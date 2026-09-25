import {
  $,
  bindLogout,
  escapeHtml,
  formatDate,
  initProtectedPage,
  supabase,
  todayIso
} from "./shared.js";

import { bindAiInsight } from "./ai-insights.js";
import { exportWorkbookToExcel } from "./export-excel.js";

const elements = {
  loading: $("#health-loading"), auth: $("#health-auth-required"), view: $("#health-view"),
  logout: $("#logout-button"), exportButton: $("#export-health-button"),
  newButton: $("#new-health-button"), dialog: $("#health-dialog"), form: $("#health-form"),
  close: $("#dialog-close"), cancel: $("#cancel-health-button"), remove: $("#delete-health-button"),
  save: $("#save-health-button"), id: $("#health-id"), specialty: $("#health-specialty"),
  provider: $("#health-provider"), lastVisit: $("#health-last-visit"), nextVisit: $("#health-next-visit"),
  frequency: $("#health-frequency"), status: $("#health-status"), contact: $("#health-contact"),
  notes: $("#health-notes"), message: $("#health-form-message"), search: $("#health-search"),
  statusFilter: $("#status-filter"), list: $("#health-list"), empty: $("#health-empty"),
  warning: $("#health-setup-warning"), count: $("#health-count"), upToDate: $("#kpi-up-to-date"),
  toSchedule: $("#kpi-to-schedule"), scheduled: $("#kpi-scheduled"), next: $("#kpi-next"),
  nextLabel: $("#kpi-next-label"), dialogTitle: $("#health-dialog-title"),
  newWeight: $("#new-weight-button"), weightDialog: $("#weight-dialog"), weightForm: $("#weight-form"),
  weightClose: $("#weight-close"), weightCancel: $("#weight-cancel"), weightSave: $("#weight-save"),
  weightDate: $("#weight-date"), weightValue: $("#weight-value"), weightNotes: $("#weight-notes"),
  weightMessage: $("#weight-message"), weightCurrent: $("#weight-current"), weightChange: $("#weight-change"),
  weightCount: $("#weight-count"), weightList: $("#weight-list"), weightEmpty: $("#weight-empty"),
  newPressure: $("#new-pressure-button"), pressureDialog: $("#pressure-dialog"),
  pressureForm: $("#pressure-form"), pressureClose: $("#pressure-close"), pressureCancel: $("#pressure-cancel"),
  pressureSave: $("#pressure-save"), pressureMeasuredAt: $("#pressure-measured-at"),
  pressureSystolic: $("#pressure-systolic"), pressureDiastolic: $("#pressure-diastolic"),
  pressurePulse: $("#pressure-pulse"), pressureNotes: $("#pressure-notes"),
  pressureMessage: $("#pressure-message"), pressureLatest: $("#pressure-latest"),
  pulseLatest: $("#pulse-latest"), pressureCount: $("#pressure-count"),
  pressureList: $("#pressure-list"), pressureEmpty: $("#pressure-empty")
};

let followups = [], weights = [], pressures = [], ready = true, userId = null;

const localDateTimeValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDateTime = value => value
  ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
  : "—";

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

function closeForm(dialog = elements.dialog) {
  if (dialog.open) dialog.close();
}

function filteredFollowups() {
  const query = elements.search.value.trim().toLowerCase();
  const status = elements.statusFilter.value;
  return followups.filter(row => {
    const haystack = `${row.specialty} ${row.provider || ""} ${row.contact || ""}`.toLowerCase();
    return (!query || haystack.includes(query)) && (status === "all" || row.status === status);
  });
}

function renderFollowups() {
  elements.upToDate.textContent = followups.filter(row => row.status === "Em dia").length;
  elements.toSchedule.textContent = followups.filter(row => row.status === "Para agendar").length;
  elements.scheduled.textContent = followups.filter(row => row.status === "Agendada").length;
  const upcoming = followups.filter(row => row.next_visit).sort((a,b) => a.next_visit.localeCompare(b.next_visit))[0];
  elements.next.textContent = upcoming ? formatDate(upcoming.next_visit).slice(0,5) : "—";
  elements.nextLabel.textContent = upcoming ? upcoming.specialty : "Nenhuma agendada";

  const data = filteredFollowups();
  elements.count.textContent = `${data.length} ${data.length === 1 ? "registro" : "registros"}`;
  elements.empty.hidden = data.length !== 0 || !ready;
  elements.list.innerHTML = data.map(row => `
    <article class="health-row" data-id="${escapeHtml(row.id)}">
      <div class="health-main"><strong>${escapeHtml(row.specialty)}</strong><span>${escapeHtml(row.frequency || "Periodicidade não informada")}</span></div>
      <div class="health-provider">${escapeHtml(row.provider || "Profissional não informado")}<span>${escapeHtml(row.contact || "")}</span></div>
      <time class="health-date last">${row.last_visit ? formatDate(row.last_visit) : "—"}<span>Última</span></time>
      <time class="health-date">${row.next_visit ? formatDate(row.next_visit) : "—"}<span>Próxima</span></time>
      <span class="health-status" data-status="${escapeHtml(row.status)}">${escapeHtml(row.status)}</span>
      <button class="row-menu" type="button" aria-label="Editar acompanhamento">•••</button>
    </article>`).join("");
  elements.list.querySelectorAll(".health-row").forEach(rowElement => {
    rowElement.querySelector(".row-menu").onclick = () =>
      openForm(followups.find(row => row.id === rowElement.dataset.id));
  });
}

function renderWeights() {
  const sorted = [...weights].sort((a,b) => b.measurement_date.localeCompare(a.measurement_date));
  const latest = sorted[0];
  const first = [...weights].sort((a,b) => a.measurement_date.localeCompare(b.measurement_date))[0];
  elements.weightCurrent.textContent = latest ? `${Number(latest.weight_kg).toFixed(1).replace(".",",")} kg` : "—";
  if (latest && first) {
    const change = Number(latest.weight_kg) - Number(first.weight_kg);
    const sign = change > 0 ? "+" : "";
    elements.weightChange.textContent = `${sign}${change.toFixed(1).replace(".",",")} kg`;
  } else {
    elements.weightChange.textContent = "—";
  }
  elements.weightCount.textContent = weights.length;
  elements.weightEmpty.hidden = weights.length !== 0;
  elements.weightList.innerHTML = sorted.map(row => `
    <div class="measurement-row">
      <div class="measurement-meta">${formatDate(row.measurement_date)}</div>
      <div class="measurement-value">${Number(row.weight_kg).toFixed(1).replace(".",",")} kg</div>
      <div class="measurement-notes">${escapeHtml(row.notes || "")}</div>
      <button class="measurement-delete" type="button" data-weight-id="${escapeHtml(row.id)}" aria-label="Excluir peso">×</button>
    </div>`).join("");
  elements.weightList.querySelectorAll("[data-weight-id]").forEach(button => {
    button.onclick = () => deleteWeight(button.dataset.weightId);
  });
}

function renderPressures() {
  const sorted = [...pressures].sort((a,b) => b.measured_at.localeCompare(a.measured_at));
  const latest = sorted[0];
  elements.pressureLatest.textContent = latest ? `${latest.systolic}/${latest.diastolic}` : "—";
  elements.pulseLatest.textContent = latest?.pulse ? `${latest.pulse} bpm` : "—";
  elements.pressureCount.textContent = pressures.length;
  elements.pressureEmpty.hidden = pressures.length !== 0;
  elements.pressureList.innerHTML = sorted.map(row => `
    <div class="measurement-row">
      <div class="measurement-meta">${formatDateTime(row.measured_at)}</div>
      <div class="measurement-value">${row.systolic}/${row.diastolic} mmHg${row.pulse ? ` · ${row.pulse} bpm` : ""}</div>
      <div class="measurement-notes">${escapeHtml(row.notes || "")}</div>
      <button class="measurement-delete" type="button" data-pressure-id="${escapeHtml(row.id)}" aria-label="Excluir pressão">×</button>
    </div>`).join("");
  elements.pressureList.querySelectorAll("[data-pressure-id]").forEach(button => {
    button.onclick = () => deletePressure(button.dataset.pressureId);
  });
}

async function load() {
  ready = true;
  elements.warning.hidden = true;
  const [followupResult, weightResult, pressureResult] = await Promise.all([
    supabase.from("health_followups").select("*").order("next_visit",{ascending:true,nullsFirst:false}).order("specialty"),
    supabase.from("health_weight_logs").select("*").order("measurement_date",{ascending:false}),
    supabase.from("health_blood_pressure_logs").select("*").order("measured_at",{ascending:false})
  ]);

  const missing = [followupResult, weightResult, pressureResult].find(result =>
    result.error && (result.error.code === "42P01" || /does not exist|schema cache/i.test(result.error.message || ""))
  );
  if (missing) {
    ready = false;
    elements.warning.hidden = false;
  }

  if (followupResult.error && !missing) throw followupResult.error;
  if (weightResult.error && !missing) throw weightResult.error;
  if (pressureResult.error && !missing) throw pressureResult.error;

  followups = followupResult.data || [];
  weights = weightResult.data || [];
  pressures = pressureResult.data || [];
  renderFollowups();
  renderWeights();
  renderPressures();
}

function exportHealth() {
  if (!followups.length && !weights.length && !pressures.length) {
    alert("Não há registros de Saúde para exportar.");
    return;
  }
  exportWorkbookToExcel({
    fileName: "saude.xlsx",
    sheets: [
      {
        sheetName: "Consultas", rows: followups,
        columns: [
          {header:"Especialidade",value:r=>r.specialty},{header:"Profissional / Clínica",value:r=>r.provider||""},
          {header:"Última consulta",value:r=>r.last_visit?formatDate(r.last_visit):""},{header:"Próxima consulta",value:r=>r.next_visit?formatDate(r.next_visit):""},
          {header:"Periodicidade",value:r=>r.frequency||""},{header:"Status",value:r=>r.status},
          {header:"Contato / Local",value:r=>r.contact||""},{header:"Observações",value:r=>r.notes||""}
        ], widths:[22,30,18,18,20,16,30,45]
      },
      {
        sheetName: "Peso", rows: weights,
        columns: [
          {header:"Data",value:r=>formatDate(r.measurement_date)},{header:"Peso (kg)",value:r=>Number(r.weight_kg)},
          {header:"Observações",value:r=>r.notes||""}
        ], widths:[16,14,45]
      },
      {
        sheetName: "Pressão", rows: pressures,
        columns: [
          {header:"Data e hora",value:r=>formatDateTime(r.measured_at)},{header:"Sistólica",value:r=>r.systolic},
          {header:"Diastólica",value:r=>r.diastolic},{header:"Pulso (bpm)",value:r=>r.pulse??""},
          {header:"Observações",value:r=>r.notes||""}
        ], widths:[20,12,12,14,45]
      }
    ]
  });
}

elements.form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!elements.form.checkValidity()) return elements.form.reportValidity();
  const payload = {
    user_id:userId,specialty:elements.specialty.value.trim(),provider:elements.provider.value.trim()||null,
    last_visit:elements.lastVisit.value||null,next_visit:elements.nextVisit.value||null,
    frequency:elements.frequency.value||null,status:elements.status.value,contact:elements.contact.value.trim()||null,
    notes:elements.notes.value.trim()||null
  };
  elements.save.disabled = true;
  const query = elements.id.value
    ? supabase.from("health_followups").update(payload).eq("id",elements.id.value)
    : supabase.from("health_followups").insert(payload);
  const {error}=await query;
  elements.save.disabled=false;
  if(error){elements.message.textContent="Não foi possível salvar.";elements.message.classList.add("is-error");return}
  closeForm(); await load();
});

elements.weightForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!elements.weightForm.checkValidity()) return elements.weightForm.reportValidity();
  elements.weightSave.disabled = true;
  const {error}=await supabase.from("health_weight_logs").upsert({
    user_id:userId,measurement_date:elements.weightDate.value,weight_kg:Number(elements.weightValue.value),
    notes:elements.weightNotes.value.trim()||null
  },{onConflict:"user_id,measurement_date"});
  elements.weightSave.disabled=false;
  if(error){elements.weightMessage.textContent="Não foi possível salvar.";elements.weightMessage.classList.add("is-error");return}
  closeForm(elements.weightDialog); await load();
});

elements.pressureForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!elements.pressureForm.checkValidity()) return elements.pressureForm.reportValidity();
  elements.pressureSave.disabled = true;
  const {error}=await supabase.from("health_blood_pressure_logs").insert({
    user_id:userId,measured_at:new Date(elements.pressureMeasuredAt.value).toISOString(),
    systolic:Number(elements.pressureSystolic.value),diastolic:Number(elements.pressureDiastolic.value),
    pulse:elements.pressurePulse.value?Number(elements.pressurePulse.value):null,
    notes:elements.pressureNotes.value.trim()||null
  });
  elements.pressureSave.disabled=false;
  if(error){elements.pressureMessage.textContent="Não foi possível salvar.";elements.pressureMessage.classList.add("is-error");return}
  closeForm(elements.pressureDialog); await load();
});

async function deleteWeight(id){if(!confirm("Excluir este registro de peso?"))return;await supabase.from("health_weight_logs").delete().eq("id",id);await load()}
async function deletePressure(id){if(!confirm("Excluir esta medição de pressão?"))return;await supabase.from("health_blood_pressure_logs").delete().eq("id",id);await load()}

elements.remove.addEventListener("click",async()=>{if(!elements.id.value||!confirm("Excluir este acompanhamento?"))return;await supabase.from("health_followups").delete().eq("id",elements.id.value);closeForm();await load()});
elements.nextVisit.addEventListener("change",()=>{if(elements.nextVisit.value)elements.status.value="Agendada"});
elements.newButton.addEventListener("click",()=>ready?openForm():elements.warning.scrollIntoView({behavior:"smooth"}));
elements.newWeight.addEventListener("click",()=>{elements.weightForm.reset();elements.weightDate.value=todayIso();elements.weightMessage.textContent="";elements.weightDialog.showModal()});
elements.newPressure.addEventListener("click",()=>{elements.pressureForm.reset();elements.pressureMeasuredAt.value=localDateTimeValue();elements.pressureMessage.textContent="";elements.pressureDialog.showModal()});
elements.exportButton.addEventListener("click",exportHealth);
elements.close.addEventListener("click",()=>closeForm());
elements.cancel.addEventListener("click",()=>closeForm());
elements.weightClose.addEventListener("click",()=>closeForm(elements.weightDialog));
elements.weightCancel.addEventListener("click",()=>closeForm(elements.weightDialog));
elements.pressureClose.addEventListener("click",()=>closeForm(elements.pressureDialog));
elements.pressureCancel.addEventListener("click",()=>closeForm(elements.pressureDialog));
elements.search.addEventListener("input",renderFollowups);
elements.statusFilter.addEventListener("change",renderFollowups);

bindLogout(elements.logout);
initProtectedPage({
  loading:elements.loading,authRequired:elements.auth,view:elements.view,
  onReady:async session=>{userId=session.user.id;await load()}
}).catch(()=>{elements.warning.hidden=false});


bindAiInsight({
  button: document.querySelector("#health-ai-button"),
  output: document.querySelector("#health-ai-output"),
  scope: "health"
});
