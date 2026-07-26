import { Router } from "express";
import { listNotifications } from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", requireAuth, listNotifications);
