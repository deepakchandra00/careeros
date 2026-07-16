import ZAI from "z-ai-web-dev-sdk";

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    // The ZAI SDK reads .z-ai-config from the project root automatically.
    // See: https://www.npmjs.com/package/z-ai-web-dev-sdk
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

type Message = { role: "assistant" | "user" | "system"; content: string };

/** Generic single-shot completion. */
export async function complete(
  systemPrompt: string,
  userPrompt: string,
  opts: { json?: boolean } = {}
): Promise<string> {
  const zai = await getZAI();
  const messages: Message[] = [
    { role: "assistant", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
  if (opts.json) {
    messages[0] = {
      role: "assistant",
      content:
        systemPrompt +
        " You MUST respond with ONLY valid minified JSON. No markdown fences, no commentary.",
    };
  }
  const completion = await zai.chat.completions.create({
    model: "glm-4.6",
    messages,
    thinking: { type: "disabled" },
  });
  return completion.choices[0]?.message?.content ?? "";
}

/** Multi-turn chat completion. */
export async function chat(
  history: Message[],
  opts: { json?: boolean } = {}
): Promise<string> {
  const zai = await getZAI();
  if (opts.json && history.length > 0) {
    history = [
      {
        role: "assistant",
        content:
          history[0].content +
          " You MUST respond with ONLY valid minified JSON. No markdown fences, no commentary.",
      },
      ...history.slice(1),
    ];
  }
  const completion = await zai.chat.completions.create({
    model: "glm-4.6",
    messages: history,
    thinking: { type: "disabled" },
  });
  return completion.choices[0]?.message?.content ?? "";
}

/** Safely extract a JSON object/array from a possibly noisy LLM string. */
export function extractJson<T = unknown>(raw: string): T | null {
  if (!raw) return null;
  let text = raw.trim();
  // strip code fences (with optional language tag like ```json)
  text = text
    .replace(/^\s*```(?:json|JSON)?\s*\n?/i, "")
    .replace(/\n?\s*```\s*$/i, "");
  // find first { or [
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
  // try direct parse, then repair strategies
  return parseWithRepair<T>(candidate);
}

/** Try JSON.parse, then apply common repairs (trailing commas, single quotes). */
function parseWithRepair<T>(s: string): T | null {
  // 1. direct
  try {
    return JSON.parse(s) as T;
  } catch {}
  // 2. remove trailing commas (,} or ,] or , before whitespace+close)
  try {
    return JSON.parse(s.replace(/,(\s*[}\]])/g, "$1")) as T;
  } catch {}
  // 3. single quotes -> double quotes (naive, only for keys/values without internal quotes)
  try {
    const dq = s.replace(/'/g, '"');
    return JSON.parse(dq) as T;
  } catch {}
  // 4. trailing commas + single quotes
  try {
    return JSON.parse(
      s.replace(/,(\s*[}\]])/g, "$1").replace(/'/g, '"')
    ) as T;
  } catch {}
  // 5. remove control chars / smart quotes
  try {
    const clean = s
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(clean) as T;
  } catch {}
  return null;
}
