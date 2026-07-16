import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  currentSkills: string[];
  targetRole: string;
  experienceYears?: number;
}

export async function POST(req: Request) {
  try {
    const { currentSkills, targetRole, experienceYears } = (await req.json()) as Body;
    if (!currentSkills?.length || !targetRole)
      return aiError("Missing skills or target role.", 400);

    const system = `You are a senior technical hiring manager. Compare the candidate's current skills to the requirements of the target role. Return STRICT JSON:
{
  "gapScore": number (0-100, higher = bigger gap),
  "currentLevel": string (e.g. "Mid-level Engineer"),
  "targetLevel": string,
  "haveSkills": string[] (skills they have that are relevant),
  "missingSkills": { "skill": string, "importance": "Critical"|"High"|"Medium", "why": string }[],
  "strengthsToLeverage": string[] (3-4),
  "quickWins": string[] (3 skills they can learn fastest),
  "longTermBets": string[] (2 deeper skills for seniority)
}
Return ONLY the JSON.`;

    const user = `Target role: ${targetRole}\nExperience: ${experienceYears ?? "N/A"} years\nCurrent skills: ${currentSkills.join(", ")}`;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse skill gap.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Skill gap failed");
  }
}
