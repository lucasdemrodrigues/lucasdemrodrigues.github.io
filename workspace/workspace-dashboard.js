import {
  $,
  localIsoDate,
  supabase
} from "./shared.js";

const pendingToggle = $("#pending-toggle");
const pendingTotal = $("#pending-total");
const pendingList = $("#pending-list");

const summaries = {
  career: $("#summary-career"),
  goals: $("#summary-goals"),
  habits: $("#summary-habits"),
  culture: $("#summary-culture"),
  health: $("#summary-health")
};

const cards = {
  career: $("#card-career"),
  goals: $("#card-goals"),
  habits: $("#card-habits"),
  culture: $("#card-culture"),
  health: $("#card-health")
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

  const expanded =
    pendingToggle.getAttribute("aria-expanded") === "true";

  setPendingExpanded(!expanded);
});

const setCardAttention = (key, shouldHighlight) => {
  cards[key]?.classList.toggle("has-pending", shouldHighlight);
  summaries[key]?.classList.toggle("has-pending", shouldHighlight);
};

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

const renderDashboardError = () => {
  pendingTotal.textContent = "—";
  pendingList.replaceChildren();

  const message = document.createElement("p");
  message.className = "pending-clear";
  message.textContent = "Não foi possível atualizar o resumo agora.";

  pendingList.append(message);
};

export const loadWorkspaceDashboard = async () => {
  if (!supabase || !pendingList) return;

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
    supabase
      .from("career_applications")
      .select("status"),

    supabase
      .from("goals")
      .select("status,deadline"),

    supabase
      .from("habits")
      .select("id,active"),

    supabase
      .from("habit_logs")
      .select("habit_id,log_date,completed")
      .eq("log_date", today),

    supabase
      .from("culture_items")
      .select("completed_at"),

    supabase
      .from("health_followups")
      .select("status,next_visit"),

    supabase
      .from("health_weight_logs")
      .select("measurement_date,weight_kg")
      .order("measurement_date", { ascending: false })
      .limit(1)
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
    renderDashboardError();
    return;
  }

  const career = careerResult.data || [];
  const goals = goalsResult.data || [];
  const habits = (habitsResult.data || [])
    .filter(habit => habit.active !== false);
  const habitLogs = habitLogsResult.data || [];
  const culture = cultureResult.data || [];
  const health = healthResult.data || [];
  const latestWeight = (weightResult.data || [])[0];

  const savedOpportunities = career
    .filter(item => item.status === "Para candidatar")
    .length;

  const activeProcesses = career
    .filter(item =>
      item.status !== "Para candidatar" &&
      !["Oferta", "Reprovado", "Desistência"].includes(item.status)
    )
    .length;

  const activeGoals = goals
    .filter(goal => goal.status !== "Concluída");

  const dueGoals = activeGoals
    .filter(goal =>
      goal.deadline &&
      goal.deadline <= dueLimit
    )
    .length;

  const doneTodayIds = new Set(
    habitLogs
      .filter(log => log.completed)
      .map(log => log.habit_id)
  );

  const habitsDoneToday = habits
    .filter(habit => doneTodayIds.has(habit.id))
    .length;

  const habitsPendingToday = Math.max(
    0,
    habits.length - habitsDoneToday
  );

  const habitsPercent = habits.length
    ? Math.round(habitsDoneToday / habits.length * 100)
    : 0;

  const cultureYear = culture
    .filter(item =>
      String(item.completed_at || "")
        .startsWith(currentYear)
    )
    .length;

  const healthToSchedule = health
    .filter(item => item.status === "Para agendar")
    .length;

  const healthScheduled = health
    .filter(item => item.status === "Agendada")
    .length;

  summaries.career.textContent =
    `${plural(savedOpportunities, "oportunidade salva", "oportunidades salvas")} · ` +
    `${plural(activeProcesses, "processo", "processos")} em andamento`;

  summaries.goals.textContent =
    `${plural(activeGoals.length, "meta ativa", "metas ativas")} · ` +
    `${plural(dueGoals, "próxima do prazo", "próximas do prazo")}`;

  summaries.habits.textContent = habits.length
    ? `${habitsPercent}% concluído hoje`
    : "Nenhum hábito ativo";

  summaries.culture.textContent =
    `${plural(cultureYear, "registro", "registros")} em ${currentYear}`;

  summaries.health.textContent = latestWeight
    ? `${plural(healthToSchedule, "para agendar", "para agendar")} · ` +
      `${Number(latestWeight.weight_kg).toFixed(1).replace(".", ",")} kg no último registro`
    : `${plural(healthToSchedule, "para agendar", "para agendar")} · ` +
      `${plural(healthScheduled, "agendada", "agendadas")}`;

  setCardAttention(
    "career",
    savedOpportunities > 0
  );

  setCardAttention(
    "goals",
    dueGoals > 0
  );

  setCardAttention(
    "habits",
    habitsPendingToday > 0
  );

  setCardAttention(
    "culture",
    false
  );

  setCardAttention(
    "health",
    healthToSchedule > 0
  );

  const pendingCount =
    savedOpportunities +
    dueGoals +
    habitsPendingToday +
    healthToSchedule;

  pendingTotal.textContent = String(pendingCount);

  $(".workspace-pending")
    ?.classList
    .toggle("has-pending", pendingCount > 0);

  pendingToggle.disabled = pendingCount === 0;

  if (pendingCount === 0) {
    setPendingExpanded(false);
  }

  pendingList.replaceChildren();

  if (!pendingCount) {
    const clear = document.createElement("p");
    clear.className = "pending-clear";
    clear.textContent = "Nada exigindo ação agora.";
    pendingList.append(clear);
    return;
  }

  if (savedOpportunities) {
    addPendingItem(
      "./carreira.html",
      savedOpportunities,
      savedOpportunities === 1
        ? "vaga para candidatar"
        : "vagas para candidatar"
    );
  }

  if (dueGoals) {
    addPendingItem(
      "./metas.html",
      dueGoals,
      dueGoals === 1
        ? "meta próxima do prazo"
        : "metas próximas do prazo"
    );
  }

  if (habitsPendingToday) {
    addPendingItem(
      "./habitos.html",
      habitsPendingToday,
      habitsPendingToday === 1
        ? "hábito pendente hoje"
        : "hábitos pendentes hoje"
    );
  }

  if (healthToSchedule) {
    addPendingItem(
      "./saude.html",
      healthToSchedule,
      healthToSchedule === 1
        ? "consulta para agendar"
        : "consultas para agendar"
    );
  }
};
