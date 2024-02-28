let transactionsArr = [];
async function fetchTransactions() {
  const transactions = await fetch("http://localhost:3000/transactions", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const transactionsData = await transactions.json();
  transactionsArr.push(...transactionsData);

  transactionsData.forEach(renderTransaction);

  updateBalance();
  return transactions;
}

function renderTransaction(transactionData) {
  const deleteBtn = createDeleteTransactionBtn(transactionData.id);
  const editBtn = createEditTransactionBtn(transactionData);
  const transaction = document.createElement("transaction");
  transaction.classList.add( "transaction");
  transaction.id = `transaction-${transactionData.id}`;

  const name = document.createElement("h3");
  name.classList.add("transaction-name");
  name.textContent = transactionData.name;

  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
    useGrouping: true,
  });
  const formatedData = formater.format(transactionData.amount);

  const amount = document.createElement("div");
  if (transactionData.amount > 0) {
    amount.classList.add("transaction-amount","credit");
  } else {
    amount.classList.add("transaction-amount","debit");
  }

  amount.innerHTML = formatedData;

  const hr = document.createElement("hr");
  transaction.appendChild(name);
  transaction.appendChild(amount);
  transaction.appendChild(editBtn);
  transaction.appendChild(deleteBtn);
  transaction.appendChild(hr);
  document.querySelector("#transactions").appendChild(transaction);
}
document.addEventListener("DOMContentLoaded", fetchTransactions);

///////////////////////////////

//Saldo
function updateBalance() {
  const balanceSpan = document.querySelector("#balance");
  const balance = transactionsArr.reduce(
    (sum, transaction) => sum + parseFloat(transaction.amount),
    0
  );

  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  });
  balanceSpan.textContent = formater.format(balance);

  if (balance > 0) {
    balanceSpan.classList.remove("negative");
    balanceSpan.classList.add("positive");
  } else {
    balanceSpan.classList.remove("positive");
    balanceSpan.classList.add("negative");
  }
}
//Adicionar Transação
const form = document.querySelector("#form");

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const id = document.querySelector("#id").value;
  const name = document.querySelector("#name").value;
  const amount = parseFloat(document.querySelector("#amount").value);

  if (name === "" || typeof amount !== "number") {
    alert("Preencha todos os campos corretamente!");
    document.querySelector("#name").focus();
    return;
  }

  if (id) {
    const response = await fetch(`http://localhost:3000/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, amount }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const transaction = await response.json();
    const indexToRemove = transactionsArr.findIndex((t) => t.id === id);
    transactionsArr.splice(indexToRemove, 1, transaction);
    document.querySelector(`#transaction-${id}`).remove();
    renderTransaction(transaction);
  } else {
    const response = await fetch("http://localhost:3000/transactions", {
      method: "POST",
      body: JSON.stringify({ name, amount }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const transaction = await response.json();
    transactionsArr.push(transaction);
    renderTransaction(transaction);
  }

  ev.target.reset();
  updateBalance();
});
////////////////////////////////////////////
//Editar Transação

function createEditTransactionBtn(transactionData) {
  const editBtn = document.createElement("button");
  editBtn.textContent = "Editar";
  editBtn.classList.add("edit-btn");
  editBtn.addEventListener("click", () => {
    document.querySelector("#id").value = transactionData.id;
    document.querySelector("#name").value = transactionData.name;
    document.querySelector("#amount").value = transactionData.amount;
  });
  return editBtn;
}
console.log(transactions);
/////////////////////////////////////////////
//Excluir Transação
function createDeleteTransactionBtn(id) {
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Excluir";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", async () => {
    await fetch(`http://localhost:3000/transactions/${id}`, {
      method: "DELETE",
    });

    const indexToRemove = transactionsArr.findIndex((t) => t.id === id);
    transactionsArr.splice(indexToRemove, 1);
    deleteBtn.parentElement.remove();
    updateBalance();
  });
  return deleteBtn;
}
