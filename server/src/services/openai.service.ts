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

export async function generateAIReply(
  subject: string,
  description: string,
  summary: string,
) {
  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: `
You are a professional customer support agent.

Write a helpful support reply.

Subject:
${subject}

Summary:
${summary}

Description:
${description}

Requirements:
- Professional
- Friendly
- Short
- Actionable
- Return only the reply
`,
  });

  return response.output_text.trim();
}

export async function classifyTicketWithAI(
  subject: string,
  description: string,
) {
  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: `
Classify the support ticket.

Allowed categories:

GENERAL_QUESTION
TECHNICAL_QUESTION
REFUND_REQUEST

Return ONLY the category.

Subject:
${subject}

Description:
${description}
`,
  });

  return response.output_text.trim();
}
