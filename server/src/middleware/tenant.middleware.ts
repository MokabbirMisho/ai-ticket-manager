import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const DEFAULT_TENANT_SLUG = "default";

export const getOrCreateDefaultTenant = async () => {
  return prisma.tenant.upsert({
    where: {
      slug: DEFAULT_TENANT_SLUG,
    },
    update: {},
    create: {
      name: "Default Workspace",
      slug: DEFAULT_TENANT_SLUG,
    },
  });
};

export const requireTenant = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.session.role === "SUPER_ADMIN") {
    return next();
  }

  if (!req.session.tenantId) {
    return res.status(403).json({
      status: "fail",
      message: "Tenant context required",
    });
  }

  next();
};

export const requireStudentTenant = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.tenantId) {
    return res.status(403).json({
      status: "fail",
      message: "Tenant context required",
    });
  }

  next();
};
