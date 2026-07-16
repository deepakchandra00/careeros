import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  experienceYears: number;
  role: string;
  location: string;
  skills: string[];
  currentCtcLPA?: number;
}

export async function POST(req: Request) {
  try {
    const b = (await req.json()) as Body;
    if (b.role == null) return aiError("Missing role.", 400);

    const system = `You are a senior compensation analyst with deep knowledge of the Indian and global tech job market. Given the candidate profile, return STRICT JSON:
{
  "marketSalaryINR": { "low": number, "high": number, "median": number } (in LPA),
  "marketSalaryUSD": { "low": number, "high": number } (in USD),
  "topCompanies": string[] (5 companies that hire this role),
  "demandLevel": "Very High"|"High"|"Medium"|"Low",
  "growthOutlook": string (1 sentence),
  "negotiationTips": string[] (4 tips),
  "perks": string[] (4 common perks for this role),
  "comparableRoles": string[] (3 alternative roles to explore)
}
Return ONLY the JSON.`;

    const user = `Role: ${b.role}\nExperience: ${b.experienceYears} years\nLocation: ${b.location}\nSkills: ${b.skills.join(", ")}\nCurrent CTC: ${b.currentCtcLPA ?? "N/A"} LPA`;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse salary data.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Salary prediction failed");
  }
}
