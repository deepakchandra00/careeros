import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body {
  profileText: string;
  jd?: string;
}

export async function POST(req: Request) {
  try {
    const { profileText, jd } = (await req.json()) as Body;
    if (!profileText || profileText.trim().length < 30)
      return aiError("Please provide more profile text.", 400);

    const jdSection = jd
      ? `\n\nJOB DESCRIPTION TO MATCH AGAINST:\n${jd}`
      : "";

    const system = `You are a Naukri.com profile optimization expert for the Indian job market. Analyze the provided profile (or resume) and return a comprehensive optimization report. Return STRICT JSON:
{
  "resumeHeadline": {
    "current": string (current headline or "Not provided"),
    "optimized": string (Naukri headline, <60 chars, keyword rich),
    "score": number (0-100),
    "issues": string[]
  },
  "profileSummary": {
    "current": string (summary of current or "Not provided"),
    "optimized": string (2-3 sentences),
    "score": number (0-100),
    "issues": string[]
  },
  "keySkills": {
    "current": string[],
    "suggested": string[] (top 15 Naukri key skills tags),
    "missing": string[] (important skills not in profile),
    "score": number (0-100)
  },
  "employment": {
    "score": number (0-100),
    "issues": string[],
    "optimizedEntries": { "company": string, "role": string, "description": string }[]
  },
  "projects": {
    "score": number (0-100),
    "issues": string[],
    "optimizedProjects": { "name": string, "description": string }[]
  },
  "careerProfile": {
    "optimized": string (Naukri "Career Profile" / IT skills summary),
    "recommended": { "industry": string, "role": string, "location": string, "employmentType": string }[]
  },
  "recruiterVisibility": {
    "currentScore": number (0-100),
    "improvedScore": number (0-100 achievable after fixes),
    "topPercentileComparison": string (e.g. "Top 18% of React Leads"),
    "sectionScores": { "headline": number, "summary": number, "skills": number, "projects": number, "employment": number }
  },
  "jdMatch": ${jd ? `{ "matchScore": number, "missingKeywords": string[], "recommendations": string[] }` : "null"},
  "salarySuggestion": {
    "current": string (estimated current CTC or "Not provided"),
    "marketRange": string (e.g. "42-50 LPA"),
    "negotiationTip": string
  },
  "weeklySuggestions": { "skill": string, "reason": string, "action": string }[]
}
Return ONLY the JSON.`;

    const out = await complete(system, profileText + jdSection, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse Naukri analysis.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Naukri optimization failed");
  }
}
