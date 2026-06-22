const getClientUrl = () => {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const buildParagraphs = (lines: string[]) => {
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
};

const buildReplyPreview = (message: string) => {
  const normalized = message.trim().replace(/\s+/g, " ");

  if (normalized.length <= 250) {
    return normalized;
  }

  return `${normalized.slice(0, 247)}...`;
};

export const buildTenantAdminWelcomeEmail = ({
  tenantName,
  adminEmail,
  temporaryPassword,
}: {
  tenantName: string;
  adminEmail: string;
  temporaryPassword: string;
}) => {
  const loginUrl = `${getClientUrl()}/login`;
  const text = [
    "Welcome to AI Ticket Manager.",
    "Your workspace has been created successfully, and your tenant admin account is ready.",
    `Workspace: ${tenantName}`,
    `Admin email: ${adminEmail}`,
    `Temporary password: ${temporaryPassword}`,
    `Staff login URL: ${loginUrl}`,
    "You will be asked to change your password on first login.",
    "After signing in, you can complete the company profile, add staff, create requesters, add knowledge base articles, and manage tickets.",
  ].join("\n\n");

  return {
    subject: "Welcome to AI Ticket Manager",
    text,
    html: buildParagraphs([
      "Welcome to AI Ticket Manager.",
      "Your workspace has been created successfully, and your tenant admin account is ready.",
      `Workspace: ${tenantName}`,
      `Admin email: ${adminEmail}`,
      `Temporary password: ${temporaryPassword}`,
      `Staff login URL: ${loginUrl}`,
      "You will be asked to change your password on first login.",
      "After signing in, you can complete the company profile, add staff, create requesters, add knowledge base articles, and manage tickets.",
    ]),
  };
};

export const buildStaffWelcomeEmail = ({
  workspaceName,
  staffEmail,
  temporaryPassword,
}: {
  workspaceName: string;
  staffEmail: string;
  temporaryPassword: string;
}) => {
  const loginUrl = `${getClientUrl()}/login`;
  const text = [
    "Your AI Ticket Manager staff account has been created successfully.",
    `Workspace: ${workspaceName}`,
    `Staff email: ${staffEmail}`,
    `Temporary password: ${temporaryPassword}`,
    `Staff login URL: ${loginUrl}`,
    "You will be asked to change your password on first login.",
    "After signing in, you can view assigned tickets, review requester details, and use AI support tools to help manage support work.",
  ].join("\n\n");

  return {
    subject: "Your AI Ticket Manager staff account is ready",
    text,
    html: buildParagraphs([
      "Your AI Ticket Manager staff account has been created successfully.",
      `Workspace: ${workspaceName}`,
      `Staff email: ${staffEmail}`,
      `Temporary password: ${temporaryPassword}`,
      `Staff login URL: ${loginUrl}`,
      "You will be asked to change your password on first login.",
      "After signing in, you can view assigned tickets, review requester details, and use AI support tools to help manage support work.",
    ]),
  };
};

export const buildRequesterWelcomeEmail = ({
  requesterName,
  requesterEmail,
  temporaryPassword,
}: {
  requesterName: string;
  requesterEmail: string;
  temporaryPassword: string;
}) => {
  const loginUrl = `${getClientUrl()}/requester/login`;
  const text = [
    `Hello ${requesterName},`,
    "Your support portal account has been created successfully.",
    `Requester email: ${requesterEmail}`,
    `Temporary password: ${temporaryPassword}`,
    `Requester login URL: ${loginUrl}`,
    "After signing in, you can create tickets, track ticket status, and update your contact information.",
    "You can change your password from your account page after signing in.",
  ].join("\n\n");

  return {
    subject: "Your support portal account is ready",
    text,
    html: buildParagraphs([
      `Hello ${requesterName},`,
      "Your support portal account has been created successfully.",
      `Requester email: ${requesterEmail}`,
      `Temporary password: ${temporaryPassword}`,
      `Requester login URL: ${loginUrl}`,
      "After signing in, you can create tickets, track ticket status, and update your contact information.",
      "You can change your password from your account page after signing in.",
    ]),
  };
};

export const buildRequesterTicketSubmittedEmail = ({
  requesterName,
  ticketSubject,
  ticketCategory,
  ticketPriority,
  ticketStatus,
}: {
  requesterName: string;
  ticketSubject: string;
  ticketCategory: string;
  ticketPriority: string;
  ticketStatus: string;
}) => {
  const ticketsUrl = `${getClientUrl()}/requester/tickets`;
  const text = [
    `Hello ${requesterName},`,
    "Your support ticket has been submitted successfully.",
    `Ticket subject: ${ticketSubject}`,
    `Category: ${ticketCategory}`,
    `Priority: ${ticketPriority}`,
    `Status: ${ticketStatus}`,
    `Requester portal: ${ticketsUrl}`,
  ].join("\n\n");

  return {
    subject: "Your support ticket has been submitted",
    text,
    html: buildParagraphs([
      `Hello ${requesterName},`,
      "Your support ticket has been submitted successfully.",
      `Ticket subject: ${ticketSubject}`,
      `Category: ${ticketCategory}`,
      `Priority: ${ticketPriority}`,
      `Status: ${ticketStatus}`,
      `Requester portal: ${ticketsUrl}`,
    ]),
  };
};

export const buildAdminNewTicketEmail = ({
  requesterName,
  requesterEmail,
  ticketSubject,
  ticketCategory,
  ticketPriority,
}: {
  requesterName: string;
  requesterEmail: string;
  ticketSubject: string;
  ticketCategory: string;
  ticketPriority: string;
}) => {
  const ticketsUrl = `${getClientUrl()}/tickets`;
  const text = [
    "A new support ticket has been received.",
    `Requester: ${requesterName}`,
    `Requester email: ${requesterEmail}`,
    `Ticket subject: ${ticketSubject}`,
    `Category: ${ticketCategory}`,
    `Priority: ${ticketPriority}`,
    `Admin/staff ticket link: ${ticketsUrl}`,
  ].join("\n\n");

  return {
    subject: "New support ticket received",
    text,
    html: buildParagraphs([
      "A new support ticket has been received.",
      `Requester: ${requesterName}`,
      `Requester email: ${requesterEmail}`,
      `Ticket subject: ${ticketSubject}`,
      `Category: ${ticketCategory}`,
      `Priority: ${ticketPriority}`,
      `Admin/staff ticket link: ${ticketsUrl}`,
    ]),
  };
};

export const buildAgentTicketAssignedEmail = ({
  ticketSubject,
  requesterName,
  requesterEmail,
  ticketPriority,
}: {
  ticketSubject: string;
  requesterName: string;
  requesterEmail: string;
  ticketPriority: string;
}) => {
  const ticketsUrl = `${getClientUrl()}/tickets`;
  const text = [
    "A support ticket has been assigned to you.",
    `Ticket subject: ${ticketSubject}`,
    `Requester: ${requesterName}`,
    `Requester email: ${requesterEmail}`,
    `Priority: ${ticketPriority}`,
    `Ticket link: ${ticketsUrl}`,
  ].join("\n\n");

  return {
    subject: "A support ticket has been assigned to you",
    text,
    html: buildParagraphs([
      "A support ticket has been assigned to you.",
      `Ticket subject: ${ticketSubject}`,
      `Requester: ${requesterName}`,
      `Requester email: ${requesterEmail}`,
      `Priority: ${ticketPriority}`,
      `Ticket link: ${ticketsUrl}`,
    ]),
  };
};

export const buildRequesterTicketStatusUpdatedEmail = ({
  ticketSubject,
  oldStatus,
  newStatus,
}: {
  ticketSubject: string;
  oldStatus?: string;
  newStatus: string;
}) => {
  const ticketsUrl = `${getClientUrl()}/requester/tickets`;
  const statusLine = oldStatus
    ? `Status changed from ${oldStatus} to ${newStatus}.`
    : `New status: ${newStatus}`;
  const text = [
    "Your support ticket status has been updated.",
    `Ticket subject: ${ticketSubject}`,
    statusLine,
    `Requester portal: ${ticketsUrl}`,
  ].join("\n\n");

  return {
    subject: "Your support ticket status has been updated",
    text,
    html: buildParagraphs([
      "Your support ticket status has been updated.",
      `Ticket subject: ${ticketSubject}`,
      statusLine,
      `Requester portal: ${ticketsUrl}`,
    ]),
  };
};

export const buildStaffReplyToRequesterEmail = ({
  requesterName,
  ticketId,
  ticketSubject,
  replySenderName,
  replyMessage,
}: {
  requesterName: string;
  ticketId: string;
  ticketSubject: string;
  replySenderName: string;
  replyMessage: string;
}) => {
  const ticketUrl = `${getClientUrl()}/requester/tickets/${ticketId}`;
  const replyPreview = buildReplyPreview(replyMessage);
  const text = [
    `Hello ${requesterName},`,
    "There is a new reply on your support ticket.",
    `Ticket subject: ${ticketSubject}`,
    `Reply from: ${replySenderName}`,
    `Reply preview: ${replyPreview}`,
    `View ticket: ${ticketUrl}`,
  ].join("\n\n");

  return {
    subject: "New reply on your support ticket",
    text,
    html: buildParagraphs([
      `Hello ${requesterName},`,
      "There is a new reply on your support ticket.",
      `Ticket subject: ${ticketSubject}`,
      `Reply from: ${replySenderName}`,
      `Reply preview: ${replyPreview}`,
      `View ticket: ${ticketUrl}`,
    ]),
  };
};

export const buildRequesterReplyToStaffEmail = ({
  requesterName,
  requesterEmail,
  ticketId,
  ticketSubject,
  replyMessage,
}: {
  requesterName: string;
  requesterEmail: string;
  ticketId: string;
  ticketSubject: string;
  replyMessage: string;
}) => {
  const ticketUrl = `${getClientUrl()}/tickets/${ticketId}`;
  const replyPreview = buildReplyPreview(replyMessage);
  const text = [
    "A requester replied to a support ticket.",
    `Requester: ${requesterName}`,
    `Requester email: ${requesterEmail}`,
    `Ticket subject: ${ticketSubject}`,
    `Reply preview: ${replyPreview}`,
    `View ticket: ${ticketUrl}`,
  ].join("\n\n");

  return {
    subject: "Requester replied to a support ticket",
    text,
    html: buildParagraphs([
      "A requester replied to a support ticket.",
      `Requester: ${requesterName}`,
      `Requester email: ${requesterEmail}`,
      `Ticket subject: ${ticketSubject}`,
      `Reply preview: ${replyPreview}`,
      `View ticket: ${ticketUrl}`,
    ]),
  };
};

export const buildPasswordResetEmail = ({
  resetUrl,
  expiresInMinutes,
}: {
  resetUrl: string;
  expiresInMinutes: number;
}) => {
  const text = [
    "We received a request to reset your AI Ticket Manager password.",
    `Use this secure link to set a new password: ${resetUrl}`,
    `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
    "If you did not request a password reset, you can ignore this email.",
  ].join("\n\n");

  return {
    subject: "Reset your AI Ticket Manager password",
    text,
    html: buildParagraphs([
      "We received a request to reset your AI Ticket Manager password.",
      `Use this secure link to set a new password: ${resetUrl}`,
      `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
      "If you did not request a password reset, you can ignore this email.",
    ]),
  };
};
