process.env.DATABASE_URL ??= "file:/tmp/meeting-market.db";
process.env.JWT_SECRET ??= "meeting-market-vercel-demo-secret";

export default async function handler(req: unknown, res: unknown) {
  const { app } = await import("../server/src/app.js");
  return app(req as never, res as never);
}
