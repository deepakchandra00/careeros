import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resumeText: string;
  jd?: string;
}

export async function POST(req: Request) {
  try {
    const { resumeText, jd } = (await req.json()) as Body;
    if (!resumeText) return aiError("Missing resume.", 400);

    const system = `You are a senior engineering interviewer at a FAANG company. Based on the candidate's resume${jd ? " and the target job description" : ""}, generate a realistic interview prep set. Return STRICT JSON:
{
  "hr": string[] (4 HR/behavioral questions),
  "technical": string[] (4 technical questions tailored to their stack),
  "behavioral": string[] (3 STAR-format behavioral questions),
  "systemDesign": string[] (3 system design questions appropriate to seniority),
  "coding": string[] (3 coding problems with topic tags like "Arrays, Two Pointers"),
  "architecture": string[] (2 architecture/tradeoff questions),
  "tips": string[] (4 prep tips specific to this candidate),
  "likelyTopics": string[] (5 topics they'll surely be asked about)
}
Return ONLY the JSON.`;

    const user = `RESUME:\n${resumeText}${jd ? `\n\nTARGET JD:\n${jd}` : ""}`;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse interview questions.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Interview prep failed");
  }
}
