import { supabase } from "./shared.js";

const formatGeneratedAt = value =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));

export const requestAiInsight = async scope => {
  const { data, error } = await supabase.functions.invoke("workspace-ai", {
    body: { scope }
  });

  if (error) throw error;
  if (!data?.insight) throw new Error("Resposta de IA vazia.");

  return data.insight;
};

export const bindAiInsight = ({
  button,
  output,
  scope,
  loadingText = "Analisando…"
}) => {
  if (!button || !output) return;

  const prefix = scope === "weekly" ? "weekly" : scope;
  const toggle = document.querySelector(`#${prefix}-ai-toggle`);
  const content = document.querySelector(`#${prefix}-ai-content`);
  const date = document.querySelector(`#${prefix}-ai-date`);

  const setExpanded = expanded => {
    if (!toggle || !content) return;
    toggle.setAttribute("aria-expanded", String(expanded));
    content.hidden = !expanded;
  };

  toggle?.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    setExpanded(!expanded);
  });

  const renderSaved = row => {
    if (!row) {
      output.hidden = true;
      output.textContent = "";
      date && (date.textContent = "Nenhuma análise gerada ainda");
      button.textContent = scope === "weekly" ? "Gerar insight" : "Gerar análise";
      return;
    }

    output.hidden = false;
    output.textContent = row.insight;
    output.classList.remove("is-error");
    date && (date.textContent = `Última análise: ${formatGeneratedAt(row.generated_at)}`);
    button.textContent = "Atualizar análise";
  };

  const loadSaved = async () => {
    const { data, error } = await supabase
      .from("workspace_ai_insights")
      .select("insight,generated_at")
      .eq("scope", scope)
      .maybeSingle();

    if (error) {
      date && (date.textContent = "Histórico de IA ainda não configurado");
      return;
    }

    renderSaved(data);
  };

  button.addEventListener("click", async () => {
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = loadingText;
    output.hidden = false;
    output.textContent = "Preparando análise…";
    output.classList.remove("is-error");

    try {
      const insight = await requestAiInsight(scope);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão inválida.");

      const generatedAt = new Date().toISOString();

      const { error } = await supabase
        .from("workspace_ai_insights")
        .upsert({
          user_id: user.id,
          scope,
          insight,
          generated_at: generatedAt
        }, {
          onConflict: "user_id,scope"
        });

      if (error) throw error;

      renderSaved({ insight, generated_at: generatedAt });
    } catch {
      output.textContent = "Não foi possível gerar ou salvar a análise agora.";
      output.classList.add("is-error");
      button.textContent = originalText;
    } finally {
      button.disabled = false;
    }
  });

  loadSaved();
};
