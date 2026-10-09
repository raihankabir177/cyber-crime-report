import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { env, SESSION_COOKIE } from "./config/env";
import { authRouter } from "./routes/auth";
import { profileRouter } from "./routes/profile";
import { victimRouter } from "./routes/victim";
import { officerRouter } from "./routes/officer";
import { adminRouter } from "./routes/admin";
import { miscRouter } from "./routes/misc";


export function createApp() {
  const app = express();
  const PgSession = connectPgSimple(session);

  // Behind Vercel / Render / Railway proxies: needed for secure cookies and client IPs.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use(
    session({
      name: SESSION_COOKIE,
      store: new PgSession({
        conString: env.databaseUrl,
        createTableIfMissing: true,
        // Serverless instances are short-lived; skip the background prune timer there.
        pruneSessionInterval: env.isVercel ? false : 15 * 60,
      }),
      secret: env.secretKey,
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: env.isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many attempts, please try again later" },
  });
  app.use(["/login", "/auth/login", "/signup", "/auth/signup"], authLimiter);

  app.use(authRouter);
  app.use(profileRouter);
  app.use(victimRouter);
  app.use(officerRouter);
  app.use(adminRouter);
  app.use(miscRouter);

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  app.use(
    (
      err: Error & { code?: string; status?: number },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ error: `File too large (max ${env.maxUploadMb} MB)` });
      }
      console.error("Unhandled error:", err);
      const status = err.status && err.status < 500 ? err.status : 500;
      res.status(status).json({
        error:
          env.isProduction && status === 500
            ? "Internal server error"
            : err.message || "Internal server error",
      });
    }
  );

  return app;
}
