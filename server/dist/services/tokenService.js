import jwt from "jsonwebtoken";
import { config } from "../config.js";
const cookieName = "meeting_market_token";
export function signToken(payload) {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}
export function verifyToken(token) {
    return jwt.verify(token, config.jwtSecret);
}
export function authCookieOptions() {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
}
export { cookieName };
