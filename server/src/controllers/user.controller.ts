import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

type StaffRole = "ADMIN" | "AGENT";

const getTrimmedString = (value: unknown) => {
  return typeof value === "string" ? value.trim() : "";
};

const isValidStaffRole = (role: unknown): role is StaffRole => {
  return role === "ADMIN" || role === "AGENT";
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  department: true,
  jobTitle: true,
  tenantId: true,
  isActive: true,
  mustChangePassword: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const createAgent = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, department, jobTitle, isActive } =
      req.body;
    const tenantId = req.session.tenantId;

    const normalizedName = getTrimmedString(name);
    const normalizedEmail = getTrimmedString(email).toLowerCase();
    const normalizedPassword = getTrimmedString(password);
    const normalizedPhone = getTrimmedString(phone);
    const normalizedDepartment = getTrimmedString(department);
    const normalizedJobTitle = getTrimmedString(jobTitle);

    if (!tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPassword ||
      !normalizedPhone ||
      !isValidStaffRole(role) ||
      !normalizedDepartment ||
      !normalizedJobTitle ||
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Full name, email, temporary password, phone, role, department, job title, and status are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 12);

    const agent = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: normalizedPhone,
        role,
        department: normalizedDepartment,
        jobTitle: normalizedJobTitle,
        isActive,
        mustChangePassword: true,
        tenantId,
      },
      select: userSelect,
    });

    return res.status(201).json({
      status: "success",
      message: "Agent created successfully",
      data: { user: agent },
    });
  } catch (error) {
    console.error("Create agent error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while creating agent",
    });
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const role = typeof req.query.role === "string" ? req.query.role : "";
    const status = typeof req.query.status === "string" ? req.query.status : "";

    const where: Prisma.UserWhereInput = {};

    if (req.session.role !== "SUPER_ADMIN") {
      if (!req.session.tenantId) {
        return res.status(403).json({
          status: "fail",
          message: "Tenant context required",
        });
      }

      where.tenantId = req.session.tenantId;
    }

    if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "AGENT") {
      where.role = role;
    }

    if (status === "active") {
      where.isActive = true;
    }

    if (status === "inactive") {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          ...userSelect,
        },
      }),

      prisma.user.count({
        where,
      }),
    ]);

    return res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error("List users error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while listing users",
    });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid user ID is required",
      });
    }

    if (req.session.role !== "SUPER_ADMIN" && !req.session.tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const { name, email, password, phone, role, department, jobTitle, isActive } =
      req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        ...(req.session.role === "SUPER_ADMIN"
          ? {}
          : { tenantId: req.session.tenantId }),
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (existingUser.role === "SUPER_ADMIN") {
      return res.status(403).json({
        status: "fail",
        message: "Super Admin users cannot be managed from this endpoint",
      });
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      role?: "ADMIN" | "AGENT";
      isActive?: boolean;
      phone?: string | null;
      department?: string | null;
      jobTitle?: string | null;
      mustChangePassword?: boolean;
    } = {};

    const normalizedName = getTrimmedString(name);
    const normalizedEmail = getTrimmedString(email).toLowerCase();
    const normalizedPhone = getTrimmedString(phone);
    const normalizedDepartment = getTrimmedString(department);
    const normalizedJobTitle = getTrimmedString(jobTitle);
    const normalizedPassword = getTrimmedString(password);

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPhone ||
      !isValidStaffRole(role) ||
      !normalizedDepartment ||
      !normalizedJobTitle ||
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Full name, email, phone, role, department, job title, and status are required",
      });
    }

    if (normalizedEmail !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (userWithEmail) {
        return res.status(409).json({
          status: "fail",
          message: "User with this email already exists",
        });
      }
    }

    data.name = normalizedName;
    data.email = normalizedEmail;
    data.phone = normalizedPhone;
    data.department = normalizedDepartment;
    data.jobTitle = normalizedJobTitle;

    if (role === "ADMIN" || role === "AGENT") {
      data.role = role;
    }

    if (typeof isActive === "boolean") {
      data.isActive = isActive;
    }

    if (normalizedPassword) {
      data.password = await bcrypt.hash(normalizedPassword, 12);
      data.mustChangePassword = true;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: userSelect,
    });

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while updating user",
    });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid user ID is required",
      });
    }

    if (req.session.role !== "SUPER_ADMIN" && !req.session.tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        ...(req.session.role === "SUPER_ADMIN"
          ? {}
          : { tenantId: req.session.tenantId }),
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (existingUser.role === "ADMIN") {
      return res.status(400).json({
        status: "fail",
        message: "Admin user cannot be deactivated",
      });
    }

    const deactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
      select: {
        ...userSelect,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "User deactivated successfully",
      data: { user: deactivatedUser },
    });
  } catch (error) {
    console.error("Deactivate user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while deactivating user",
    });
  }
};
