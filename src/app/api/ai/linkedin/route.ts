import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body {
  profileText: string;
}

export async function POST(req: Request) {
  try {
    const { profileText } = (await req.json()) as Body;
    if (!profileText || profileText.trim().length < 30)
      return aiError("Please provide more profile text.", 400);

    const system = `You are a LinkedIn growth expert and personal branding strategist. Analyze the provided LinkedIn profile (or resume) and return a comprehensive optimization report. Return STRICT JSON:
{
  "headline": {
    "current": string (the current headline, or "Not provided"),
    "optimized": string (compelling, keyword-rich, under 220 chars),
    "score": number (0-100),
    "issues": string[] (specific issues with the current headline),
    "keywords": string[] (keywords that should be in the headline)
  },
  "about": {
    "current": string (summary of current about, or "Not provided"),
    "optimized": string (first-person, 3 short paragraphs, story-driven),
    "score": number (0-100),
    "issues": string[]
  },
  "experience": {
    "score": number (0-100),
    "issues": string[],
    "optimizedBullets": { "company": string, "role": string, "bullets": string[] }[]
  },
  "skills": {
    "current": string[],
    "suggested": string[] (top 20 skills to add, ordered by relevance),
    "missing": string[] (important skills not in the profile),
    "score": number (0-100)
  },
  "seo": {
    "score": number (0-100),
    "searchVisibility": number (0-100),
    "recruiterKeywords": string[] (5 keywords recruiters search for),
    "tips": string[] (4 actionable SEO tips)
  },
  "featured": string[] (3 things to feature — projects, posts, certifications),
  "bannerIdea": string (creative idea for their cover banner),
  "networkingMessages": {
    "connectionRequest": string (a personalized connection request message),
    "recruiterOutreach": string (a message to send to a recruiter),
    "referralRequest": string (a message asking for a referral),
    "thankYou": string (a post-interview thank-you message)
  },
  "profileHealth": {
    "strength": number (0-100),
    "activity": "Low" | "Medium" | "High",
    "recommendationsNeeded": number,
    "skillsMissing": number
  }
}
Return ONLY the JSON.`;

    const out = await complete(system, profileText, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse LinkedIn analysis.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "LinkedIn optimization failed");
  }
}
