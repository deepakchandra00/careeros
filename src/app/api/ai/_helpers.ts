import { NextResponse } from "next/server";

/**
 * Return an AI error response with a user-friendly message.
 * Detects common ZAI API errors and provides helpful guidance.
 */
export function aiError(message: string, status = 500) {
  // Check for common ZAI API errors and provide helpful messages
  let friendlyMessage = message;

  if (message.includes("1113") || message.includes("Insufficient balance")) {
    friendlyMessage =
      "ZAI API key has insufficient balance. Please recharge at https://z.ai/ to use AI features.";
  } else if (
    message.includes("ZAI_API_KEY is not set") ||
    message.includes("Configuration file not found")
  ) {
    friendlyMessage =
      "ZAI API key is not configured. Set ZAI_API_KEY in your environment variables.";
  } else if (message.includes("401") || message.includes("Unauthorized")) {
    friendlyMessage =
      "ZAI API key is invalid. Check your ZAI_API_KEY environment variable.";
  }

  return NextResponse.json({ error: friendlyMessage }, { status });
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
