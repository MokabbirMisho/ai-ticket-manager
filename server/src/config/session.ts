import "dotenv/config";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

const { Pool } = pg;

const PgSession = connectPgSimple(session);

const databaseUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing from .env");
}

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in production");
}

const pgPool = new Pool({
  connectionString: databaseUrl,
});

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    tableName: "user_sessions",
    createTableIfMissing: true,
  }),
  name: "ticket.sid",
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
});
