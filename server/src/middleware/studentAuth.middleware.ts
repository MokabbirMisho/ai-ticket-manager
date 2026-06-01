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

  next();
};
