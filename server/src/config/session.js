import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";
const PgSession = pgSession(session);
const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
//# sourceMappingURL=session.js.map