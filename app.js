import {
collection,
addDoc,
getDocs,
updateDoc,
doc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const classesRef = collection(window.db,"classes");

let classData = [];
let classIds = [];

async function loadClasses(){

const snapshot = await getDocs(classesRef);

classData=[];
classIds=[];

const dropdown=document.getElementById("classDropdown");

dropdown.innerHTML="";

snapshot.forEach((docSnap,i)=>{

let data=docSnap.data();

classData.push(data);
classIds.push(docSnap.id);

let option=document.createElement("option");

option.value=i;
option.text=data.name;

dropdown.appendChild(option);

});

}

async function addClass(){

let name=document.getElementById("className").value;
let max=parseInt(document.getElementById("maxLeaves").value);

if(!name||!max){
alert("Enter class name and max leaves");
return;
}

await addDoc(classesRef,{
name:name,
max:max,
taken:0,
dates:[]
});

loadClasses();

}

async function leaveClass(){

let index=document.getElementById("classDropdown").value;

let data=classData[index];

data.taken++;

data.dates.push(new Date().toISOString().split("T")[0]);

await updateDoc(doc(window.db,"classes",classIds[index]),data);

loadClasses();

}

async function editMaxLeaves(){

let index=document.getElementById("classDropdown").value;

let newMax=parseInt(prompt("Enter new max leaves"));

if(!newMax) return;

let data=classData[index];

data.max=newMax;

await updateDoc(doc(window.db,"classes",classIds[index]),data);

loadClasses();

}

async function removeClass(){

let index=document.getElementById("classDropdown").value;

await deleteDoc(doc(window.db,"classes",classIds[index]));

loadClasses();

}

function showLeaves(){

let index=document.getElementById("classDropdown").value;

let data=classData[index];

alert(
"Max Leaves: "+data.max+
"\nLeaves Taken: "+data.taken+
"\nLeave Dates: "+data.dates.join(", ")
);

}

async function resetAll(){

if(!confirm("Delete all classes?")) return;

const snapshot=await getDocs(classesRef);

snapshot.forEach(async (docSnap)=>{
await deleteDoc(doc(window.db,"classes",docSnap.id));
});

loadClasses();

}

document.addEventListener("DOMContentLoaded",()=>{

document.getElementById("addBtn").addEventListener("click",addClass);
document.getElementById("leaveBtn").addEventListener("click",leaveClass);
document.getElementById("editBtn").addEventListener("click",editMaxLeaves);
document.getElementById("removeBtn").addEventListener("click",removeClass);
document.getElementById("showBtn").addEventListener("click",showLeaves);
document.getElementById("resetBtn").addEventListener("click",resetAll);

loadClasses();

});
