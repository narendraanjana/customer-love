import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, EmailTag } from "@/types/emailTags";

const apiKey =
  process.env.API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  "";

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const EMAIL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tag: {
      type: Type.STRING,
      description: "Classification tag.",
      enum: Object.values(EmailTag),
    },
    confidence_score: {
      type: Type.NUMBER,
      description: "0 to 1 score.",
    },
    cleaned_message: {
      type: Type.STRING,
      description: "The core message without signatures/headers.",
    },
  },
  required: ["tag", "confidence_score", "cleaned_message"],
};

export const classifyEmail = async (content: string): Promise<AIResponse> => {
  if (!ai) {
    throw new Error(
      "Missing API_KEY (or GEMINI_API_KEY/GOOGLE_API_KEY) for @google/genai",
    );
  }
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
You are an expert customer support triager. Analyze the incoming email and perform exactly TWO tasks:
1. Assign exactly ONE appropriate tag based on these strict definitions:
   - 🔴 Bug: Critical/Data loss: Crashes, backup failure, apps won’t open, or any loss of user data.
   - 🟠 Bug: Functional: Technical issues where a feature is broken. Examples: PDF Export failing, wrong dates, Enter key not working, or specific technical bugs where something should work but doesn't.
   - 🟡 Bug: Visual/UI: Layout or aesthetic issues. Examples: Hard to read text, wrong colors, glitchy animations, or misaligned elements.
   - 🎨 Design/UX Pushback: Negative reactions to intentional design changes. Examples: User hates a new color scheme or dislikes a UX change.
   - 🎭 Content Issue: Errors in information. Examples: Missing stories, wrong quotes, errors in newsletters, blog posts, or static text.
   - 💡 Feature Request: Suggestions for new functionality or improvements to existing features.
   - ❓ How-to/Confusion: User is struggling to understand how to use a feature or is generally confused.
   - ❤️ Praise: Positive feedback, compliments, or expressions of gratitude.
   - 💸 Refund/Churn: Requests for refunds, billing issues, account deletions, or app deletions.
   - 🤝 Hiring/Collab: Recruitment inquiries, job applications, partnership proposals, or requests for professional collaboration.
   - ⚪️ Blank Message: Emails that contain no body or meaningful content.

2. Extract the "core message" from the email. Remove email headers, signatures, footers, and redundant pleasantries. Keep only the essential request or information.

Return the result as a JSON object matching the provided schema. Do not modify the essential meaning of the text during cleaning.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Email Content:\n${content}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: EMAIL_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}") as AIResponse;
};
