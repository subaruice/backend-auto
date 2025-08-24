import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const mail = nodemailer.createTransport({
    host: "mail.milotec.com.ua",
    port: 465,
    secure: true,
    auth: {
        user: "info@milotec.com.ua",
        pass: process.env.MAIL_PASS,
    },
});

router.post("/feedback", async (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    try {
        await mail.sendMail({
            from: `"${firstName} ${lastName}" <${email}`,
            to: "info@milotec.com.ua",
            subject: `Новое сообщение от пользователя ${firstName}`,
            html: `
            <div style="font-family: sans-serif; line-height: 1.5; color: #333; padding: 15px">
                <h2 style="color: #004aad;">📩 Новое сообщение с формы обратной связи</h2>
                <p><strong>Имя:</strong> ${firstName}</p>
                <p><strong>Фамилия:</strong> ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Сообщение:</strong></p>
                <div style="padding: 10px; background: #f5f5f5; border-radius: 5px;">
                ${message.replace(/\n/g, "<br>")}
                </div>
                <hr>
                <p style="font-size: 12px; color: #777;">Это письмо было отправлено с сайта <a href="https://milotec.com.ua" style="color: #004aad;">Milotec.com.ua</a></p>
            </div>
            `,
        });

        await mail.sendMail({
            from: '"Milotec" <info@milotec.com.ua>',
            to: email,
            subject: "Спасибо за ваше сообщение!",
            html: `
                <div>
                    <h2>Здравствуйте, ${firstName}!</h2>
                    <p>Мы получили ваше сообщение и свяжемся с вами в ближайшее время.</p>
                    <hr>
                    <p><b>Ваше сообщение:</b><br>${message}</p>
                    <p>С уважением,<br>Команда Milotec</p>
                </div>
            `,
        })
        res.json({ success: true, message: "Сообщения отправлены" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: `${process.env.MAIL_PASS}` });
    }
});

export default router;
