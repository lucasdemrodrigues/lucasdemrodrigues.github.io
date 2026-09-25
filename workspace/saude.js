import {
  $,
  bindLogout,
  escapeHtml,
  formatDate,
  initProtectedPage,
  supabase
} from "./shared.js";
import { exportRowsToExcel } from "./export-excel.js";

const elements = {
  loading: $("#health-loading"),
  auth: $("#health-auth-required"),
  view: $("#health-view"),
  logout: $("#logout-button"),
  newButton: $("#new-health-button"),
  exportButton: $("#export-health-button"),
  dialog: $("#health-dialog"),
  form: $("#health-form"),
  close: $("#dialog-close"),
  cancel: $("#cancel-health-button"),
  remove: $("#delete-health-button"),
  save: $("#save-health-button"),
  id: $("#health-id"),
  specialty: $("#health-specialty"),
  provider: $("#health-provider"),
  lastVisit: $("#health-last-visit"),
  nextVisit: $("#health-next-visit"),
  frequency: $("#health-frequency"),
  status: $("#health-status"),
  contact: $("#health-contact"),
  notes: $("#health-notes"),
  message: $("#health-form-message"),
  search: $("#health-search"),
  statusFilter: $("#status-filter"),
  list: $("#health-list"),
  empty: $("#health-empty"),
  warning: $("#health-setup-warning"),
  count: $("#health-count"),
  upToDate: $("#kpi-up-to-date"),
  toSchedule: $("#kpi-to-schedule"),
  scheduled: $("#kpi-scheduled"),
  next: $("#kpi-next"),
  nextLabel: $("#kpi-next-label"),
  dialogTitle: $("#health-dialog-title")
};

let rows = [];
let ready = true;
let userId = null;

function openForm(row) {
  elements.form.reset();
  elements.id.value = "";
  elements.status.value = "Em dia";
  elements.remove.hidden = true;
  elements.dialogTitle.textContent = "Novo acompanhamento";

  if (row) {
    elements.id.value = row.id;
    elements.specialty.value = row.specialty || "";
    elements.provider.value = row.provider || "";
    elements.lastVisit.value = row.last_visit || "";
    elements.nextVisit.value = row.next_visit || "";
    elements.frequency.value = row.frequency || "";
    elements.status.value = row.status || "Em dia";
    elements.contact.value = row.contact || "";
    elements.notes.value = row.notes || "";
    elements.remove.hidden = false;
    elements.dialogTitle.textContent = "Editar acompanhamento";
  }

  elements.dialog.showModal();
  setTimeout(() => elements.specialty.focus(), 0);
}

function closeForm() {
  if (elements.dialog.open) elements.dialog.close();
}

function filteredRows() {
  const query = elements.search.value.trim().toLowerCase();
  const status = elements.statusFilter.value;

  return rows.filter(row => {
    const haystack = `${row.specialty} ${row.provider || ""} ${row.contact || ""}`.toLowerCase();

    if (query && !haystack.includes(query)) return false;
    if (status !== "all" && row.status !== status) return false;

    return true;
  });
}

function exportHealth() {
  const data = filteredRows();

  if (!data.length) {
    alert("Não há registros para exportar com os filtros atuais.");
    return;
  }

  exportRowsToExcel({
    rows: data,
    columns: [
      { header: "Especialidade", value: row => row.specialty },
      { header: "Profissional / Clínica", value: row => row.provider || "" },
      { header: "Última consulta", value: row => row.last_visit ? formatDate(row.last_visit) : "" },
      { header: "Próxima consulta", value: row => row.next_visit ? formatDate(row.next_visit) : "" },
      { header: "Periodicidade", value: row => row.frequency || "" },
      { header: "Status", value: row => row.status },
      { header: "Contato / Local", value: row => row.contact || "" },
      { header: "Observações", value: row => row.notes || "" }
    ],
    widths: [22, 30, 18, 18, 20, 16, 30, 45],
    sheetName: "Saúde",
    fileName: "saude.xlsx"
  });
}

function render() {
  elements.upToDate.textContent = rows.filter(row => row.status === "Em dia").length;
  elements.toSchedule.textContent = rows.filter(row => row.status === "Para agendar").length;
  elements.scheduled.textContent = rows.filter(row => row.status === "Agendada").length;

  const upcoming = rows
    .filter(row => row.next_visit)
    .sort((a, b) => a.next_visit.localeCompare(b.next_visit))[0];

  if (upcoming) {
    elements.next.textContent = formatDate(upcoming.next_visit).slice(0, 5);
    elements.nextLabel.textContent = upcoming.specialty;
  } else {
    elements.next.textContent = "—";
    elements.nextLabel.textContent = "Nenhuma agendada";
  }

  const data = filteredRows();
  elements.count.textContent = `${data.length} ${data.length === 1 ? "registro" : "registros"}`;
  elements.empty.hidden = data.length !== 0 || !ready;

  elements.list.innerHTML = data.map(row => `
    <article class="health-row" data-id="${escapeHtml(row.id)}">
      <div class="health-main">
        <strong>${escapeHtml(row.specialty)}</strong>
        <span>${escapeHtml(row.frequency || "Periodicidade não informada")}</span>
      </div>
      <div class="health-provider">
        ${escapeHtml(row.provider || "Profissional não informado")}
        <span>${escapeHtml(row.contact || "")}</span>
      </div>
      <time class="health-date last">${row.last_visit ? formatDate(row.last_visit) : "—"}<span>Última</span></time>
      <time class="health-date">${row.next_visit ? formatDate(row.next_visit) : "—"}<span>Próxima</span></time>
      <span class="health-status" data-status="${escapeHtml(row.status)}">${escapeHtml(row.status)}</span>
      <button class="row-menu" type="button" aria-label="Editar acompanhamento">•••</button>
    </article>
  `).join("");

  elements.list.querySelectorAll(".health-row").forEach(rowElement => {
    rowElement.querySelector(".row-menu").onclick = () =>
      openForm(rows.find(row => row.id === rowElement.dataset.id));
  });
}

async function load() {
  ready = true;
  elements.warning.hidden = true;

  const { data, error } = await supabase
    .from("health_followups")
    .select("*")
    .order("next_visit", { ascending: true, nullsFirst: false })
    .order("specialty", { ascending: true });

  if (error) {
    if (
      error.code === "42P01" ||
      /health_followups|schema cache|does not exist/i.test(error.message || "")
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

  const payload = {
    user_id: userId,
    specialty: elements.specialty.value.trim(),
    provider: elements.provider.value.trim() || null,
    last_visit: elements.lastVisit.value || null,
    next_visit: elements.nextVisit.value || null,
    frequency: elements.frequency.value || null,
    status: elements.status.value,
    contact: elements.contact.value.trim() || null,
    notes: elements.notes.value.trim() || null
  };

  elements.save.disabled = true;
  elements.message.textContent = "";
  elements.message.classList.remove("is-error");

  const query = elements.id.value
    ? supabase.from("health_followups").update(payload).eq("id", elements.id.value)
    : supabase.from("health_followups").insert(payload);

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
  if (!elements.id.value || !confirm("Excluir este acompanhamento?")) return;

  await supabase
    .from("health_followups")
    .delete()
    .eq("id", elements.id.value);

  closeForm();
  await load();
});

elements.nextVisit.addEventListener("change", () => {
  if (elements.nextVisit.value) elements.status.value = "Agendada";
});

elements.newButton.addEventListener("click", () => {
  ready ? openForm() : elements.warning.scrollIntoView({ behavior: "smooth" });
});

elements.exportButton.addEventListener("click", exportHealth);
elements.close.addEventListener("click", closeForm);
elements.cancel.addEventListener("click", closeForm);
elements.search.addEventListener("input", render);
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
