import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { getOrCreateDefaultTenant } from "../middleware/tenant.middleware.js";
import {
  passwordResetGenericMessage,
  requestRequesterPasswordReset,
  resetRequesterPassword,
  validateResetPasswordInput,
} from "../services/passwordReset.service.js";

export const registerRequester = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required",
      });
    }

    const existingRequester = await prisma.requester.findUnique({
      where: { email },
    });

    if (existingRequester) {
      return res.status(409).json({
        status: "fail",
        message: "Requester with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const tenant = await getOrCreateDefaultTenant();

    const requester = await prisma.requester.create({
      data: {
        name,
        email,
        password: hashedPassword,
        tenantId: tenant.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    req.session.requesterId = requester.id;
    req.session.requesterEmail = requester.email;
    req.session.tenantId = tenant.id;

    return res.status(201).json({
      status: "success",
      message: "Requester registered successfully",
      data: { requester, student: requester },
    });
  } catch (error) {
    console.error("Register requester error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong during registration",
    });
  }
};

export const loginRequester = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
      });
    }

    const requester = await prisma.requester.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });

    if (!requester || !requester.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, requester.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    req.session.requesterId = requester.id;
    req.session.requesterEmail = requester.email;
    req.session.tenantId = requester.tenantId;

    const requesterData = {
      id: requester.id,
      name: requester.name,
      email: requester.email,
      isActive: requester.isActive,
      tenantId: requester.tenantId,
    };

    return res.status(200).json({
      status: "success",
      message: "Requester login successful",
      data: {
        requester: requesterData,
        student: requesterData,
      },
    });
  } catch (error) {
    console.error("Login requester error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong during login",
    });
  }
};

export const logoutRequester = async (req: Request, res: Response) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Could not logout requester",
      });
    }

    res.clearCookie("ticket.sid");

    return res.status(200).json({
      status: "success",
      message: "Requester logout successful",
    });
  });
};

export const getRequesterMe = async (req: Request, res: Response) => {
  try {
    if (!req.session.requesterId) {
      return res.status(401).json({
        status: "fail",
        message: "Requester not authenticated",
      });
    }

    const requester = await prisma.requester.findUnique({
      where: { id: req.session.requesterId },
      select: {
        id: true,
        name: true,
        email: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        tenant: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!requester || !requester.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "Requester not found or inactive",
      });
    }

    req.session.tenantId = requester.tenantId;

    return res.status(200).json({
      status: "success",
      data: { requester, student: requester },
    });
  } catch (error) {
    console.error("Get requester me error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

export const forgotRequesterPassword = async (req: Request, res: Response) => {
  try {
    await requestRequesterPasswordReset(req.body.email);

    return res.status(200).json({
      status: "success",
      message: passwordResetGenericMessage,
    });
  } catch (error) {
    console.error(
      "Requester forgot password error:",
      error instanceof Error ? error.message : error,
    );

    return res.status(200).json({
      status: "success",
      message: passwordResetGenericMessage,
    });
  }
};

export const resetRequesterPasswordController = async (
  req: Request,
  res: Response,
) => {
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

    const didReset = await resetRequesterPassword({
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
      "Requester reset password error:",
      error instanceof Error ? error.message : error,
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to reset password",
    });
  }
};
