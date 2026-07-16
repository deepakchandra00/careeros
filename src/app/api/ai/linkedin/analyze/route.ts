import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resumeText: string;
  linkedinText?: string;
}

export async function POST(req: Request) {
  try {
    const { resumeText, linkedinText } = (await req.json()) as Body;
    if (!resumeText) return aiError("Missing resume.", 400);

    const hasLinkedin = Boolean(linkedinText && linkedinText.trim().length > 0);

    const system = `You are a LinkedIn growth expert, executive branding strategist, and recruiter-focused SEO specialist.
You will receive a candidate's resume${hasLinkedin ? " AND their current LinkedIn profile text" : ""}.
${hasLinkedin ? "Compare the two and surface gaps and rewrites." : "Treat the resume as the source of truth; assume the candidate has not yet built a LinkedIn profile (so current fields are empty)."}

Perform a deep, section-by-section optimization. Produce STRICT JSON in this exact shape:

{
  "headline": {
    "current": string,
    "score": number (0-100, how strong the current headline is; 0 if none),
    "issues": string[] (concise issues found in current headline; empty array if none),
    "suggested": string (an optimized, keyword-rich headline under 220 chars)
  },
  "about": {
    "current": string (the current About text or empty string),
    "score": number (0-100),
    "checks": { "label": string, "pass": boolean }[] (exactly 7 checks covering: first-person voice, opening hook, keyword density, quantified achievements, length 150-300 words, includes CTA, shows personality),
    "suggested": string (a fully rewritten About section, 3 short paragraphs, first person)
  },
  "experience": {
    "company": string,
    "role": string,
    "currentBullets": string[] (current bullets from the LinkedIn/profile text, or derived from resume; may be empty),
    "rewrittenBullets": string[] (3-5 LinkedIn-optimized, impact-led bullets per role)
  }[],
  "skillsGap": {
    "resume": string[] (skills found on the resume),
    "linkedin": string[] (skills found on the LinkedIn profile; empty if no profile text),
    "market": string[] (10 in-demand market skills for this person's role/industry),
    "missing": string[] (skills the candidate should add to LinkedIn — market skills not already on profile/resume)
  },
  "featured": string[] (6 things to feature — GitHub repo, portfolio link, case study, architecture diagram, blog post, open source contribution, etc. — each as a short descriptive line),
  "seoScore": number (overall LinkedIn SEO / discoverability score 0-100),
  "keywordCoverage": { "keyword": string, "present": boolean }[] (8-12 high-value recruiter search keywords with whether they are present in the supplied profile/resume),
  "recruiterKeywords": string[] (8 keywords recruiters actually search for this profile),
  "profileHealth": {
    "strength": number (overall profile strength 0-100),
    "activity": string ("Low" | "Medium" | "High"),
    "postsNeeded": number (how many more posts in the next 30 days),
    "recommendationsNeeded": number (how many more recommendations to request),
    "skillsMissing": number (count of missing critical skills),
    "headlineStatus": string ("Excellent" | "Good" | "Needs Work")
  },
  "bannerIdea": {
    "text": string (a short tagline / text to display on the banner),
    "layout": string (a one-sentence description of the suggested visual layout, colors, and placement)
  }
}

Rules:
- Return ONLY the JSON object. No markdown fences, no prose.
- All strings must be plain text (no emojis).
- Use realistic, specific numbers in bullets wherever the resume supports it.
- If a field is unknown because no LinkedIn text was supplied, still produce a sensible best-effort value (do not use null).`;

    const user = `CANDIDATE RESUME:\n${resumeText}\n\n${
      hasLinkedin
        ? `CURRENT LINKEDIN PROFILE TEXT:\n${linkedinText}`
        : `CURRENT LINKEDIN PROFILE TEXT:\n(none supplied — treat all "current" fields as empty)`
    }`;

    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse LinkedIn analysis.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(
      e instanceof Error ? e.message : "LinkedIn analysis failed"
    );
  }
}
