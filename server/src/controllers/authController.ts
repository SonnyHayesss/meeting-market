import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { config } from "../config.js";
import { prisma } from "../prisma.js";
import { authCookieOptions, cookieName, signToken } from "../services/tokenService.js";
import type { AuthedRequest, Role } from "../types.js";

function publicUser(username: string, role: Role) {
  return { username, role };
}

export async function register(req: Request, res: Response) {
  const username = String(req.body.username ?? "").trim();
  const password = String(req.body.password ?? "");

  if (username.length < 2 || password.length < 6) {
    return res.status(400).json({ message: "Ник от 2 символов, пароль от 6 символов." });
  }

  if (username === config.admin.username) {
    return res.status(400).json({ message: "Этот ник зарезервирован." });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return res.status(409).json({ message: "Такой ник уже занят." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, passwordHash } });
  const token = signToken({ sub: String(user.id), username: user.username, role: "USER" });

  res.cookie(cookieName, token, authCookieOptions());
  return res.status(201).json({ user: publicUser(user.username, "USER") });
}

export async function login(req: Request, res: Response) {
  const username = String(req.body.username ?? "").trim();
  const password = String(req.body.password ?? "");

  if (username === config.admin.username && password === config.admin.password) {
    const token = signToken({ sub: "admin", username, role: "ADMIN" });
    res.cookie(cookieName, token, authCookieOptions());
    return res.json({ user: publicUser(username, "ADMIN") });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Неверный ник или пароль." });
  }

  const token = signToken({ sub: String(user.id), username: user.username, role: "USER" });
  res.cookie(cookieName, token, authCookieOptions());
  return res.json({ user: publicUser(user.username, "USER") });
}

export function me(req: AuthedRequest, res: Response) {
  return res.json({ user: publicUser(req.user!.username, req.user!.role) });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(cookieName);
  return res.json({ ok: true });
}
