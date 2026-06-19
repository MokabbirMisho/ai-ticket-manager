import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createRequesterTicket = async (req: Request, res: Response) => {
  try {
    const { subject, description } = req.body;

    const requesterId = req.session.requesterId;
    const tenantId = req.session.tenantId;

    if (!requesterId || !tenantId) {
      return res.status(401).json({
        status: "fail",
        message: "Requester authentication required",
      });
    }

    if (
      typeof subject !== "string" ||
      typeof description !== "string" ||
      !subject.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Subject and description are required",
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject: subject.trim(),
        description: description.trim(),
        requesterId,
        tenantId,
      },
    });

    return res.status(201).json({
      status: "success",
      data: {
        ticket,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to create ticket",
    });
  }
};

export const getMyTickets = async (req: Request, res: Response) => {
  try {
    const requesterId = req.session.requesterId;
    const tenantId = req.session.tenantId;

    if (!requesterId || !tenantId) {
      return res.status(401).json({
        status: "fail",
        message: "Requester authentication required",
      });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        requesterId,
        tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      status: "success",
      results: tickets.length,
      data: {
        tickets,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to load tickets",
    });
  }
};

export const getMyTicket = async (req: Request, res: Response) => {
  try {
    const requesterId = req.session.requesterId;
    const tenantId = req.session.tenantId;
    const ticketId = req.params.ticketId;

    if (!requesterId || !tenantId) {
      return res.status(401).json({
        status: "fail",
        message: "Requester authentication required",
      });
    }

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        requesterId,
        tenantId,
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        ticket,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to load ticket",
    });
  }
};
