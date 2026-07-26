import { prisma } from "../prisma.js";
function meetingDate(date, time) {
    const [hours, minutes] = time.split(":").map(Number);
    const start = new Date(`${date}T00:00:00`);
    start.setHours(hours, minutes, 0, 0);
    if (hours < 17) {
        start.setDate(start.getDate() + 1);
    }
    return start;
}
function placeText(booking) {
    return booking.place === "Другое" ? booking.customPlace ?? "другое место" : booking.place;
}
export async function createStatusNotification(booking, status) {
    if (!booking.userId)
        return;
    const approved = status === "APPROVED";
    await prisma.notification.create({
        data: {
            audience: "USER",
            userId: booking.userId,
            bookingId: booking.id,
            title: approved ? "Заявка одобрена" : "Заявка отклонена",
            message: approved
                ? `Илья подтвердил встречу ${booking.date} с ${booking.startTime} до ${booking.endTime}, место: ${placeText(booking)}.`
                : `Илья отклонил заявку на ${booking.date} с ${booking.startTime} до ${booking.endTime}.`
        }
    });
}
export async function createDeletedApprovedNotification(booking) {
    if (!booking.userId)
        return;
    await prisma.notification.create({
        data: {
            audience: "USER",
            userId: booking.userId,
            bookingId: booking.id,
            title: "Одобренная встреча удалена",
            message: `Встреча ${booking.date} с ${booking.startTime} до ${booking.endTime}, место: ${placeText(booking)}, больше не активна.`
        }
    });
}
export function buildReminder(booking, audience) {
    const start = meetingDate(booking.date, booking.startTime);
    const diffMs = start.getTime() - Date.now();
    if (diffMs < 0 || diffMs > 60 * 60 * 1000) {
        return null;
    }
    const minutes = Math.max(1, Math.ceil(diffMs / 60000));
    const person = audience === "ADMIN" ? `${booking.displayName} (@${booking.username})` : "Ильей";
    return {
        id: `reminder-${audience.toLowerCase()}-${booking.id}`,
        title: "Встреча уже скоро",
        message: `Через ${minutes} мин. встреча с ${person}: ${booking.startTime} - ${booking.endTime}, ${placeText(booking)}.`,
        audience,
        bookingId: booking.id,
        createdAt: new Date().toISOString(),
        kind: "REMINDER"
    };
}
