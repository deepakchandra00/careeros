import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  code: string;
  language: string;
  problem: { title: string; description: string; difficulty: string };
}

export async function POST(req: Request) {
  try {
    const { code, language, problem } = (await req.json()) as Body;
    if (!code || !problem) return aiError("Missing code or problem.", 400);

    const system = `You are a senior engineering interviewer reviewing a coding solution. Analyze the candidate's code and return STRICT JSON:
{
  "correctness": "Correct"|"Mostly Correct"|"Has Bugs"|"Incorrect",
  "score": number (0-100),
  "complexity": { "time": string (e.g. "O(n log n)"), "space": string },
  "strengths": string[] (2-3 things done well),
  "issues": string[] (bugs, edge cases, or improvements — be specific with line references),
  "suggestions": string[] (2-3 actionable improvements),
  "betterApproach": string (1-2 sentence description of a better approach if applicable, else "N/A")
}
Return ONLY the JSON.`;

    const user = `Problem (${problem.difficulty}): ${problem.title}\n${problem.description}\n\nLanguage: ${language}\n\nSolution:\n\`\`\`${language}\n${code}\n\`\`\``;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse code review.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Code review failed");
  }
}
