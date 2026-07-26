import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { authRoutes } from "./routes/authRoutes.js";
import { bookingRoutes } from "./routes/bookingRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";
import { initializeDatabase } from "./services/databaseService.js";
const app = express();
app.use(cors({
    origin: config.clientUrl,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Что-то пошло не так." });
});
await initializeDatabase();
app.listen(config.port, () => {
    console.log(`Meeting Market API: http://localhost:${config.port}`);
});
