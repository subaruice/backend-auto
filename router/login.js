import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('nmema');
            
            return res.status(404).json({ message: "Заполните обязательное поле" });
        }
        const [user] = await pool.query(`SELECT * FROM avl_customers WHERE Email = ?`, [email]);
        if (user.length === 0) {
            return res.status(401).json({ message: "Неправильный имейл" });
        }
        const match = await bcrypt.compare(password, user[0].cust_password);
        if (!match) {
            return res.status(401).json({ message: "Неправильный пароль" });
        }

        const token = jwt.sign({ id: user[0].customerID, login: user[0].Login, email }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });
        res.json({ message: "Вы успешно вошли в систему", user: user[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal error" });
    }
});

export default router;
