export type Role = "ADMIN" | "USER";
export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED";

export type User = {
  username: string;
  role: Role;
};

export type BookedInterval = {
  id: number;
  startTime: string;
  endTime: string;
};

export type Booking = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  place: string;
  customPlace: string | null;
  username: string;
  displayName: string;
  status: BookingStatus;
  createdAt: string;
};

export type AppNotification = {
  id: number | string;
  title: string;
  message: string;
  audience: "ADMIN" | "USER";
  userId?: number | null;
  bookingId?: number | null;
  createdAt: string;
  kind: "STATUS" | "REMINDER";
};
