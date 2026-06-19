import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

export const createRequester = async (req: Request, res: Response) => {
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

    const existingRequester = await prisma.requester.findUnique({
      where: { email: email.trim() },
    });

    if (existingRequester) {
      return res.status(409).json({
        status: "fail",
        message: "Requester with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const requester = await prisma.requester.create({
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
      message: "Requester created successfully",
      data: { requester, student: requester },
    });
  } catch (error) {
    console.error("Create requester error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while creating requester",
    });
  }
};

export const listRequesters = async (req: Request, res: Response) => {
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

    const where: Prisma.RequesterWhereInput = {
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

    const [requesters, totalRequesters] = await Promise.all([
      prisma.requester.findMany({
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

      prisma.requester.count({
        where,
      }),
    ]);

    return res.status(200).json({
      status: "success",
      results: requesters.length,
      data: {
        requesters,
        students: requesters,
        pagination: {
          page,
          limit,
          totalRequesters,
          totalStudents: totalRequesters,
          totalPages: Math.ceil(totalRequesters / limit),
        },
      },
    });
  } catch (error) {
    console.error("List requesters error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while listing requesters",
    });
  }
};

export const updateRequester = async (req: Request, res: Response) => {
  try {
    const requesterId = req.params.id;

    if (!requesterId || Array.isArray(requesterId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid requester ID is required",
      });
    }

    if (!req.session.tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const { name, email, password, isActive } = req.body;

    const existingRequester = await prisma.requester.findFirst({
      where: {
        id: requesterId,
        tenantId: req.session.tenantId,
      },
    });

    if (!existingRequester) {
      return res.status(404).json({
        status: "fail",
        message: "Requester not found",
      });
    }

    const data: Prisma.RequesterUpdateInput = {};

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

    const requester = await prisma.requester.update({
      where: { id: requesterId },
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
      message: "Requester updated successfully",
      data: { requester, student: requester },
    });
  } catch (error) {
    console.error("Update requester error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while updating requester",
    });
  }
};

export const deactivateRequester = async (req: Request, res: Response) => {
  try {
    const requesterId = req.params.id;

    if (!requesterId || Array.isArray(requesterId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid requester ID is required",
      });
    }

    if (!req.session.tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const existingRequester = await prisma.requester.findFirst({
      where: {
        id: requesterId,
        tenantId: req.session.tenantId,
      },
    });

    if (!existingRequester) {
      return res.status(404).json({
        status: "fail",
        message: "Requester not found",
      });
    }

    const requester = await prisma.requester.update({
      where: { id: requesterId },
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
      message: "Requester deactivated successfully",
      data: { requester, student: requester },
    });
  } catch (error) {
    console.error("Deactivate requester error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while deactivating requester",
    });
  }
};
