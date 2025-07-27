import express from "express";
import { pool } from "../db.js";
import { getProductsByCategoryId, getProductById, getAllProducts, getAllSaleProducts } from "../db/queries.js";
import { cleanHtml } from "../utils/extractModels.js";

const router = express.Router();

router.get("/category/:id", async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const categoryID = req.params.id;
    try {
        const [count] = await pool.query(getProductsByCategoryId, [categoryID]);
        const [rows] = await pool.query(`${getProductsByCategoryId} LIMIT ? OFFSET ?`, [categoryID, limit, offset]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Нет товаров" });
        }
        const cleanedProducts = rows.map((product) => ({
            ...product,
            name: product.name.replace(/[^а-яА-ЯёЁ\s]/g, ""),
            product_code: product.product_code.replace(/\s+/g, ""),
            brief_description: cleanHtml(product.brief_description),
        }));
        res.set("x-total-count", count.length);
        res.json(cleanedProducts);
    } catch (err) {
        console.error("DB error: ", err.message);
        res.status(500).json({ error: "Database error" });
    }
});
router.get("/product/:id", async (req, res) => {
    const productID = req.params.id;
    try {
        const [rows] = await pool.query(getProductById, [productID]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Продукт не найден" });
        }
        const cleanedProducts = rows.map((product) => ({
            ...product,
            name: product.name.replace(/[^а-яА-ЯёЁ\s]/g, ""),
            product_code: product.product_code.replace(/\s+/g, ""),
            brief_description: cleanHtml(product.brief_description),
            description: cleanHtml(product.description),
        }));
        return res.json(cleanedProducts[0]);
    } catch (err) {
        console.error("DB error: ", err.message);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/", async (req, res) => {
    const limit = parseInt(req.query.limit) || 140;
    const offset = parseInt(req.query.offset) || 0;
    try {
        const [count] = await pool.query(getAllSaleProducts);
        const [rows] = await pool.query(`${getAllSaleProducts} LIMIT ? OFFSET ?`, [limit, offset]);
        if (rows.length === 0) {
            return res.status(404).json("Нет товаров");
        }
        const cleanedProducts = rows.map((product) => ({
            ...product,
            name: product.name.replace(/[^а-яА-ЯёЁ\s]/g, ""),
            product_code: product.product_code.replace(/\s+/g, ""),
            brief_description: cleanHtml(product.brief_description),
        }));

        res.set("x-total-count", count.length);
        res.json(cleanedProducts);
    } catch {
        console.log("DB error");
        res.status(500).json({ error: "db error" });
    }
});

router.get("/catalog", async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    try {
        const [rows] = await pool.query(`${getAllProducts} LIMIT ? OFFSET ?`, [limit, offset]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Нет товаров" });
        }
        const cleanedProducts = rows.map((product) => ({
            ...product,
            name: product.name.replace(/[^а-яА-ЯёЁ\s]/g, ""),
            product_code: product.product_code.replace(/\s+/g, ""),
            brief_description: cleanHtml(product.brief_description),
        }));

        const productsMap = new Map();

        cleanedProducts.forEach((row) => {
            if (!productsMap.has(row.productID)) {
                const { picture_id, filename, thumbnail, enlarged, ...productFields } = row;
                productsMap.set(row.productID, {
                    ...productFields,
                    pictures: [], // always initialize
                });
            }
            if (row.picture_id) {
                productsMap.get(row.productID).pictures.push({
                    photoID: row.picture_id,
                    filename: row.filename,
                    thumbnail: row.thumbnail,
                    enlarged: row.enlarged,
                });
            }
        });
        const result = Array.from(productsMap.values());
        res.set("x-total-count", result.length);
        res.json(result);
    } catch (err) {
        console.error("DB error: ", err.message);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
