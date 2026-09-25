import {
  $,
  bindLogout,
  escapeHtml,
  formatDate,
  initProtectedPage,
  supabase,
  todayIso
} from "./shared.js";

import { bindAiInsight } from "./ai-insights.js";import { exportRowsToExcel } from "./export-excel.js";

const elements = {
  loading: $("#career-loading"),
  auth: $("#career-auth-required"),
  view: $("#career-view"),
  logout: $("#logout-button"),
  newButton: $("#new-application-button"),
  exportButton: $("#export-career-button"),
  dialog: $("#application-dialog"),
  form: $("#application-form"),
  close: $("#dialog-close"),
  cancel: $("#cancel-application-button"),
  remove: $("#delete-application-button"),
  save: $("#save-application-button"),
  id: $("#application-id"),
  company: $("#company"),
  role: $("#role"),
  date: $("#applied-at"),
  applicationDeadline: $("#application-deadline"),
  status: $("#status"),
  source: $("#source"),
  model: $("#work-model"),
  location: $("#location"),
  salary: $("#salary"),
  url: $("#job-url"),
  notes: $("#notes"),
  message: $("#form-message"),
  search: $("#career-search"),
  statusFilter: $("#status-filter"),
  periodFilter: $("#period-filter"),
  list: $("#applications-list"),
  empty: $("#applications-empty"),
  warning: $("#career-setup-warning"),
  count: $("#applications-count"),
  saved: $("#kpi-saved"),
  total: $("#kpi-total"),
  active: $("#kpi-active"),
  interviews: $("#kpi-interviews"),
  rate: $("#kpi-response-rate"),
  dialogTitle: $("#application-dialog-title")
};

const TERMINAL_STATUSES = new Set(["Oferta", "Reprovado", "Desistência"]);
const ADVANCED_STATUSES = new Set([
  "Em análise",
  "Entrevista",
  "Case/Teste",
  "Oferta",
  "Reprovado",
  "Desistência"
]);
const INTERVIEW_STATUSES = new Set(["Entrevista", "Case/Teste", "Oferta"]);
const PRE_APPLICATION_STATUS = "Para candidatar";

let rows = [];
let ready = true;

const daysSince = date => {
  if (!date) return "";

  const start = new Date(date + "T12:00:00");
  const now = new Date();

  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const days = Math.max(0, Math.floor((now - start) / 86400000));

  if (days === 0) return "Hoje";
  if (days === 1) return "Há 1 dia";
  return `Há ${days} dias`;
};

function openForm(row) {
  elements.form.reset();
  elements.id.value = "";
  elements.date.value = "";
  elements.applicationDeadline.value = "";
  elements.status.value = PRE_APPLICATION_STATUS;
  elements.remove.hidden = true;
  elements.dialogTitle.textContent = "Nova candidatura";

  if (row) {
    elements.id.value = row.id;
    elements.company.value = row.company || "";
    elements.role.value = row.role || "";
    elements.date.value = row.applied_at || "";
    elements.applicationDeadline.value = row.application_deadline || "";
    elements.status.value = row.status || PRE_APPLICATION_STATUS;
    elements.source.value = row.source || "";
    elements.model.value = row.work_model || "";
    elements.location.value = row.location || "";
    elements.salary.value = row.salary || "";
    elements.url.value = row.job_url || "";
    elements.notes.value = row.notes || "";
    elements.remove.hidden = false;
    elements.dialogTitle.textContent = "Editar candidatura";
  }

  elements.dialog.showModal();
  setTimeout(() => elements.company.focus(), 0);
}

function closeForm() {
  if (elements.dialog.open) elements.dialog.close();
}

function filteredRows() {
  const query = elements.search.value.trim().toLowerCase();
  const status = elements.statusFilter.value;
  const period = elements.periodFilter.value;
  const currentYear = new Date().getFullYear();

  return rows.filter(row => {
    if (query && !(`${row.company} ${row.role}`).toLowerCase().includes(query)) {
      return false;
    }

    if (status !== "all" && row.status !== status) return false;

    if (period !== "all") {
      const baseDate = row.applied_at || row.created_at?.slice(0, 10);
      if (!baseDate) return false;

      const date = new Date(baseDate + "T12:00:00");

      if (period === "year" && date.getFullYear() !== currentYear) return false;

      if (period === "30" || period === "90") {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - Number(period));
        if (date < cutoff) return false;
      }
    }

    return true;
  });
}

function exportCareer() {
  const data = filteredRows();

  if (!data.length) {
    alert("Não há registros para exportar com os filtros atuais.");
    return;
  }

  exportRowsToExcel({
    rows: data,
    columns: [
      { header: "Empresa", value: row => row.company },
      { header: "Vaga", value: row => row.role },
      { header: "Status", value: row => row.status },
      { header: "Data da candidatura", value: row => row.applied_at ? formatDate(row.applied_at) : "" },
      { header: "Prazo para candidatar", value: row => row.application_deadline ? formatDate(row.application_deadline) : "" },
      { header: "Fonte", value: row => row.source || "" },
      { header: "Modelo", value: row => row.work_model || "" },
      { header: "Localização", value: row => row.location || "" },
      { header: "Faixa salarial", value: row => row.salary || "" },
      { header: "Link da vaga", value: row => row.job_url || "" },
      { header: "Observações", value: row => row.notes || "" }
    ],
    widths: [24, 32, 18, 20, 22, 16, 14, 20, 18, 42, 45],
    sheetName: "Carreira",
    fileName: "carreira.xlsx"
  });
}

function render() {
  const saved = rows.filter(row => row.status === PRE_APPLICATION_STATUS);
  const applications = rows.filter(row => row.status !== PRE_APPLICATION_STATUS);

  elements.saved.textContent = saved.length;

  elements.total.textContent = applications.length;
  elements.active.textContent = applications.filter(row => !TERMINAL_STATUSES.has(row.status)).length;
  elements.interviews.textContent = applications.filter(row => INTERVIEW_STATUSES.has(row.status)).length;
  elements.rate.textContent =
    (applications.length
      ? Math.round(applications.filter(row => ADVANCED_STATUSES.has(row.status)).length / applications.length * 100)
      : 0) + "%";

  const data = filteredRows();
  elements.count.textContent = `${data.length} ${data.length === 1 ? "registro" : "registros"}`;
  elements.empty.hidden = data.length !== 0 || !ready;

  elements.list.innerHTML = data.map(row => {
    const displayDate = row.status === PRE_APPLICATION_STATUS
      ? (row.application_deadline ? formatDate(row.application_deadline) : "Sem prazo")
      : formatDate(row.applied_at);

    const dateCaption = row.status === PRE_APPLICATION_STATUS
      ? "Para candidatar"
      : daysSince(row.applied_at);

    return `
      <article class="application-row" data-id="${escapeHtml(row.id)}">
        <div class="application-company">
          <strong>${escapeHtml(row.company)}</strong>
          <span>${escapeHtml(row.source || "Fonte não informada")}</span>
        </div>
        <div class="application-role">
          ${escapeHtml(row.role)}
          <span>${escapeHtml(row.work_model || row.location || "Modelo não informado")}</span>
        </div>
        <time class="application-date" datetime="${escapeHtml(row.applied_at || row.application_deadline || "")}">
          ${displayDate}
          <span>${dateCaption}</span>
        </time>
        <span class="status-badge" data-status="${escapeHtml(row.status)}">${escapeHtml(row.status)}</span>
        <button class="row-menu" type="button" aria-label="Editar">•••</button>
      </article>
    `;
  }).join("");

  elements.list.querySelectorAll(".application-row").forEach(rowElement => {
    rowElement.querySelector("button").onclick = () =>
      openForm(rows.find(row => String(row.id) === rowElement.dataset.id));
  });
}

async function load() {
  ready = true;
  elements.warning.hidden = true;

  const { data, error } = await supabase
    .from("career_applications")
    .select("*")
    .order("applied_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (
      error.code === "42P01" ||
      /career_applications|schema cache|does not exist/i.test(error.message || "")
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

elements.form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!elements.form.checkValidity()) {
    elements.form.reportValidity();
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  elements.save.disabled = true;
  elements.save.textContent = "Salvando…";
  elements.message.textContent = "";
  elements.message.classList.remove("is-error");

  if (elements.status.value !== PRE_APPLICATION_STATUS && !elements.date.value) {
    elements.message.textContent = "Informe a data da candidatura para este status.";
    elements.message.classList.add("is-error");
    elements.save.disabled = false;
    elements.save.textContent = "Salvar candidatura";
    return;
  }

  const payload = {
    user_id: user.id,
    company: elements.company.value.trim(),
    role: elements.role.value.trim(),
    applied_at: elements.status.value === PRE_APPLICATION_STATUS ? null : elements.date.value,
    application_deadline: elements.applicationDeadline.value || null,
    status: elements.status.value,
    source: elements.source.value || null,
    work_model: elements.model.value || null,
    location: elements.location.value.trim() || null,
    salary: elements.salary.value.trim() || null,
    job_url: elements.url.value.trim() || null,
    notes: elements.notes.value.trim() || null
  };

  const query = elements.id.value
    ? supabase.from("career_applications").update(payload).eq("id", elements.id.value)
    : supabase.from("career_applications").insert(payload);

  const { error } = await query;

  elements.save.disabled = false;
  elements.save.textContent = "Salvar candidatura";

  if (error) {
    elements.message.textContent = "Não foi possível salvar. Verifique a configuração do banco.";
    elements.message.classList.add("is-error");
    return;
  }

  closeForm();
  await load();
});

elements.remove.addEventListener("click", async () => {
  if (!elements.id.value || !confirm("Excluir esta candidatura?")) return;

  await supabase
    .from("career_applications")
    .delete()
    .eq("id", elements.id.value);

  closeForm();
  await load();
});

elements.newButton.addEventListener("click", () => {
  ready ? openForm() : elements.warning.scrollIntoView({ behavior: "smooth" });
});

elements.exportButton.addEventListener("click", exportCareer);
elements.close.addEventListener("click", closeForm);
elements.cancel.addEventListener("click", closeForm);
elements.search.addEventListener("input", render);
elements.statusFilter.addEventListener("change", render);
elements.periodFilter.addEventListener("change", render);

elements.status.addEventListener("change", () => {
  const isPreApplication = elements.status.value === PRE_APPLICATION_STATUS;

  if (isPreApplication) {
    elements.date.value = "";
  } else if (!elements.date.value) {
    elements.date.value = todayIso();
  }
});

bindLogout(elements.logout);

initProtectedPage({
  loading: elements.loading,
  authRequired: elements.auth,
  view: elements.view,
  onReady: load
}).catch(() => {
  elements.warning.hidden = false;
});


bindAiInsight({
  button: document.querySelector("#career-ai-button"),
  output: document.querySelector("#career-ai-output"),
  scope: "career"
});
