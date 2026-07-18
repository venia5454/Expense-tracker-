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

  let imageURL = "";

let file = document.getElementById("receiptImage").files[0];

if(file){
  imageURL = URL.createObjectURL(file);
}


expenses.push({

    name:name,

    amount:amount,

    category:"Receipt",

    date:new Date().toLocaleDateString(),

    image:imageURL

});

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
     ${expense.image ? 
`<img src="${expense.image}" width="80">`
: ""} </div>

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
    "$" + (budget-total).toFixed(2);let remaining = budget - total;

let alertBox = document.getElementById("alertBox");


if (budget > 0 && remaining < 0) {

  alertBox.innerHTML =
  `<div class="alert">
  🚨 You are over your budget!
  </div>`;

}

else if (budget > 0 && remaining < budget * 0.2) {

  alertBox.innerHTML =
  `<div class="alert">
  ⚠️ You are close to your budget!
  </div>`;

}

else {

  alertBox.innerHTML = "";

}


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
const lockScreen = document.getElementById("lockScreen");
const savedPin = localStorage.getItem("pin");

if (!savedPin) {
  lockScreen.classList.add("hidden");
}


document.getElementById("unlockBtn").onclick = () => {

  let entered =
  document.getElementById("unlockPin").value;

  if (entered === localStorage.getItem("pin")) {

    lockScreen.classList.add("hidden");

  } else {

    document.getElementById("lockMessage").innerText =
    "Wrong PIN";

  }

};
function showHistory(month){

  let filtered = expenses.filter(expense => {

    let expenseDate =
    new Date(expense.date);

    return expenseDate.getMonth() == month;

  });


  let total = filtered.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );


  document.getElementById("historyResult").innerHTML = `

    <b>Month Total:</b> $${total.toFixed(2)}
    <br>
    <b>Number of Expenses:</b> ${filtered.length}

    <hr>

    ${
      filtered.map(expense =>
      `• ${expense.name}: $${expense.amount}`
      ).join("<br>")
      || "No expenses this month"
    }

  `;

}


document.getElementById("monthSelect").onchange =
function(){

  showHistory(Number(this.value));

};
document.getElementById("saveGoal").onclick = () => {

  let goal = {
    name: document.getElementById("goalName").value,
    amount: Number(document.getElementById("goalAmount").value),
    saved: Number(document.getElementById("savedAmount").value)
  };

  localStorage.setItem(
    "goal",
    JSON.stringify(goal)
  );

  showGoal();

};


function showGoal(){

  let goal =
  JSON.parse(localStorage.getItem("goal"));

  if(!goal) return;


  let percent =
  Math.min(
    (goal.saved / goal.amount) * 100,
    100
  );


  document.getElementById("goalDisplay").innerHTML = `

  <h3>${goal.name}</h3>

  $${goal.saved} / $${goal.amount}

  <div class="progress">
    <div class="progress-bar"
    style="width:${percent}%">
    </div>
  </div>

  <p>${percent.toFixed(0)}% complete</p>

  `;

}


showGoal();
let savedTheme =
localStorage.getItem("theme");


if(savedTheme){

  document.body.classList.add(savedTheme);

}


document.getElementById("themeSelect").onchange =
function(){

  document.body.className = "";

  document.body.classList.add(this.value);

  localStorage.setItem(
    "theme",
    this.value
  );

};



document.getElementById("resetBtn").onclick = () => {

  if(confirm("Delete all app data?")){

    localStorage.clear();

    location.reload();

  }

};
let receiptFile =
document.getElementById("receiptImage");


receiptFile.onchange = () => {

  let file = receiptFile.files[0];

  if(file){

    let image =
    document.getElementById("receiptPreview");

    image.src =
    URL.createObjectURL(file);

    image.style.display = "block";

  }

};



document.getElementById("addReceipt").onclick = () => {

  let name =
  document.getElementById("receiptName").value;

  let amount =
  Number(document.getElementById("receiptAmount").value);


  if(name === "" || amount <= 0){

    alert("Enter receipt details");

    return;

  }


  expenses.push({

    name:name,

    amount:amount,

    category:"Receipt",

    date:new Date().toLocaleDateString()

  });


  save();


  alert("Receipt added!");

};
document.getElementById("scanReceipt").onclick = async () => {

  let file =
  document.getElementById("receiptImage").files[0];


  if(!file){

    alert("Take a picture first");

    return;

  }


  document.getElementById("scanStatus").innerText =
  "Scanning receipt...";


  let result =
  await Tesseract.recognize(
    file,
    "eng"
  );


  let text =
  result.data.text;


  document.getElementById("scanStatus").innerText =
  "Scan complete!";


  console.log(text);


  let numbers =
  text.match(/\d+\.\d{2}/g);


  if(numbers){

    document.getElementById("receiptAmount").value =
    numbers[numbers.length-1];

  }


  let lines =
  text.split("\n");


  if(lines.length > 0){

    document.getElementById("receiptName").value =
    lines[0];

  }

};
// Lock app button
document.getElementById("lockApp").onclick = () => {

  document.getElementById("lockScreen")
  .classList.remove("hidden");

  document.getElementById("unlockPin").value = "";

};


// Change PIN button
document.getElementById("changePin").onclick = () => {

  let newPin = prompt("Enter your new 4-digit PIN:");

  if(newPin && newPin.length >= 4){

    localStorage.setItem("pin", newPin);

    alert("PIN changed!");

  } else {

    alert("PIN must be at least 4 digits");

  }

};
document.getElementById("resetPin").onclick = () => {

  localStorage.removeItem("pin");

  alert("PIN reset! Reload the app.");

  location.reload();

};
