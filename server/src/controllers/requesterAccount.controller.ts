import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

const requesterAccountSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  country: true,
  city: true,
  address: true,
};

const getTrimmedString = (value: unknown) => {
  return typeof value === "string" ? value.trim() : "";
};

export const getRequesterAccount = async (req: Request, res: Response) => {
  try {
    const requesterId = req.session.requesterId;

    if (!requesterId) {
      return res.status(401).json({
        status: "fail",
        message: "Requester authentication required",
      });
    }

    const requester = await prisma.requester.findUnique({
      where: { id: requesterId },
      select: requesterAccountSelect,
    });

    if (!requester) {
      return res.status(404).json({
        status: "fail",
        message: "Requester account not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: { requester },
    });
  } catch (error) {
    console.error("Get requester account error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while loading account",
    });
  }
};

export const updateRequesterAccount = async (req: Request, res: Response) => {
  try {
    const requesterId = req.session.requesterId;

    if (!requesterId) {
      return res.status(401).json({
        status: "fail",
        message: "Requester authentication required",
      });
    }

    const { phone, country, city, address } = req.body;

    const requester = await prisma.requester.update({
      where: { id: requesterId },
      data: {
        phone: getTrimmedString(phone) || null,
        country: getTrimmedString(country) || null,
        city: getTrimmedString(city) || null,
        address: getTrimmedString(address) || null,
      },
      select: requesterAccountSelect,
    });

    return res.status(200).json({
      status: "success",
      message: "Account profile updated successfully",
      data: { requester },
    });
  } catch (error) {
    console.error("Update requester account error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while updating account",
    });
  }
};

export const updateRequesterPassword = async (req: Request, res: Response) => {
  try {
    const requesterId = req.session.requesterId;

    if (!requesterId) {
      return res.status(401).json({
        status: "fail",
        message: "Requester authentication required",
      });
    }

    const currentPassword = getTrimmedString(req.body.currentPassword);
    const newPassword = getTrimmedString(req.body.newPassword);
    const confirmPassword = getTrimmedString(req.body.confirmPassword);

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message:
          "Current password, new password, and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "New password and confirm password must match",
      });
    }

    const requester = await prisma.requester.findUnique({
      where: { id: requesterId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!requester) {
      return res.status(404).json({
        status: "fail",
        message: "Requester account not found",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      requester.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.requester.update({
      where: { id: requester.id },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update requester password error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while updating password",
    });
  }
};
