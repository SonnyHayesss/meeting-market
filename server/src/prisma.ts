import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL ??= process.env.VERCEL ? "file:/tmp/meeting-market.db" : "file:./dev.db";

export const prisma = new PrismaClient();
