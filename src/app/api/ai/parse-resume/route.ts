import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 180;

interface Body {
  text: string;
}

const SYSTEM = `You are a fast resume parser. Extract the resume into this JSON shape. Be CONCISE: limit experience bullets to 3 per role, limit projects to 3, limit skills to 15. If a field is unknown use empty string/array.
{
  "name": string,
  "title": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedin": string,
  "github": string,
  "website": string,
  "summary": string (2-3 sentences max),
  "experience": [{ "role": string, "company": string, "location": string, "start": string, "end": string, "bullets": string[] (max 3) }],
  "skills": string[] (max 15),
  "projects": [{ "name": string, "description": string (1 sentence), "tech": string[], "link": string }] (max 3),
  "education": [{ "degree": string, "school": string, "location": string, "start": string, "end": string, "grade": string }],
  "certifications": [{ "title": string, "subtitle": string, "description": string, "date": string }],
  "languages": string[],
  "awards": [{ "title": string, "subtitle": string, "description": string, "date": string }],
  "publications": [{ "title": string, "subtitle": string, "description": string, "date": string }],
  "interests": string[],
  "references": [{ "name": string, "role": string, "company": string, "contact": string }]
}
Return ONLY the JSON. No fences, no commentary. Be fast and concise.`;

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as Body;
    if (!text || text.trim().length < 30)
      return aiError("Could not extract enough text from the file.", 400);

    // Truncate to avoid LLM timeouts on large/noisy PDF extractions.
    // 3,000 chars captures name, contact, summary, skills, recent experience,
    // and education — enough for a complete parse. The LLM responds in 30-60s.
    const truncated = text.length > 3000 ? text.slice(0, 3000) + "\n[...truncated]" : text;

    // Attempt 1: standard
    let out = await complete(SYSTEM, truncated, { json: true });
    let parsed = extractJson(out);

    // Attempt 2: repair pass — show the model its broken output, ask for valid JSON
    if (!parsed) {
      const repairSys =
        "The previous model output was supposed to be valid JSON but failed to parse. Return ONLY valid minified JSON (no fences, no commentary) fixing any syntax errors. Output the complete corrected object.";
      out = await complete(repairSys, out, { json: true });
      parsed = extractJson(out);
    }

    // Attempt 3: one more, more forceful
    if (!parsed) {
      out = await complete(
        "Output ONLY a single minified JSON object with no extra characters whatsoever. No backticks. No prose. Start with { and end with }.",
        `Resume text:\n${text}`,
        { json: true }
      );
      parsed = extractJson(out);
    }

    if (!parsed)
      return aiError(
        "The AI could not return a valid parsed resume. Please try a different file or paste the content manually."
      );

    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Resume parse failed");
  }
}
