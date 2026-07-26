import type { BookingStatus } from "../types";

const labels: Record<BookingStatus, string> = {
  PENDING: "Ожидает",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено"
};

const styles: Record<BookingStatus, string> = {
  PENDING: "bg-gold/15 text-[#f1c98b] ring-gold/30",
  APPROVED: "bg-emerald-400/12 text-emerald-200 ring-emerald-300/25",
  REJECTED: "bg-ember/14 text-[#ffb3a8] ring-ember/35"
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status]}`}>{labels[status]}</span>;
}
