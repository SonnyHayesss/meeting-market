import { Router } from "express";
import {
  availability,
  createBooking,
  deleteBooking,
  listBookings,
  listMyBookings,
  updateBookingStatus
} from "../controllers/bookingController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const bookingRoutes = Router();

bookingRoutes.get("/availability", requireAuth, availability);
bookingRoutes.get("/mine", requireAuth, listMyBookings);
bookingRoutes.post("/", requireAuth, createBooking);
bookingRoutes.get("/", requireAuth, requireAdmin, listBookings);
bookingRoutes.patch("/:id/status", requireAuth, requireAdmin, updateBookingStatus);
bookingRoutes.delete("/:id", requireAuth, requireAdmin, deleteBooking);
