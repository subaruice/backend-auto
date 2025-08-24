import express from "express";
import checkAuthJWT from "../utils/checkAuthJWT.js";
import { pool } from "../db.js";

const router = express.Router();

router.get("/profile", checkAuthJWT, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Нет токена" });

        const [user] = await pool.query("SELECT * FROM avl_customers WHERE customerID = ?", [req.user.id]);

        if (user.length === 0) return res.status(403).json({ message: "Пользователь не найден" });

        res.json(user[0]);
    } catch (err) {
        console.erroe(err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

export default router;
