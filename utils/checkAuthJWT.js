import jwt from "jsonwebtoken";

const checkAuthJWT = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Нет токена" });

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Не валидный токен" });
        req.user = user;
        next();
    });
};

export default checkAuthJWT;
