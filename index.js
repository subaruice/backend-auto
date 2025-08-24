import cors from "cors";
import logout from "./router/logout.js";
import express from "express";
import productRoutes from "./router/products.js";
import categoryRoutes from "./router/categories.js";
import feedback from "./router/feedback.js";
import registration from "./router/registration.js";
import login from "./router/login.js";
import cookieParser from "cookie-parser";
import profile from "./router/profile.js";
import updateUserInfo from "./router/updateUserInfo.js";

const app = express();
const PORT = 3001;

app.use(
    cors({
        origin: "http://localhost:5173",
        exposedHeaders: ["x-total-count"],
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/", feedback);
app.use("/", registration);
app.use("/", login);
app.use("/", profile);
app.use("/", logout);
app.use("/", updateUserInfo);

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
