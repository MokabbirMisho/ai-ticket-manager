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

export async function generateAIReply({
  subject,
  description,
  summary,
  studentName,
  agentName,
}: {
  subject: string;
  description: string;
  summary: string;
  studentName: string;
  agentName?: string | null;
}) {
  const finalAgentName = agentName || "Support Team";

  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: `
You are a professional student support agent.

Write a helpful support reply for the student.

Student Name:
${studentName}

Agent Name:
${finalAgentName}

Subject:
${subject}

Summary:
${summary}

Description:
${description}

Requirements:
- Start with "Dear ${studentName},"
- End with:
  Best regards,
  ${finalAgentName}
- Do not use placeholders like [User], [Your Name], [Student Name], or [Agent Name].
- Be professional, friendly, short, and actionable.
- Return only the final reply.
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
