import type { Request, Response } from "express";
import { TicketStatus, type Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const ticketWhere: Prisma.TicketWhereInput = {};
    const agentWhere: Prisma.UserWhereInput = {
      role: "AGENT",
      isActive: true,
    };

    if (req.session.role !== "SUPER_ADMIN") {
      if (!req.session.tenantId) {
        return res.status(403).json({
          status: "fail",
          message: "Tenant context required",
        });
      }

      ticketWhere.tenantId = req.session.tenantId;
      agentWhere.tenantId = req.session.tenantId;
    }

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
      prisma.ticket.count({
        where: ticketWhere,
      }),
      prisma.ticket.count({
        where: { ...ticketWhere, status: TicketStatus.OPEN },
      }),
      prisma.ticket.count({
        where: { ...ticketWhere, status: TicketStatus.RESOLVED },
      }),
      prisma.ticket.count({
        where: { ...ticketWhere, status: TicketStatus.CLOSED },
      }),
      prisma.user.count({
        where: agentWhere,
      }),
      prisma.ticket.findMany({
        where: ticketWhere,
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
        where: { ...ticketWhere, category: "GENERAL_QUESTION" },
      }),
      prisma.ticket.count({
        where: { ...ticketWhere, category: "TECHNICAL_QUESTION" },
      }),
      prisma.ticket.count({
        where: { ...ticketWhere, category: "REFUND_REQUEST" },
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
