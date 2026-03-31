import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
getDocs,
updateDoc,
doc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8qsUf9xIosSBxTEbJCEagybpOFctT0HU",
  authDomain: "attendance-tracker-55b94.firebaseapp.com",
  projectId: "attendance-tracker-55b94",
  storageBucket: "attendance-tracker-55b94.firebasestorage.app",
  messagingSenderId: "444252780003",
  appId: "1:444252780003:web:c7995b36acfc04fce7dcd6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const classesRef = collection(db,"classes");

let classData = [];
let classIds = [];
let editingDateIndex = null;

function normalizeDates(dates){
if(!Array.isArray(dates)) return [];
return dates.filter((d)=>typeof d === "string" && d.trim() !== "");
}

function resetDateEditorState(){
editingDateIndex = null;
document.getElementById("leaveDateInput").value = "";
document.getElementById("saveDateBtn").textContent = "Add Leave Date";
document.getElementById("cancelDateEditBtn").disabled = true;
}

function clearClassEditor(){
document.getElementById("editClassName").value = "";
document.getElementById("editMaxLeaves").value = "";
document.getElementById("editLeavesTaken").value = "";
document.getElementById("editClassName").disabled = true;
document.getElementById("editMaxLeaves").disabled = true;
document.getElementById("editLeavesTaken").disabled = true;
document.getElementById("leaveDateInput").disabled = true;
document.getElementById("saveDateBtn").disabled = true;
document.getElementById("cancelDateEditBtn").disabled = true;
document.getElementById("saveClassBtn").disabled = true;
document.getElementById("dateList").innerHTML = "";
resetDateEditorState();
}

function renderDateList(data){
const container = document.getElementById("dateList");
const dates = normalizeDates(data.dates);

if(dates.length === 0){
container.innerHTML = "<p class='date-empty'>No leave dates yet.</p>";
return;
}

const items = dates.map((dateValue,index)=>`
<div class="date-item">
<span>${dateValue}</span>
<div class="date-actions">
<button type="button" class="small-btn blue date-edit-btn" data-index="${index}">Edit</button>
<button type="button" class="small-btn red date-remove-btn" data-index="${index}">Remove</button>
</div>
</div>
`).join("");

container.innerHTML = items;
}

function fillClassEditor(){
let selected = getSelectedClass();

if(!selected){
clearClassEditor();
return;
}

let {data} = selected;

document.getElementById("editClassName").value = data.name;
document.getElementById("editMaxLeaves").value = data.max;
document.getElementById("editLeavesTaken").value = data.taken;
document.getElementById("editClassName").disabled = false;
document.getElementById("editMaxLeaves").disabled = false;
document.getElementById("editLeavesTaken").disabled = false;
document.getElementById("leaveDateInput").disabled = false;
document.getElementById("saveDateBtn").disabled = false;
document.getElementById("saveClassBtn").disabled = false;
resetDateEditorState();
renderDateList(data);
}

async function loadClasses(){

const previouslySelectedId = classIds[document.getElementById("classDropdown").selectedIndex];

const snapshot = await getDocs(classesRef);

classData = [];
classIds = [];

const dropdown = document.getElementById("classDropdown");

dropdown.innerHTML = "";

snapshot.forEach((docSnap)=>{

let data = docSnap.data();

classData.push(data);
classIds.push(docSnap.id);

let option = document.createElement("option");

option.text = data.name;
option.value = docSnap.id;

dropdown.appendChild(option);

});

if(previouslySelectedId){
const selectedIndex = classIds.indexOf(previouslySelectedId);
if(selectedIndex !== -1){
dropdown.selectedIndex = selectedIndex;
}
}

if(dropdown.options.length > 0 && dropdown.selectedIndex === -1){
dropdown.selectedIndex = 0;
}

if(dropdown.options.length === 0){
clearClassEditor();
return;
}

fillClassEditor();

}

function getSelectedClass(){

let dropdown = document.getElementById("classDropdown");

let index = dropdown.selectedIndex;

if(index === -1){
alert("No class selected");
return null;
}

let data = classData[index];

if(!data){
alert("Class not found");
return null;
}

return {index,data};

}

async function addClass(){

let name = document.getElementById("className").value;
let max = parseInt(document.getElementById("maxLeaves").value);

if(!name || !max){
alert("Enter class name and max leaves");
return;
}

await addDoc(classesRef,{
name:name,
max:max,
taken:0,
dates:[]
});

document.getElementById("className").value="";
document.getElementById("maxLeaves").value="";

loadClasses();

}

async function leaveClass(){

let selected = getSelectedClass();
if(!selected) return;

let {index,data} = selected;

data.taken++;

data.dates.push(new Date().toISOString().split("T")[0]);

await updateDoc(doc(db,"classes",classIds[index]),data);

loadClasses();

}

async function removeClass(){

let selected = getSelectedClass();
if(!selected) return;

let {index} = selected;

await deleteDoc(doc(db,"classes",classIds[index]));

loadClasses();

}

async function saveClassChanges(){

let selected = getSelectedClass();
if(!selected) return;

let {index,data} = selected;

let newName = document.getElementById("editClassName").value.trim();
let newMax = parseInt(document.getElementById("editMaxLeaves").value);
let newTaken = parseInt(document.getElementById("editLeavesTaken").value);
const dateCount = normalizeDates(data.dates).length;

if(!newName){
alert("Class name cannot be empty");
return;
}

if(Number.isNaN(newMax) || newMax < 0){
alert("Enter a valid max leaves number");
return;
}

if(Number.isNaN(newTaken) || newTaken < 0){
alert("Enter a valid leaves taken number");
return;
}

if(newTaken < dateCount){
alert("Leaves taken cannot be less than number of saved leave dates");
return;
}

if(newMax < newTaken){
alert("Max leaves cannot be less than leaves taken");
return;
}

data.name = newName;
data.max = newMax;
data.taken = newTaken;

await updateDoc(doc(db,"classes",classIds[index]),{
name:data.name,
max:data.max,
taken:data.taken,
dates:normalizeDates(data.dates)
});

loadClasses();

}

async function saveLeaveDate(){

let selected = getSelectedClass();
if(!selected) return;

let {index,data} = selected;

const pickedDate = document.getElementById("leaveDateInput").value;

if(!pickedDate){
alert("Pick a leave date first");
return;
}

const dates = normalizeDates(data.dates);
const duplicateIndex = dates.findIndex((d)=>d === pickedDate);

if(duplicateIndex !== -1 && duplicateIndex !== editingDateIndex){
alert("This leave date already exists");
return;
}

if(editingDateIndex === null){
dates.push(pickedDate);
}else{
dates[editingDateIndex] = pickedDate;
}

data.dates = dates;
data.taken = dates.length;

if(data.max < data.taken){
alert("Increase max leaves before adding this many leave dates");
return;
}

await updateDoc(doc(db,"classes",classIds[index]),{
name:data.name,
max:data.max,
taken:data.taken,
dates:data.dates
});

loadClasses();

}

function startEditLeaveDate(index){
const selected = getSelectedClass();
if(!selected) return;

const {data} = selected;
const dates = normalizeDates(data.dates);
const existingDate = dates[index];

if(!existingDate) return;

editingDateIndex = index;
document.getElementById("leaveDateInput").value = existingDate;
document.getElementById("saveDateBtn").textContent = "Update Leave Date";
document.getElementById("cancelDateEditBtn").disabled = false;
}

async function removeLeaveDate(index){
const selected = getSelectedClass();
if(!selected) return;

const {data} = selected;
const dates = normalizeDates(data.dates);

if(!dates[index]) return;

const dateToRemove = dates[index];
const className = data.name || "this class";
if(!confirm(`Remove ${dateToRemove} from ${className}?`)) return;

dates.splice(index,1);
data.dates = dates;
data.taken = dates.length;

await updateDoc(doc(db,"classes",classIds[selected.index]),{
name:data.name,
max:data.max,
taken:data.taken,
dates:data.dates
});

loadClasses();

}

function handleDateListClick(event){
const editBtn = event.target.closest(".date-edit-btn");
const removeBtn = event.target.closest(".date-remove-btn");

if(editBtn){
const idx = parseInt(editBtn.dataset.index);
if(Number.isNaN(idx)) return;
startEditLeaveDate(idx);
return;
}

if(removeBtn){
const idx = parseInt(removeBtn.dataset.index);
if(Number.isNaN(idx)) return;
removeLeaveDate(idx);
}

}

function cancelLeaveDateEdit(){
resetDateEditorState();
}

function showLeaves(){

let tableHTML = `
<table border="1" style="width:100%;margin-top:20px;border-collapse:collapse">
<tr>
<th>Class Name</th>
<th>Max Leaves</th>
<th>Leaves Taken</th>
<th>Leaves Left</th>
<th>Leave Dates</th>
</tr>
`;

classData.forEach((c)=>{

let leavesLeft = c.max - c.taken;

let dates = c.dates.length ? c.dates.join(", ") : "-";

tableHTML += `
<tr>
<td>${c.name}</td>
<td>${c.max}</td>
<td>${c.taken}</td>
<td>${leavesLeft}</td>
<td>${dates}</td>
</tr>
`;

});

tableHTML += `</table>`;

document.getElementById("tableArea").innerHTML = tableHTML;

}

async function resetAll(){

if(!confirm("Delete all classes?")) return;

const snapshot = await getDocs(classesRef);

snapshot.forEach(async (docSnap)=>{
await deleteDoc(doc(db,"classes",docSnap.id));
});

loadClasses();

}

document.getElementById("addBtn").onclick = addClass;
document.getElementById("leaveBtn").onclick = leaveClass;
document.getElementById("removeBtn").onclick = removeClass;
document.getElementById("showBtn").onclick = showLeaves;
document.getElementById("resetBtn").onclick = resetAll;
document.getElementById("saveClassBtn").onclick = saveClassChanges;
document.getElementById("classDropdown").onchange = fillClassEditor;
document.getElementById("saveDateBtn").onclick = saveLeaveDate;
document.getElementById("cancelDateEditBtn").onclick = cancelLeaveDateEdit;
document.getElementById("dateList").onclick = handleDateListClick;

loadClasses();
