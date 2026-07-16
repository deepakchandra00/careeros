import { complete } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  text: string;
  action: "improve" | "rewrite" | "shorten" | "expand";
  context?: string;
}

const PROMPTS: Record<Body["action"], string> = {
  improve:
    "You are an elite resume writer and ATS optimization expert. Improve the given resume bullet point to be impactful, quantified, and keyword-rich. Keep it to ONE bullet (1-2 lines max). Start with a strong action verb. Do not add preamble.",
  rewrite:
    "You are an elite resume writer. Rewrite the given resume text to be professional, achievement-focused, and polished. Preserve the original meaning but elevate the language. Output ONLY the rewritten text, no preamble.",
  shorten:
    "You are a resume editor. Shorten the given resume text to be concise and punchy while keeping the core achievement and any metrics. Output ONLY the shortened text.",
  expand:
    "You are an elite resume writer. Expand the given resume bullet into 2-3 rich, quantified, achievement-oriented bullets. Each bullet starts with a strong action verb and includes measurable impact. Output ONLY the bullets, one per line, no numbering, no preamble.",
};

export async function POST(req: Request) {
  try {
    const { text, action, context } = (await req.json()) as Body;
    if (!text || !action)
      return aiError("Missing 'text' or 'action'.", 400);

    const system = PROMPTS[action];
    const user = context
      ? `Context: ${context}\n\nText to ${action}:\n${text}`
      : `Text to ${action}:\n${text}`;

    const out = await complete(system, user);
    return aiOk({ result: out.trim() });
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "AI rewrite failed");
  }
}
