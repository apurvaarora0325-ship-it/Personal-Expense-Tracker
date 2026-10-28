import { useEffect, useState } from "react";
import "./App.css";
import { registerUser, loginUser } from "./api";

const API_URL = "http://localhost:5000/api";

function App() {
const [token, setToken] = useState(localStorage.getItem("token") || "");
const [user, setUser] = useState(
JSON.parse(localStorage.getItem("user") || "null")
);

const [isRegister, setIsRegister] = useState(false);
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [authError, setAuthError] = useState("");
const [message, setMessage] = useState("");

const [expenses, setExpenses] = useState([]);
const [title, setTitle] = useState("");
const [amount, setAmount] = useState("");
const [category, setCategory] = useState("Food");
const [paymentMethod, setPaymentMethod] = useState("Cash");
const [date, setDate] = useState(
new Date().toISOString().slice(0, 10)
);
const [description, setDescription] = useState("");
const [expenseError, setExpenseError] = useState("");

async function handleAuth(e) {
e.preventDefault();
setAuthError("");
setMessage("");

try {
  if (isRegister) {
    await registerUser(name, email, password);
    setMessage("Registration successful! Please log in.");
    setIsRegister(false);
    setName("");
    setPassword("");
  } else {
    const data = await loginUser(email, password);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
    setPassword("");
  }
} catch (error) {
  setAuthError(error.message || "Something went wrong.");
}

}

async function fetchExpenses() {
try {
const response = await fetch("${API_URL}/expenses", {
headers: {
Authorization: "Bearer ${token}",
},
});

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not load expenses.");
  }

  setExpenses(data.expenses || []);
  setExpenseError("");
} catch (error) {
  setExpenseError(error.message || "Could not load expenses.");
}

}

useEffect(() => {
if (token) {
fetchExpenses();
}
}, [token]);

async function addExpense(e) {
e.preventDefault();
setExpenseError("");

if (!title.trim() || !amount || Number(amount) <= 0 || !date) {
  setExpenseError("Please enter a name, valid amount and date.");
  return;
}

try {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: title.trim(),
      amount: Number(amount),
      category,
      paymentMethod,
      date,
      description,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not add expense.");
  }

  setTitle("");
  setAmount("");
  setCategory("Food");
  setPaymentMethod("Cash");
  setDate(new Date().toISOString().slice(0, 10));
  setDescription("");

  await fetchExpenses();
  setMessage("Expense added successfully!");
  setTimeout(() => setMessage(""), 2500);
} catch (error) {
  setExpenseError(error.message || "Could not add expense.");
}

}

async function deleteExpense(id) {
if (!window.confirm("Are you sure you want to delete this expense?")) {
return;
}

try {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not delete expense.");
  }

  await fetchExpenses();
  setMessage("Expense deleted successfully!");
  setTimeout(() => setMessage(""), 2500);
} catch (error) {
  setExpenseError(error.message || "Could not delete expense.");
}

}

function logout() {
localStorage.removeItem("token");
localStorage.removeItem("user");
setToken("");
setUser(null);
setExpenses([]);
setMessage("");
setAuthError("");
setExpenseError("");
}

const totalExpense = expenses.reduce(
(total, expense) => total + Number(expense.amount || 0),
0
);

if (!token) {
return (
<div className="app">
<header className="header">
<h1>Personal Expense Tracker</h1>
<p>Manage your daily expenses easily</p>
</header>

    <main className="container">
      <section className="form-card">
        <h2>{isRegister ? "Create Account" : "Login"}</h2>

        {message && <p>{message}</p>}
        {authError && <p style={{ color: "red" }}>{authError}</p>}

        <form onSubmit={handleAuth}>
          {isRegister && (
            <>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </>
          )}

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isRegister ? 6 : undefined}
            required
          />

          <button type="submit">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "18px" }}>
          {isRegister
            ? "Already have an account? "
            : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setAuthError("");
              setMessage("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </section>
    </main>

    <footer>
      <p>Personal Expense Tracker | MCA Project</p>
    </footer>
  </div>
);

}

return (
<div className="app">
<header className="header">
<h1>Personal Expense Tracker</h1>
<p>Manage your daily expenses easily</p>
<p>Welcome, {user?.name || user?.email || "User"}!</p>
<button type="button" onClick={logout}>
Logout
</button>
</header>

  <main className="container">
    <section className="summary-card">
      <h2>Total Expenses</h2>
      <h1>₹{totalExpense.toLocaleString("en-IN")}</h1>
    </section>

    <section className="form-card">
      <h2>Add New Expense</h2>

      <form onSubmit={addExpense}>
        <label>Expense Name</label>
        <input
          type="text"
          placeholder="e.g. Shopping"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Amount (₹)</label>
        <input
          type="number"
          placeholder="Enter amount"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Education</option>
          <option>Bills</option>
          <option>Other</option>
        </select>

        <label>Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Debit Card</option>
          <option>Credit Card</option>
          <option>Net Banking</option>
          <option>Other</option>
        </select>

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label>Description (Optional)</label>
        <input
          type="text"
          placeholder="Add a note"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">+ Add Expense</button>
      </form>

      {expenseError && (
        <p style={{ color: "red" }}>{expenseError}</p>
      )}
      {message && <p>{message}</p>}
    </section>

    <section className="expense-card">
      <h2>Expense History</h2>

      {expenses.length === 0 ? (
        <p className="empty">No expenses added yet.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{expense.title}</td>
                  <td>{expense.category}</td>
                  <td>{expense.paymentMethod || "-"}</td>
                  <td>
                    {expense.date
                      ? String(expense.date).slice(0, 10)
                      : "-"}
                  </td>
                  <td>
                    ₹{Number(expense.amount).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => deleteExpense(expense._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  </main>

  <footer>
    <p>Personal Expense Tracker | MCA Project</p>
  </footer>
</div>

);
}

export default App;