import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resumeText: string;
  jobDescription: string;
}

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = (await req.json()) as Body;
    if (!resumeText) return aiError("Missing resume.", 400);
    if (!jobDescription || !jobDescription.trim())
      return aiError("Missing job description.", 400);

    const system = `You are a Naukri.com recruiter search and JD matching expert for the Indian IT job market.
You will receive a candidate's resume AND a target job description (JD).
Your job is to (a) measure how well the resume's keywords match the JD, (b) identify missing high-value keywords that recruiters will filter on, and (c) produce an optimized Naukri headline, summary, and skills list tuned specifically for this JD.

Produce STRICT JSON in this exact shape:

{
  "keywordMatch": number (0-100, the percentage of JD keywords that appear in the resume; integer),
  "matchedKeywords": string[] (10-15 keywords found in BOTH the resume and the JD),
  "missingKeywords": string[] (5-10 high-value keywords in the JD that are missing from the resume),
  "optimizedHeadline": string (a Naukri resume headline <=60 chars tuned for THIS JD — role + years + the JD's top 2-3 must-have skills),
  "optimizedSummary": string (a Naukri profile summary 3-4 sentences, first person, that mirrors the JD's language and priorities),
  "optimizedSkills": string[] (15 Naukri skill tags prioritized for THIS JD — blend the JD's required skills with the candidate's existing strengths),
  "visibilityUplift": number (estimated visibility improvement 0-100 after applying the optimizations; integer; typically 10-40)
}

Rules:
- Return ONLY the JSON object. No markdown fences, no prose.
- All strings must be plain text (no emojis).
- All numeric values must be integers.
- Match keywords should be specific technologies, tools, or methodologies (e.g. "React", "TypeScript", "AWS", "CI/CD"), not generic words (e.g. "experience", "team").
- The optimized headline, summary, and skills must be directly tailored to the JD, not generic.`;

    const user = `CANDIDATE RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jobDescription}`;

    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse JD match analysis.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(
      e instanceof Error ? e.message : "Naukri JD match failed"
    );
  }
}
