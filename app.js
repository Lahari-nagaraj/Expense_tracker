const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const app = express();
const port = 3000;

// PostgreSQL Configuration
const pool = new Pool({
  user: "postgres", // Replace with your PostgreSQL username
  host: "localhost",
  database: "expense_tracker",
  password: "hari@2013", // Replace with your PostgreSQL password
  port: 5432,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Routes
app.get("/", async (req, res) => {
  const expenses = await pool.query("SELECT * FROM expenses ORDER BY date DESC");
  const totalExpense = await pool.query("SELECT SUM(amount) AS total FROM expenses");
  const totalIncome = await pool.query("SELECT SUM(amount) AS total FROM income");
  res.render("index", {
    expenses: expenses.rows,
    totalExpense: totalExpense.rows[0].total || 0,
    totalIncome: totalIncome.rows[0].total || 0,
  });
});

app.get("/add-expense", (req, res) => {
  res.render("add-expense");
});

app.post("/add-expense", async (req, res) => {
  const { description, amount, date } = req.body;
  await pool.query(
    "INSERT INTO expenses (description, amount, date) VALUES ($1, $2, $3)",
    [description, amount, date]
  );
  res.redirect("/");
});

app.get("/add-income", (req, res) => {
  res.render("add-income");
});

app.post("/add-income", async (req, res) => {
  const { amount, date } = req.body;
  await pool.query("INSERT INTO income (amount, date) VALUES ($1, $2)", [
    amount,
    date,
  ]);
  res.redirect("/");
});

app.post("/delete-expense/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
  res.redirect("/");
});

app.get("/dashboard", async (req, res) => {
  const dailyTotals = await pool.query(
    "SELECT date, SUM(amount) AS total FROM expenses GROUP BY date ORDER BY date DESC"
  );
  res.render("dashboard", { dailyTotals: dailyTotals.rows });
});

// Start Server
app.listen(port, () => {
  console.log(`Expense Tracker running on http://localhost:${port}`);
});
