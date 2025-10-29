import express from "express";
import { pool } from "../db.js";
import multer from "multer";
import cloudinary from "../cloudinary.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.patch("/profile/edit", upload.single("avatar_image"), async (req, res) => {
    try {
        const { first_name, last_name, Login, Email, phone_number, id } = req.body;

        const [rows] = await pool.query("SELECT customerID FROM avl_customers WHERE phone_number = ?", [phone_number]);

        if (rows.length > 1) {
            return res.status(400).json({ message: "Такой номер телефона уже существует" });
        }
        const updates = { first_name, last_name, Login, Email, phone_number };
        if (req.file) {
            try {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ folder: "user_avatars" }, (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(result);
                    });
                    stream.end(req.file.buffer);
                });
                const [imageExist] = await pool.query(`SELECT avatar_image FROM avl_customers WHERE customerID = ?`, [
                    id,
                ]);
                if (imageExist.length !== 0) {
                    const public_id = imageExist[0].avatar_image
                        .split("/")
                        .slice(-2)
                        .join("/")
                        .replace(/\.[^/.]+$/, "");
                    await cloudinary.uploader.destroy(public_id);
                }
                updates.avatar_image = result?.secure_url;
            } catch (err) {
                return res.status(500).json({ message: "pizdec" });
            }
        }
        const fields = Object.keys(updates).filter((key) => updates[key] !== undefined && updates[key] !== null);
        const values = fields.map((key) => updates[key]);

        if (fields.length === 0) {
            return res.status(400).json({ message: "Нет полей к обновлению" });
        }
        const setString = fields.map((f) => `${f} = ?`).join(", ");

        const [result] = await pool.query(`UPDATE avl_customers SET ${setString} WHERE customerID = ?`, [
            ...values,
            id,
        ]);

        if (result.changedRows === 0) {
            return res.json({ message: "Data is not changed" });
        }

        res.json({
            message: `${id} пользователь с этим id изменён`,
            avatar_url: updates["avatar_image"] ? updates["avatar_image"] : null,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal error" });
    }
});

router.patch("/profile/delete", async (req, res) => {
    try {
        const { customerID } = req.body;
        await pool.query(`UPDATE avl_customers SET avatar_image = NULL WHERE customerID = ?`, [customerID]);
        res.json({ avatar_url: null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal error" });
    }
});

export default router;
