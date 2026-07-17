"use client";

/**
 * Client-side AI helper using Puter.js (free, anonymous, no API key needed).
 *
 * Puter.js is loaded via <script> in layout.tsx.
 * All AI calls happen client-side (browser).
 *
 * This module provides:
 * - complete(systemPrompt, userPrompt, opts) → single-shot completion
 * - chat(history, opts) → multi-turn chat
 * - extractJson(raw) → safe JSON extraction
 *
 * Usage:
 *   const { complete, extractJson } = await import("@/lib/ai-client");
 *   const raw = await complete("You are...", "Parse this:...", { json: true });
 *   const parsed = extractJson(raw);
 */

type Message = { role: "system" | "user" | "assistant"; content: string };

/** Global type for Puter.js */
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          messages: Message[] | string,
          opts?: { model?: string; stream?: boolean; temperature?: number }
        ) => Promise<{
          message?: { content?: string };
          text?: string;
          toString?: () => string;
        }>;
      };
    };
  }
}

/** Wait for Puter.js to load (up to 10 seconds). */
function waitForPuter(): Promise<NonNullable<Window["puter"]>> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cannot use Puter.js on the server."));
      return;
    }
    let attempts = 0;
    const maxAttempts = 50; // 10 seconds at 200ms intervals

    const check = () => {
      if (window.puter?.ai?.chat) {
        resolve(window.puter);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(check, 200);
      } else {
        reject(
          new Error(
            "Puter.js failed to load. Check your internet connection or disable ad blockers."
          )
        );
      }
    };
    check();
  });
}

/**
 * Generic single-shot completion using Puter.js (GPT-4o-mini, free).
 */
export async function complete(
  systemPrompt: string,
  userPrompt: string,
  opts: { json?: boolean } = {}
): Promise<string> {
  const puter = await waitForPuter();

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
    const response = await puter.ai.chat(messages, {
      model: "gpt-4o-mini",
      stream: false,
    });

    // Puter.js returns different shapes depending on version
    const content =
      response?.message?.content ||
      response?.text ||
      (typeof response === "string" ? response : "");

    return typeof content === "string" ? content : String(content ?? "");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Puter AI request failed: ${msg}`);
  }
}

/**
 * Multi-turn chat completion using Puter.js.
 */
export async function chat(
  history: Message[],
  opts: { json?: boolean } = {}
): Promise<string> {
  const puter = await waitForPuter();

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
    const response = await puter.ai.chat(messages, {
      model: "gpt-4o-mini",
      stream: false,
    });

    const content =
      response?.message?.content ||
      response?.text ||
      (typeof response === "string" ? response : "");

    return typeof content === "string" ? content : String(content ?? "");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Puter AI request failed: ${msg}`);
  }
}

/**
 * Safely extract a JSON object/array from a possibly noisy LLM string.
 * (Same implementation as server-side extractJson)
 */
export function extractJson<T = unknown>(raw: string): T | null {
  if (!raw) return null;
  let text = raw.trim();
  // Strip code fences
  text = text
    .replace(/^\s*```(?:json|JSON)?\s*\n?/i, "")
    .replace(/\n?\s*```\s*$/i, "");

  // Find first { or [
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
  try {
    return JSON.parse(s) as T;
  } catch {}
  try {
    return JSON.parse(s.replace(/,(\s*[}\]])/g, "$1")) as T;
  } catch {}
  try {
    return JSON.parse(s.replace(/'/g, '"')) as T;
  } catch {}
  try {
    return JSON.parse(
      s.replace(/,(\s*[}\]])/g, "$1").replace(/'/g, '"')
    ) as T;
  } catch {}
  try {
    const clean = s
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(clean) as T;
  } catch {}
  return null;
}
