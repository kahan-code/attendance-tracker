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

async function loadClasses(){

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

dropdown.appendChild(option);

});

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

async function editMaxLeaves(){

let selected = getSelectedClass();
if(!selected) return;

let {index,data} = selected;

let newMax = parseInt(prompt("Enter new max leaves"));

if(!newMax) return;

data.max = newMax;

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
document.getElementById("editBtn").onclick = editMaxLeaves;
document.getElementById("removeBtn").onclick = removeClass;
document.getElementById("showBtn").onclick = showLeaves;
document.getElementById("resetBtn").onclick = resetAll;

loadClasses();
