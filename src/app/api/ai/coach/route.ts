import { chat } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Body {
  messages: Msg[];
  resumeContext?: string;
}

export async function POST(req: Request) {
  try {
    const { messages, resumeContext } = (await req.json()) as Body;
    if (!messages || !messages.length) return aiError("No messages.", 400);

    const system = `You are CareerOS AI, an elite, warm, and pragmatic career coach for tech professionals in India and globally. You give specific, actionable advice on resumes, ATS, LinkedIn, Naukri, interviews, salary negotiation, job search, and career transitions. Be concise but thorough. Use bullet points and concrete examples. When asked for letters or messages, write them ready-to-use.${
      resumeContext ? `\n\nUser's resume context:\n${resumeContext}` : ""
    }`;

    const history = [
      { role: "assistant" as const, content: system },
      ...messages,
    ];
    const out = await chat(history);
    return aiOk({ reply: out.trim() });
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Coach failed");
  }
}
