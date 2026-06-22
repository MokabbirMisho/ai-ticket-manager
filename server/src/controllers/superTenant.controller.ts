import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  PaymentProvider,
  Plan,
  Role,
  SubscriptionStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { sendEmail } from "../services/email.service.js";
import { buildTenantAdminWelcomeEmail } from "../services/emailTemplates.service.js";

const isPlan = (value: unknown): value is Plan => {
  return typeof value === "string" && Object.values(Plan).includes(value as Plan);
};

const isSubscriptionStatus = (
  value: unknown,
): value is SubscriptionStatus => {
  return (
    typeof value === "string" &&
    Object.values(SubscriptionStatus).includes(value as SubscriptionStatus)
  );
};

const isPaymentProvider = (value: unknown): value is PaymentProvider => {
  return (
    typeof value === "string" &&
    Object.values(PaymentProvider).includes(value as PaymentProvider)
  );
};

const parseOptionalDate = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  if (typeof value !== "string") {
    throw new Error("subscriptionEndsAt must be a valid date string");
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("subscriptionEndsAt must be a valid date string");
  }

  return date;
};

export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const status = typeof req.query.status === "string" ? req.query.status : "";

    const where: Prisma.TenantWhereInput = {};

    if (status === "active") {
      where.isActive = true;
    }

    if (status === "inactive") {
      where.isActive = false;
    }

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { slug: { contains: search.trim(), mode: "insensitive" } },
        { country: { contains: search.trim(), mode: "insensitive" } },
        { industry: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [tenants, totalTenants] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              users: true,
              requesters: true,
              tickets: true,
              knowledgeArticles: true,
            },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    const tenantsWithCompatibilityCounts = tenants.map((tenant) => ({
      ...tenant,
      _count: {
        ...tenant._count,
        students: tenant._count.requesters,
      },
    }));

    return res.status(200).json({
      status: "success",
      results: tenantsWithCompatibilityCounts.length,
      data: {
        tenants: tenantsWithCompatibilityCounts,
        pagination: {
          page,
          limit,
          totalTenants,
          totalPages: Math.ceil(totalTenants / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get tenants error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to load tenants",
    });
  }
};

export const getTenantById = async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;

    if (!tenantId || Array.isArray(tenantId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid tenant ID is required",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          where: {
            role: {
              in: [Role.ADMIN, Role.AGENT],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            users: true,
            requesters: true,
            tickets: true,
            knowledgeArticles: true,
          },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({
        status: "fail",
        message: "Tenant not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        tenant,
        usage: {
          users: tenant._count.users,
          students: tenant._count.requesters,
          requesters: tenant._count.requesters,
          tickets: tenant._count.tickets,
          knowledgeArticles: tenant._count.knowledgeArticles,
        },
      },
    });
  } catch (error) {
    console.error("Get tenant error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to load tenant",
    });
  }
};

export const createTenant = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      contactEmail,
      country,
      industry,
      plan,
      subscriptionStatus,
      subscriptionEndsAt,
      paymentProvider,
      adminName,
      adminEmail,
      temporaryPassword,
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof slug !== "string" ||
      typeof contactEmail !== "string" ||
      typeof adminName !== "string" ||
      typeof adminEmail !== "string" ||
      typeof temporaryPassword !== "string" ||
      !name.trim() ||
      !slug.trim() ||
      !contactEmail.trim() ||
      !adminName.trim() ||
      !adminEmail.trim() ||
      !temporaryPassword.trim()
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Name, slug, contact email, admin name, admin email, and temporary password are required",
      });
    }

    const normalizedSlug = slug.trim();
    const normalizedAdminEmail = adminEmail.trim().toLowerCase();
    const normalizedContactEmail = contactEmail.trim().toLowerCase();

    const [existingTenant, existingUser] = await Promise.all([
      prisma.tenant.findUnique({
        where: { slug: normalizedSlug },
      }),
      prisma.user.findUnique({
        where: { email: normalizedAdminEmail },
      }),
    ]);

    if (existingTenant) {
      return res.status(409).json({
        status: "fail",
        message: "Tenant with this slug already exists",
      });
    }

    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        message: "Admin email is already in use",
      });
    }

    if (plan !== undefined && !isPlan(plan)) {
      return res.status(400).json({ status: "fail", message: "Invalid plan" });
    }

    if (
      subscriptionStatus !== undefined &&
      !isSubscriptionStatus(subscriptionStatus)
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid subscription status",
      });
    }

    if (paymentProvider !== undefined && !isPaymentProvider(paymentProvider)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid payment provider",
      });
    }

    const parsedSubscriptionEndsAt = parseOptionalDate(subscriptionEndsAt);

    const data: Prisma.TenantCreateInput = {
      name: name.trim(),
      slug: normalizedSlug,
      contactEmail: normalizedContactEmail,
      country: typeof country === "string" && country.trim() ? country.trim() : null,
      industry:
        typeof industry === "string" && industry.trim() ? industry.trim() : null,
    };

    if (plan !== undefined) data.plan = plan;
    if (subscriptionStatus !== undefined) {
      data.subscriptionStatus = subscriptionStatus;
    }
    if (paymentProvider !== undefined) data.paymentProvider = paymentProvider;
    if (parsedSubscriptionEndsAt !== undefined) {
      data.subscriptionEndsAt = parsedSubscriptionEndsAt;
    }

    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    const { tenant, admin } = await prisma.$transaction(async (tx) => {
      const createdTenant = await tx.tenant.create({ data });

      const createdAdmin = await tx.user.create({
        data: {
          name: adminName.trim(),
          email: normalizedAdminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
          tenant: {
            connect: { id: createdTenant.id },
          },
          isActive: true,
          mustChangePassword: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          tenantId: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
        },
      });

      return {
        tenant: createdTenant,
        admin: createdAdmin,
      };
    });

    const welcomeEmail = await sendEmail({
      to: admin.email,
      ...buildTenantAdminWelcomeEmail({
        tenantName: tenant.name,
        adminEmail: admin.email,
        temporaryPassword: temporaryPassword.trim(),
      }),
    });
    const emailWarning = !welcomeEmail.success;

    return res.status(201).json({
      status: "success",
      message: emailWarning
        ? "Tenant created successfully, but the welcome email could not be sent."
        : "Tenant created successfully",
      data: {
        tenant,
        admin: {
          email: admin.email,
        },
        welcomeEmailSent: welcomeEmail.success,
      },
    });
  } catch (error) {
    console.error("Create tenant error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to create tenant",
    });
  }
};

export const updateTenant = async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;

    if (!tenantId || Array.isArray(tenantId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid tenant ID is required",
      });
    }

    const { name, slug, contactEmail, country, industry, isActive } = req.body;
    const data: Prisma.TenantUpdateInput = {};

    if (typeof name === "string") data.name = name.trim();
    if (typeof slug === "string") data.slug = slug.trim();
    if (typeof contactEmail === "string") {
      data.contactEmail = contactEmail.trim() || null;
    }
    if (typeof country === "string") data.country = country.trim() || null;
    if (typeof industry === "string") data.industry = industry.trim() || null;
    if (typeof isActive === "boolean") data.isActive = isActive;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data,
    });

    return res.status(200).json({
      status: "success",
      message: "Tenant updated successfully",
      data: { tenant },
    });
  } catch (error) {
    console.error("Update tenant error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update tenant",
    });
  }
};

export const updateTenantSubscription = async (
  req: Request,
  res: Response,
) => {
  try {
    const tenantId = req.params.id;

    if (!tenantId || Array.isArray(tenantId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid tenant ID is required",
      });
    }

    const { plan, subscriptionStatus, subscriptionEndsAt, paymentProvider } =
      req.body;
    const data: Prisma.TenantUpdateInput = {};

    if (plan !== undefined) {
      if (!isPlan(plan)) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid plan",
        });
      }

      data.plan = plan;
    }

    if (subscriptionStatus !== undefined) {
      if (!isSubscriptionStatus(subscriptionStatus)) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid subscription status",
        });
      }

      data.subscriptionStatus = subscriptionStatus;
    }

    if (paymentProvider !== undefined) {
      if (!isPaymentProvider(paymentProvider)) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid payment provider",
        });
      }

      data.paymentProvider = paymentProvider;
    }

    const parsedSubscriptionEndsAt = parseOptionalDate(subscriptionEndsAt);
    if (parsedSubscriptionEndsAt !== undefined) {
      data.subscriptionEndsAt = parsedSubscriptionEndsAt;
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data,
    });

    return res.status(200).json({
      status: "success",
      message: "Tenant subscription updated successfully",
      data: { tenant },
    });
  } catch (error) {
    console.error("Update tenant subscription error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update tenant subscription",
    });
  }
};

export const deactivateTenant = async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;

    if (!tenantId || Array.isArray(tenantId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid tenant ID is required",
      });
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: false },
    });

    return res.status(200).json({
      status: "success",
      message: "Tenant deactivated successfully",
      data: { tenant },
    });
  } catch (error) {
    console.error("Deactivate tenant error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to deactivate tenant",
    });
  }
};

export const activateTenant = async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;

    if (!tenantId || Array.isArray(tenantId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid tenant ID is required",
      });
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: true },
    });

    return res.status(200).json({
      status: "success",
      message: "Tenant activated successfully",
      data: { tenant },
    });
  } catch (error) {
    console.error("Activate tenant error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to activate tenant",
    });
  }
};
