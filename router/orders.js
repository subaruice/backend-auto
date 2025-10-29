import express from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

router.get("/orders", async (req, res) => {
    try {
        const cookie = req.cookies.jwt;
        const payload = jwt.verify(cookie, process.env.JWT_SECRET_KEY);
        const [rows] = await pool.query(`SELECT * FROM orders WHERE customerID = ?`, [payload.id]);
        if (rows.length === 0) {
           return res.status(404).json({ message: "Нет заказов" });
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal error" });
    }
});

export default router;
