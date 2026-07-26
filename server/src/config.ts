export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "meeting-market-local-secret",
  admin: {
    username: "adminX",
    password: "qwerty213609"
  }
};

export const places = [
  "Центр (Семаки)",
  "Центр (Ростов)",
  "Дон (купаться)",
  "ТЦ",
  "Другое"
];

export const schedule = {
  start: "17:00",
  end: "02:00",
  stepMinutes: 30,
  holidayStart: { month: 12, day: 30 },
  holidayEnd: { month: 1, day: 7 }
};
