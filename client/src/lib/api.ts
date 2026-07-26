import type { AppNotification, Booking, BookedInterval, BookingStatus, User } from "../types";

const headers = { "Content-Type": "application/json" };

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers,
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? "Ошибка запроса");
  }

  return data as T;
}

export const api = {
  register: (payload: { username: string; password: string }) =>
    request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload: { username: string; password: string }) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  me: () => request<{ user: User }>("/auth/me"),
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
  availability: (date: string) =>
    request<{ date: string; unavailable: boolean; booked: BookedInterval[] }>(`/bookings/availability?date=${date}`),
  createBooking: (payload: {
    date: string;
    startTime: string;
    endTime: string;
    place: string;
    customPlace?: string;
    username: string;
    displayName: string;
  }) =>
    request<{ booking: Booking }>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  bookings: () => request<{ bookings: Booking[] }>("/bookings"),
  myBookings: () => request<{ bookings: Booking[] }>("/bookings/mine"),
  notifications: () => request<{ notifications: AppNotification[] }>("/notifications"),
  setStatus: (id: number, status: BookingStatus) =>
    request<{ booking: Booking }>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  deleteBooking: (id: number) =>
    request<{ ok: true }>(`/bookings/${id}`, {
      method: "DELETE"
    })
};
