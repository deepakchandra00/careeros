import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  action: "generate" | "score";
  role?: string;
  type?: string; // HR | Technical | Behavioral | System Design | Leadership
  answer?: string;
  question?: string;
  resumeContext?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (body.action === "generate") {
      const system = `You are an expert interviewer for ${body.role ?? "a software engineer"} roles. Generate ${body.type ?? "technical"} interview questions. Return STRICT JSON:
{
  "questions": [
    {
      "id": string,
      "question": string,
      "type": "${body.type ?? "Technical"}",
      "difficulty": "Easy"|"Medium"|"Hard",
      "topic": string,
      "modelAnswer": string (a strong 2-3 sentence answer),
      "evaluationCriteria": string[] (3-4 things to look for in the answer)
    }
  ]
}
Generate 5 questions. Return ONLY the JSON.`;
      const out = await complete(system, `Role: ${body.role ?? "Software Engineer"}\nType: ${body.type ?? "Technical"}${body.resumeContext ? `\nCandidate context: ${body.resumeContext}` : ""}`, { json: true });
      const parsed = extractJson(out);
      if (!parsed) return aiError("Failed to generate questions.");
      return aiOk(parsed);
    }

    if (body.action === "score") {
      if (!body.question || !body.answer) return aiError("Missing question or answer.", 400);
      const system = `You are an expert interviewer scoring a candidate's answer. Return STRICT JSON:
{
  "score": number (0-100),
  "grade": "Excellent"|"Good"|"Average"|"Weak"|"Poor",
  "strengths": string[] (1-2 things done well),
  "improvements": string[] (1-2 things to improve),
  "modelAnswer": string (a better version of the answer in 2-3 sentences),
  "feedback": string (1 sentence summary feedback)
}
Return ONLY the JSON.`;
      const user = `Question: ${body.question}\n\nCandidate's answer: ${body.answer}`;
      const out = await complete(system, user, { json: true });
      const parsed = extractJson(out);
      if (!parsed) return aiError("Failed to score answer.");
      return aiOk(parsed);
    }

    return aiError("Invalid action. Use 'generate' or 'score'.", 400);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Mock interview failed");
  }
}
