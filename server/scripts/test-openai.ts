import { openai } from "../src/config/openai.js";

async function main() {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: "Say hello from OpenAI.",
  });

  console.log(response.output_text);
}

main();
