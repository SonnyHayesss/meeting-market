import type { Request } from "express";

export type Role = "ADMIN" | "USER";

export type JwtPayload = {
  sub: string;
  username: string;
  role: Role;
};

export type AuthedRequest = Request & {
  user?: JwtPayload;
};
