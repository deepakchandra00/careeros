import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  query: string;
  role?: string;
  location?: string;
}

export async function POST(req: Request) {
  try {
    const { query, role, location } = (await req.json()) as Body;
    if (!query) return aiError("Missing query.", 400);

    const system = `You are an AI job search aggregator. Given a search query, simulate curated, realistic job listings across LinkedIn, Naukri, Indeed, Wellfound, and Glassdoor (use plausible company names and realistic details). Return STRICT JSON:
{
  "results": {
    "title": string,
    "company": string,
    "location": string,
    "experience": string,
    "salary": string,
    "source": "LinkedIn"|"Naukri"|"Indeed"|"Wellfound"|"Glassdoor",
    "posted": string (e.g. "2d ago"),
    "matchScore": number (0-100),
    "tags": string[],
    "remote": boolean,
    "url": string
  }[],
  "totalFound": number,
  "marketInsight": string (1 sentence on demand),
  "topHiringCompanies": string[] (5)
}
Return 8-10 realistic results. Return ONLY the JSON.`;

    const user = `Search query: ${query}\nPreferred role: ${role ?? "any"}\nLocation: ${location ?? "India"}`;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse job search results.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Job search failed");
  }
}
