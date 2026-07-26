import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { StatusBadge } from "./StatusBadge";
import type { Booking } from "../types";

export function BookingCard({ booking }: { booking: Booking }) {
  const place = booking.place === "Другое" ? booking.customPlace : booking.place;

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-cream">{format(parseISO(`${booking.date}T12:00:00`), "d MMMM yyyy", { locale: ru })}</p>
          <p className="mt-1 text-sm text-cream/60">
            {booking.startTime} - {booking.endTime}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <p className="text-sm text-cream/75">Место: {place}</p>
      <p className="mt-1 text-sm text-cream/45">
        {booking.displayName} · @{booking.username}
      </p>
    </article>
  );
}
