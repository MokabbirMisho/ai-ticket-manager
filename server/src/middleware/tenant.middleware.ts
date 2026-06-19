import type { NextFunction, Request, Response } from "express";
import { PaymentProvider, Plan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const DEFAULT_TENANT_SLUG = "default";

export const getOrCreateDefaultTenant = async () => {
  return prisma.tenant.upsert({
    where: {
      slug: DEFAULT_TENANT_SLUG,
    },
    update: {
      isActive: true,
      plan: Plan.FREE,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      subscriptionEndsAt: null,
      paymentProvider: PaymentProvider.MANUAL,
    },
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

const inactiveSubscriptionMessage =
  "Your workspace subscription is not active. Please contact support.";

const isSubscriptionDateExpired = (subscriptionEndsAt: Date | null) => {
  if (!subscriptionEndsAt) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return subscriptionEndsAt < today;
};

export const requireActiveTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session.role === "SUPER_ADMIN") {
      return next();
    }

    if (!req.session.tenantId) {
      return res.status(403).json({
        status: "fail",
        message: inactiveSubscriptionMessage,
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: {
        id: req.session.tenantId,
      },
      select: {
        isActive: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });

    if (
      !tenant ||
      !tenant.isActive ||
      tenant.subscriptionStatus === SubscriptionStatus.EXPIRED ||
      tenant.subscriptionStatus === SubscriptionStatus.SUSPENDED ||
      isSubscriptionDateExpired(tenant.subscriptionEndsAt)
    ) {
      return res.status(403).json({
        status: "fail",
        message: inactiveSubscriptionMessage,
      });
    }

    return next();
  } catch (error) {
    console.error("Active tenant check error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to verify workspace subscription",
    });
  }
};
