import { NextResponse } from "next/server";

/**
 * Return an AI error response with a user-friendly message.
 * Detects common ZAI API errors and provides helpful guidance.
 */
export function aiError(message: string, status = 500) {
  // Pass the original error message through — the client-side useAI hook
  // and fetchWithFallback detect ZAI errors by checking for keywords like
  // "insufficient balance", "1113", "recharge", etc. (case-insensitive).
  // Don't transform the message here — let the client decide how to display it.
  return NextResponse.json({ error: message }, { status });
}

export function aiOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Wrap an AI route handler with automatic error handling.
 * Catches ZAI API errors and returns friendly messages.
 */
export function aiCatch(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  return fn().catch((e) => {
    const msg = e instanceof Error ? e.message : "AI request failed";
    return aiError(msg);
  });
}
