/**
 * AI helper using Puter.js (client-side, free, no API key needed).
 *
 * Puter.js is loaded via <script> in layout.tsx.
 * All AI calls happen client-side (browser), not server-side.
 *
 * The server-side API routes (/api/ai/*) are kept as fallbacks but
 * the primary AI calls now go through Puter.js directly from the client.
 */

type Message = { role: "assistant" | "user" | "system"; content: string };

/** Get the Puter.js instance from the window object. */
function getPuter(): Promise<NonNullable<Window["puter"]>> {
  return new Promise((resolve, reject) => {
    // Wait for Puter.js to load (it's loaded async in layout.tsx)
    let attempts = 0;
    const check = () => {
      if (typeof window !== "undefined" && window.puter?.ai?.chat) {
        resolve(window.puter);
      } else if (attempts < 50) {
        attempts++;
        setTimeout(check, 200);
      } else {
        reject(new Error("Puter.js failed to load. Check your internet connection."));
      }
    };
    check();
  });
}

/**
 * Generic single-shot completion using Puter.js.
 * Works client-side — no server API call needed.
 */
export async function complete(
  systemPrompt: string,
  userPrompt: string,
  opts: { json?: boolean } = {}
): Promise<string> {
  const puter = await getPuter();

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  if (opts.json) {
    messages[0] = {
      role: "system",
      content:
        systemPrompt +
        " You MUST respond with ONLY valid minified JSON. No markdown fences, no commentary.",
    };
  }

  try {
    const response = await puter.ai.chat(messages, { model: "gpt-4o-mini", stream: false });
    // Puter.js returns { message: { content: "..." } } or similar
    const content = response?.message?.content || response?.text || (typeof response === "string" ? response : "");
    return typeof content === "string" ? content : JSON.stringify(content);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`AI request failed: ${msg}`);
  }
}

/**
 * Multi-turn chat completion using Puter.js.
 */
export async function chat(
  history: Message[],
  opts: { json?: boolean } = {}
): Promise<string> {
  const puter = await getPuter();

  if (opts.json && history.length > 0) {
    history = [
      {
        role: "system",
        content:
          history[0].content +
          " You MUST respond with ONLY valid minified JSON. No markdown fences, no commentary.",
      },
      ...history.slice(1),
    ];
  }

  try {
    const response = await puter.ai.chat(history, { model: "gpt-4o-mini", stream: false });
    const content = response?.message?.content || response?.text || (typeof response === "string" ? response : "");
    return typeof content === "string" ? content : JSON.stringify(content);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`AI request failed: ${msg}`);
  }
}

/** Safely extract a JSON object/array from a possibly noisy LLM string. */
export function extractJson<T = unknown>(raw: string): T | null {
  if (!raw) return null;
  let text = raw.trim();
  text = text
    .replace(/^\s*```(?:json|JSON)?\s*\n?/i, "")
    .replace(/\n?\s*```\s*$/i, "");
  const start = text.search(/[{[]/);
  if (start === -1) return null;
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === open) depth++;
      else if (c === close) {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
  }
  const candidate = end >= 0 ? text.slice(start, end + 1) : text.slice(start);
  return parseWithRepair<T>(candidate);
}

/** Try JSON.parse, then apply common repairs. */
function parseWithRepair<T>(s: string): T | null {
  try { return JSON.parse(s) as T; } catch {}
  try { return JSON.parse(s.replace(/,(\s*[}\]])/g, "$1")) as T; } catch {}
  try { return JSON.parse(s.replace(/'/g, '"')) as T; } catch {}
  try { return JSON.parse(s.replace(/,(\s*[}\]])/g, "$1").replace(/'/g, '"')) as T; } catch {}
  try {
    const clean = s
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(clean) as T;
  } catch {}
  return null;
}
