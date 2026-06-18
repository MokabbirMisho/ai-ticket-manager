import type { Request, Response, NextFunction } from "express";

export const requireStudentAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.studentId) {
    return res.status(401).json({
      status: "fail",
      message: "Student authentication required",
    });
  }

  if (!req.session.tenantId) {
    return res.status(403).json({
      status: "fail",
      message: "Tenant context required",
    });
  }

  next();
};
