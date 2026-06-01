import type { Request, Response } from "express";
import { TicketStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      closedTickets,
      totalAgents,
      recentTickets,
      generalQuestions,
      technicalQuestions,
      refundRequests,
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({
        where: { status: TicketStatus.OPEN },
      }),
      prisma.ticket.count({
        where: { status: TicketStatus.RESOLVED },
      }),
      prisma.ticket.count({
        where: { status: TicketStatus.CLOSED },
      }),
      prisma.user.count({
        where: { role: "AGENT", isActive: true },
      }),
      prisma.ticket.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          assignedAgent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.ticket.count({
        where: { category: "GENERAL_QUESTION" },
      }),
      prisma.ticket.count({
        where: { category: "TECHNICAL_QUESTION" },
      }),
      prisma.ticket.count({
        where: { category: "REFUND_REQUEST" },
      }),
    ]);

    return res.status(200).json({
      status: "success",
      data: {
        stats: {
          totalTickets,
          openTickets,
          resolvedTickets,
          closedTickets,
          totalAgents,
        },
        categories: {
          generalQuestions,
          technicalQuestions,
          refundRequests,
        },
        recentTickets,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong while loading dashboard stats",
    });
  }
};
