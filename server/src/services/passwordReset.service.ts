import crypto from "crypto";
import bcrypt from "bcrypt";
import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { sendEmail } from "./email.service.js";
import { buildPasswordResetEmail } from "./emailTemplates.service.js";

const resetTokenBytes = 32;
const resetTokenExpiryMinutes = 30;

export const passwordResetGenericMessage =
  "If an account exists for this email, a password reset link has been sent.";

const getClientUrl = () => {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
};

const normalizeEmail = (email: unknown) => {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
};

const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const createRawToken = () => {
  return crypto.randomBytes(resetTokenBytes).toString("hex");
};

const getExpiresAt = () => {
  return new Date(Date.now() + resetTokenExpiryMinutes * 60 * 1000);
};

export const validateResetPasswordInput = ({
  token,
  newPassword,
  confirmPassword,
}: {
  token: unknown;
  newPassword: unknown;
  confirmPassword: unknown;
}) => {
  if (
    typeof token !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string" ||
    !token.trim() ||
    !newPassword.trim() ||
    !confirmPassword.trim()
  ) {
    return "Token, new password, and confirmation are required";
  }

  if (newPassword !== confirmPassword) {
    return "New password and confirmation do not match";
  }

  if (newPassword.length < 8) {
    return "New password must be at least 8 characters";
  }

  return "";
};

const sendResetEmail = async ({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) => {
  await sendEmail({
    to,
    ...buildPasswordResetEmail({
      resetUrl,
      expiresInMinutes: resetTokenExpiryMinutes,
    }),
  });
};

export const requestStaffPasswordReset = async (email: unknown) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return;

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  const resettableRoles: Role[] = ["ADMIN", "AGENT"];

  if (!user || !user.isActive || !resettableRoles.includes(user.role)) {
    return;
  }

  const rawToken = createRawToken();
  const tokenHash = hashToken(rawToken);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: getExpiresAt(),
    },
  });

  const resetUrl = `${getClientUrl()}/reset-password?token=${encodeURIComponent(
    rawToken,
  )}&type=staff`;

  await sendResetEmail({
    to: user.email,
    resetUrl,
  });
};

export const requestRequesterPasswordReset = async (email: unknown) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return;

  const requester = await prisma.requester.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      isActive: true,
    },
  });

  if (!requester || !requester.isActive) {
    return;
  }

  const rawToken = createRawToken();
  const tokenHash = hashToken(rawToken);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      requesterId: requester.id,
      expiresAt: getExpiresAt(),
    },
  });

  const resetUrl = `${getClientUrl()}/requester/reset-password?token=${encodeURIComponent(
    rawToken,
  )}`;

  await sendResetEmail({
    to: requester.email,
    resetUrl,
  });
};

export const resetStaffPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) => {
  const tokenHash = hashToken(token.trim());

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      userId: { not: null },
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  if (
    !resetToken?.user ||
    !resetToken.user.isActive ||
    (resetToken.user.role !== "ADMIN" && resetToken.user.role !== "AGENT")
  ) {
    return false;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);

  return true;
};

export const resetRequesterPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) => {
  const tokenHash = hashToken(token.trim());

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      requesterId: { not: null },
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      requester: {
        select: {
          id: true,
          isActive: true,
        },
      },
    },
  });

  if (!resetToken?.requester || !resetToken.requester.isActive) {
    return false;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.requester.update({
      where: { id: resetToken.requester.id },
      data: {
        password: hashedPassword,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);

  return true;
};
