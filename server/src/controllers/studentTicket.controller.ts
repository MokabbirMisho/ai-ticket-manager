import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createStudentTicket = async (req: Request, res: Response) => {
  try {
    const { subject, description } = req.body;

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
        studentId: req.session.studentId!,
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
    const tickets = await prisma.ticket.findMany({
      where: {
        studentId: req.session.studentId,
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
    const { ticketId } = req.params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        studentId: req.session.studentId,
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
