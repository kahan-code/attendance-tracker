import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://hwdwhrtsjhpbjcfzjcky.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Znet58KwaxCwGcgxxabHbw_bsf6eoY0";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const els = {
  statusBanner: document.getElementById("statusBanner"),
  newClassName: document.getElementById("newClassName"),
  newMaxLeaves: document.getElementById("newMaxLeaves"),
  addClassBtn: document.getElementById("addClassBtn"),
  classSelect: document.getElementById("classSelect"),
  markLeaveBtn: document.getElementById("markLeaveBtn"),
  removeClassBtn: document.getElementById("removeClassBtn"),
  editClassName: document.getElementById("editClassName"),
  editMaxLeaves: document.getElementById("editMaxLeaves"),
  editLeavesTaken: document.getElementById("editLeavesTaken"),
  saveClassBtn: document.getElementById("saveClassBtn"),
  leaveDateInput: document.getElementById("leaveDateInput"),
  saveDateBtn: document.getElementById("saveDateBtn"),
  cancelDateEditBtn: document.getElementById("cancelDateEditBtn"),
  dateList: document.getElementById("dateList"),
  statTotalClasses: document.getElementById("statTotalClasses"),
  statTotalTaken: document.getElementById("statTotalTaken"),
  statTotalRemaining: document.getElementById("statTotalRemaining"),
  showTableBtn: document.getElementById("showTableBtn"),
  resetAllBtn: document.getElementById("resetAllBtn"),
  tableWrap: document.getElementById("tableWrap"),
  tableArea: document.getElementById("tableArea")
};

const state = {
  classes: [],
  selectedId: null,
  editingDateIndex: null,
  tableVisible: false
};

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeDates(dates) {
  if (!Array.isArray(dates)) return [];
  return dates.filter((d) => typeof d === "string" && d.trim() !== "");
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function setStatus(message, type = "info") {
  els.statusBanner.textContent = message;
  els.statusBanner.className = `status-banner show ${type}`;
}

function clearStatus() {
  els.statusBanner.textContent = "";
  els.statusBanner.className = "status-banner";
}

function setEditorDisabled(disabled) {
  els.editClassName.disabled = disabled;
  els.editMaxLeaves.disabled = disabled;
  els.editLeavesTaken.disabled = disabled;
  els.leaveDateInput.disabled = disabled;
  els.saveDateBtn.disabled = disabled;
  els.cancelDateEditBtn.disabled = disabled;
  els.saveClassBtn.disabled = disabled;
}

function resetDateEditor() {
  state.editingDateIndex = null;
  els.leaveDateInput.value = "";
  els.saveDateBtn.textContent = "Add Leave Date";
  els.cancelDateEditBtn.disabled = true;
}

function clearClassEditor() {
  els.editClassName.value = "";
  els.editMaxLeaves.value = "";
  els.editLeavesTaken.value = "";
  els.dateList.innerHTML = "<p class='date-empty'>No class selected.</p>";
  setEditorDisabled(true);
  resetDateEditor();
}

function getSelectedClass() {
  return state.classes.find((item) => String(item.id) === String(state.selectedId)) || null;
}

function renderClassOptions() {
  const options = state.classes
    .map(
      (item) =>
        `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name || "Untitled class")}</option>`
    )
    .join("");

  els.classSelect.innerHTML = options;

  if (!state.classes.length) {
    state.selectedId = null;
    clearClassEditor();
    return;
  }

  if (!state.selectedId || !state.classes.some((item) => String(item.id) === String(state.selectedId))) {
    state.selectedId = state.classes[0].id;
  }

  els.classSelect.value = String(state.selectedId);
  fillClassEditor();
}

function renderDateList(classItem) {
  const dates = normalizeDates(classItem.dates);

  if (!dates.length) {
    els.dateList.innerHTML = "<p class='date-empty'>No leave dates yet.</p>";
    return;
  }

  els.dateList.innerHTML = dates
    .map(
      (dateValue, index) => `
        <div class="date-item">
          <span>${escapeHTML(dateValue)}</span>
          <div class="date-actions">
            <button type="button" class="small-btn btn-secondary date-edit-btn" data-index="${index}">Edit</button>
            <button type="button" class="small-btn btn-danger date-remove-btn" data-index="${index}">Remove</button>
          </div>
        </div>
      `
    )
    .join("");
}

function fillClassEditor() {
  const selected = getSelectedClass();
  if (!selected) {
    clearClassEditor();
    return;
  }

  els.editClassName.value = selected.name || "";
  els.editMaxLeaves.value = Number(selected.max) || 0;
  els.editLeavesTaken.value = Number(selected.taken) || 0;
  setEditorDisabled(false);
  resetDateEditor();
  renderDateList(selected);
}

function renderStats() {
  const totals = state.classes.reduce(
    (acc, item) => {
      const max = Number(item.max) || 0;
      const taken = Number(item.taken) || 0;
      acc.totalClasses += 1;
      acc.totalTaken += taken;
      acc.totalRemaining += max - taken;
      return acc;
    },
    { totalClasses: 0, totalTaken: 0, totalRemaining: 0 }
  );

  els.statTotalClasses.textContent = String(totals.totalClasses);
  els.statTotalTaken.textContent = String(totals.totalTaken);
  els.statTotalRemaining.textContent = String(totals.totalRemaining);
}

function renderTable() {
  if (!state.classes.length) {
    els.tableArea.innerHTML = "<p class='date-empty'>No classes available.</p>";
    return;
  }

  const rows = state.classes
    .map((item) => {
      const max = Number(item.max) || 0;
      const taken = Number(item.taken) || 0;
      const dates = normalizeDates(item.dates);
      return `
        <tr>
          <td>${escapeHTML(item.name || "Untitled class")}</td>
          <td>${max}</td>
          <td>${taken}</td>
          <td>${max - taken}</td>
          <td>${escapeHTML(dates.length ? dates.join(", ") : "-")}</td>
        </tr>
      `;
    })
    .join("");

  els.tableArea.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Class Name</th>
          <th>Max Leaves</th>
          <th>Leaves Taken</th>
          <th>Leaves Left</th>
          <th>Leave Dates</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function fetchClasses() {
  const { data, error } = await supabase.from("classes").select("*").order("id", { ascending: true });

  if (error) {
    setStatus(`Failed to load classes: ${error.message}`, "error");
    return;
  }

  state.classes = (data || []).map((item) => ({
    ...item,
    max: Number(item.max) || 0,
    taken: Number(item.taken) || 0,
    dates: normalizeDates(item.dates)
  }));

  renderClassOptions();
  renderStats();
  renderTable();
  if (!state.classes.length) {
    setStatus("No classes yet. Add your first class.", "info");
  } else {
    clearStatus();
  }
}

async function updateClass(classId, payload) {
  const { error } = await supabase.from("classes").update(payload).eq("id", classId);
  if (error) throw error;
}

async function addClass() {
  const name = els.newClassName.value.trim();
  const max = Number.parseInt(els.newMaxLeaves.value, 10);

  if (!name || Number.isNaN(max) || max <= 0) {
    setStatus("Enter a valid class name and max leaves.", "error");
    return;
  }

  const { error } = await supabase.from("classes").insert({
    name,
    max,
    taken: 0,
    dates: []
  });

  if (error) {
    setStatus(`Could not add class: ${error.message}`, "error");
    return;
  }

  els.newClassName.value = "";
  els.newMaxLeaves.value = "";
  setStatus(`Class "${name}" added.`, "success");
  await fetchClasses();
}

async function markLeave() {
  const selected = getSelectedClass();
  if (!selected) {
    setStatus("Select a class first.", "error");
    return;
  }

  const dates = normalizeDates(selected.dates);
  dates.push(getTodayISO());

  if (dates.length > selected.max) {
    setStatus("Max leaves reached. Increase max leaves before adding more dates.", "error");
    return;
  }

  try {
    await updateClass(selected.id, { dates, taken: dates.length });
    setStatus("Leave marked for today.", "success");
    await fetchClasses();
  } catch (error) {
    setStatus(`Could not mark leave: ${error.message}`, "error");
  }
}

async function removeClass() {
  const selected = getSelectedClass();
  if (!selected) {
    setStatus("Select a class first.", "error");
    return;
  }

  if (!confirm(`Remove ${selected.name || "this class"}?`)) return;

  const { error } = await supabase.from("classes").delete().eq("id", selected.id);
  if (error) {
    setStatus(`Could not remove class: ${error.message}`, "error");
    return;
  }

  setStatus("Class removed.", "success");
  await fetchClasses();
}

async function saveClassChanges() {
  const selected = getSelectedClass();
  if (!selected) {
    setStatus("Select a class first.", "error");
    return;
  }

  const newName = els.editClassName.value.trim();
  const newMax = Number.parseInt(els.editMaxLeaves.value, 10);
  const newTaken = Number.parseInt(els.editLeavesTaken.value, 10);
  const dateCount = normalizeDates(selected.dates).length;

  if (!newName) {
    setStatus("Class name cannot be empty.", "error");
    return;
  }

  if (Number.isNaN(newMax) || newMax < 0) {
    setStatus("Enter a valid max leaves value.", "error");
    return;
  }

  if (Number.isNaN(newTaken) || newTaken < 0) {
    setStatus("Enter a valid leaves taken value.", "error");
    return;
  }

  if (newTaken < dateCount) {
    setStatus("Leaves taken cannot be less than saved leave dates.", "error");
    return;
  }

  if (newMax < newTaken) {
    setStatus("Max leaves cannot be less than leaves taken.", "error");
    return;
  }

  try {
    await updateClass(selected.id, {
      name: newName,
      max: newMax,
      taken: newTaken,
      dates: normalizeDates(selected.dates)
    });
    setStatus("Class details updated.", "success");
    await fetchClasses();
  } catch (error) {
    setStatus(`Could not save class: ${error.message}`, "error");
  }
}

async function saveLeaveDate() {
  const selected = getSelectedClass();
  if (!selected) {
    setStatus("Select a class first.", "error");
    return;
  }

  const pickedDate = els.leaveDateInput.value;
  if (!pickedDate) {
    setStatus("Pick a leave date first.", "error");
    return;
  }

  const dates = normalizeDates(selected.dates);
  const duplicateIndex = dates.findIndex((d) => d === pickedDate);
  if (duplicateIndex !== -1 && duplicateIndex !== state.editingDateIndex) {
    setStatus("This leave date already exists.", "error");
    return;
  }

  if (state.editingDateIndex === null) {
    dates.push(pickedDate);
  } else {
    dates[state.editingDateIndex] = pickedDate;
  }

  if (dates.length > selected.max) {
    setStatus("Increase max leaves before adding this many leave dates.", "error");
    return;
  }

  try {
    await updateClass(selected.id, { dates, taken: dates.length });
    setStatus("Leave dates updated.", "success");
    await fetchClasses();
  } catch (error) {
    setStatus(`Could not save leave date: ${error.message}`, "error");
  }
}

function startEditLeaveDate(index) {
  const selected = getSelectedClass();
  if (!selected) return;

  const dates = normalizeDates(selected.dates);
  const existing = dates[index];
  if (!existing) return;

  state.editingDateIndex = index;
  els.leaveDateInput.value = existing;
  els.saveDateBtn.textContent = "Update Leave Date";
  els.cancelDateEditBtn.disabled = false;
}

async function removeLeaveDate(index) {
  const selected = getSelectedClass();
  if (!selected) return;

  const dates = normalizeDates(selected.dates);
  if (!dates[index]) return;

  if (!confirm(`Remove ${dates[index]} from ${selected.name || "this class"}?`)) return;

  dates.splice(index, 1);

  try {
    await updateClass(selected.id, { dates, taken: dates.length });
    setStatus("Leave date removed.", "success");
    await fetchClasses();
  } catch (error) {
    setStatus(`Could not remove leave date: ${error.message}`, "error");
  }
}

function cancelDateEdit() {
  resetDateEditor();
}

function handleDateListClick(event) {
  const editBtn = event.target.closest(".date-edit-btn");
  const removeBtn = event.target.closest(".date-remove-btn");

  if (editBtn) {
    const index = Number.parseInt(editBtn.dataset.index, 10);
    if (!Number.isNaN(index)) startEditLeaveDate(index);
    return;
  }

  if (removeBtn) {
    const index = Number.parseInt(removeBtn.dataset.index, 10);
    if (!Number.isNaN(index)) removeLeaveDate(index);
  }
}

function toggleTable() {
  state.tableVisible = !state.tableVisible;
  els.tableWrap.classList.toggle("hidden", !state.tableVisible);
  els.showTableBtn.textContent = state.tableVisible ? "Hide Leaves Table" : "Show Leaves Table";
}

async function resetAll() {
  if (!confirm("Delete all classes?")) return;

  const { error } = await supabase.from("classes").delete().not("id", "is", null);
  if (error) {
    setStatus(`Could not reset classes: ${error.message}`, "error");
    return;
  }

  setStatus("All classes deleted.", "success");
  await fetchClasses();
}

function handleSelectChange() {
  state.selectedId = els.classSelect.value || null;
  fillClassEditor();
}

function wireEvents() {
  els.addClassBtn.addEventListener("click", addClass);
  els.markLeaveBtn.addEventListener("click", markLeave);
  els.removeClassBtn.addEventListener("click", removeClass);
  els.saveClassBtn.addEventListener("click", saveClassChanges);
  els.saveDateBtn.addEventListener("click", saveLeaveDate);
  els.cancelDateEditBtn.addEventListener("click", cancelDateEdit);
  els.showTableBtn.addEventListener("click", toggleTable);
  els.resetAllBtn.addEventListener("click", resetAll);
  els.classSelect.addEventListener("change", handleSelectChange);
  els.dateList.addEventListener("click", handleDateListClick);
}

async function init() {
  wireEvents();
  await fetchClasses();
}

init();
