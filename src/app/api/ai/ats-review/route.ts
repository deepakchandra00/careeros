import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resumeText: string;
}

export async function POST(req: Request) {
  try {
    const { resumeText } = (await req.json()) as Body;
    if (!resumeText || resumeText.trim().length < 20)
      return aiError("Please provide resume text.", 400);

    const system = `You are an expert ATS (Applicant Tracking System) analyzer and senior technical recruiter. Analyze the resume text and return a STRICT JSON object with this exact shape:
{
  "atsScore": number (0-100, integer),
  "atsGrade": "A"|"B"|"C"|"D",
  "missingKeywords": string[] (5-8 technical keywords/skills the resume lacks for a senior engineering role),
  "weakBullets": { "count": number, "examples": string[] (2-3 weak bullet points found) },
  "grammarIssues": { "count": number, "examples": string[] },
  "formattingIssues": { "count": number, "examples": string[] },
  "suggestedSalaryINR": { "low": number (LPA), "high": number (LPA) },
  "interviewProbability": "High"|"Medium"|"Low",
  "strengths": string[] (3-4 strengths),
  "topRecommendations": string[] (3-4 actionable recommendations)
}
Return ONLY the JSON.`;

    const out = await complete(system, resumeText, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse ATS analysis.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "ATS review failed");
  }
}
