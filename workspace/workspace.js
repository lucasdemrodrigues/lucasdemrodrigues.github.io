import { bindAiInsight } from "./ai-insights.js";
import { initWorkspaceAuth } from "./workspace-auth.js";
import { loadWorkspaceDashboard } from "./workspace-dashboard.js";

bindAiInsight({
  button: document.querySelector("#weekly-ai-button"),
  output: document.querySelector("#weekly-ai-output"),
  scope: "weekly",
  loadingText: "Gerando…"
});

initWorkspaceAuth(loadWorkspaceDashboard);
