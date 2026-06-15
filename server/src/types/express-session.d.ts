import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: "ADMIN" | "AGENT";
    studentId?: string;
    studentEmail?: string;
  }
}
