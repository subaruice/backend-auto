import express from "express";

const router = express.Router();

router.post("/logout", async (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: false,
    });
    res.json({ message: "clear cookie" });
});

export default router;