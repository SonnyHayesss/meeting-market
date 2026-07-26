import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { JwtPayload } from "../types.js";

const cookieName = "meeting_market_token";

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

export { cookieName };
