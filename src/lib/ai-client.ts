"use client";

/**
 * Client-side AI helper using Pollinations.ai (free, anonymous, no API key needed).
 *
 * Pollinations.ai provides a free OpenAI-compatible API that works without
 * authentication, sign-in, or API keys. Perfect for client-side AI calls.
 *
 * This module provides:
 * - complete(systemPrompt, userPrompt, opts) → single-shot completion
 * - chat(history, opts) → multi-turn chat
 * - extractJson(raw) → safe JSON extraction
 */

type Message = { role: "system" | "user" | "assistant"; content: string };

const POLLINATIONS_URL = "https://text.pollinations.ai/";

/**
 * Generic single-shot completion using Pollinations.ai (free, no key).
 */
export async function complete(
  systemPrompt: string,
  userPrompt: string,
  opts: { json?: boolean } = {}
): Promise<string> {
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
    const res = await fetch(POLLINATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        model: "openai",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pollinations API error (${res.status}): ${text.slice(0, 100)}`);
    }

    const text = await res.text();
    return text.trim();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`AI request failed: ${msg}`);
  }
}

/**
 * Multi-turn chat completion using Pollinations.ai.
 */
export async function chat(
  history: Message[],
  opts: { json?: boolean } = {}
): Promise<string> {
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
    const res = await fetch(POLLINATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        model: "openai",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pollinations API error (${res.status}): ${text.slice(0, 100)}`);
    }

    const text = await res.text();
    return text.trim();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`AI request failed: ${msg}`);
  }
}

/**
 * Safely extract a JSON object/array from a possibly noisy LLM string.
 */
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

/** Try JSON.parse with common repair strategies. */
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
