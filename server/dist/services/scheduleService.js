import { schedule } from "../config.js";
function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}
function parseBookingDate(date) {
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day)
        return null;
    const parsed = new Date(year, month - 1, day);
    parsed.setHours(0, 0, 0, 0);
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
        return null;
    }
    return parsed;
}
export function isInsideBookingWindow(date) {
    const parsed = parseBookingDate(date);
    if (!parsed)
        return false;
    const today = startOfToday();
    const max = new Date(today);
    max.setFullYear(max.getFullYear() + 1);
    return parsed.getTime() >= today.getTime() && parsed.getTime() <= max.getTime();
}
export function isHoliday(date) {
    const [, monthRaw, dayRaw] = date.split("-").map(Number);
    const month = monthRaw;
    const day = dayRaw;
    return (month === 12 && day >= schedule.holidayStart.day) || (month === 1 && day <= schedule.holidayEnd.day);
}
export function toMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const base = hours < 17 ? 24 * 60 : 0;
    return base + hours * 60 + minutes;
}
export function isAllowedTime(time) {
    const minutes = toMinutes(time);
    return minutes >= toMinutes(schedule.start) && minutes <= toMinutes(schedule.end);
}
export function isValidInterval(startTime, endTime) {
    return isAllowedTime(startTime) && isAllowedTime(endTime) && toMinutes(endTime) > toMinutes(startTime);
}
export function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
    return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}
