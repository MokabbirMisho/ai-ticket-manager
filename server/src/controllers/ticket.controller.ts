import type { Request, Response } from "express";
import { TicketCategory, TicketStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { subject, description, category } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        status: "fail",
        message: "Subject and description are required",
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        category: category || TicketCategory.GENERAL_QUESTION,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Ticket created successfully",
      data: { ticket },
    });
  } catch (error) {
    console.error("Create ticket error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while creating ticket",
    });
  }
};

export const listTickets = async (req: Request, res: Response) => {
  try {
    const { status, category, sort } = req.query;

    const tickets = await prisma.ticket.findMany({
      where: {
        status: status ? (status as TicketStatus) : undefined,
        category: category ? (category as TicketCategory) : undefined,
      },
      orderBy: {
        createdAt: sort === "oldest" ? "asc" : "desc",
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      results: tickets.length,
      data: { tickets },
    });
  } catch (error) {
    console.error("List tickets error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while listing tickets",
    });
  }
};

export const getTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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
      data: { ticket },
    });
  } catch (error) {
    console.error("Get ticket error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while getting ticket",
    });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, category, assignedAgentId, aiSummary, aiReply } = req.body;

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket not found",
      });
    }

    if (assignedAgentId) {
      const agent = await prisma.user.findUnique({
        where: { id: assignedAgentId },
      });

      if (!agent || !agent.isActive || agent.role !== "AGENT") {
        return res.status(400).json({
          status: "fail",
          message: "Assigned agent is invalid",
        });
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        status,
        category,
        assignedAgentId,
        aiSummary,
        aiReply,
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Ticket updated successfully",
      data: { ticket },
    });
  } catch (error) {
    console.error("Update ticket error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while updating ticket",
    });
  }
};
