import type { NextFunction, Request, Response } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.userId) {
    return res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });
  }

  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.userId) {
    return res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });
  }

  if (req.session.role !== "ADMIN") {
    return res.status(403).json({
      status: "fail",
      message: "Admin access required",
    });
  }

  next();
};
