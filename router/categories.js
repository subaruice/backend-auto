import express from "express";
import { pool } from "../db.js";
import { getAllCategories } from "../db/queries.js";

const router = express.Router();

function buildCategory(categories, parentId) {
    return categories
        .filter((cat) => cat.parent === parentId)
        .map((cat) => ({
            ...cat,
            name: cat.name.replace("Шкода", "Škoda"),
            subcategories: buildCategory(categories, cat.categoryID),
        }));
}

router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(getAllCategories);

        // const main = rows.filter((cat) => cat.parent === 1);
        // const subs = rows.filter((cat) => cat.parent !== null && cat.parent !== 1);

        // const structured = main.map((parent) => ({
        //     ...parent,
        //     subcategories: subs.filter((sub) => sub.parent === parent.categoryID),
        //     name: parent.name.replace("Шкода", "Škoda"),
        // }));
        const structured = buildCategory(rows, 1)

        res.json(structured);
    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
