import {
  formatDateTime,
  supabase
} from "./shared.js";

export const requestAiInsight = async scope => {
  if (!supabase) {
    throw new Error("Supabase não configurado.");
  }

  const { data, error } = await supabase.functions.invoke(
    "workspace-ai",
    {
      body: { scope }
    }
  );

  if (error) throw error;

  if (!data?.insight) {
    throw new Error("Resposta de IA vazia.");
  }

  return data.insight;
};

export const bindAiInsight = ({
  button,
  output,
  scope,
  loadingText = "Analisando…"
}) => {
  if (!button || !output || !supabase) return;

  const toggle = document.querySelector(
    `#${scope}-ai-toggle`
  );

  const content = document.querySelector(
    `#${scope}-ai-content`
  );

  const date = document.querySelector(
    `#${scope}-ai-date`
  );

  const setExpanded = expanded => {
    if (!toggle || !content) return;

    toggle.setAttribute(
      "aria-expanded",
      String(expanded)
    );

    content.hidden = !expanded;
  };

  toggle?.addEventListener("click", () => {
    const expanded =
      toggle.getAttribute("aria-expanded") === "true";

    setExpanded(!expanded);
  });

  const renderSaved = row => {
    if (!row) {
      output.hidden = true;
      output.textContent = "";

      if (date) {
        date.textContent = "Nenhuma análise gerada ainda";
      }

      button.textContent =
        scope === "weekly"
          ? "Gerar insight"
          : "Gerar análise";

      return;
    }

    output.hidden = false;
    output.textContent = row.insight;
    output.classList.remove("is-error");

    if (date) {
      date.textContent =
        `Última análise: ${formatDateTime(row.generated_at)}`;
    }

    button.textContent = "Atualizar análise";
  };

  const getCurrentUser = async () => {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Sessão inválida.");
    }

    return user;
  };

  const loadSaved = async () => {
    try {
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from("workspace_ai_insights")
        .select("insight,generated_at")
        .eq("user_id", user.id)
        .eq("scope", scope)
        .maybeSingle();

      if (error) throw error;

      renderSaved(data);
    } catch {
      if (date) {
        date.textContent = "Nenhuma análise gerada ainda";
      }
    }
  };

  button.addEventListener("click", async () => {
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = loadingText;

    output.hidden = false;
    output.textContent = "Preparando análise…";
    output.classList.remove("is-error");

    try {
      const user = await getCurrentUser();
      const insight = await requestAiInsight(scope);
      const generatedAt = new Date().toISOString();

      const { error } = await supabase
        .from("workspace_ai_insights")
        .upsert(
          {
            user_id: user.id,
            scope,
            insight,
            generated_at: generatedAt
          },
          {
            onConflict: "user_id,scope"
          }
        );

      if (error) throw error;

      renderSaved({
        insight,
        generated_at: generatedAt
      });
    } catch {
      output.textContent =
        "Não foi possível gerar ou salvar a análise agora.";

      output.classList.add("is-error");
      button.textContent = originalText;
    } finally {
      button.disabled = false;
    }
  });

  loadSaved();
};
