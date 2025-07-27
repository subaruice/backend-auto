import express from "express";
import { pool } from "../db.js";
import { getAllCategories } from "../db/queries.js";

const router = express.Router();

// GET: categories with nested subcategories
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(getAllCategories);

        const main = rows.filter((cat) => cat.parent === 1);
        const subs = rows.filter((cat) => cat.parent !== null && cat.parent !== 1);

        const structured = main.map((parent) => ({
            ...parent,
            subcategories: subs.filter((sub) => sub.parent === parent.categoryID),
            name: parent.name.replace("Шкода", "Škoda"),
        }));

        res.json(structured);
    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
