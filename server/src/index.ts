process.env.DATABASE_URL ??= "file:./dev.db";

import { config } from "./config.js";
import { app, ensureDatabase } from "./app.js";

await ensureDatabase();

app.listen(config.port, () => {
  console.log(`Meeting Market API: http://localhost:${config.port}`);
});
