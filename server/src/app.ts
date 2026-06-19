import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { sessionMiddleware } from "./config/session.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import requesterAuthRoutes from "./routes/requesterAuth.routes.js";
import requesterAccountRoutes from "./routes/requesterAccount.routes.js";
import requesterTicketRoutes from "./routes/requesterTicket.routes.js";
import requesterRoutes from "./routes/requester.routes.js";
import knowledgeRoutes from "./routes/knowledge.routes.js";
import superTenantRoutes from "./routes/superTenant.routes.js";
import superUserRoutes from "./routes/superUser.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json());

app.use(sessionMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/requester/auth", requesterAuthRoutes);
app.use("/api/requester/account", requesterAccountRoutes);
app.use("/api/requester/tickets", requesterTicketRoutes);
app.use("/api/requesters", requesterRoutes);

app.use("/api/student/auth", requesterAuthRoutes);
app.use("/api/student/tickets", requesterTicketRoutes);
app.use("/api/students", requesterRoutes);

app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/super/tenants", superTenantRoutes);
app.use("/api/super/users", superUserRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "AI Ticket Management API is running",
  });
});

export default app;
