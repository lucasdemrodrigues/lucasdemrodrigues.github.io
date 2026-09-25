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
  loading: $("#culture-loading"),
  auth: $("#culture-auth-required"),
  view: $("#culture-view"),
  logout: $("#logout-button"),
  newButton: $("#new-culture-button"),
  exportButton: $("#export-culture-button"),
  dialog: $("#culture-dialog"),
  form: $("#culture-form"),
  close: $("#dialog-close"),
  cancel: $("#cancel-culture-button"),
  remove: $("#delete-culture-button"),
  save: $("#save-culture-button"),
  id: $("#culture-id"),
  type: $("#culture-type"),
  title: $("#culture-title"),
  creator: $("#culture-creator"),
  date: $("#culture-date"),
  genre: $("#culture-genre"),
  rating: $("#culture-rating"),
  platform: $("#culture-platform"),
  notes: $("#culture-notes"),
  message: $("#culture-form-message"),
  search: $("#culture-search"),
  typeFilter: $("#type-filter"),
  yearFilter: $("#year-filter"),
  list: $("#culture-list"),
  empty: $("#culture-empty"),
  warning: $("#culture-setup-warning"),
  count: $("#culture-count"),
  total: $("#kpi-total"),
  movies: $("#kpi-movies"),
  books: $("#kpi-books"),
  ratingAverage: $("#kpi-rating"),
  dialogTitle: $("#culture-dialog-title")
};

let rows = [];
let ready = true;
let userId = null;

function openForm(row) {
  elements.form.reset();
  elements.id.value = "";
  elements.type.value = "Filme";
  elements.date.value = todayIso();
  elements.remove.hidden = true;
  elements.dialogTitle.textContent = "Novo registro";

  if (row) {
    elements.id.value = row.id;
    elements.type.value = row.item_type;
    elements.title.value = row.title || "";
    elements.creator.value = row.creator || "";
    elements.date.value = row.completed_at || todayIso();
    elements.genre.value = row.genre || "";
    elements.rating.value = row.rating ?? "";
    elements.platform.value = row.platform || "";
    elements.notes.value = row.notes || "";
    elements.remove.hidden = false;
    elements.dialogTitle.textContent = "Editar registro";
  }

  elements.dialog.showModal();
  setTimeout(() => elements.title.focus(), 0);
}

function closeForm() {
  if (elements.dialog.open) elements.dialog.close();
}

function filteredRows() {
  const query = elements.search.value.trim().toLowerCase();
  const type = elements.typeFilter.value;
  const year = elements.yearFilter.value;
  const currentYear = String(new Date().getFullYear());

  return rows.filter(row => {
    const haystack = `${row.title} ${row.creator || ""}`.toLowerCase();

    if (query && !haystack.includes(query)) return false;
    if (type !== "all" && row.item_type !== type) return false;
    if (year === "current" && !String(row.completed_at || "").startsWith(currentYear)) return false;
    if (year !== "current" && year !== "all" && !String(row.completed_at || "").startsWith(year)) return false;

    return true;
  });
}

function syncYearOptions() {
  const currentYear = String(new Date().getFullYear());
  const selected = elements.yearFilter.value;
  const years = [...new Set(
    rows
      .map(row => String(row.completed_at || "").slice(0, 4))
      .filter(year => /^\d{4}$/.test(year) && year !== currentYear)
  )].sort((a, b) => Number(b) - Number(a));

  elements.yearFilter.replaceChildren(
    new Option("Este ano", "current"),
    ...years.map(year => new Option(year, year)),
    new Option("Todos", "all")
  );

  elements.yearFilter.value = [...elements.yearFilter.options]
    .some(option => option.value === selected)
      ? selected
      : "current";
}

function exportCulture() {
  const data = filteredRows();

  if (!data.length) {
    alert("Não há registros para exportar com os filtros atuais.");
    return;
  }

  const period = elements.yearFilter.value === "current"
    ? String(new Date().getFullYear())
    : elements.yearFilter.value === "all"
      ? "todos"
      : elements.yearFilter.value;

  exportRowsToExcel({
    rows: data,
    columns: [
      { header: "Tipo", value: row => row.item_type },
      { header: "Título", value: row => row.title },
      { header: "Autor / Diretor", value: row => row.creator || "" },
      { header: "Data de conclusão", value: row => formatDate(row.completed_at) },
      { header: "Gênero", value: row => row.genre || "" },
      { header: "Nota", value: row => row.rating ?? "" },
      { header: "Onde / Formato", value: row => row.platform || "" },
      { header: "Observações", value: row => row.notes || "" }
    ],
    widths: [10, 34, 28, 18, 22, 8, 20, 45],
    sheetName: "Cultura",
    fileName: `cultura_${period}.xlsx`
  });
}

function render() {
  const currentYear = String(new Date().getFullYear());
  const yearRows = rows.filter(row => String(row.completed_at || "").startsWith(currentYear));

  elements.total.textContent = yearRows.length;
  elements.movies.textContent = yearRows.filter(row => row.item_type === "Filme").length;
  elements.books.textContent = yearRows.filter(row => row.item_type === "Livro").length;

  const rated = yearRows.filter(row => Number.isFinite(Number(row.rating)));
  elements.ratingAverage.textContent = rated.length
    ? (rated.reduce((sum, row) => sum + Number(row.rating), 0) / rated.length)
        .toFixed(1)
        .replace(".", ",")
    : "—";

  const data = filteredRows();
  elements.count.textContent = `${data.length} ${data.length === 1 ? "registro" : "registros"}`;
  elements.empty.hidden = data.length !== 0 || !ready;

  elements.list.innerHTML = data.map(row => `
    <article class="culture-row" data-id="${escapeHtml(row.id)}">
      <span class="culture-type">${escapeHtml(row.item_type)}</span>
      <div class="culture-main">
        <strong>${escapeHtml(row.title)}</strong>
        <span>${escapeHtml(row.genre || "Gênero não informado")}</span>
      </div>
      <div class="culture-creator">
        ${escapeHtml(row.creator || "—")}
        <span>${escapeHtml(row.platform || "")}</span>
      </div>
      <time class="culture-date">${formatDate(row.completed_at)}</time>
      <div class="culture-rating">${row.rating ? escapeHtml(row.rating) + "/10" : "—"}</div>
      <button class="row-menu" type="button" aria-label="Editar registro">•••</button>
    </article>
  `).join("");

  elements.list.querySelectorAll(".culture-row").forEach(rowElement => {
    rowElement.querySelector(".row-menu").onclick = () =>
      openForm(rows.find(row => row.id === rowElement.dataset.id));
  });
}

async function load() {
  ready = true;
  elements.warning.hidden = true;

  const { data, error } = await supabase
    .from("culture_items")
    .select("*")
    .order("completed_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (
      error.code === "42P01" ||
      /culture_items|schema cache|does not exist/i.test(error.message || "")
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
  syncYearOptions();
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
    item_type: elements.type.value,
    title: elements.title.value.trim(),
    creator: elements.creator.value.trim() || null,
    completed_at: elements.date.value,
    genre: elements.genre.value.trim() || null,
    rating: elements.rating.value ? Number(elements.rating.value) : null,
    platform: elements.platform.value.trim() || null,
    notes: elements.notes.value.trim() || null
  };

  elements.save.disabled = true;
  elements.message.textContent = "";
  elements.message.classList.remove("is-error");

  const query = elements.id.value
    ? supabase.from("culture_items").update(payload).eq("id", elements.id.value)
    : supabase.from("culture_items").insert(payload);

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
  if (!elements.id.value || !confirm("Excluir este registro?")) return;

  await supabase
    .from("culture_items")
    .delete()
    .eq("id", elements.id.value);

  closeForm();
  await load();
});

elements.newButton.addEventListener("click", () => {
  ready ? openForm() : elements.warning.scrollIntoView({ behavior: "smooth" });
});

elements.exportButton.addEventListener("click", exportCulture);
elements.close.addEventListener("click", closeForm);
elements.cancel.addEventListener("click", closeForm);
elements.search.addEventListener("input", render);
elements.typeFilter.addEventListener("change", render);
elements.yearFilter.addEventListener("change", render);

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
