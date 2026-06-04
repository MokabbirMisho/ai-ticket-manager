import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const createAgent = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const agent = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.AGENT,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
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

    const where: {
      role?: "ADMIN" | "AGENT";
      isActive?: boolean;
      OR?: {
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      }[];
    } = {};

    if (role === "ADMIN" || role === "AGENT") {
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
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
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

    const { name, email, password, role, isActive } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      role?: "ADMIN" | "AGENT";
      isActive?: boolean;
    } = {};

    if (name) data.name = name;
    if (email) data.email = email;

    if (role === "ADMIN" || role === "AGENT") {
      data.role = role;
    }

    if (typeof isActive === "boolean") {
      data.isActive = isActive;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
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

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
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
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
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
