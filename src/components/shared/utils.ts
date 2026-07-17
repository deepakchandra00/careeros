"use client";

import * as React from "react";

export function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

/** Hook that calls an AI JSON endpoint with loading + error states. */
export function useAI<T>() {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = React.useCallback(async (url: string, body: unknown) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json as T);
      return json as T;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, run, setData, setError };
}

/**
 * Hook that calls Puter.js AI directly from the client (no server route needed).
 * Puter.js is free, no API key, no balance issues.
 *
 * Usage:
 *   const { data, loading, run } = usePuterAI<ResultType>();
 *   run("system prompt", "user prompt", { json: true });
 */
export function usePuterAI<T>() {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = React.useCallback(async (
    systemPrompt: string,
    userPrompt: string,
    opts?: { json?: boolean }
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const { complete, extractJson } = await import("@/lib/ai-client");
      const raw = await complete(systemPrompt, userPrompt, opts);
      if (opts?.json) {
        const parsed = extractJson<T>(raw);
        if (!parsed) throw new Error("AI returned invalid JSON. Please try again.");
        setData(parsed);
        return parsed;
      }
      setData(raw as unknown as T);
      return raw as unknown as T;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, run, setData, setError };
}
