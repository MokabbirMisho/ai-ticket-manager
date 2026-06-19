import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "AGENT";
    tenantId?: string;
    requesterId?: string;
    requesterEmail?: string;
  }
}
