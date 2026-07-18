"use client";

/**
 * Client-side AI helper using OpenRouter API (fallback when server route fails).
 *
 * Model: deepseek/deepseek-chat
 * API: https://openrouter.ai/api/v1/chat/completions
 * Key: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY (client-safe)
 *
 * This provides a free AI fallback when the server-side ZAI API has
 * insufficient balance. All AI features work without any API key issues.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-chat";

type Message = { role: "system" | "user" | "assistant"; content: string };

/** Generic single-shot completion using OpenRouter. */
export async function complete(
  systemPrompt: string,
  userPrompt: string,
  opts: { json?: boolean } = {}
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_OPENROUTER_API_KEY is not set.");
  }

  let system = systemPrompt;
  if (opts.json) {
    system =
      systemPrompt +
      " You MUST respond with ONLY valid minified JSON. No markdown fences, no commentary.";
  }

  const messages: Message[] = [
    { role: "system", content: system },
    { role: "user", content: userPrompt },
  ];

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://careeros.app",
        "X-Title": "CareerOS",
      },
      body: JSON.stringify({ model: MODEL, messages }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter error (${res.status}): ${text.slice(0, 100)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`AI request failed: ${msg}`);
  }
}

/** Multi-turn chat completion using OpenRouter. */
export async function chat(
  history: Message[],
  opts: { json?: boolean } = {}
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_OPENROUTER_API_KEY is not set.");
  }

  let messages = [...history];
  if (opts.json && messages.length > 0) {
    messages[0] = {
      ...messages[0],
      content:
        messages[0].content +
        " You MUST respond with ONLY valid minified JSON. No markdown fences, no commentary.",
    };
  }

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://careeros.app",
        "X-Title": "CareerOS",
      },
      body: JSON.stringify({ model: MODEL, messages }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter error (${res.status}): ${text.slice(0, 100)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
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
        if (depth === 0) { end = i; break; }
      }
    }
  }

  const candidate = end >= 0 ? text.slice(start, end + 1) : text.slice(start);
  return parseWithRepair<T>(candidate);
}

function parseWithRepair<T>(s: string): T | null {
  try { return JSON.parse(s) as T; } catch {}
  try { return JSON.parse(s.replace(/,(\s*[}\]])/g, "$1")) as T; } catch {}
  try { return JSON.parse(s.replace(/'/g, '"')) as T; } catch {}
  try { return JSON.parse(s.replace(/,(\s*[}\]])/g, "$1").replace(/'/g, '"')) as T; } catch {}
  try {
    const clean = s.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(clean) as T;
  } catch {}
  return null;
}
