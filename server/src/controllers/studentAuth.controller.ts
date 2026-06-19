import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { getOrCreateDefaultTenant } from "../middleware/tenant.middleware.js";

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required",
      });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return res.status(409).json({
        status: "fail",
        message: "Student with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const tenant = await getOrCreateDefaultTenant();

    const student = await prisma.student.create({
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

    req.session.studentId = student.id;
    req.session.studentEmail = student.email;
    req.session.tenantId = tenant.id;

    return res.status(201).json({
      status: "success",
      message: "Student registered successfully",
      data: { student },
    });
  } catch (error) {
    console.error("Register student error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong during registration",
    });
  }
};

export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
      });
    }

    const student = await prisma.student.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });

    if (!student || !student.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    req.session.studentId = student.id;
    req.session.studentEmail = student.email;
    req.session.tenantId = student.tenantId;

    return res.status(200).json({
      status: "success",
      message: "Student login successful",
      data: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          isActive: student.isActive,
          tenantId: student.tenantId,
        },
      },
    });
  } catch (error) {
    console.error("Login student error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong during login",
    });
  }
};

export const logoutStudent = async (req: Request, res: Response) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Could not logout student",
      });
    }

    res.clearCookie("ticket.sid");

    return res.status(200).json({
      status: "success",
      message: "Student logout successful",
    });
  });
};

export const getStudentMe = async (req: Request, res: Response) => {
  try {
    if (!req.session.studentId) {
      return res.status(401).json({
        status: "fail",
        message: "Student not authenticated",
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: req.session.studentId },
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

    if (!student || !student.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "Student not found or inactive",
      });
    }

    req.session.tenantId = student.tenantId;

    return res.status(200).json({
      status: "success",
      data: { student },
    });
  } catch (error) {
    console.error("Get student me error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
