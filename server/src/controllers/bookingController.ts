import type { Response } from "express";
import { places } from "../config.js";
import { prisma } from "../prisma.js";
import { createDeletedApprovedNotification, createStatusNotification } from "../services/notificationService.js";
import { intervalsOverlap, isHoliday, isInsideBookingWindow, isValidInterval } from "../services/scheduleService.js";
import type { AuthedRequest } from "../types.js";

function normalizeBooking(booking: {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  place: string;
  customPlace: string | null;
  username: string;
  displayName: string;
  status: string;
  createdAt: Date;
}) {
  return {
    ...booking,
    createdAt: booking.createdAt.toISOString()
  };
}

export async function availability(req: AuthedRequest, res: Response) {
  const date = String(req.query.date ?? "");

  if (!date) {
    return res.status(400).json({ message: "Выберите дату." });
  }

  const approved = await prisma.booking.findMany({
    where: { date, status: "APPROVED" },
    orderBy: { startTime: "asc" }
  });

  return res.json({
    date,
    unavailable: isHoliday(date) || !isInsideBookingWindow(date),
    booked: approved.map((booking) => ({
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime
    }))
  });
}

export async function createBooking(req: AuthedRequest, res: Response) {
  const date = String(req.body.date ?? "");
  const startTime = String(req.body.startTime ?? "");
  const endTime = String(req.body.endTime ?? "");
  const place = String(req.body.place ?? "");
  const customPlace = String(req.body.customPlace ?? "").trim();
  const username = String(req.body.username ?? "").trim();
  const displayName = String(req.body.displayName ?? "").trim();

  if (!date || !startTime || !endTime || !place || !username || !displayName) {
    return res.status(400).json({ message: "Заполните все обязательные поля." });
  }

  if (isHoliday(date)) {
    return res.status(400).json({ message: "Недоступно" });
  }

  if (!isInsideBookingWindow(date)) {
    return res.status(400).json({ message: "Можно бронировать только с сегодняшнего дня и максимум на год вперед." });
  }

  if (!places.includes(place)) {
    return res.status(400).json({ message: "Выберите место из списка." });
  }

  if (place === "Другое" && customPlace.length < 2) {
    return res.status(400).json({ message: "Укажите место встречи." });
  }

  if (!isValidInterval(startTime, endTime)) {
    return res.status(400).json({ message: "Выберите время с 17:00 до 02:00, окончание позже начала." });
  }

  const approved = await prisma.booking.findMany({ where: { date, status: "APPROVED" } });
  const hasOverlap = approved.some((booking) => intervalsOverlap(startTime, endTime, booking.startTime, booking.endTime));

  if (hasOverlap) {
    return res.status(409).json({ message: "Это время уже занято." });
  }

  const booking = await prisma.booking.create({
    data: {
      date,
      startTime,
      endTime,
      place,
      customPlace: place === "Другое" ? customPlace : null,
      username,
      displayName,
      userId: req.user?.role === "USER" ? Number(req.user.sub) : null
    }
  });

  return res.status(201).json({ booking: normalizeBooking(booking) });
}

export async function listBookings(_req: AuthedRequest, res: Response) {
  const bookings = await prisma.booking.findMany({
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { createdAt: "desc" }]
  });

  return res.json({ bookings: bookings.map(normalizeBooking) });
}

export async function listMyBookings(req: AuthedRequest, res: Response) {
  const bookings = await prisma.booking.findMany({
    where: { userId: Number(req.user!.sub) },
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { createdAt: "desc" }]
  });

  return res.json({ bookings: bookings.map(normalizeBooking) });
}

export async function updateBookingStatus(req: AuthedRequest, res: Response) {
  const id = Number(req.params.id);
  const status = String(req.body.status ?? "");

  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return res.status(400).json({ message: "Неизвестный статус." });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return res.status(404).json({ message: "Заявка не найдена." });
  }

  if (status === "APPROVED") {
    const approved = await prisma.booking.findMany({
      where: { date: booking.date, status: "APPROVED", NOT: { id } }
    });
    const hasOverlap = approved.some((item) =>
      intervalsOverlap(booking.startTime, booking.endTime, item.startTime, item.endTime)
    );

    if (hasOverlap) {
      return res.status(409).json({ message: "Нельзя одобрить: интервал пересекается с уже одобренной встречей." });
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: status as "APPROVED" | "REJECTED" | "PENDING" }
  });

  if ((status === "APPROVED" || status === "REJECTED") && booking.status !== status) {
    await createStatusNotification(updated, status);
  }

  return res.json({ booking: normalizeBooking(updated) });
}

export async function deleteBooking(req: AuthedRequest, res: Response) {
  const id = Number(req.params.id);
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    return res.status(404).json({ message: "Заявка не найдена." });
  }

  if (booking.status === "APPROVED") {
    await createDeletedApprovedNotification(booking);
  }

  await prisma.booking.delete({ where: { id } });
  return res.json({ ok: true });
}
