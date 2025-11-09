import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import express from "express";

const router = express.Router();

router.post("/registration", async (req, res) => {
    try {
        const { login, email, password, name, surname } = req.body;

        if (!login || !email || !password) {
            return res.status(404).json({ message: "Заполните обязательные поля" });
        }

        const [userExists] = await pool.query(`SELECT customerID FROM avl_customers WHERE Login = ? OR Email = ?`, [
            login,
            email,
        ]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: "Пользователь с таким email уже существует" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const reg_datetime = new Date();
        const [result] = await pool.query(
            `INSERT INTO avl_customers (Login, cust_password, Email, reg_datetime, first_name, last_name)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [login, hashPass, email, reg_datetime, name, surname]
        );

        const token = jwt.sign({ id: result.insertId, login, email }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });
        res.status(201).json({ message: `Вы успешно зарегестрировались ${login}` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

export default router;
