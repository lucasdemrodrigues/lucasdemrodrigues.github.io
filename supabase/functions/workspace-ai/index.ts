import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });

Deno.serve(async request => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const groqApiKey = Deno.env.get("GROQ_API_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !groqApiKey) {
    return json({ error: "Função ainda não configurada." }, 503);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ error: "Não autenticado." }, 401);

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } }
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return json({ error: "Sessão inválida." }, 401);

  const { scope } = await request.json();
  const allowedScopes = new Set(["weekly", "career", "goals", "habits", "health"]);
  if (!allowedScopes.has(scope)) return json({ error: "Escopo inválido." }, 400);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoIso = sevenDaysAgo.toISOString().slice(0, 10);

  const queries: Record<string, Promise<any>[]> = {
    career: [
      supabase.from("career_applications").select("company,role,status,applied_at,application_deadline,created_at").order("created_at",{ascending:false}).limit(40)
    ],
    goals: [
      supabase.from("goals").select("title,period_type,category,deadline,status,progress,success_criteria").order("deadline",{ascending:true}).limit(40)
    ],
    habits: [
      supabase.from("habits").select("id,name,category,target_per_week,start_date,active").eq("active",true),
      supabase.from("habit_logs").select("habit_id,log_date,completed").gte("log_date",sevenDaysAgoIso).lte("log_date",today)
    ],
    health: [
      supabase.from("health_followups").select("specialty,last_visit,next_visit,frequency,status").order("next_visit",{ascending:true,nullsFirst:false}),
      supabase.from("health_weight_logs").select("measurement_date,weight_kg").order("measurement_date",{ascending:false}).limit(30),
      supabase.from("health_blood_pressure_logs").select("measured_at,systolic,diastolic,pulse").order("measured_at",{ascending:false}).limit(30)
    ],
    weekly: [
      supabase.from("career_applications").select("status,applied_at,application_deadline,created_at").order("created_at",{ascending:false}).limit(40),
      supabase.from("goals").select("title,deadline,status,progress,success_criteria").order("deadline",{ascending:true}).limit(30),
      supabase.from("habits").select("id,name,target_per_week,active").eq("active",true),
      supabase.from("habit_logs").select("habit_id,log_date,completed").gte("log_date",sevenDaysAgoIso).lte("log_date",today)
    ]
  };

  const results = await Promise.all(queries[scope]);
  const firstError = results.find(result => result.error)?.error;
  if (firstError) return json({ error: "Não foi possível carregar os dados." }, 500);

  const payload = results.map(result => result.data || []);

  const safety = scope === "health"
    ? "Você pode resumir tendências de peso, frequência de registros e organização de consultas. Para pressão arterial, não diagnostique, não classifique o usuário e não diga que um valor é seguro ou perigoso. Apenas descreva o histórico de forma neutra e sugira procurar orientação profissional se houver dúvidas ou sintomas."
    : "";

  const instructions = `
Você é um assistente de organização pessoal dentro de um Workspace privado.
Analise apenas os dados fornecidos. Não invente fatos.
Responda em português do Brasil, de forma objetiva, útil e sem tom motivacional genérico.
Dê no máximo 3 sugestões concretas e priorizadas.
Diferencie observações dos dados de sugestões.
Não use Markdown complexo; títulos curtos e bullets simples são suficientes.
${safety}
`;

  const prompts: Record<string,string> = {
    career: "Analise o pipeline de carreira: oportunidades salvas, candidaturas, etapas, prazos e sinais de falta de atualização. Dê sugestões práticas.",
    goals: "Analise as metas: quantidade ativa, progresso, prazo, critérios de conclusão e possíveis conflitos de prioridade. Dê sugestões práticas.",
    habits: "Analise os hábitos ativos e os check-ins dos últimos 7 dias em relação às metas semanais. Dê sugestões práticas e realistas.",
    health: "Analise a organização de consultas, tendência dos registros de peso e consistência dos registros de pressão. Não faça diagnóstico.",
    weekly: "Crie um Insight da semana reunindo Carreira, Metas e Hábitos. Destaque o que merece atenção primeiro e dê até 3 ações práticas para a próxima semana."
  };

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      reasoning_effort: "low",
      max_completion_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: instructions
        },
        {
          role: "user",
          content: `${prompts[scope]}\n\nDados estruturados:\n${JSON.stringify(payload)}`
        }
      ]
    })
  });

  if (!groqResponse.ok) {
    return json({ error: "Falha ao consultar o modelo." }, 502);
  }

  const ai = await groqResponse.json();
  const insight = ai?.choices?.[0]?.message?.content?.trim();

  if (!insight) return json({ error: "Resposta vazia." }, 502);

  return json({ insight });
});
