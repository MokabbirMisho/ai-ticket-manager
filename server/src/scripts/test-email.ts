import "dotenv/config";
import { sendEmail } from "../services/email.service.js";

const testRecipient = process.env.MAIL_TEST_TO || "test@example.local";

const result = await sendEmail({
  to: testRecipient,
  subject: "AI Ticket Manager test email",
  text: "This is a development test email from AI Ticket Manager.",
  html: "<p>This is a development test email from AI Ticket Manager.</p>",
});

if (result.success) {
  console.log("Test email sent successfully.");
  process.exit(0);
}

if (result.skipped) {
  console.warn(result.reason);
  process.exit(0);
}

console.error(result.error);
process.exit(1);
