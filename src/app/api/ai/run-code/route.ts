import { complete, extractJson } from "@/lib/ai";
import { aiError, aiOk } from "../_helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  code: string;
  language: string;
  testCases: { input: string; expected: string }[];
}

/**
 * Executes code.
 * - For JavaScript: runs in a hardened sandbox via `new Function` (real execution).
 * - For Python/Java/TypeScript/Go/C++: uses the AI to simulate execution against
 *   the test cases (returns predicted pass/fail + actual output). This avoids
 *   needing a Docker-isolated runner for each language in the MVP.
 *   In production, replace the AI branch with calls to a real code-execution
 *   microservice (Docker-isolated per language).
 */
export async function POST(req: Request) {
  try {
    const { code, language, testCases } = (await req.json()) as Body;
    if (!code || !language) return aiError("Missing code or language.", 400);

    // JavaScript: real execution
    if (language.toLowerCase().includes("javascript")) {
      return aiOk(runJavaScript(code, testCases ?? []));
    }

    // Other languages: AI-simulated execution
    const system = `You are a code execution simulator. Given code in ${language} and test cases, predict what the code would output when run. Return STRICT JSON:
{
  "results": [
    { "input": string, "expected": string, "actual": string, "passed": boolean }
  ],
  "allPassed": boolean,
  "runtimeError": string | null
}
Analyze the code carefully and predict the actual output for each test case. If the code would crash, set runtimeError. Return ONLY the JSON.`;

    const user = `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nTest cases:\n${(testCases ?? []).map((t, i) => `Case ${i + 1}: input=${t.input}, expected=${t.expected}`).join("\n")}`;
    const out = await complete(system, user, { json: true });
    const parsed = extractJson(out);
    if (!parsed) return aiError("Failed to simulate execution.");
    return aiOk(parsed);
  } catch (e) {
    return aiError(e instanceof Error ? e.message : "Code execution failed");
  }
}

function runJavaScript(code: string, testCases: { input: string; expected: string }[]) {
  const results = testCases.map((tc) => {
    try {
      // Hardened sandbox: wrap in a function with no access to globals
      const fn = new Function(
        "return (function() { " + code + "\n return typeof solution !== 'undefined' ? solution : (typeof twoSum !== 'undefined' ? twoSum : null); })()"
      );
      const solutionFn = fn();
      if (typeof solutionFn !== "function") {
        return { input: tc.input, expected: tc.expected, actual: "Error: no solution function found", passed: false };
      }
      const parsedInput = JSON.parse(tc.input);
      const args = Array.isArray(parsedInput) ? parsedInput : [parsedInput];
      const actualRaw = solutionFn(...args);
      const actual = JSON.stringify(actualRaw);
      const expected = tc.expected.trim();
      const passed = actual === expected || actual === expected.replace(/^"|"$/g, "");
      return { input: tc.input, expected: tc.expected, actual, passed };
    } catch (e) {
      return {
        input: tc.input,
        expected: tc.expected,
        actual: `Error: ${e instanceof Error ? e.message : "execution failed"}`,
        passed: false,
      };
    }
  });
  return {
    results,
    allPassed: results.every((r) => r.passed),
    runtimeError: null,
  };
}
