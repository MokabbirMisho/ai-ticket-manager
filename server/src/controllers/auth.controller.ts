import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { getOrCreateDefaultTenant } from "../middleware/tenant.middleware.js";

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

    if (user.tenant && !user.tenant.isActive) {
      return res.status(403).json({
        status: "fail",
        message: "Workspace is inactive",
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
        isActive: true,
        tenant: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!user || !user.isActive || (user.tenant && !user.tenant.isActive)) {
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
