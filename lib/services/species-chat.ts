/* eslint-disable */
import OpenAI from "openai";

// initialize client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_INSTRUCTION = `
You are a chatbot that ONLY answers questions about animals, species, and wildlife biology.
You can discuss habitat, diet, behavior, anatomy, conservation status, ecosystems, taxonomy, and similar topics.

If the user asks something unrelated (coding, politics, math, general trivia, personal advice, etc.),
respond politely and briefly that you can only help with animal/species-related questions,
and invite them to ask about an animal or species instead.

When answering:
- Be accurate and clear.
- If unsure, say what you’re unsure about.
- Keep answers concise unless the user asks for more detail.
`;

export async function generateResponse(message: string): Promise<string> {
  try {
    // if empty message
    const trimmed = (message ?? "").trim();
    if (!trimmed) return "Please ask a question about an animal or species.";

    // gpt-5-nano limits: 40,000 TPM, 3 RPM 200 RPD, 200,000 TPD
    const model = process.env.OPENAI_MODEL ?? "gpt-5-nano";

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: trimmed },
      ],
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0
      ? text
      : "Sorry, I couldn’t generate a response at this moment. Please try again with a species-related question.";
  } catch (err) {
    // fallback message
    return "Sorry, I ran into a problem generating a response. Please try again in a moment.";
  }
}
