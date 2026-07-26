import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { NotificationList } from "../components/NotificationList";
import { StatusBadge } from "../components/StatusBadge";
import { Tabs } from "../components/Tabs";
import { api } from "../lib/api";
import type { AppNotification, Booking, BookingStatus } from "../types";

export function AdminPage() {
  const [tab, setTab] = useState<"bookings" | "notifications">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [error, setError] = useState("");

  async function loadBookings() {
    try {
      const response = await api.bookings();
      setBookings(response.bookings);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить заявки.");
    }
  }

  async function loadNotifications() {
    try {
      const response = await api.notifications();
      setNotifications(response.notifications);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить уведомления.");
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (tab === "notifications") {
      loadNotifications();
    }
  }, [tab]);

  async function setStatus(id: number, status: BookingStatus) {
    try {
      await api.setStatus(id, status);
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить статус.");
    }
  }

  async function remove(id: number) {
    try {
      await api.deleteBooking(id);
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить заявку.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
      <section className="mb-6 flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.05] p-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-gold">админ-панель</p>
          <h1 className="text-3xl font-bold text-cream">Заявки на встречу</h1>
          <p className="mt-2 text-sm text-cream/60">Одобренные интервалы закрывают время для новых броней.</p>
        </div>
        <Button variant="secondary" onClick={loadBookings}>
          Обновить
        </Button>
      </section>

      {error ? <p className="mb-4 rounded-lg bg-ember/12 px-3 py-2 text-sm text-[#ffc1b8]">{error}</p> : null}

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "bookings", label: "Все заявки" },
          { id: "notifications", label: "Уведомления" }
        ]}
      />

      {tab === "bookings" ? (
      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
        <div className="hidden grid-cols-[0.9fr_0.8fr_1.2fr_1fr_0.9fr_1.6fr] gap-4 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-cream/45 lg:grid">
          <span>Дата</span>
          <span>Время</span>
          <span>Место</span>
          <span>Пользователь</span>
          <span>Статус</span>
          <span>Действия</span>
        </div>

        {bookings.length === 0 ? (
          <p className="p-6 text-center text-cream/60">Заявок пока нет.</p>
        ) : (
          bookings.map((booking) => (
            <article
              key={booking.id}
              className="grid gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 lg:grid-cols-[0.9fr_0.8fr_1.2fr_1fr_0.9fr_1.6fr] lg:items-center"
            >
              <div>
                <p className="text-sm font-semibold text-cream lg:hidden">Дата</p>
                <p className="text-cream">{format(parseISO(`${booking.date}T12:00:00`), "d MMM yyyy", { locale: ru })}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-cream lg:hidden">Время</p>
                <p className="text-cream/75">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-cream lg:hidden">Место</p>
                <p className="text-cream/75">{booking.place === "Другое" ? booking.customPlace : booking.place}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-cream lg:hidden">Пользователь</p>
                <p className="text-cream">{booking.displayName}</p>
                <p className="text-sm text-cream/45">@{booking.username}</p>
              </div>
              <StatusBadge status={booking.status} />
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setStatus(booking.id, "APPROVED")} disabled={booking.status === "APPROVED"}>
                  Одобрить
                </Button>
                <Button variant="secondary" onClick={() => setStatus(booking.id, "REJECTED")} disabled={booking.status === "REJECTED"}>
                  Отклонить
                </Button>
                <Button variant="danger" onClick={() => remove(booking.id)}>
                  Удалить
                </Button>
              </div>
            </article>
          ))
        )}
      </section>
      ) : null}

      {tab === "notifications" ? (
        <section>
          <div className="mb-4 flex justify-end">
            <Button variant="secondary" onClick={loadNotifications}>
              Обновить
            </Button>
          </div>
          <NotificationList notifications={notifications} />
        </section>
      ) : null}
    </main>
  );
}
