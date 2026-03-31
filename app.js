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

function clearClassEditor(){
document.getElementById("editClassName").value = "";
document.getElementById("editMaxLeaves").value = "";
document.getElementById("editClassName").disabled = true;
document.getElementById("editMaxLeaves").disabled = true;
document.getElementById("saveClassBtn").disabled = true;
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
document.getElementById("editClassName").disabled = false;
document.getElementById("editMaxLeaves").disabled = false;
document.getElementById("saveClassBtn").disabled = false;
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

if(!newName){
alert("Class name cannot be empty");
return;
}

if(Number.isNaN(newMax) || newMax < 0){
alert("Enter a valid max leaves number");
return;
}

if(newMax < data.taken){
alert("Max leaves cannot be less than leaves already taken");
return;
}

data.name = newName;
data.max = newMax;

await updateDoc(doc(db,"classes",classIds[index]),data);

loadClasses();

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

loadClasses();
