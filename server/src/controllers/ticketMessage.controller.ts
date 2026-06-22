import type { Request, Response } from "express";
import type { Prisma, Ticket } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { sendEmail } from "../services/email.service.js";
import {
  buildRequesterReplyToStaffEmail,
  buildStaffReplyToRequesterEmail,
} from "../services/emailTemplates.service.js";

const maxMessageLength = 5000;

const messageInclude = {
  senderUser: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  senderRequester: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.TicketMessageInclude;

type TicketMessageWithSender = Prisma.TicketMessageGetPayload<{
  include: typeof messageInclude;
}>;

const formatMessage = (message: TicketMessageWithSender) => ({
  id: message.id,
  ticketId: message.ticketId,
  senderType: message.senderType,
  senderDisplayName:
    message.senderType === "STAFF"
      ? message.senderUser?.name || "Staff"
      : message.senderRequester?.name || "Requester",
  senderEmail:
    message.senderType === "STAFF"
      ? message.senderUser?.email || null
      : message.senderRequester?.email || null,
  message: message.message,
  createdAt: message.createdAt,
});

const getValidatedMessage = (value: unknown) => {
  if (typeof value !== "string") {
    return {
      error: "Message is required",
      message: "",
    };
  }

  const message = value.trim();

  if (!message) {
    return {
      error: "Message is required",
      message: "",
    };
  }

  if (message.length > maxMessageLength) {
    return {
      error: `Message must be ${maxMessageLength} characters or fewer`,
      message: "",
    };
  }

  return {
    error: "",
    message,
  };
};

const getStaffAccessibleTicket = async (req: Request, ticketId: string) => {
  const currentUserId = req.session.userId;
  const currentRole = req.session.role;
  const tenantId = req.session.tenantId;

  if (!currentUserId || !currentRole) {
    return {
      status: 401,
      message: "Authentication required",
      ticket: null,
    };
  }

  if (currentRole !== "ADMIN" && currentRole !== "AGENT") {
    return {
      status: 403,
      message: "Staff access required",
      ticket: null,
    };
  }

  if (!tenantId) {
    return {
      status: 403,
      message: "Tenant context required",
      ticket: null,
    };
  }

  const where: Prisma.TicketWhereInput = {
    id: ticketId,
    tenantId,
  };

  if (currentRole === "AGENT") {
    where.assignedAgentId = currentUserId;
  }

  const ticket = await prisma.ticket.findFirst({ where });

  if (!ticket) {
    return {
      status: 404,
      message: "Ticket not found",
      ticket: null,
    };
  }

  return {
    status: 200,
    message: "",
    ticket,
  };
};

const getRequesterAccessibleTicket = async (req: Request, ticketId: string) => {
  const requesterId = req.session.requesterId;
  const tenantId = req.session.tenantId;

  if (!requesterId || !tenantId) {
    return {
      status: 401,
      message: "Requester authentication required",
      ticket: null,
    };
  }

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      tenantId,
      requesterId,
    },
  });

  if (!ticket) {
    return {
      status: 404,
      message: "Ticket not found",
      ticket: null,
    };
  }

  return {
    status: 200,
    message: "",
    ticket,
  };
};

const getMessagesForTicket = async (ticket: Ticket) => {
  const messages = await prisma.ticketMessage.findMany({
    where: {
      ticketId: ticket.id,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: messageInclude,
  });

  return messages.map(formatMessage);
};

const notifyRequesterAboutStaffReply = async ({
  ticketId,
  replyMessage,
  replySenderName,
}: {
  ticketId: string;
  replyMessage: string;
  replySenderName: string;
}) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      requester: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!ticket?.requester?.email) {
    return false;
  }

  const result = await sendEmail({
    to: ticket.requester.email,
    ...buildStaffReplyToRequesterEmail({
      requesterName: ticket.requester.name,
      ticketId: ticket.id,
      ticketSubject: ticket.subject,
      replySenderName,
      replyMessage,
    }),
  });

  return result.success;
};

const notifyStaffAboutRequesterReply = async ({
  ticketId,
  replyMessage,
}: {
  ticketId: string;
  replyMessage: string;
}) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      tenantId: true,
      assignedAgentId: true,
      assignedAgent: {
        select: {
          email: true,
          tenantId: true,
          isActive: true,
        },
      },
      requester: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!ticket?.requester?.email) {
    return false;
  }

  const email = buildRequesterReplyToStaffEmail({
    requesterName: ticket.requester.name,
    requesterEmail: ticket.requester.email,
    ticketId: ticket.id,
    ticketSubject: ticket.subject,
    replyMessage,
  });

  if (
    ticket.assignedAgent?.email &&
    ticket.assignedAgent.isActive &&
    ticket.assignedAgent.tenantId === ticket.tenantId
  ) {
    const result = await sendEmail({
      to: ticket.assignedAgent.email,
      ...email,
    });

    return result.success;
  }

  const tenantAdmins = await prisma.user.findMany({
    where: {
      tenantId: ticket.tenantId,
      role: "ADMIN",
      isActive: true,
    },
    select: {
      email: true,
    },
  });

  if (tenantAdmins.length === 0) {
    return false;
  }

  const results = await Promise.all(
    tenantAdmins.map((admin) =>
      sendEmail({
        to: admin.email,
        ...email,
      }),
    ),
  );

  return results.every((result) => result.success);
};

export const listStaffTicketMessages = async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id;

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const access = await getStaffAccessibleTicket(req, ticketId);

    if (!access.ticket) {
      return res.status(access.status).json({
        status: "fail",
        message: access.message,
      });
    }

    const messages = await getMessagesForTicket(access.ticket);

    return res.status(200).json({
      status: "success",
      results: messages.length,
      data: { messages },
    });
  } catch (error) {
    console.error("List staff ticket messages error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to load ticket messages",
    });
  }
};

export const createStaffTicketMessage = async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id;

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const access = await getStaffAccessibleTicket(req, ticketId);

    if (!access.ticket) {
      return res.status(access.status).json({
        status: "fail",
        message: access.message,
      });
    }

    const validation = getValidatedMessage(req.body.message);

    if (validation.error) {
      return res.status(400).json({
        status: "fail",
        message: validation.error,
      });
    }

    const senderUserId = req.session.userId;

    if (!senderUserId) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required",
      });
    }

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: access.ticket.id,
        senderType: "STAFF",
        senderUserId,
        message: validation.message,
      },
      include: messageInclude,
    });

    const notificationEmailSent = await notifyRequesterAboutStaffReply({
      ticketId: access.ticket.id,
      replyMessage: validation.message,
      replySenderName: message.senderUser?.name || "Staff",
    });

    return res.status(201).json({
      status: "success",
      message: notificationEmailSent
        ? "Reply sent successfully."
        : "Reply sent successfully, but the notification email could not be sent.",
      data: { message: formatMessage(message), notificationEmailSent },
    });
  } catch (error) {
    console.error("Create staff ticket message error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to send reply",
    });
  }
};

export const listRequesterTicketMessages = async (
  req: Request,
  res: Response,
) => {
  try {
    const ticketId = req.params.id;

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const access = await getRequesterAccessibleTicket(req, ticketId);

    if (!access.ticket) {
      return res.status(access.status).json({
        status: "fail",
        message: access.message,
      });
    }

    const messages = await getMessagesForTicket(access.ticket);

    return res.status(200).json({
      status: "success",
      results: messages.length,
      data: { messages },
    });
  } catch (error) {
    console.error("List requester ticket messages error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to load ticket messages",
    });
  }
};

export const createRequesterTicketMessage = async (
  req: Request,
  res: Response,
) => {
  try {
    const ticketId = req.params.id;

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid ticket ID is required",
      });
    }

    const access = await getRequesterAccessibleTicket(req, ticketId);

    if (!access.ticket) {
      return res.status(access.status).json({
        status: "fail",
        message: access.message,
      });
    }

    const validation = getValidatedMessage(req.body.message);

    if (validation.error) {
      return res.status(400).json({
        status: "fail",
        message: validation.error,
      });
    }

    const senderRequesterId = req.session.requesterId;

    if (!senderRequesterId) {
      return res.status(401).json({
        status: "fail",
        message: "Requester authentication required",
      });
    }

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: access.ticket.id,
        senderType: "REQUESTER",
        senderRequesterId,
        message: validation.message,
      },
      include: messageInclude,
    });

    const notificationEmailSent = await notifyStaffAboutRequesterReply({
      ticketId: access.ticket.id,
      replyMessage: validation.message,
    });

    return res.status(201).json({
      status: "success",
      message: notificationEmailSent
        ? "Your reply has been sent successfully."
        : "Your reply has been sent successfully, but the notification email could not be sent.",
      data: { message: formatMessage(message), notificationEmailSent },
    });
  } catch (error) {
    console.error("Create requester ticket message error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to send reply",
    });
  }
};
