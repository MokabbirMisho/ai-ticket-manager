import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid user ID is required",
      });
    }

    const { temporaryPassword } = req.body;

    if (
      typeof temporaryPassword !== "string" ||
      !temporaryPassword.trim()
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Temporary password is required",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (targetUser.role === Role.SUPER_ADMIN) {
      return res.status(403).json({
        status: "fail",
        message: "Cannot reset another Super Admin password here",
      });
    }

    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        mustChangePassword: true,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully",
      data: {
        user: {
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Reset user password error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to reset password",
    });
  }
};
