import { openai, OPENAI_MODEL } from "../config/openai.js";

export async function generateTicketSummary(
  subject: string,
  description: string,
) {
  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: `
You are a support ticket assistant.

Create a concise summary of the following ticket.

Subject:
${subject}

Description:
${description}

Return only the summary.
`,
  });

  return response.output_text.trim();
}
