let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = localStorage.getItem("budget") || 0;

const nameInput = document.getElementById("expenseName");
const amountInput = document.getElementById("expenseAmount");
const categoryInput = document.getElementById("category");
const list = document.getElementById("expenseList");

const totalText = document.getElementById("total");
const budgetText = document.getElementById("budget");
const remainingText = document.getElementById("remaining");

const chartCanvas = document.getElementById("chart");

let chart;


// Add expense
document.getElementById("addBtn").onclick = () => {

  let name = nameInput.value;
  let amount = Number(amountInput.value);
  let category = categoryInput.value;

  if(name === "" || amount <= 0){
    alert("Enter a valid expense");
    return;
  }

  expenses.push({
    name,
    amount,
    category,
    date: new Date().toLocaleDateString()
  });

  save();

  nameInput.value = "";
  amountInput.value = "";
};


// Save budget
document.getElementById("saveBudget").onclick = () => {

  budget = Number(document.getElementById("budgetInput").value);

  localStorage.setItem("budget", budget);

  update();

};


// Delete expense
function removeExpense(index){

  expenses.splice(index,1);

  save();

}


// Save data
function save(){

  localStorage.setItem(
    "expenses",
    JSON.stringify(expenses)
  );

  update();

}


// Update app
function update(){

  list.innerHTML = "";

  let total = 0;

  let categories = {};


  expenses.forEach((expense,index)=>{

    total += expense.amount;

    categories[expense.category] =
      (categories[expense.category] || 0)
      + expense.amount;


    let li = document.createElement("li");

    li.className = "expense";

    li.innerHTML = `
      <div>
        <b>${expense.name}</b><br>
        ${expense.category}
        <br>
        ${expense.date}
      </div>

      <div>
        $${expense.amount.toFixed(2)}
        <br>
        <button class="delete"
        onclick="removeExpense(${index})">
        ❌
        </button>
      </div>
    `;

    list.appendChild(li);

  });


  totalText.innerHTML =
    "$" + total.toFixed(2);

  budgetText.innerHTML =
    "$" + Number(budget).toFixed(2);

  remainingText.innerHTML =
    "$" + (budget-total).toFixed(2);


  makeChart(categories);

}


// Search
document.getElementById("search").oninput = function(){

  let text = this.value.toLowerCase();

  document.querySelectorAll(".expense")
  .forEach(item=>{

    item.style.display =
    item.innerText.toLowerCase()
    .includes(text)
    ? "flex"
    : "none";

  });

};


// Dark mode
document.getElementById("darkModeBtn").onclick = ()=>{

  document.body.classList.toggle("dark");

};


// Chart
function makeChart(data){

  if(chart){
    chart.destroy();
  }


  chart = new Chart(chartCanvas,{
    type:"doughnut",

    data:{
      labels:Object.keys(data),

      datasets:[{
        data:Object.values(data)
      }]
    }

  });

}


update();
// Export expenses
document.getElementById("exportBtn").onclick = () => {

  let file = JSON.stringify(expenses,null,2);

  let blob = new Blob([file], {
    type:"application/json"
  });

  let link=document.createElement("a");

  link.href=URL.createObjectURL(blob);

  link.download="expenses.json";

  link.click();

};


// Monthly report
document.getElementById("reportBtn").onclick = () => {

  let total = expenses.reduce(
    (sum,e)=>sum+e.amount,0
  );

  alert(
    "Monthly Report\n\n" +
    "Expenses: " + expenses.length +
    "\nSpent: $" + total.toFixed(2)
  );

};


// PIN system
let savedPin =
localStorage.getItem("pin");


document.getElementById("savePin").onclick = ()=>{

 let pin =
 document.getElementById("pinInput").value;

 if(pin.length < 4){
   alert("PIN needs 4 numbers");
   return;
 }

 localStorage.setItem("pin",pin);

 alert("PIN saved!");

};


// Install app offline
if("serviceWorker" in navigator){

 navigator.serviceWorker.register(
 "service-worker.js"
 );

}
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {

  event.preventDefault();

  deferredPrompt = event;

  document.getElementById("installBtn").style.display = "block";

});


document.getElementById("installBtn").onclick = async () => {

  if(deferredPrompt){

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;

  }

};
