import type { Response } from "express";
import { prisma } from "../prisma.js";
import { buildReminder } from "../services/notificationService.js";
import type { AuthedRequest } from "../types.js";

function normalizeNotification(notification: {
  id: number;
  title: string;
  message: string;
  audience: string;
  userId: number | null;
  bookingId: number | null;
  createdAt: Date;
}) {
  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
    kind: "STATUS"
  };
}

export async function listNotifications(req: AuthedRequest, res: Response) {
  const isAdmin = req.user?.role === "ADMIN";
  const userId = req.user?.role === "USER" ? Number(req.user.sub) : undefined;

  const stored = await prisma.notification.findMany({
    where: isAdmin ? { audience: "ADMIN" } : { userId },
    orderBy: { createdAt: "desc" }
  });

  const approvedBookings = await prisma.booking.findMany({
    where: isAdmin ? { status: "APPROVED" } : { status: "APPROVED", userId },
    orderBy: [{ date: "asc" }, { startTime: "asc" }]
  });

  const reminders = approvedBookings
    .map((booking) => buildReminder(booking, isAdmin ? "ADMIN" : "USER"))
    .filter(Boolean);

  return res.json({ notifications: [...reminders, ...stored.map(normalizeNotification)] });
}
