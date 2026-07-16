import { complete } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resumeText: string;
  jd: string;
  tone?: string;
}

export async function POST(req: Request) {
  try {
    const { resumeText, jd, tone } = (await req.json()) as Body;
    if (!resumeText || !jd) return aiError("Missing resume or JD.", 400);

    const system = `You are an expert cover letter writer. Write a tailored, persuasive cover letter (around 250-320 words) that connects the candidate's resume to the job description. Use a ${tone || "confident, professional"} tone. Address it "Dear Hiring Manager,". Sign off with the candidate's name from the resume. Output ONLY the cover letter text, no preamble or markdown.`;
    const user = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jd}`;
    const out = await complete(system, user);
    return aiOk({ letter: out.trim() });
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Cover letter failed");
  }
}
