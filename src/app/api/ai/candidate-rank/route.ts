import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Candidate {
  id: string;
  name: string;
  title: string;
  skills: string[];
  experienceYears: number;
  summary: string;
}

interface Body {
  jd: string;
  candidates: Candidate[];
}

export async function POST(req: Request) {
  try {
    const { jd, candidates } = (await req.json()) as Body;
    if (!jd || !candidates?.length) return aiError("Missing JD or candidates.", 400);

    const system = `You are a senior technical recruiter. Rank candidates against the job description. Return STRICT JSON:
{
  "rankings": [
    {
      "candidateId": string,
      "matchScore": number (0-100),
      "grade": "Excellent"|"Good"|"Fair"|"Poor",
      "matchedSkills": string[],
      "missingSkills": string[],
      "strengths": string[] (2 short points),
      "concerns": string[] (1-2 short points),
      "recommendation": "Strong Yes"|"Yes"|"Maybe"|"No"
    }
  ]
}
Rank by matchScore descending. Return ONLY the JSON.`;

    const user = `JOB DESCRIPTION:\n${jd}\n\nCANDIDATES:\n${candidates
      .map((c) => `ID: ${c.id}\nName: ${c.name}\nTitle: ${c.title}\nExperience: ${c.experienceYears} years\nSkills: ${c.skills.join(", ")}\nSummary: ${c.summary}`)
      .join("\n\n")}`;

    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse candidate rankings.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Candidate ranking failed");
  }
}
