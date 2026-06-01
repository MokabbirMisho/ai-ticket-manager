import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
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

    req.session.userId = user.id;
    req.session.role = user.role;

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
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
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "User not found or inactive",
      });
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
