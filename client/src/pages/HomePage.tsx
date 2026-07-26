import { addMonths, format } from "date-fns";
import { ru } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BookingCard } from "../components/BookingCard";
import { Button } from "../components/Button";
import { NotificationList } from "../components/NotificationList";
import { Tabs } from "../components/Tabs";
import { api } from "../lib/api";
import {
  canOpenNextMonth,
  canOpenPreviousMonth,
  formatDate,
  isBookableDate,
  isBeyondBookingWindow,
  isHoliday,
  isPastDay,
  isSameCalendarDay,
  monthGrid,
  overlaps,
  places,
  timeSlots,
  toMinutes
} from "../lib/schedule";
import { useAuthStore } from "../store/authStore";
import type { AppNotification, BookedInterval, Booking } from "../types";

type BookingForm = {
  username: string;
  displayName: string;
  customPlace: string;
};

export function HomePage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"book" | "mine" | "notifications">("book");
  const [started, setStarted] = useState(false);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [today, setToday] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [booked, setBooked] = useState<BookedInterval[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [place, setPlace] = useState(places[0]);
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<BookingForm>({
    defaultValues: { username: user?.username ?? "", displayName: "", customPlace: "" }
  });

  const slots = useMemo(timeSlots, []);
  const days = monthGrid(month);
  const canGoBack = canOpenPreviousMonth(month, today);
  const canGoForward = canOpenNextMonth(month, today);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextToday = new Date();
      setToday(nextToday);

      if (!canOpenPreviousMonth(month, nextToday)) {
        setMonth(nextToday);
      }

      if (selectedDate && !isBookableDate(selectedDate, nextToday)) {
        setSelectedDate(null);
        setStartTime("");
        setEndTime("");
      }
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, [month, selectedDate]);

  async function loadPersonalData() {
    try {
      const [bookingsResponse, notificationsResponse] = await Promise.all([api.myBookings(), api.notifications()]);
      setMyBookings(bookingsResponse.bookings);
      setNotifications(notificationsResponse.notifications);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Не удалось загрузить личные данные.");
    }
  }

  useEffect(() => {
    if (tab === "mine" || tab === "notifications") {
      loadPersonalData();
    }
  }, [tab]);

  useEffect(() => {
    if (!selectedDate) return;

    setNotice("");
    setStartTime("");
    setEndTime("");
    api
      .availability(formatDate(selectedDate))
      .then((response) => setBooked(response.booked))
      .catch((err) => setNotice(err instanceof Error ? err.message : "Не удалось загрузить интервалы."));
  }, [selectedDate]);

  function pickDate(day: Date) {
    if (isHoliday(day) || isPastDay(day, today) || isBeyondBookingWindow(day, today)) {
      setNotice("Недоступно");
      return;
    }
    setSuccess(false);
    setSelectedDate(day);
  }

  function isStartDisabled(slot: string) {
    return booked.some((item) => toMinutes(slot) >= toMinutes(item.startTime) && toMinutes(slot) < toMinutes(item.endTime));
  }

  function isEndDisabled(slot: string) {
    if (!startTime || toMinutes(slot) <= toMinutes(startTime)) return true;
    return overlaps(startTime, slot, booked);
  }

  async function onSubmit(values: BookingForm) {
    if (!selectedDate) {
      setNotice("Сначала выберите дату.");
      return;
    }

    if (!startTime || !endTime) {
      setNotice("Выберите время начала и окончания.");
      return;
    }

    try {
      await api.createBooking({
        date: formatDate(selectedDate),
        startTime,
        endTime,
        place,
        customPlace: values.customPlace,
        username: values.username,
        displayName: values.displayName
      });
      setSuccess(true);
      setNotice("");
      setStartTime("");
      setEndTime("");
      reset({ username: user?.username ?? values.username, displayName: "", customPlace: "" });
      const response = await api.availability(formatDate(selectedDate));
      setBooked(response.booked);
      await loadPersonalData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Не удалось отправить заявку.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl overflow-hidden px-4 pb-12 sm:px-6">
      <section className="grid items-center gap-6 py-5 sm:gap-10 sm:py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <img src="/logo.png" alt="Meeting Market" className="mx-auto h-40 w-40 rounded-full object-cover shadow-soft ring-1 ring-gold/40 sm:h-72 sm:w-72 lg:mx-0" />
        <div className="min-w-0">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-gold">рынок встреч</p>
          <h1 className="break-words text-3xl font-bold leading-tight text-cream sm:text-6xl">Meeting Market</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-cream/70">
            Теперь встречи с Ильей проходят по взрослому: с календарем, слотами и легким ощущением биржевых торгов за свободный вечер.
          </p>
          <Button className="mt-8 w-full text-base sm:w-auto" onClick={() => setStarted(true)}>
            Забронировать встречу с Ильей
          </Button>
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "book", label: "Бронирование" },
          { id: "mine", label: "Мои заявки" },
          { id: "notifications", label: "Уведомления" }
        ]}
      />

      {tab === "book" ? (
        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="panel">
            <div className="mb-5 flex items-center justify-between gap-2 sm:gap-3">
              <Button variant="secondary" onClick={() => setMonth(addMonths(month, -1))} disabled={!canGoBack}>
                Назад
              </Button>
              <h2 className="text-center text-xl font-bold text-cream">{format(month, "LLLL yyyy", { locale: ru })}</h2>
              <Button variant="secondary" onClick={() => setMonth(addMonths(month, 1))} disabled={!canGoForward}>
                Вперед
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-cream/45">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((day) => {
                const holiday = isHoliday(day);
                const past = isPastDay(day, today);
                const futureBlocked = isBeyondBookingWindow(day, today);
                const bookable = isBookableDate(day, today);
                const selected = selectedDate && isSameCalendarDay(day, selectedDate);
                const faded = day.getMonth() !== month.getMonth();

                return (
                  <button
                    key={day.toISOString()}
                    className={`aspect-square rounded-lg text-sm font-semibold transition ${
                      past || futureBlocked
                        ? "bg-white/[0.035] text-cream/25 ring-1 ring-white/5"
                        : holiday
                        ? "bg-ember/20 text-[#ffb6ad] ring-1 ring-ember/35"
                        : selected
                          ? "bg-gold text-ink"
                          : "bg-emerald-400/14 text-emerald-100 ring-1 ring-emerald-300/20 hover:bg-emerald-400/22"
                    } ${faded ? "opacity-35" : ""}`}
                    onClick={() => pickDate(day)}
                    disabled={!bookable}
                    type="button"
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
            {notice ? <p className="mt-4 rounded-lg bg-ember/12 px-3 py-2 text-sm text-[#ffc1b8]">{notice}</p> : null}
            {success ? <p className="mt-4 rounded-lg bg-emerald-400/12 px-3 py-2 text-sm text-emerald-100">Заявка успешно отправлена.</p> : null}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="panel space-y-5">
            <div>
              <h2 className="text-xl font-bold text-cream">Детали встречи</h2>
              <p className="mt-1 text-sm text-cream/55">{selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: ru }) : "Сначала выберите дату"}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Начало</span>
                <select className="field" value={startTime} onChange={(event) => setStartTime(event.target.value)} disabled={!selectedDate}>
                  <option value="">Выбрать</option>
                  {slots.slice(0, -1).map((slot) => (
                    <option key={slot} value={slot} disabled={isStartDisabled(slot)}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Окончание</span>
                <select className="field" value={endTime} onChange={(event) => setEndTime(event.target.value)} disabled={!startTime}>
                  <option value="">Выбрать</option>
                  {slots.slice(1).map((slot) => (
                    <option key={slot} value={slot} disabled={isEndDisabled(slot)}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <span className="label">Место</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {places.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${
                      place === item ? "bg-gold text-ink" : "bg-white/[0.06] text-cream hover:bg-white/[0.1]"
                    }`}
                    onClick={() => setPlace(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {place === "Другое" ? (
              <label>
                <span className="label">Свое место</span>
                <input className="field" {...register("customPlace")} placeholder="Где именно встречаемся" />
              </label>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Username</span>
                <input className="field" {...register("username", { required: true })} />
              </label>
              <label>
                <span className="label">Имя</span>
                <input className="field" {...register("displayName", { required: true })} placeholder="Как вас назвать" />
              </label>
            </div>

            <Button className="w-full" disabled={formState.isSubmitting || !selectedDate}>
              Отправить заявку
            </Button>
          </form>
        </section>
      ) : null}

      {tab === "mine" ? (
        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-cream">Мои заявки</h2>
              <p className="mt-1 text-sm text-cream/55">Здесь видно, когда, где и в каком статусе встреча.</p>
            </div>
            <Button variant="secondary" onClick={loadPersonalData}>
              Обновить
            </Button>
          </div>
          {myBookings.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.05] p-6 text-center text-cream/60">Заявок пока нет.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {myBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "notifications" ? (
        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-cream">Уведомления</h2>
              <p className="mt-1 text-sm text-cream/55">Статусы заявок и напоминания за час до одобренной встречи.</p>
            </div>
            <Button variant="secondary" onClick={loadPersonalData}>
              Обновить
            </Button>
          </div>
          <NotificationList notifications={notifications} />
        </section>
      ) : null}
    </main>
  );
}
