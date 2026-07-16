import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 90;

type SectionType = "contact" | "summary" | "skills" | "experience" | "projects" | "education";

interface Body {
  section: SectionType;
  text: string;
}

const PROMPTS: Record<SectionType, string> = {
  contact: `Extract the contact info from this resume header. Return STRICT JSON:
{"name": string, "title": string, "email": string, "phone": string, "location": string, "linkedin": string, "github": string, "website": string}
Unknown fields = "". Title is the professional headline (e.g. "Technical Lead | React Architect"). Return ONLY JSON.`,
  summary: `Extract the professional summary from this text. Return STRICT JSON:
{"summary": string}
Return ONLY JSON.`,
  skills: `Extract ALL skills from this text. Return STRICT JSON:
{"skills": string[]}
List every skill mentioned, as an array. Return ONLY JSON.`,
  experience: `Extract ALL work experience entries from this text. Return STRICT JSON:
{"experience": [{"role": string, "company": string, "location": string, "start": string, "end": string, "bullets": string[]}]}
Capture EVERY job entry. For each, extract 2-4 key achievement bullets. Dates in source format (e.g. "Jan 2023"). Return ONLY JSON.`,
  projects: `Extract ALL projects from this text. Return STRICT JSON:
{"projects": [{"name": string, "description": string, "tech": string[], "link": string}]}
Capture EVERY project. Description = 1-2 sentences. tech = array of technologies. link = "" if not given. Return ONLY JSON.`,
  education: `Extract ALL education entries (and certifications if present). Return STRICT JSON:
{"education": [{"degree": string, "school": string, "location": string, "start": string, "end": string, "grade": string}], "certifications": [{"title": string, "subtitle": string, "description": "", "date": string}]}
Return ONLY JSON.`,
};

export async function POST(req: Request) {
  try {
    const { section, text } = (await req.json()) as Body;
    if (!section || !text || text.trim().length < 10)
      return aiError("Missing section or text.", 400);

    // Truncate each section to 3,500 chars max (keeps LLM response fast ~5-10s)
    const truncated = text.length > 3500 ? text.slice(0, 3500) + "\n[...truncated]" : text;

    const system = PROMPTS[section];
    const out = await complete(system, truncated, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError(`Failed to parse ${section} section.`);
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : `Chunked parse failed for section`);
  }
}
