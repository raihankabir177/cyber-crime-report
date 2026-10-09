import { assertCoreEnv, env } from "./config/env";
import { createApp } from "./app";
import { prisma } from "./lib/prisma";

assertCoreEnv();

const app = createApp();

const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`API server listening on http://0.0.0.0:${env.port}`);
});

const shutdown = () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
