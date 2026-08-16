process.env.DATABASE_URL ??= "file:/tmp/meeting-market.db";
process.env.JWT_SECRET ??= "meeting-market-vercel-demo-secret";

import { app } from "../server/src/app.js";

export default app;
