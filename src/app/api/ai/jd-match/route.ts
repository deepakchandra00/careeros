import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resumeText: string;
  jd: string;
}

export async function POST(req: Request) {
  try {
    const { resumeText, jd } = (await req.json()) as Body;
    if (!resumeText || !jd) return aiError("Missing resume or JD.", 400);

    const system = `You are an expert technical recruiter and ATS matcher. Compare the candidate's resume to the job description. Return STRICT JSON:
{
  "matchScore": number (0-100),
  "matchGrade": "Excellent"|"Good"|"Fair"|"Poor",
  "matchedSkills": string[] (skills present in both),
  "missingSkills": string[] (skills in JD but not resume),
  "extraSkills": string[] (resume skills not in JD, a plus),
  "strengths": string[] (2-4),
  "gaps": string[] (2-4 areas to improve),
  "rewriteSuggestions": string[] (3-5 concrete suggestions to tailor the resume for this JD)
}
Return ONLY the JSON.`;

    const user = `RESUME:\n${resumeText}\n\n---\n\nJOB DESCRIPTION:\n${jd}`;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse JD match.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "JD match failed");
  }
}
