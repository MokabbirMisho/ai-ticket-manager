import nodemailer, { type Transporter } from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export type SendEmailResult =
  | {
      success: true;
      skipped: false;
      messageId?: string;
    }
  | {
      success: false;
      skipped: true;
      reason: string;
    }
  | {
      success: false;
      skipped: false;
      error: string;
    };

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

let transporter: Transporter | null = null;

const requiredMailEnv = [
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_USER",
  "MAIL_PASS",
  "MAIL_FROM",
] as const;

const getMissingMailEnv = () => {
  return requiredMailEnv.filter((key) => !process.env[key]?.trim());
};

const getSmtpConfig = (): SmtpConfig | null => {
  const missing = getMissingMailEnv();

  if (missing.length > 0) {
    return null;
  }

  const port = Number(process.env.MAIL_PORT);

  if (!Number.isInteger(port) || port <= 0) {
    return null;
  }

  return {
    host: process.env.MAIL_HOST as string,
    port,
    user: process.env.MAIL_USER as string,
    pass: process.env.MAIL_PASS as string,
    from: process.env.MAIL_FROM as string,
  };
};

const getTransporter = (config: SmtpConfig) => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailInput): Promise<SendEmailResult> => {
  const config = getSmtpConfig();

  if (!config) {
    const missing = getMissingMailEnv();
    const reason =
      missing.length > 0
        ? `Email sending skipped. Missing SMTP environment variables: ${missing.join(
            ", ",
          )}`
        : "Email sending skipped. MAIL_PORT must be a positive integer.";

    if (process.env.NODE_ENV !== "production") {
      console.warn(reason);
      return {
        success: false,
        skipped: true,
        reason,
      };
    }

    return {
      success: false,
      skipped: false,
      error: "Email service is not configured.",
    };
  }

  if (!to.trim() || !subject.trim() || (!text?.trim() && !html?.trim())) {
    return {
      success: false,
      skipped: false,
      error: "Email requires a recipient, subject, and text or html body.",
    };
  }

  try {
    const info = await getTransporter(config).sendMail({
      from: config.from,
      to: to.trim(),
      subject: subject.trim(),
      text,
      html,
    });

    return {
      success: true,
      skipped: false,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(
      "Email send failed:",
      error instanceof Error ? error.message : error,
    );

    return {
      success: false,
      skipped: false,
      error: "Email could not be sent.",
    };
  }
};
