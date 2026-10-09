// Vercel serverless entry: serves the compiled Express app (built by `npm run build`).
const { assertCoreEnv } = require("../dist/config/env");
const { createApp } = require("../dist/app");

assertCoreEnv();

module.exports = createApp();
