import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resumeText: string;
  targetLevel: string; // entry | senior | lead | architect | manager
  company?: string;
  tone?: string;
}

const LEVEL_DESC: Record<string, string> = {
  entry: "an entry-level/junior engineer",
  senior: "a senior engineer",
  lead: "a tech lead",
  architect: "a solutions architect",
  manager: "an engineering manager",
};

export async function POST(req: Request) {
  try {
    const { resumeText, targetLevel, company, tone } = (await req.json()) as Body;
    if (!resumeText || !targetLevel) return aiError("Missing fields.", 400);

    const system = `You are an elite resume writer who tailors resumes for specific seniority levels, companies, and tones. Rewrite the resume summary and experience bullets to position the candidate as ${LEVEL_DESC[targetLevel] ?? "a senior engineer"}${company ? ` targeting ${company}` : ""}${tone ? ` with a ${tone} tone` : ""}. Return STRICT JSON:
{
  "newTitle": string (new resume headline/title),
  "newSummary": string (rewritten professional summary, 2-3 sentences),
  "rewrittenExperience": { "role": string, "company": string, "bullets": string[] }[],
  "suggestedSkills": string[] (skills to add/emphasize for this level),
  "rationale": string[] (3 bullets explaining the changes made)
}
Return ONLY the JSON.`;

    const user = `Original resume:\n${resumeText}`;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse rewrite.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Resume rewrite failed");
  }
}
