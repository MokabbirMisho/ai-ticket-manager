import type { Request, Response } from "express";
import { TicketCategory } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import {
  generateTicketSummary,
  generateAIReply,
  classifyTicketWithAI,
} from "../services/openai.service.js";

export const summarizeTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({
        status: "fail",
        message: "Ticket ID is required",
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket not found",
      });
    }

    const summary = await generateTicketSummary(
      ticket.subject,
      ticket.description,
    );

    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        aiSummary: summary,
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
      message: "AI summary generated successfully",
      data: {
        ticket: updatedTicket,
      },
    });
  } catch (error) {
    console.error("AI summary error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to generate summary",
    });
  }
};

export const generateReply = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({
        status: "fail",
        message: "Ticket ID is required",
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        student: {
          select: {
            name: true,
          },
        },
        assignedAgent: {
          select: {
            name: true,
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

    const reply = await generateAIReply({
      subject: ticket.subject,
      description: ticket.description,
      summary: ticket.aiSummary || "",
      studentName: ticket.student?.name || "Student",
      agentName: ticket.assignedAgent?.name || "Support Team",
    });

    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        aiReply: reply,
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
      message: "AI reply generated successfully",
      data: {
        ticket: updatedTicket,
      },
    });
  } catch (error) {
    console.error("AI reply error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to generate AI reply",
    });
  }
};

export const classifyTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({
        status: "fail",
        message: "Ticket ID is required",
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket not found",
      });
    }

    const category = await classifyTicketWithAI(
      ticket.subject,
      ticket.description,
    );

    const allowedCategories = [
      "GENERAL_QUESTION",
      "TECHNICAL_QUESTION",
      "REFUND_REQUEST",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        status: "fail",
        message: "AI returned an invalid category",
        data: {
          category,
        },
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        category: category as TicketCategory,
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
      message: "Ticket classified successfully",
      data: {
        ticket: updatedTicket,
      },
    });
  } catch (error) {
    console.error("AI classification error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to classify ticket",
    });
  }
};
