import {
collection,
addDoc,
getDocs,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const classesRef = collection(window.db,"classes");

async function addClass(){

let name=document.getElementById("className").value;

let max=parseInt(document.getElementById("maxLeaves").value);

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

loadClasses();

}

async function leaveClass(id,data){

data.taken++;

data.dates.push(new Date().toISOString().split("T")[0]);

await updateDoc(doc(window.db,"classes",id),data);

loadClasses();

}

async function loadClasses(){

let snapshot=await getDocs(classesRef);

let div=document.getElementById("classList");

div.innerHTML="";

snapshot.forEach(docSnap=>{

let c=docSnap.data();

div.innerHTML+=`

<div class="classCard">

<h3>${c.name}</h3>

<p>
Leaves left: ${c.max-c.taken} / ${c.max}
</p>

<button onclick="leaveClass('${docSnap.id}', ${JSON.stringify(c)})">
I LEFT THIS CLASS
</button>

<p>
Leave Dates: ${c.dates.join(", ")}
</p>

</div>

`;

});

}

document.getElementById("addBtn").addEventListener("click", addClass);

window.leaveClass = leaveClass;

loadClasses();