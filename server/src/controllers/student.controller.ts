import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const tenantId = req.session.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required",
      });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { email: email.trim() },
    });

    if (existingStudent) {
      return res.status(409).json({
        status: "fail",
        message: "Student with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        isActive: true,
        tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Student created successfully",
      data: { student },
    });
  } catch (error) {
    console.error("Create student error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while creating student",
    });
  }
};

export const listStudents = async (req: Request, res: Response) => {
  try {
    const page =
      typeof req.query.page === "string" ? Number(req.query.page) || 1 : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) || 20 : 20;

    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const status = typeof req.query.status === "string" ? req.query.status : "";

    if (!req.session.tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const where: Prisma.StudentWhereInput = {
      tenantId: req.session.tenantId,
    };

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

    const [students, totalStudents] = await Promise.all([
      prisma.student.findMany({
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
          tenantId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      }),

      prisma.student.count({
        where,
      }),
    ]);

    return res.status(200).json({
      status: "success",
      results: students.length,
      data: {
        students,
        pagination: {
          page,
          limit,
          totalStudents,
          totalPages: Math.ceil(totalStudents / limit),
        },
      },
    });
  } catch (error) {
    console.error("List students error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while listing students",
    });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;

    if (!studentId || Array.isArray(studentId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid student ID is required",
      });
    }

    if (!req.session.tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const { name, email, password, isActive } = req.body;

    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId: req.session.tenantId,
      },
    });

    if (!existingStudent) {
      return res.status(404).json({
        status: "fail",
        message: "Student not found",
      });
    }

    const data: Prisma.StudentUpdateInput = {};

    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();
    }

    if (typeof email === "string" && email.trim()) {
      data.email = email.trim();
    }

    if (typeof isActive === "boolean") {
      data.isActive = isActive;
    }

    if (typeof password === "string" && password.trim()) {
      data.password = await bcrypt.hash(password, 12);
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Student updated successfully",
      data: { student },
    });
  } catch (error) {
    console.error("Update student error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while updating student",
    });
  }
};

export const deactivateStudent = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;

    if (!studentId || Array.isArray(studentId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid student ID is required",
      });
    }

    if (!req.session.tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId: req.session.tenantId,
      },
    });

    if (!existingStudent) {
      return res.status(404).json({
        status: "fail",
        message: "Student not found",
      });
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Student deactivated successfully",
      data: { student },
    });
  } catch (error) {
    console.error("Deactivate student error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while deactivating student",
    });
  }
};
