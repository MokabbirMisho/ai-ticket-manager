import type { Request, Response } from "express";
import { TicketCategory, TicketStatus, type Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { subject, description, category } = req.body;
    const tenantId = req.session.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

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
        tenantId,
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

    const where: Prisma.TicketWhereInput = {};

    if (req.session.role !== "SUPER_ADMIN") {
      if (!req.session.tenantId) {
        return res.status(403).json({
          status: "fail",
          message: "Tenant context required",
        });
      }

      where.tenantId = req.session.tenantId;
    }

    if (typeof status === "string" && status) {
      where.status = status as TicketStatus;
    }

    if (typeof category === "string" && category) {
      where.category = category as TicketCategory;
    }

    if (req.session.role === "AGENT") {
      if (!req.session.userId) {
        return res.status(401).json({
          status: "fail",
          message: "Authentication required",
        });
      }

      where.assignedAgentId = req.session.userId;
    }

    const tickets = await prisma.ticket.findMany({
      where,
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
        student: {
          select: {
            id: true,
            name: true,
            email: true,
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
    const ticketId = req.params.id;

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const where: Prisma.TicketWhereInput = {
      id: ticketId,
    };

    if (req.session.role !== "SUPER_ADMIN") {
      if (!req.session.tenantId) {
        return res.status(403).json({
          status: "fail",
          message: "Tenant context required",
        });
      }

      where.tenantId = req.session.tenantId;
    }

    if (req.session.role === "AGENT") {
      if (!req.session.userId) {
        return res.status(401).json({
          status: "fail",
          message: "Authentication required",
        });
      }

      where.assignedAgentId = req.session.userId;
    }

    const ticket = await prisma.ticket.findFirst({
      where,
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        student: {
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
    const ticketId = req.params.id;

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const currentUserId = req.session.userId;
    const currentRole = req.session.role;
    const tenantId = req.session.tenantId;

    if (!currentUserId || !currentRole) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required",
      });
    }

    if (currentRole !== "SUPER_ADMIN" && !tenantId) {
      return res.status(403).json({
        status: "fail",
        message: "Tenant context required",
      });
    }

    const { status, category, assignedAgentId, aiSummary, aiReply } = req.body;

    const ticketWhere: Prisma.TicketWhereInput = {
      id: ticketId,
    };

    if (currentRole !== "SUPER_ADMIN") {
      if (!tenantId) {
        return res.status(403).json({
          status: "fail",
          message: "Tenant context required",
        });
      }

      ticketWhere.tenantId = tenantId;
    }

    if (currentRole === "AGENT") {
      ticketWhere.assignedAgentId = currentUserId;
    }

    const existingTicket = await prisma.ticket.findFirst({
      where: ticketWhere,
    });

    if (!existingTicket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket not found",
      });
    }

    if (currentRole === "AGENT" && assignedAgentId) {
      return res.status(403).json({
        status: "fail",
        message: "Agents cannot assign tickets",
      });
    }

    if (assignedAgentId) {
      const agent = await prisma.user.findUnique({
        where: { id: assignedAgentId },
      });

      if (
        !agent ||
        !agent.isActive ||
        agent.role !== "AGENT" ||
        (currentRole !== "SUPER_ADMIN" && agent.tenantId !== tenantId)
      ) {
        return res.status(400).json({
          status: "fail",
          message: "Assigned agent is invalid",
        });
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
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
        student: {
          select: {
            id: true,
            name: true,
            email: true,
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
