import type { NextFunction, Response } from "express";
import { cookieName, verifyToken } from "../services/tokenService.js";
import type { AuthedRequest } from "../types.js";

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[cookieName];

  if (!token) {
    return res.status(401).json({ message: "Нужно войти в аккаунт." });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Сессия истекла. Войдите снова." });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Доступ только для администратора." });
  }

  return next();
}
