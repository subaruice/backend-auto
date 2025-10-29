import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/accept-order", async (req, res) => {
    const { first_name, last_name, payment_method, city, phone_number, newPost_office, customerID, productID } =
        req.body;
    try {
        const [added] = await pool.query(
            `INSERT INTO orders 
            (first_name, last_name, payment_method, city, phone_number, newPost_office, customerID, productID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                first_name,
                last_name,
                payment_method,
                city,
                Number(phone_number),
                Number(newPost_office),
                Number(customerID),
                JSON.stringify(productID),
            ]
        );
        res.status(201).json({ message: `Создан заказ с номером ${added.insertId}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal error" });
    }
});

export default router;
