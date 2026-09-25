import { supabase } from "./shared.js";

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

  button.addEventListener("click", async () => {
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = loadingText;
    output.hidden = false;
    output.textContent = "Preparando análise…";
    output.classList.remove("is-error");

    try {
      output.textContent = await requestAiInsight(scope);
    } catch {
      output.textContent = "A IA ainda não está disponível. Verifique a configuração da função no Supabase.";
      output.classList.add("is-error");
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
};
