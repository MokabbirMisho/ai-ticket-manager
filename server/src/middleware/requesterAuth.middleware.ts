import type { Request, Response, NextFunction } from "express";

export const requireRequesterAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.requesterId) {
    return res.status(401).json({
      status: "fail",
      message: "Requester authentication required",
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
