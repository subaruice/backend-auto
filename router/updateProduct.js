import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.patch("/admin/patch-product", async (req, res) => {
    try {
        const { productID, name, description, list_price, Price, product_code, in_stock } = req.body;

        const updateString = { name, description, list_price, Price, product_code, in_stock };
        const fields = Object.keys(updateString).filter(
            (key) => updateString[key] !== undefined && updateString[key] !== null
        );
        if (fields.length === 0) {
            return res.status(500).json({ message: "Нет полей к обновлению" });
        }
        const values = fields.map((key) => updateString[key]);
        const setString = fields.map((f) => `${f} = ?`).join(", ");
        const [rows] = await pool.query(`UPDATE avl_products SET ${setString} WHERE productID = ?`, [
            ...values,
            productID,
        ]);

        if (rows.affectedRows === 0) {
            return res.status(500).json({ message: "Ничего не обновлено" });
        }

        res.json({ message: `Продукт ${product_code} изменён` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal error" });
    }
});

export default router;
