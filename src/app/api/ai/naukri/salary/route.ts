import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resumeText: string;
  currentSalary?: string;
}

export async function POST(req: Request) {
  try {
    const { resumeText, currentSalary } = (await req.json()) as Body;
    if (!resumeText) return aiError("Missing resume.", 400);

    const hasSalary = Boolean(currentSalary && currentSalary.trim().length > 0);

    const system = `You are a senior Indian IT compensation analyst with deep knowledge of Naukri salary data, market bands by role + experience + city, and Indian IT hiring norms.
You will receive a candidate's resume${hasSalary ? " and their current salary string" : ""}.
Estimate the candidate's market salary range in Indian Lakhs Per Annum (LPA) based on their role, years of experience, top skills, location, and seniority signals from the resume.

Produce STRICT JSON in this exact shape:

{
  "current": number (the parsed current salary in LPA, or 0 if not provided / not parseable; integer),
  "marketMin": number (lower end of the realistic market band in LPA; integer),
  "marketMax": number (upper end of the realistic market band in LPA; integer),
  "marketMedian": number (median of the market band in LPA; integer or one-decimal float),
  "currency": "LPA",
  "reasoning": string (2-3 sentence explanation of how the band was derived, referencing the candidate's role, experience, skills, and city),
  "factors": string[] (4-6 short factor strings, e.g. "8+ years React experience", "Leadership experience", "Bangalore market", "Senior IC role", "Cloud + DevOps premium")
}

Rules:
- Return ONLY the JSON object. No markdown fences, no prose.
- All strings must be plain text (no emojis).
- All numeric values must be non-negative numbers (current, marketMin, marketMax, marketMedian).
- marketMin must be less than marketMax; marketMedian must be between them.
- If currentSalary is provided, parse it to a number in LPA (handle formats like "8 LPA", "8.5 LPA", "12,00,000", "12 lakh", "1000000"). If unparseable, set current to 0.
- Reasoning and factors should be specific to THIS candidate's resume, not generic.`;

    const user = `CANDIDATE RESUME:\n${resumeText}\n\n${
      hasSalary
        ? `CURRENT SALARY (user supplied):\n${currentSalary}`
        : `CURRENT SALARY:\n(not supplied — leave "current" as 0)`
    }`;

    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse salary estimate.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(
      e instanceof Error ? e.message : "Naukri salary estimation failed"
    );
  }
}
