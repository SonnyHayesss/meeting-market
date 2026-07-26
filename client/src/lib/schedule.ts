import { addDays, addYears, eachDayOfInterval, endOfMonth, format, isBefore, isSameDay, startOfDay, startOfMonth, subDays } from "date-fns";
import type { BookedInterval } from "../types";

export const places = ["Центр (Семаки)", "Центр (Ростов)", "Дон (купаться)", "ТЦ", "Другое"];

export function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function isHoliday(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return (month === 12 && day >= 30) || (month === 1 && day <= 7);
}

export function isPastDay(date: Date, now = new Date()) {
  return isBefore(startOfDay(date), startOfDay(now));
}

export function maxBookingDate(now = new Date()) {
  return addYears(startOfDay(now), 1);
}

export function isBeyondBookingWindow(date: Date, now = new Date()) {
  return startOfDay(date).getTime() > maxBookingDate(now).getTime();
}

export function isBookableDate(date: Date, now = new Date()) {
  return !isPastDay(date, now) && !isBeyondBookingWindow(date, now) && !isHoliday(date);
}

export function canOpenPreviousMonth(month: Date, now = new Date()) {
  return startOfMonth(month).getTime() > startOfMonth(now).getTime();
}

export function canOpenNextMonth(month: Date, now = new Date()) {
  return addDays(endOfMonth(month), 1).getTime() <= endOfMonth(maxBookingDate(now)).getTime();
}

export function monthGrid(anchor: Date) {
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  const gridStart = subDays(start, (start.getDay() + 6) % 7);
  const gridEnd = addDays(end, 6 - ((end.getDay() + 6) % 7));

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours < 17 ? 24 * 60 : 0) + hours * 60 + minutes;
}

export function timeSlots() {
  const result: string[] = [];
  for (let minutes = 17 * 60; minutes <= 26 * 60; minutes += 30) {
    const normalized = minutes % (24 * 60);
    const hours = Math.floor(normalized / 60);
    const mins = normalized % 60;
    result.push(`${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`);
  }
  return result;
}

export function overlaps(startTime: string, endTime: string, booked: BookedInterval[]) {
  return booked.some((slot) => toMinutes(startTime) < toMinutes(slot.endTime) && toMinutes(slot.startTime) < toMinutes(endTime));
}

export function isSameCalendarDay(a: Date, b: Date) {
  return isSameDay(a, b);
}
