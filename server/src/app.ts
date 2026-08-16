import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { authRoutes } from "./routes/authRoutes.js";
import { bookingRoutes } from "./routes/bookingRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";
import { initializeDatabase } from "./services/databaseService.js";

export const app = express();

let databaseReady: Promise<void> | null = null;

export function ensureDatabase() {
  databaseReady ??= initializeDatabase();
  return databaseReady;
}

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(async (_req, _res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Что-то пошло не так." });
});
