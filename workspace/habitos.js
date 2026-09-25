import {
  $,
  bindLogout,
  escapeHtml,
  initProtectedPage,
  supabase,
  todayIso
} from "./shared.js";

import { bindAiInsight } from "./ai-insights.js";
import { exportRowsToExcel } from "./export-excel.js";

const elements = {
  loading: $("#habits-loading"),
  auth: $("#habits-auth-required"),
  view: $("#habits-view"),
  logout: $("#logout-button"),
  newButton: $("#new-habit-button"),
  exportButton: $("#export-habits-button"),
  dialog: $("#habit-dialog"),
  form: $("#habit-form"),
  close: $("#dialog-close"),
  cancel: $("#cancel-habit-button"),
  remove: $("#delete-habit-button"),
  save: $("#save-habit-button"),
  id: $("#habit-id"),
  name: $("#habit-name"),
  category: $("#habit-category"),
  target: $("#habit-target"),
  start: $("#habit-start"),
  notes: $("#habit-notes"),
  message: $("#habit-form-message"),
  list: $("#habits-list"),
  empty: $("#habits-empty"),
  warning: $("#habits-setup-warning"),
  todayDate: $("#today-date"),
  active: $("#kpi-active-habits"),
  today: $("#kpi-today"),
  month: $("#kpi-month"),
  monthCheckins: $("#kpi-month-checkins"),
  week: $("#habits-week"),
  dialogTitle: $("#habit-dialog-title")
};

let habits = [];
let logs = [];
let ready = true;
let userId = null;

const monthStart = () => {
  const date = new Date();
  date.setDate(1);

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const sevenDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const lastSevenDays = () => Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - index));
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
});

const formatDayShort = date =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit" })
    .format(new Date(date + "T12:00:00"))
    .replace(".", "");

const formatToday = () =>
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(new Date());

function openForm(habit) {
  elements.form.reset();
  elements.id.value = "";
  elements.start.value = todayIso();
  elements.target.value = "7";
  elements.remove.hidden = true;
  elements.dialogTitle.textContent = "Novo hábito";

  if (habit) {
    elements.id.value = habit.id;
    elements.name.value = habit.name || "";
    elements.category.value = habit.category || "";
    elements.target.value = String(habit.target_per_week || 7);
    elements.start.value = habit.start_date || todayIso();
    elements.notes.value = habit.notes || "";
    elements.remove.hidden = false;
    elements.dialogTitle.textContent = "Editar hábito";
  }

  elements.dialog.showModal();
  setTimeout(() => elements.name.focus(), 0);
}

function closeForm() {
  if (elements.dialog.open) elements.dialog.close();
}

function expectedToDate(habit) {
  const now = new Date(todayIso() + "T12:00:00");
  const firstDay = new Date(monthStart() + "T12:00:00");
  const habitStart = new Date((habit.start_date || monthStart()) + "T12:00:00");
  const effectiveStart = habitStart > firstDay ? habitStart : firstDay;

  if (effectiveStart > now) return 0;

  const elapsedDays = Math.floor((now - effectiveStart) / 86400000) + 1;
  return Math.max(1, Math.ceil((habit.target_per_week || 7) * elapsedDays / 7));
}

function monthProgress(habit) {
  const expected = expectedToDate(habit);
  if (!expected) return 0;

  const start = habit.start_date && habit.start_date > monthStart()
    ? habit.start_date
    : monthStart();

  const completed = logs.filter(log =>
    log.habit_id === habit.id &&
    log.completed &&
    log.log_date >= start &&
    log.log_date <= todayIso()
  ).length;

  return Math.min(100, Math.round(completed / expected * 100));
}

function monthCheckins(habit) {
  const start = habit.start_date && habit.start_date > monthStart()
    ? habit.start_date
    : monthStart();

  return logs.filter(log =>
    log.habit_id === habit.id &&
    log.completed &&
    log.log_date >= start &&
    log.log_date <= todayIso()
  ).length;
}

function exportHabits() {
  const activeHabits = habits.filter(habit => habit.active !== false);

  if (!activeHabits.length) {
    alert("Não há hábitos ativos para exportar.");
    return;
  }

  exportRowsToExcel({
    rows: activeHabits,
    columns: [
      { header: "Hábito", value: habit => habit.name },
      { header: "Categoria", value: habit => habit.category || "" },
      { header: "Meta semanal", value: habit => Number(habit.target_per_week || 7) },
      { header: "Data de início", value: habit => habit.start_date || "" },
      { header: "Progresso no mês (%)", value: habit => monthProgress(habit) },
      { header: "Check-ins no mês", value: habit => monthCheckins(habit) },
      { header: "Observações", value: habit => habit.notes || "" }
    ],
    widths: [30, 18, 14, 16, 22, 18, 40],
    sheetName: "Hábitos",
    fileName: "habitos.xlsx"
  });
}

function renderWeek(activeHabits) {
  const days = lastSevenDays();

  elements.week.innerHTML = activeHabits.map(habit => {
    const markers = days.map(day => {
      const done = logs.some(log =>
        log.habit_id === habit.id &&
        log.log_date === day &&
        log.completed
      );

      return `<span class="week-day ${done ? "is-done" : ""}" title="${escapeHtml(formatDayShort(day))}" aria-label="${escapeHtml(formatDayShort(day))}: ${done ? "concluído" : "não concluído"}">${done ? "✓" : ""}</span>`;
    }).join("");

    return `
      <div class="week-row">
        <div><strong>${escapeHtml(habit.name)}</strong><span>${monthProgress(habit)}% no mês</span></div>
        <div class="week-days" aria-label="Últimos sete dias de ${escapeHtml(habit.name)}">${markers}</div>
      </div>
    `;
  }).join("");
}

function render() {
  const activeHabits = habits.filter(habit => habit.active !== false);
  const today = todayIso();

  const todayDone = activeHabits.filter(habit =>
    logs.some(log =>
      log.habit_id === habit.id &&
      log.log_date === today &&
      log.completed
    )
  ).length;

  elements.active.textContent = activeHabits.length;
  elements.today.textContent =
    (activeHabits.length ? Math.round(todayDone / activeHabits.length * 100) : 0) + "%";

  const expected = activeHabits.reduce((sum, habit) => sum + expectedToDate(habit), 0);
  const monthDone = activeHabits.reduce((sum, habit) => {
    const start = habit.start_date && habit.start_date > monthStart()
      ? habit.start_date
      : monthStart();

    return sum + logs.filter(log =>
      log.habit_id === habit.id &&
      log.completed &&
      log.log_date >= start &&
      log.log_date <= today
    ).length;
  }, 0);

  elements.month.textContent =
    (expected ? Math.min(100, Math.round(monthDone / expected * 100)) : 0) + "%";
  elements.monthCheckins.textContent = monthDone;
  elements.empty.hidden = activeHabits.length !== 0 || !ready;
  renderWeek(activeHabits);

  elements.list.innerHTML = activeHabits.map(habit => {
    const doneToday = logs.some(log =>
      log.habit_id === habit.id &&
      log.log_date === today &&
      log.completed
    );

    const actionLabel = `${doneToday ? "Desmarcar" : "Marcar"} ${habit.name}`;

    return `
      <article class="habit-row" data-id="${escapeHtml(habit.id)}">
        <button
          class="habit-check ${doneToday ? "is-done" : ""}"
          type="button"
          aria-label="${escapeHtml(actionLabel)}"
        >${doneToday ? "✓" : ""}</button>
        <div class="habit-main">
          <strong>${escapeHtml(habit.name)}</strong>
          <span>${escapeHtml(habit.category || "Sem categoria")}</span>
        </div>
        <div class="habit-meta">${Number(habit.target_per_week || 7)}x por semana</div>
        <div class="habit-progress">
          <strong>${monthProgress(habit)}%</strong>
          <span>no mês</span>
        </div>
        <button class="row-menu" type="button" aria-label="Editar hábito">•••</button>
      </article>
    `;
  }).join("");

  elements.list.querySelectorAll(".habit-row").forEach(rowElement => {
    const id = rowElement.dataset.id;

    rowElement.querySelector(".habit-check").onclick = () => toggleToday(id);
    rowElement.querySelector(".row-menu").onclick = () =>
      openForm(habits.find(habit => habit.id === id));
  });
}

async function load() {
  ready = true;
  elements.warning.hidden = true;

  const [
    { data: habitData, error: habitError },
    { data: logData, error: logError }
  ] = await Promise.all([
    supabase.from("habits").select("*").order("created_at"),
    supabase.from("habit_logs").select("*").gte("log_date", sevenDaysAgo() < monthStart() ? sevenDaysAgo() : monthStart()).order("log_date")
  ]);

  if (habitError || logError) {
    const error = habitError || logError;

    if (
      error.code === "42P01" ||
      /habits|habit_logs|schema cache|does not exist/i.test(error.message || "")
    ) {
      ready = false;
      habits = [];
      logs = [];
      elements.warning.hidden = false;
      render();
      return;
    }

    throw error;
  }

  habits = habitData || [];
  logs = logData || [];
  render();
}

async function toggleToday(id) {
  const today = todayIso();
  const existing = logs.find(log =>
    log.habit_id === id &&
    log.log_date === today
  );

  if (existing) {
    await supabase
      .from("habit_logs")
      .delete()
      .eq("id", existing.id);
  } else {
    await supabase.from("habit_logs").insert({
      user_id: userId,
      habit_id: id,
      log_date: today,
      completed: true
    });
  }

  await load();
}

elements.form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!elements.form.checkValidity()) {
    elements.form.reportValidity();
    return;
  }

  const payload = {
    user_id: userId,
    name: elements.name.value.trim(),
    category: elements.category.value || null,
    target_per_week: Number(elements.target.value),
    start_date: elements.start.value || todayIso(),
    notes: elements.notes.value.trim() || null,
    active: true
  };

  elements.save.disabled = true;
  elements.message.textContent = "";
  elements.message.classList.remove("is-error");

  const query = elements.id.value
    ? supabase.from("habits").update(payload).eq("id", elements.id.value)
    : supabase.from("habits").insert(payload);

  const { error } = await query;
  elements.save.disabled = false;

  if (error) {
    elements.message.textContent = "Não foi possível salvar.";
    elements.message.classList.add("is-error");
    return;
  }

  closeForm();
  await load();
});

elements.remove.addEventListener("click", async () => {
  if (!elements.id.value || !confirm("Excluir este hábito e seu histórico?")) return;

  await supabase
    .from("habits")
    .delete()
    .eq("id", elements.id.value);

  closeForm();
  await load();
});

elements.newButton.addEventListener("click", () => {
  ready ? openForm() : elements.warning.scrollIntoView({ behavior: "smooth" });
});

elements.exportButton.addEventListener("click", exportHabits);
elements.close.addEventListener("click", closeForm);
elements.cancel.addEventListener("click", closeForm);

bindLogout(elements.logout);

initProtectedPage({
  loading: elements.loading,
  authRequired: elements.auth,
  view: elements.view,
  onReady: async session => {
    userId = session.user.id;
    elements.todayDate.textContent = formatToday();
    await load();
  }
}).catch(() => {
  elements.warning.hidden = false;
});


bindAiInsight({
  button: document.querySelector("#habits-ai-button"),
  output: document.querySelector("#habits-ai-output"),
  scope: "habits"
});
