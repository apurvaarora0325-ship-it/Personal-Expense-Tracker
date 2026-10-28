const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRouter = require("./routes/authRouters");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);

// Test route
app.get("/", (req, res) => {
    res.send("Personal Expense Tracker Backend is Running!");
});

// Expense routes
const expenseRoute = require("./routes/expenseRouter");
app.use("/api/expenses", expenseRoute);

// Server and database connection
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

startServer();