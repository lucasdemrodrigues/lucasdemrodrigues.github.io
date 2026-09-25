import { bindAiInsight } from "./ai-insights.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const authView = document.querySelector("#auth-view");
const privateView = document.querySelector("#private-view");
const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login-button");
const logoutButton = document.querySelector("#logout-button");
const authMessage = document.querySelector("#auth-message");
const pendingToggle = document.querySelector("#pending-toggle");
const pendingTotal = document.querySelector("#pending-total");
const pendingList = document.querySelector("#pending-list");
const summaryCareer = document.querySelector("#summary-career");
const summaryGoals = document.querySelector("#summary-goals");
const summaryHabits = document.querySelector("#summary-habits");
const summaryCulture = document.querySelector("#summary-culture");
const summaryHealth = document.querySelector("#summary-health");
const cardCareer = document.querySelector("#card-career");
const cardGoals = document.querySelector("#card-goals");
const cardHabits = document.querySelector("#card-habits");
const cardCulture = document.querySelector("#card-culture");
const cardHealth = document.querySelector("#card-health");

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
let supabase = null;

const showMessage = (message = "", isError = false) => {
  authMessage.textContent = message;
  authMessage.classList.toggle("is-error", isError);
};

const showAuth = () => {
  authView.hidden = false;
  privateView.hidden = true;
};

const showPrivate = () => {
  authView.hidden = true;
  privateView.hidden = false;
};

const localIsoDate = date => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const plural = (value, singular, pluralForm) =>
  `${value} ${value === 1 ? singular : pluralForm}`;

const setPendingExpanded = expanded => {
  if (!pendingToggle || !pendingList) return;

  pendingToggle.setAttribute("aria-expanded", String(expanded));
  pendingList.hidden = !expanded;
};

pendingToggle?.addEventListener("click", () => {
  if (pendingToggle.disabled) return;
  const expanded = pendingToggle.getAttribute("aria-expanded") === "true";
  setPendingExpanded(!expanded);
});

const addPendingItem = (href, value, label) => {
  const link = document.createElement("a");
  link.className = "pending-item";
  link.href = href;

  const strong = document.createElement("strong");
  strong.textContent = String(value);

  const span = document.createElement("span");
  span.textContent = label;

  link.append(strong, span);
  pendingList.append(link);
};

const loadDashboard = async () => {
  if (!pendingList) return;

  const now = new Date();
  const today = localIsoDate(now);
  const dueLimitDate = new Date(now);
  dueLimitDate.setDate(dueLimitDate.getDate() + 7);
  const dueLimit = localIsoDate(dueLimitDate);
  const currentYear = String(now.getFullYear());

  const [
    careerResult,
    goalsResult,
    habitsResult,
    habitLogsResult,
    cultureResult,
    healthResult,
    weightResult
  ] = await Promise.all([
    supabase.from("career_applications").select("status"),
    supabase.from("goals").select("status,deadline"),
    supabase.from("habits").select("id,active"),
    supabase.from("habit_logs").select("habit_id,log_date,completed").eq("log_date", today),
    supabase.from("culture_items").select("completed_at"),
    supabase.from("health_followups").select("status,next_visit"),
    supabase.from("health_weight_logs").select("measurement_date,weight_kg").order("measurement_date",{ascending:false}).limit(1)
  ]);

  const results = [
    careerResult,
    goalsResult,
    habitsResult,
    habitLogsResult,
    cultureResult,
    healthResult,
    weightResult
  ];

  if (results.some(result => result.error)) {
    pendingTotal.textContent = "—";
    pendingList.replaceChildren();
    const message = document.createElement("p");
    message.className = "pending-clear";
    message.textContent = "Não foi possível atualizar o resumo agora.";
    pendingList.append(message);
    return;
  }

  const career = careerResult.data || [];
  const goals = goalsResult.data || [];
  const habits = (habitsResult.data || []).filter(habit => habit.active !== false);
  const habitLogs = habitLogsResult.data || [];
  const culture = cultureResult.data || [];
  const health = healthResult.data || [];
  const latestWeight = (weightResult.data || [])[0];

  const savedOpportunities = career.filter(item => item.status === "Para candidatar").length;
  const activeProcesses = career.filter(item =>
    item.status !== "Para candidatar" &&
    !["Oferta", "Reprovado", "Desistência"].includes(item.status)
  ).length;

  const activeGoals = goals.filter(goal => goal.status !== "Concluída");
  const dueGoals = activeGoals.filter(goal =>
    goal.deadline && goal.deadline <= dueLimit
  ).length;

  const doneTodayIds = new Set(
    habitLogs
      .filter(log => log.completed)
      .map(log => log.habit_id)
  );
  const habitsDoneToday = habits.filter(habit => doneTodayIds.has(habit.id)).length;
  const habitsPendingToday = Math.max(0, habits.length - habitsDoneToday);
  const habitsPercent = habits.length
    ? Math.round(habitsDoneToday / habits.length * 100)
    : 0;

  const cultureYear = culture.filter(item =>
    String(item.completed_at || "").startsWith(currentYear)
  ).length;

  const healthToSchedule = health.filter(item => item.status === "Para agendar").length;
  const healthScheduled = health.filter(item => item.status === "Agendada").length;

  summaryCareer.textContent =
    `${plural(savedOpportunities, "oportunidade salva", "oportunidades salvas")} · ${plural(activeProcesses, "processo", "processos")} em andamento`;
  summaryGoals.textContent =
    `${plural(activeGoals.length, "meta ativa", "metas ativas")} · ${plural(dueGoals, "próxima do prazo", "próximas do prazo")}`;
  summaryHabits.textContent = habits.length
    ? `${habitsPercent}% concluído hoje`
    : "Nenhum hábito ativo";
  summaryCulture.textContent =
    `${plural(cultureYear, "registro", "registros")} em ${currentYear}`;
  const setCardAttention = (card, summary, shouldHighlight) => {
    card?.classList.toggle("has-pending", shouldHighlight);
    summary?.classList.toggle("has-pending", shouldHighlight);
  };

  setCardAttention(cardCareer, summaryCareer, savedOpportunities > 0);
  setCardAttention(cardGoals, summaryGoals, dueGoals > 0);
  setCardAttention(cardHabits, summaryHabits, habitsPendingToday > 0);
  setCardAttention(cardCulture, summaryCulture, false);
  setCardAttention(cardHealth, summaryHealth, healthToSchedule > 0);

  summaryHealth.textContent = latestWeight
    ? `${plural(healthToSchedule, "para agendar", "para agendar")} · ${Number(latestWeight.weight_kg).toFixed(1).replace(".", ",")} kg no último registro`
    : `${plural(healthToSchedule, "para agendar", "para agendar")} · ${plural(healthScheduled, "agendada", "agendadas")}`;

  const pendingCount =
    savedOpportunities +
    dueGoals +
    habitsPendingToday +
    healthToSchedule;

  pendingTotal.textContent = String(pendingCount);
  document.querySelector(".workspace-pending")?.classList.toggle("has-pending", pendingCount > 0);
  pendingToggle.disabled = pendingCount === 0;
  if (pendingCount === 0) setPendingExpanded(false);
  pendingList.replaceChildren();

  if (!pendingCount) {
    const clear = document.createElement("p");
    clear.className = "pending-clear";
    clear.textContent = "Nada exigindo ação agora.";
    pendingList.append(clear);
    return;
  }

  if (savedOpportunities) {
    addPendingItem("./carreira.html", savedOpportunities,
      savedOpportunities === 1 ? "vaga para candidatar" : "vagas para candidatar");
  }

  if (dueGoals) {
    addPendingItem("./metas.html", dueGoals,
      dueGoals === 1 ? "meta próxima do prazo" : "metas próximas do prazo");
  }

  if (habitsPendingToday) {
    addPendingItem("./habitos.html", habitsPendingToday,
      habitsPendingToday === 1 ? "hábito pendente hoje" : "hábitos pendentes hoje");
  }

  if (healthToSchedule) {
    addPendingItem("./saude.html", healthToSchedule,
      healthToSchedule === 1 ? "consulta para agendar" : "consultas para agendar");
  }
};

if (!isConfigured) {
  showAuth();
  loginButton.disabled = true;
  showMessage("Autenticação ainda não configurada.", true);
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const syncSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      showAuth();
      return;
    }
    showPrivate();
    await loadDashboard();
  };

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    showMessage();

    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Entrando…";

    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value
    });

    loginButton.disabled = false;
    loginButton.textContent = "Entrar";

    if (error) {
      showMessage("E-mail ou senha inválidos.", true);
      return;
    }

    passwordInput.value = "";
    showPrivate();
    await loadDashboard();
  });

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    await supabase.auth.signOut();
    logoutButton.disabled = false;
    showAuth();
    emailInput.focus();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      showPrivate();
    } else {
      showAuth();
    }
  });

  syncSession();
}


bindAiInsight({
  button: document.querySelector("#weekly-ai-button"),
  output: document.querySelector("#weekly-ai-output"),
  scope: "weekly",
  loadingText: "Gerando…"
});
