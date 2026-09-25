import {
  $,
  bindLogout,
  escapeHtml,
  formatDate,
  initProtectedPage,
  supabase,
  todayIso
} from "./shared.js";
import { exportRowsToExcel } from "./export-excel.js";

const elements = {
  loading: $("#goals-loading"),
  auth: $("#goals-auth-required"),
  view: $("#goals-view"),
  logout: $("#logout-button"),
  newButton: $("#new-goal-button"),
  exportButton: $("#export-goals-button"),
  dialog: $("#goal-dialog"),
  form: $("#goal-form"),
  close: $("#dialog-close"),
  cancel: $("#cancel-goal-button"),
  remove: $("#delete-goal-button"),
  save: $("#save-goal-button"),
  id: $("#goal-id"),
  title: $("#goal-title"),
  period: $("#goal-period"),
  category: $("#goal-category"),
  deadline: $("#goal-deadline"),
  status: $("#goal-status"),
  successCriteria: $("#goal-success-criteria"),
  progress: $("#goal-progress"),
  progressLabel: $("#goal-progress-label"),
  notes: $("#goal-notes"),
  message: $("#goal-form-message"),
  search: $("#goals-search"),
  periodFilter: $("#period-filter"),
  statusFilter: $("#status-filter"),
  list: $("#goals-list"),
  empty: $("#goals-empty"),
  warning: $("#goals-setup-warning"),
  count: $("#goals-count"),
  active: $("#kpi-active"),
  completed: $("#kpi-completed"),
  progressAverage: $("#kpi-progress"),
  dueSoon: $("#kpi-due"),
  dialogTitle: $("#goal-dialog-title")
};

let rows = [];
let ready = true;
let userId = null;

const daysUntil = date => {
  if (!date) return null;

  const today = new Date(todayIso() + "T12:00:00");
  const deadline = new Date(date + "T12:00:00");

  return Math.round((deadline - today) / 86400000);
};

function deadlineLabel(row) {
  if (row.status === "Concluída") return "Concluída";

  const days = daysUntil(row.deadline);

  if (days === null) return "Sem prazo";
  if (days < 0) return `Atrasada ${Math.abs(days)}d`;
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";

  return `Em ${days} dias`;
}

function openForm(row) {
  elements.form.reset();
  elements.id.value = "";
  elements.period.value = "Mensal";
  elements.status.value = "Em andamento";
  elements.successCriteria.value = "";
  elements.progress.value = "0";
  elements.progressLabel.textContent = "0%";
  elements.deadline.value = todayIso();
  elements.remove.hidden = true;
  elements.dialogTitle.textContent = "Nova meta";

  if (row) {
    elements.id.value = row.id;
    elements.title.value = row.title || "";
    elements.period.value = row.period_type || "Mensal";
    elements.category.value = row.category || "";
    elements.deadline.value = row.deadline || todayIso();
    elements.status.value = row.status || "Em andamento";
    elements.successCriteria.value = row.success_criteria || "";
    elements.progress.value = String(row.progress || 0);
    elements.progressLabel.textContent = `${row.progress || 0}%`;
    elements.notes.value = row.notes || "";
    elements.remove.hidden = false;
    elements.dialogTitle.textContent = "Editar meta";
  }

  elements.dialog.showModal();
  setTimeout(() => elements.title.focus(), 0);
}

function closeForm() {
  if (elements.dialog.open) elements.dialog.close();
}

function filteredRows() {
  const query = elements.search.value.trim().toLowerCase();
  const period = elements.periodFilter.value;
  const status = elements.statusFilter.value;

  return rows.filter(row => {
    if (query && !row.title.toLowerCase().includes(query)) return false;
    if (period !== "all" && row.period_type !== period) return false;
    if (status === "active" && row.status === "Concluída") return false;
    if (status !== "active" && status !== "all" && row.status !== status) return false;

    return true;
  });
}

function exportGoals() {
  const data = filteredRows();

  if (!data.length) {
    alert("Não há metas para exportar com os filtros atuais.");
    return;
  }

  exportRowsToExcel({
    rows: data,
    columns: [
      { header: "Meta", value: row => row.title },
      { header: "Período", value: row => row.period_type },
      { header: "Categoria", value: row => row.category || "" },
      { header: "Prazo", value: row => formatDate(row.deadline) },
      { header: "Status", value: row => row.status },
      { header: "Critério de conclusão", value: row => row.success_criteria || "" },
      { header: "Progresso (%)", value: row => Number(row.progress || 0) },
      { header: "Observações", value: row => row.notes || "" }
    ],
    widths: [38, 12, 16, 14, 16, 38, 14, 45],
    sheetName: "Metas",
    fileName: "metas.xlsx"
  });
}

function render() {
  const active = rows.filter(row => row.status !== "Concluída");
  const completed = rows.filter(row => row.status === "Concluída");

  elements.active.textContent = active.length;
  elements.completed.textContent = completed.length;
  elements.progressAverage.textContent =
    (active.length
      ? Math.round(active.reduce((sum, row) => sum + Number(row.progress || 0), 0) / active.length)
      : 0) + "%";
  elements.dueSoon.textContent = active.filter(row => {
    const days = daysUntil(row.deadline);
    return days !== null && days >= 0 && days <= 7;
  }).length;

  const data = filteredRows();
  elements.count.textContent = `${data.length} ${data.length === 1 ? "registro" : "registros"}`;
  elements.empty.hidden = data.length !== 0 || !ready;

  elements.list.innerHTML = data.map(row => {
    const days = daysUntil(row.deadline);
    const deadlineClass =
      row.status !== "Concluída" && days !== null && days < 0
        ? " is-overdue"
        : row.status !== "Concluída" && days !== null && days <= 7
          ? " is-soon"
          : "";

    const progress = Math.max(0, Math.min(100, Number(row.progress || 0)));

    return `
      <article class="goal-row" data-id="${escapeHtml(row.id)}">
        <div class="goal-main">
          <strong>${escapeHtml(row.title)}</strong>
          <span>${escapeHtml(row.category || "Sem categoria")} · ${escapeHtml(row.status)}</span>
        </div>
        <span class="goal-period">${escapeHtml(row.period_type)}</span>
        <div class="goal-progress-wrap">
          <div class="goal-progress-top">
            <span>Progresso</span>
            <strong>${progress}%</strong>
          </div>
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width:${progress}%"></div>
          </div>
        </div>
        <div class="goal-deadline${deadlineClass}">
          ${deadlineLabel(row)}<br>
          <span>${formatDate(row.deadline)}</span>
        </div>
        <button class="row-menu" type="button" aria-label="Editar meta">•••</button>
      </article>
    `;
  }).join("");

  elements.list.querySelectorAll(".goal-row").forEach(rowElement => {
    rowElement.querySelector(".row-menu").onclick = () =>
      openForm(rows.find(row => row.id === rowElement.dataset.id));
  });
}

async function load() {
  ready = true;
  elements.warning.hidden = true;

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("deadline", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (
      error.code === "42P01" ||
      /goals|schema cache|does not exist/i.test(error.message || "")
    ) {
      ready = false;
      rows = [];
      elements.warning.hidden = false;
      render();
      return;
    }

    throw error;
  }

  rows = data || [];
  render();
}

elements.progress.addEventListener("input", () => {
  elements.progressLabel.textContent = `${elements.progress.value}%`;
});

elements.status.addEventListener("change", () => {
  if (elements.status.value === "Concluída") {
    elements.progress.value = "100";
    elements.progressLabel.textContent = "100%";
  }
});

elements.form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!elements.form.checkValidity()) {
    elements.form.reportValidity();
    return;
  }

  const payload = {
    user_id: userId,
    title: elements.title.value.trim(),
    period_type: elements.period.value,
    category: elements.category.value || null,
    deadline: elements.deadline.value,
    status: elements.status.value,
    success_criteria: elements.successCriteria.value.trim() || null,
    progress: Number(elements.progress.value),
    notes: elements.notes.value.trim() || null
  };

  elements.save.disabled = true;
  elements.message.textContent = "";
  elements.message.classList.remove("is-error");

  const query = elements.id.value
    ? supabase.from("goals").update(payload).eq("id", elements.id.value)
    : supabase.from("goals").insert(payload);

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
  if (!elements.id.value || !confirm("Excluir esta meta?")) return;

  await supabase
    .from("goals")
    .delete()
    .eq("id", elements.id.value);

  closeForm();
  await load();
});

elements.newButton.addEventListener("click", () => {
  ready ? openForm() : elements.warning.scrollIntoView({ behavior: "smooth" });
});

elements.exportButton.addEventListener("click", exportGoals);
elements.close.addEventListener("click", closeForm);
elements.cancel.addEventListener("click", closeForm);
elements.search.addEventListener("input", render);
elements.periodFilter.addEventListener("change", render);
elements.statusFilter.addEventListener("change", render);

bindLogout(elements.logout);

initProtectedPage({
  loading: elements.loading,
  authRequired: elements.auth,
  view: elements.view,
  onReady: async session => {
    userId = session.user.id;
    await load();
  }
}).catch(() => {
  elements.warning.hidden = false;
});
