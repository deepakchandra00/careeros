import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  name: string;
  resumeText: string;
  targetRole?: string;
}

export async function POST(req: Request) {
  try {
    const { name, resumeText, targetRole } = (await req.json()) as Body;
    if (!name || !resumeText)
      return aiError("Missing name or resume.", 400);

    const system = `You are an expert networking strategist and professional copywriter who specializes in LinkedIn outreach.
You will receive a candidate's name, resume, and an optional target role.
Write 4 personalized, professional, ready-to-send networking message templates.

Each message must be:
- Personalized (reference the candidate's actual skills, role, or a relevant achievement from the resume)
- Concise and natural-sounding (not generic, not salesy)
- Properly formatted with a greeting, body, and sign-off
- Free of emojis and placeholders the user would have to fill in beyond [Recipient Name] / [Company Name] where unavoidable

Return STRICT JSON in this exact shape:

{
  "connectionRequest": string (under 300 chars — LinkedIn connection request note, friendly and specific, references a shared interest or the candidate's work),
  "recruiterMessage": string (150-220 words — first message to a recruiter, references the candidate's target role, top 1-2 quantified wins, and a soft ask for a chat),
  "thankYou": string (90-140 words — post-interview thank you note, references a specific conversation point, restates fit, leaves the door open),
  "referralRequest": string (120-180 words — message to a connection asking for a referral to a specific role at their company, polite and low-pressure, makes it easy to say no)
}

Rules:
- Address the recipient as "Hi [Name]," unless the message type implies otherwise.
- Sign off as "${name}".
- Return ONLY the JSON. No markdown fences, no commentary.`;

    const user = `CANDIDATE NAME: ${name}\n${
      targetRole ? `TARGET ROLE: ${targetRole}\n` : ""
    }RESUME:\n${resumeText}`;

    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to parse networking messages.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(
      e instanceof Error ? e.message : "Networking message generation failed"
    );
  }
}
