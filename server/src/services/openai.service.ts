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
  requesterName,
  agentName,
  knowledgeContext,
}: {
  subject: string;
  description: string;
  summary: string;
  requesterName: string;
  agentName?: string | null;
  knowledgeContext?: string;
}) {
  const finalAgentName = agentName || "Support Team";

  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: `
You are a professional customer support agent.

Write a helpful support reply for the requester/customer.

Requester Name:
${requesterName}

Agent Name:
${finalAgentName}

Subject:
${subject}

Summary:
${summary}

Description:
${description}

Relevant Knowledge Base Information:
${knowledgeContext || "No specific knowledge base article was found."}

Requirements:
- Start with "Dear ${requesterName},"
- End with:
  Best regards,
  ${finalAgentName}
- Use the knowledge base information when it is relevant.
- If the knowledge base information is not relevant, answer based on the ticket only.
- Do not invent university policies, deadlines, fees, or processing times.
- Do not mention "knowledge base" to the requester/customer.
- Do not use placeholders like [User], [Your Name], [Requester Name], or [Agent Name].
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
