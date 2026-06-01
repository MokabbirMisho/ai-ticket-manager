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

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
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
    });

    return res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
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
    const { id } = req.params;
    const { name, email, isActive } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        isActive,
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
    });

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: { user: updatedUser },
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
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id },
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
      where: { id },
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
