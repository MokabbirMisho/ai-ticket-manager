import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { getOrCreateDefaultTenant } from "../middleware/tenant.middleware.js";
import {
  passwordResetGenericMessage,
  requestStaffPasswordReset,
  resetStaffPassword,
  validateResetPasswordInput,
} from "../services/passwordReset.service.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
      });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    if (user.role !== "SUPER_ADMIN" && !user.tenantId) {
      const tenant = await getOrCreateDefaultTenant();

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          tenantId: tenant.id,
        },
        include: {
          tenant: true,
        },
      });
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    if (user.tenantId) {
      req.session.tenantId = user.tenantId;
    } else {
      delete req.session.tenantId;
    }

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          mustChangePassword: user.mustChangePassword,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong during login",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Could not logout",
      });
    }

    res.clearCookie("ticket.sid");

    return res.status(200).json({
      status: "success",
      message: "Logout successful",
    });
  });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        status: "fail",
        message: "Not authenticated",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        mustChangePassword: true,
        isActive: true,
        tenant: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "User not found or inactive",
      });
    }

    req.session.role = user.role;
    if (user.tenantId) {
      req.session.tenantId = user.tenantId;
    } else {
      delete req.session.tenantId;
    }

    return res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required",
      });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Current password, new password, and confirmation are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "New password and confirmation do not match",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "User not found or inactive",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: "fail",
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        mustChangePassword: true,
        isActive: true,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Password changed successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to change password",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    await requestStaffPasswordReset(req.body.email);

    return res.status(200).json({
      status: "success",
      message: passwordResetGenericMessage,
    });
  } catch (error) {
    console.error(
      "Staff forgot password error:",
      error instanceof Error ? error.message : error,
    );

    return res.status(200).json({
      status: "success",
      message: passwordResetGenericMessage,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    const validationError = validateResetPasswordInput({
      token,
      newPassword,
      confirmPassword,
    });

    if (validationError) {
      return res.status(400).json({
        status: "fail",
        message: validationError,
      });
    }

    const didReset = await resetStaffPassword({
      token,
      newPassword,
    });

    if (!didReset) {
      return res.status(400).json({
        status: "fail",
        message: "Password reset link is invalid, expired, or already used",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error(
      "Staff reset password error:",
      error instanceof Error ? error.message : error,
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to reset password",
    });
  }
};
