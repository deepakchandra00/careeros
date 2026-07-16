import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resumeText: string;
  naukriText?: string;
}

export async function POST(req: Request) {
  try {
    const { resumeText, naukriText } = (await req.json()) as Body;
    if (!resumeText) return aiError("Missing resume.", 400);

    const hasNaukri = Boolean(naukriText && naukriText.trim().length > 0);

    const system = `You are a Naukri.com profile optimization expert for the Indian IT job market, with deep expertise in recruiter search ranking, keyword density, and Indian hiring norms.
You will receive a candidate's resume${hasNaukri ? " AND their current Naukri profile text" : ""}.
${hasNaukri ? "Compare the two and surface gaps and rewrites for every section." : "Treat the resume as the source of truth; assume the candidate has not yet built a Naukri profile (so all 'current' fields should be inferred from the resume or marked empty)."}

Perform a deep, section-by-section optimization tuned for Naukri's recruiter search algorithm. Produce STRICT JSON in this exact shape:

{
  "resumeHeadline": {
    "current": string (current Naukri resume headline if supplied, else empty string),
    "score": number (0-100, how strong the current headline is; 0 if none),
    "issues": string[] (concise issues found in current headline; empty array if none),
    "suggested": string (an optimized Naukri resume headline, <=60 chars, keyword rich, role + years + top skills)
  },
  "profileSummary": {
    "current": string (current profile summary if supplied, else empty string),
    "score": number (0-100),
    "suggested": string (a fully rewritten Naukri profile summary, 3-4 sentences, first person, keyword dense, quantified)
  },
  "keySkills": {
    "market": string[] (15 in-demand Naukri skill tags for this role/industry),
    "resume": string[] (skills found on the resume),
    "naukri": string[] (skills found on the Naukri profile; empty array if no Naukri text supplied),
    "missing": string[] (skills the candidate should add to their Naukri profile — market skills not already on profile/resume)
  },
  "projects": {
    "name": string,
    "currentBullets": string[] (current bullets if Naukri text supplied, else derived from resume project description; may be empty),
    "rewrittenBullets": string[] (3-5 Naukri-optimized, impact-led bullets per project)
  }[],
  "employment": {
    "company": string,
    "role": string,
    "currentDescription": string (current Naukri employment description if supplied, else derived from resume; may be empty),
    "rewrittenDescription": string (a polished 3-4 sentence Naukri employment description, impact-led, with metrics)
  }[],
  "careerProfile": {
    "industry": string (current industry, e.g. IT-Software / Software Services),
    "role": string (current functional role, e.g. Software Engineer),
    "location": string (current location),
    "salary": string (current salary string, e.g. "Not disclosed" or "8.0 LPA"),
    "noticePeriod": string (current notice, e.g. "15 days" / "1 Month" / "90 Days" / "Serving"),
    "employmentType": string (current employment type, e.g. "Permanent" / "Full Time"),
    "recommended": {
      "industry": string,
      "role": string,
      "location": string,
      "salary": string (recommended salary range string, e.g. "12.0 - 16.0 LPA"),
      "noticePeriod": string,
      "employmentType": string
    }
  },
  "visibility": {
    "headline": number (0-100, how well the current headline ranks for recruiter searches),
    "summary": number,
    "skills": number,
    "projects": number,
    "employment": number,
    "overall": number (overall Naukri search visibility score 0-100)
  },
  "weeklySuggestions": {
    "type": string (one of: "skill" / "version" / "keyword" / "activity" / "profile" — the category of suggestion),
    "title": string (short title, e.g. "New React skill trending" / "TypeScript version update" / "Next.js 15 released"),
    "description": string (1-2 sentence explanation of why this matters for Naukri visibility),
    "action": string (concrete action to take, e.g. "Add 'React 18' to your Key Skills")
  }[]
}

Rules:
- Return ONLY the JSON object. No markdown fences, no prose.
- All strings must be plain text (no emojis).
- Use realistic, specific numbers in bullets wherever the resume supports it.
- If a field is unknown because no Naukri text was supplied, still produce a sensible best-effort value (do not use null).
- All numeric scores must be integers between 0 and 100.
- weeklySuggestions should have 5-7 items, focused on Indian IT market trends relevant to the candidate's role.`;

    const user = `CANDIDATE RESUME:\n${resumeText}\n\n${
      hasNaukri
        ? `CURRENT NAUKRI PROFILE TEXT:\n${naukriText}`
        : `CURRENT NAUKRI PROFILE TEXT:\n(none supplied — treat all "current" fields as empty)`
    }`;

    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse Naukri analysis.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(
      e instanceof Error ? e.message : "Naukri analysis failed"
    );
  }
}
