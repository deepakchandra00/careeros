"use client";

import * as React from "react";

export function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

/** AI prompt registry — used for OpenRouter fallback when server route fails */
export interface AIFallbackPrompt {
  system: string;
  user: (body: Record<string, unknown>) => string;
}

/**
 * Registry of AI prompts for fallback to OpenRouter.
 * When the server API route fails (e.g., ZAI balance issue), the hook
 * uses the prompt to call OpenRouter directly from the client.
 */
const AI_PROMPTS: Record<string, AIFallbackPrompt> = {
  "/api/ai/cover-letter": {
    system:
      "You are an expert cover letter writer. Write a tailored, persuasive cover letter (around 250-320 words) that connects the candidate's resume to the job description. Use a confident, professional tone. Address it 'Dear Hiring Manager,'. Sign off with the candidate's name from the resume. Output ONLY the cover letter text, no preamble or markdown.",
    user: (b) =>
      `RESUME:\n${b.resumeText}\n\nJOB DESCRIPTION:\n${b.jd}\n\nTone: ${b.tone || "confident, professional"}`,
  },
  "/api/ai/rewriter": {
    system:
      'You are an elite resume writer who tailors resumes for specific seniority levels. Rewrite the resume to position the candidate appropriately. Return STRICT JSON: {"newTitle":string,"newSummary":string,"rewrittenExperience":[{"role":string,"company":string,"bullets":string[]}],"keywords":string[]}. Return ONLY the JSON.',
    user: (b) =>
      `Target level: ${b.targetLevel}\nCompany: ${b.company || "N/A"}\nTone: ${b.tone || "professional"}\n\nRESUME:\n${b.resumeText}`,
  },
  "/api/ai/ats-review": {
    system:
      'You are an ATS resume scanner. Score the resume out of 100 and identify issues. Return STRICT JSON: {"atsScore":number,"atsGrade":string,"missingKeywords":string[],"weakBullets":{"count":number,"examples":string[]},"grammarIssues":{"count":number,"examples":string[]},"formattingIssues":{"count":number,"examples":string[]},"suggestedSalaryINR":{"low":number,"high":number},"interviewProbability":"High"|"Medium"|"Low"}. Return ONLY the JSON.',
    user: (b) => `RESUME:\n${b.resumeText}`,
  },
  "/api/ai/jd-match": {
    system:
      'You are a job description matcher. Compare the resume to the JD and return STRICT JSON: {"matchScore":number,"matchedKeywords":string[],"missingKeywords":string[],"suggestions":string[]}. Return ONLY the JSON.',
    user: (b) => `RESUME:\n${b.resumeText}\n\nJOB DESCRIPTION:\n${b.jd}`,
  },
  "/api/ai/interview": {
    system:
      'You are an interview coach. Generate interview questions based on the resume. Return STRICT JSON: {"hr":string[],"technical":string[],"behavioral":string[],"systemDesign":string[],"coding":string[],"architecture":string[],"tips":string[],"likelyTopics":string[]}. Return ONLY the JSON.',
    user: (b) => `RESUME:\n${b.resumeText}\n\nJD: ${b.jd || "N/A"}`,
  },
  "/api/ai/salary": {
    system:
      'You are a salary predictor. Estimate market salary based on role, experience, location, and skills. Return STRICT JSON: {"marketSalaryINR":{"low":number,"high":number,"median":number},"marketSalaryUSD":{"low":number,"high":number},"topCompanies":string[],"demandLevel":"Very High"|"High"|"Medium"|"Low","growthOutlook":string,"negotiationTips":string[],"perks":string[],"comparableRoles":string[]}. Return ONLY the JSON.',
    user: (b) =>
      `Role: ${b.role}\nExperience: ${b.experienceYears} years\nLocation: ${b.location}\nSkills: ${Array.isArray(b.skills) ? (b.skills as string[]).join(", ") : ""}\nCurrent CTC: ${b.currentCtcLPA || "N/A"} LPA`,
  },
  "/api/ai/skill-gap": {
    system:
      'You are a skill gap analyzer. Compare the resume to a target role and identify missing skills. Return STRICT JSON: {"currentSkills":string[],"requiredSkills":string[],"missingSkills":string[],"recommendedCourses":[{"title":string,"provider":string,"duration":string}],"prioritySkills":string[]}. Return ONLY the JSON.',
    user: (b) => `RESUME:\n${b.resumeText}\n\nTarget Role: ${b.targetRole || "Senior Engineer"}`,
  },
  "/api/ai/roadmap": {
    system:
      'You are a career roadmap generator. Create a 30/60/90 day upskilling plan. Return STRICT JSON: {"days30":{"goals":string[],"resources":string[]},"days60":{"goals":string[],"resources":string[]},"days90":{"goals":string[],"resources":string[]},"milestones":string[]}. Return ONLY the JSON.',
    user: (b) => `RESUME:\n${b.resumeText}\nTarget: ${b.targetRole || "Senior Engineer"}`,
  },
  "/api/ai/job-search": {
    system:
      'You are a job search assistant. Find relevant jobs based on the resume. Return STRICT JSON: {"jobs":[{"title":string,"company":string,"location":string,"salary":string,"matchScore":number,"url":string}],"tips":string[]}. Return ONLY the JSON.',
    user: (b) => `RESUME:\n${b.resumeText}\nQuery: ${b.query || ""}`,
  },
  "/api/ai/parse-resume-chunked": {
    system:
      'You are a resume parser. Extract structured data from the given resume section. Return STRICT JSON only.',
    user: (b) => `Section: ${b.section}\nText: ${b.text}`,
  },
  "/api/ai/linkedin/analyze": {
    system:
      'You are a LinkedIn optimization expert. Analyze the resume and return LinkedIn optimization data as STRICT JSON.',
    user: (b) => `RESUME:\n${b.resumeText}\n\nLINKEDIN:\n${b.linkedinText || ""}`,
  },
  "/api/ai/naukri/analyze": {
    system:
      'You are a Naukri.com profile optimization expert. Analyze the resume and return Naukri optimization data as STRICT JSON.',
    user: (b) => `RESUME:\n${b.resumeText}\n\nNAUKRI:\n${b.naukriText || ""}`,
  },
  "/api/ai/career-intelligence": {
    system:
      'You are a career intelligence engine. Analyze the resume and scores to provide unified career insights as STRICT JSON.',
    user: (b) => `RESUME:\n${b.resumeText}\n\nSCORES: ${JSON.stringify(b.scores || {})}`,
  },
  "/api/ai/coach": {
    system: "You are an AI career coach. Provide helpful, actionable career advice.",
    user: (b) => `Message: ${b.message || ""}\n\nResume context: ${b.resumeText || ""}`,
  },
  "/api/ai/rewrite": {
    system:
      "You are a professional resume bullet rewriter. Rewrite the given bullet point to be more impactful and quantified. Return the rewritten text only.",
    user: (b) => `Original: ${b.text || ""}\nTone: ${b.tone || "professional"}`,
  },
  "/api/ai/run-code": {
    system:
      'You are a code execution simulator. Given code and test cases, predict what the code would output. Return STRICT JSON: {"output":string,"passing":boolean,"error":string|null}. Return ONLY the JSON.',
    user: (b) => `Language: ${b.language || "javascript"}\nCode: ${b.code || ""}\nTest cases: ${JSON.stringify(b.testCases || [])}`,
  },
  "/api/ai/code-review": {
    system:
      'You are a senior engineering interviewer. Review the candidate\'s code and return STRICT JSON: {"score":number,"feedback":string,"improvements":string[],"complexity":string}. Return ONLY the JSON.',
    user: (b) => `Code: ${b.code || ""}\nLanguage: ${b.language || "javascript"}\nProblem: ${b.problem || ""}`,
  },
  "/api/ai/mock-interview": {
    system:
      'You are an expert interviewer. Generate interview questions or score answers. Return STRICT JSON.',
    user: (b) => `Role: ${b.role || "Software Engineer"}\nType: ${b.type || "Technical"}\nAction: ${b.action || "question"}\nContext: ${b.resumeContext || ""}\nAnswer: ${b.answer || ""}`,
  },
  "/api/ai/candidate-rank": {
    system:
      'You are a recruiter tool. Rank candidates based on their resumes against the job description. Return STRICT JSON: {"rankings":[{"candidateId":string,"score":number,"reason":string}]}. Return ONLY the JSON.',
    user: (b) => `Job Description: ${b.jd || ""}\nCandidates: ${JSON.stringify(b.candidates || [])}`,
  },
};

/**
 * Hook that calls an AI JSON endpoint with loading + error states.
 * If the server route fails, automatically falls back to OpenRouter (free AI).
 */
export function useAI<T>() {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = React.useCallback(async (url: string, body: unknown): Promise<T | null> => {
    setLoading(true);
    setError(null);

    // Try server route first
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
    } catch (serverError) {
      const serverMsg = serverError instanceof Error ? serverError.message : "Server failed";

      // Check if this is a ZAI/server error → fall back to OpenRouter
      // Use case-insensitive matching to catch all variations
      const lowerMsg = serverMsg.toLowerCase();
      const isServerError =
        lowerMsg.includes("1113") ||
        lowerMsg.includes("insufficient balance") ||
        lowerMsg.includes("zai_api_key") ||
        lowerMsg.includes("zai api key") ||
        lowerMsg.includes("configuration file not found") ||
        lowerMsg.includes("ai request failed") ||
        lowerMsg.includes("ai service has insufficient") ||
        lowerMsg.includes("recharge") ||
        lowerMsg.includes("not configured") ||
        lowerMsg.includes("openrouter") ||
        lowerMsg.includes("500");

      if (!isServerError) {
        // Non-server error — don't fall back
        setError(serverMsg);
        setLoading(false);
        return null;
      }

      // Fall back to OpenRouter
      try {
        const prompt = AI_PROMPTS[url];
        if (!prompt) {
          throw new Error(
            "AI service unavailable (ZAI balance issue) and no OpenRouter fallback configured for this endpoint."
          );
        }

        const { complete, extractJson } = await import("@/lib/ai-client");
        const userPrompt = prompt.user(body as Record<string, unknown>);
        const raw = await complete(prompt.system, userPrompt, { json: true });

        // For non-JSON responses (like cover letter text)
        if (url === "/api/ai/cover-letter" || url === "/api/ai/coach") {
          const result = { text: raw } as unknown as T;
          setData(result);
          return result;
        }

        // For JSON responses
        const parsed = extractJson<T>(raw);
        if (!parsed) {
          throw new Error("AI returned invalid JSON. Please try again.");
        }
        setData(parsed);
        return parsed;
      } catch (fallbackError) {
        const msg = fallbackError instanceof Error ? fallbackError.message : "AI fallback failed";
        setError(msg);
        setLoading(false);
        return null;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, run, setData, setError };
}

/**
 * Helper for modules that use direct fetch() instead of useAI hook.
 * Falls back to OpenRouter if the server route fails with ZAI errors.
 *
 * Usage:
 *   const data = await fetchWithFallback("/api/ai/coach", { message: "hi" });
 */
export async function fetchWithFallback<T>(
  url: string,
  body: Record<string, unknown>
): Promise<T> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Request failed");
    return json as T;
  } catch (serverError) {
    const serverMsg = serverError instanceof Error ? serverError.message : "Server failed";
    const lowerMsg = serverMsg.toLowerCase();

    // Check if this is a ZAI error that should trigger OpenRouter fallback
    const isZAIError =
      lowerMsg.includes("1113") ||
      lowerMsg.includes("insufficient balance") ||
      lowerMsg.includes("zai_api_key") ||
      lowerMsg.includes("zai api key") ||
      lowerMsg.includes("configuration file not found") ||
      lowerMsg.includes("ai request failed") ||
      lowerMsg.includes("ai service has insufficient") ||
      lowerMsg.includes("recharge") ||
      lowerMsg.includes("not configured");

    if (!isZAIError) {
      throw serverError;
    }

    // Fall back to OpenRouter
    const prompt = AI_PROMPTS[url];
    if (!prompt) {
      throw new Error("AI service unavailable and no OpenRouter fallback configured.");
    }

    const { complete, extractJson } = await import("@/lib/ai-client");
    const userPrompt = prompt.user(body);
    const raw = await complete(prompt.system, userPrompt, { json: true });

    // For text responses (cover letter, coach)
    if (url === "/api/ai/cover-letter" || url === "/api/ai/coach") {
      return { text: raw } as unknown as T;
    }

    // For JSON responses
    const parsed = extractJson<T>(raw);
    if (!parsed) {
      throw new Error("AI returned invalid JSON. Please try again.");
    }
    return parsed;
  }
}
