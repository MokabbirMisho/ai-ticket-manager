import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

const requesterSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  company: true,
  department: true,
  jobTitle: true,
  country: true,
  city: true,
  address: true,
  tenantId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RequesterSelect;

const getTrimmedString = (value: unknown) => {
  return typeof value === "string" ? value.trim() : "";
};

export const createRequester = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      company,
      department,
      jobTitle,
      country,
      city,
      address,
      isActive,
    } = req.body;
    const tenantId = req.session.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const normalizedName = getTrimmedString(name);
    const normalizedEmail = getTrimmedString(email).toLowerCase();
    const normalizedPassword = getTrimmedString(password);
    const normalizedPhone = getTrimmedString(phone);
    const normalizedCompany = getTrimmedString(company);
    const normalizedCountry = getTrimmedString(country);
    const normalizedCity = getTrimmedString(city);
    const normalizedAddress = getTrimmedString(address);

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPassword ||
      !normalizedPhone ||
      !normalizedCompany ||
      !normalizedCountry ||
      !normalizedCity ||
      !normalizedAddress
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Name, email, password, phone, company, country, city, and address are required",
      });
    }

    const existingRequester = await prisma.requester.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingRequester) {
      return res.status(409).json({
        status: "fail",
        message: "Requester with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 12);

    const requester = await prisma.requester.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: normalizedPhone,
        company: normalizedCompany,
        department: getTrimmedString(department) || null,
        jobTitle: getTrimmedString(jobTitle) || null,
        country: normalizedCountry,
        city: normalizedCity,
        address: normalizedAddress,
        isActive: typeof isActive === "boolean" ? isActive : true,
        tenantId,
      },
      select: requesterSelect,
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
          ...requesterSelect,
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

export const getRequester = async (req: Request, res: Response) => {
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

    const requester = await prisma.requester.findFirst({
      where: {
        id: requesterId,
        tenantId: req.session.tenantId,
      },
      select: {
        ...requesterSelect,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!requester) {
      return res.status(404).json({
        status: "fail",
        message: "Requester not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: { requester, student: requester },
    });
  } catch (error) {
    console.error("Get requester error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while loading requester",
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

    const {
      name,
      email,
      password,
      phone,
      company,
      department,
      jobTitle,
      country,
      city,
      address,
      isActive,
    } = req.body;

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
    const normalizedName = getTrimmedString(name);
    const normalizedEmail = getTrimmedString(email).toLowerCase();
    const normalizedPhone = getTrimmedString(phone);
    const normalizedCompany = getTrimmedString(company);
    const normalizedCountry = getTrimmedString(country);
    const normalizedCity = getTrimmedString(city);
    const normalizedAddress = getTrimmedString(address);

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPhone ||
      !normalizedCompany ||
      !normalizedCountry ||
      !normalizedCity ||
      !normalizedAddress ||
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Name, email, phone, company, country, city, address, and status are required",
      });
    }

    data.name = normalizedName;
    data.email = normalizedEmail;
    data.phone = normalizedPhone;
    data.company = normalizedCompany;
    data.department = getTrimmedString(department) || null;
    data.jobTitle = getTrimmedString(jobTitle) || null;
    data.country = normalizedCountry;
    data.city = normalizedCity;
    data.address = normalizedAddress;
    data.isActive = isActive;

    if (typeof password === "string" && password.trim()) {
      data.password = await bcrypt.hash(password, 12);
    }

    const requester = await prisma.requester.update({
      where: { id: requesterId },
      data,
      select: requesterSelect,
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
      select: requesterSelect,
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
