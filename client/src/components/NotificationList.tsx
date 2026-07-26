import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import type { AppNotification } from "../types";

export function NotificationList({ notifications }: { notifications: AppNotification[] }) {
  if (notifications.length === 0) {
    return <p className="rounded-lg border border-white/10 bg-white/[0.05] p-6 text-center text-cream/60">Уведомлений пока нет.</p>;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <article
          key={notification.id}
          className={`rounded-lg border p-4 ${
            notification.kind === "REMINDER" ? "border-gold/35 bg-gold/10" : "border-white/10 bg-white/[0.055]"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-bold text-cream">{notification.title}</h3>
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold text-cream/55">
              {notification.kind === "REMINDER" ? "напоминание" : "статус"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-cream/72">{notification.message}</p>
          <p className="mt-3 text-xs text-cream/40">{format(parseISO(notification.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}</p>
        </article>
      ))}
    </div>
  );
}
