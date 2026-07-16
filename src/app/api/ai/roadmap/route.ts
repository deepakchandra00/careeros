import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  missingSkills: string[];
  targetRole: string;
}

export async function POST(req: Request) {
  try {
    const { missingSkills, targetRole } = (await req.json()) as Body;
    if (!missingSkills?.length || !targetRole)
      return aiError("Missing skills or target role.", 400);

    const system = `You are a senior career mentor and learning strategist. Create a structured upskilling roadmap. Return STRICT JSON:
{
  "title": string,
  "overview": string (1-2 sentences),
  "plan30": { "goal": string, "weeks": { "week": number, "focus": string, "tasks": string[] }[] },
  "plan60": { "goal": string, "weeks": { "week": number, "focus": string, "tasks": string[] }[] },
  "plan90": { "goal": string, "weeks": { "week": number, "focus": string, "tasks": string[] }[] },
  "resources": { "skill": string, "resource": string, "type": "Course"|"Book"|"Docs"|"Project"|"Video" }[],
  "milestones": string[] (4 milestones to validate progress),
  "certifications": string[] (3 relevant certifications)
}
Cover weeks 1-12 distributed across the three phases. Return ONLY the JSON.`;

    const user = `Target role: ${targetRole}\nMissing skills to cover: ${missingSkills.join(", ")}`;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse roadmap.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Roadmap failed");
  }
}
