import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const tenantProfileSelect = {
  id: true,
  name: true,
  contactEmail: true,
  country: true,
  industry: true,
  updatedAt: true,
} satisfies Prisma.TenantSelect;

const getTrimmedString = (value: unknown) => {
  return typeof value === "string" ? value.trim() : "";
};

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const getTenantProfile = async (req: Request, res: Response) => {
  try {
    const tenantId = req.session.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: tenantProfileSelect,
    });

    if (!tenant) {
      return res.status(404).json({
        status: "fail",
        message: "Tenant not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: { tenant },
    });
  } catch (error) {
    console.error("Get tenant profile error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to load tenant profile",
    });
  }
};

export const updateTenantProfile = async (req: Request, res: Response) => {
  try {
    const tenantId = req.session.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const name = getTrimmedString(req.body.name);
    const contactEmail = getTrimmedString(req.body.contactEmail).toLowerCase();
    const country = getTrimmedString(req.body.country);
    const industry = getTrimmedString(req.body.industry);

    if (!name || !contactEmail || !country || !industry) {
      return res.status(400).json({
        status: "fail",
        message: "Company name, contact email, country, and industry are required",
      });
    }

    if (!isValidEmail(contactEmail)) {
      return res.status(400).json({
        status: "fail",
        message: "A valid contact email is required",
      });
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name,
        contactEmail,
        country,
        industry,
      },
      select: tenantProfileSelect,
    });

    return res.status(200).json({
      status: "success",
      message: "Company profile updated successfully.",
      data: { tenant },
    });
  } catch (error) {
    console.error("Update tenant profile error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update tenant profile",
    });
  }
};
