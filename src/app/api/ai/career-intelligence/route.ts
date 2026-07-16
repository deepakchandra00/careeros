import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body {
  resumeText: string;
  linkedinScore?: number;
  naukriScore?: number;
  atsScore?: number;
  interviewReadiness?: number;
  codingScore?: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.resumeText || body.resumeText.trim().length < 30)
      return aiError("Please provide resume/profile text.", 400);

    const system = `You are a Career Intelligence Engine. Combine the candidate's profile data into a unified career health assessment. Return STRICT JSON:
{
  "careerHealth": {
    "score": number (0-100, weighted average of all sub-scores),
    "percentile": number (0-100, what % of peers they're better than),
    "trend": "Improving" | "Stable" | "Needs Work",
    "summary": string (1 sentence)
  },
  "scores": {
    "resume": { "score": number, "label": "ATS Score", "status": "Excellent"|"Good"|"Fair"|"Poor" },
    "linkedin": { "score": number, "label": "LinkedIn SEO", "status": string },
    "naukri": { "score": number, "label": "Naukri Visibility", "status": string },
    "github": { "score": number, "label": "GitHub Activity", "status": string, "connected": false },
    "portfolio": { "score": number, "label": "Portfolio", "status": string, "connected": false },
    "interview": { "score": number, "label": "Interview Readiness", "status": string },
    "coding": { "score": number, "label": "Coding Practice", "status": string }
  },
  "salaryPotential": {
    "low": number (LPA),
    "high": number (LPA),
    "median": number (LPA),
    "currency": "INR"
  },
  "topMatchingRoles": {
    "title": string,
    "matchScore": number (0-100),
    "stars": number (1-5),
    "reason": string (why they match)
  }[],
  "weeklyInsight": string (a personalized weekly insight, e.g. "Your profile is now 95% better than 83% of React Technical Leads. Add Docker to your skills to reach the top 5%."),
  "actionItems": { "priority": "High"|"Medium"|"Low", "action": string, "module": string }[]
}
Use the provided sub-scores where given (linkedinScore, naukriScore, atsScore, interviewReadiness, codingScore); synthesize realistic values for missing ones (github, portfolio). Return ONLY the JSON.`;

    const user = `Profile:\n${body.resumeText}\n\nProvided scores: ATS=${body.atsScore ?? "N/A"}, LinkedIn=${body.linkedinScore ?? "N/A"}, Naukri=${body.naukriScore ?? "N/A"}, Interview=${body.interviewReadiness ?? "N/A"}, Coding=${body.codingScore ?? "N/A"}`;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse career intelligence.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Career intelligence failed");
  }
}
