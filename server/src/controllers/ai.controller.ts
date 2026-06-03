import type { Request, Response } from "express";
import { TicketCategory } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import {
  classifyTicketWithAI,
  generateAIReply,
  generateTicketSummary,
} from "../services/openai.service.js";

export const summarizeTicket = async (req: Request, res: Response) => {
  try {
    const ticketIdParam = req.params.ticketId;

    if (!ticketIdParam || Array.isArray(ticketIdParam)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const ticketId: string = ticketIdParam;

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
    const ticketIdParam = req.params.ticketId;

    if (!ticketIdParam || Array.isArray(ticketIdParam)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const ticketId: string = ticketIdParam;

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

    const subject = ticket.subject;
    const description = ticket.description;
    const category = ticket.category;

    const keywords = `${subject} ${description} ${category}`
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.replace(/[^a-z0-9]/gi, ""))
      .filter((word) => word.length > 3)
      .slice(0, 10);

    const relatedArticles = await prisma.knowledgeArticle.findMany({
      where: {
        isActive: true,
        OR: [
          ...keywords.map((keyword) => ({
            title: {
              contains: keyword,
              mode: "insensitive" as const,
            },
          })),
          ...keywords.map((keyword) => ({
            content: {
              contains: keyword,
              mode: "insensitive" as const,
            },
          })),
          {
            category: {
              contains: String(category),
              mode: "insensitive" as const,
            },
          },
        ],
      },
      take: 3,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const articlesForContext =
      relatedArticles.length > 0
        ? relatedArticles
        : await prisma.knowledgeArticle.findMany({
            where: {
              isActive: true,
            },
            take: 3,
            orderBy: {
              updatedAt: "desc",
            },
          });

    const knowledgeContext = articlesForContext
      .map((article, index) => {
        return `
Article ${index + 1}
Title: ${article.title}
Category: ${article.category}
Content: ${article.content}
`;
      })
      .join("\n");

    const reply = await generateAIReply({
      subject,
      description,
      summary: ticket.aiSummary || "",
      studentName: ticket.student?.name || "Student",
      agentName: ticket.assignedAgent?.name || "Support Team",
      knowledgeContext,
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
      message: "AI reply generated successfully using knowledge base",
      data: {
        ticket: updatedTicket,
        knowledgeArticlesUsed: articlesForContext.map((article) => ({
          id: article.id,
          title: article.title,
          category: article.category,
        })),
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
    const ticketIdParam = req.params.ticketId;

    if (!ticketIdParam || Array.isArray(ticketIdParam)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const ticketId: string = ticketIdParam;

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
