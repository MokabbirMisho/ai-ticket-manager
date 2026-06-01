import "dotenv/config";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

const { Pool } = pg;

const PgSession = connectPgSimple(session);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing from .env");
}

console.log("Session store connected to:", databaseUrl);

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
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
});
