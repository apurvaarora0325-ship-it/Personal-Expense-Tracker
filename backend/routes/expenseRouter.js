const express = require("express");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authentication to all expense routes
router.use(authMiddleware);

// Add a new expense
router.post("/", async (req, res) => {
    try {
        const {
            title,
            amount,
            category,
            paymentMethod,
            date,
            description
        } = req.body;

        if (
            !title ||
            amount === undefined ||
            !category ||
            !paymentMethod
        ) {
            return res.status(400).json({
                message: "Please provide all required expense details."
            });
        }

        const expense = await Expense.create({
            user: req.user.id,
            title,
            amount,
            category,
            paymentMethod,
            date,
            description
        });

        res.status(201).json({
            message: "Expense added successfully.",
            expense
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding expense.",
            error: error.message
        });
    }
});

// Get all expenses of the logged-in user
router.get("/", async (req, res) => {
    try {
        const expenses = await Expense.find({
            user: req.user.id
        }).sort({ date: -1 });

        res.status(200).json({
            count: expenses.length,
            expenses
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching expenses.",
            error: error.message
        });
    }
});

// Update an expense
router.put("/:id", async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found."
            });
        }

        res.status(200).json({
            message: "Expense updated successfully.",
            expense
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating expense.",
            error: error.message
        });
    }
});

// Delete an expense
router.delete("/:id", async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found."
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting expense.",
            error: error.message
        });
    }
});

module.exports = router;