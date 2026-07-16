/**
 * Client-side resume section splitter.
 *
 * Takes raw resume text (extracted from PDF/DOCX/TXT) and splits it into
 * 6 typed sections by detecting common section headers. No AI used —
 * this is pure regex/heuristic so it's instant and deterministic.
 *
 * The output is fed section-by-section to `/api/ai/parse-resume-chunked`
 * which avoids LLM timeouts on large (12,000+ char) resumes.
 */

export type SectionType =
  | "contact"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education";

export interface SplitSections {
  contact: string;
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
}

/**
 * Header detection patterns.
 * Match a TRIMMED line that consists ONLY of the header text
 * (case-insensitive) with an optional trailing colon.
 * Anchored with ^...$ so "Experience at Google" inside a bullet
 * point is NOT mistaken for a header.
 */
const HEADER_PATTERNS: { section: SectionType; regex: RegExp }[] = [
  {
    section: "summary",
    regex:
      /^(?:professional\s+summary|summary|profile|objective|about\s+me|career\s+summary|career\s+objective|professional\s+profile|executive\s+summary)\s*:?\s*$/i,
  },
  {
    section: "skills",
    regex:
      /^(?:technical\s+skills|skills|key\s+skills|core\s+competencies|core\s+skills|tech\s+stack|areas\s+of\s+expertise|relevant\s+skills|technology\s+stack|technologies)\s*:?\s*$/i,
  },
  {
    section: "experience",
    regex:
      /^(?:professional\s+experience|work\s+experience|experience|employment|employment\s+history|work\s+history|career\s+history|professional\s+background|career\s+experience)\s*:?\s*$/i,
  },
  {
    section: "projects",
    regex:
      /^(?:key\s+projects|projects|notable\s+projects|personal\s+projects|side\s+projects|selected\s+projects|signature\s+projects)\s*:?\s*$/i,
  },
  {
    section: "education",
    regex:
      /^(?:education|academic|qualifications|education\s+&\s+certifications|education\s+and\s+certifications|academic\s+background|academic\s+qualifications)\s*:?\s*$/i,
  },
];

/** Lines that are decorative underlines (e.g. "-----" or "=====") */
const UNDERLINE_REGEX = /^[-=_*~\s]+$/;

/** A header line should be reasonably short */
const MAX_HEADER_LEN = 80;

/**
 * Split resume text into 6 typed sections.
 *
 * - `contact`: everything before the first recognized header
 * - `summary`/`skills`/`experience`/`projects`/`education`: text under
 *   each header until the next header (or end of text)
 * - Skills text is compressed (category prefixes stripped, items
 *   comma-separated, deduplicated)
 *
 * If a section's header is missing, that section is empty. The contact
 * section always has content (the entire text if no headers found).
 */
export function splitResumeIntoSections(text: string): SplitSections {
  const result: SplitSections = {
    contact: "",
    summary: "",
    skills: "",
    experience: "",
    projects: "",
    education: "",
  };

  if (!text || !text.trim()) return result;

  const lines = text.split(/\r?\n/);

  // Identify section boundaries (line index where the section's BODY starts)
  type Boundary = { section: SectionType; lineIdx: number };
  const boundaries: Boundary[] = [{ section: "contact", lineIdx: 0 }];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (UNDERLINE_REGEX.test(line)) continue;
    if (line.length > MAX_HEADER_LEN) continue;

    for (const { section, regex } of HEADER_PATTERNS) {
      if (regex.test(line)) {
        // Body starts on the next non-empty, non-underline line
        let bodyStart = i + 1;
        while (
          bodyStart < lines.length &&
          (!lines[bodyStart].trim() || UNDERLINE_REGEX.test(lines[bodyStart].trim()))
        ) {
          bodyStart++;
        }
        boundaries.push({ section, lineIdx: bodyStart });
        break;
      }
    }
  }

  // Sort boundaries by line index (contact is always first since lineIdx=0)
  boundaries.sort((a, b) => a.lineIdx - b.lineIdx);

  // Extract each section's body text
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i].lineIdx;
    const end = i + 1 < boundaries.length ? boundaries[i + 1].lineIdx : lines.length;
    if (end <= start) continue;

    const sectionLines: string[] = [];
    for (let j = start; j < end; j++) {
      const trimmed = lines[j].trim();
      if (UNDERLINE_REGEX.test(trimmed)) continue;
      sectionLines.push(lines[j]);
    }

    const sectionText = sectionLines.join("\n").trim();
    if (sectionText) {
      // For contact, accumulate (in case there are multiple "contact" hits — rare)
      if (boundaries[i].section === "contact" && result.contact) {
        result.contact += "\n\n" + sectionText;
      } else {
        result[boundaries[i].section] = sectionText;
      }
    }
  }

  // Compress skills (strip category prefixes, comma-separate, dedupe)
  if (result.skills) {
    result.skills = compressSkills(result.skills);
  }

  return result;
}

/**
 * Strip category prefixes from a skills section.
 *
 * Input might look like:
 *   Frontend: React, TypeScript, Next.js
 *   Backend / APIs: Node.js, GraphQL, REST
 *   Architecture & Performance: Webpack, Lighthouse
 *
 * Output: "React, TypeScript, Next.js, Node.js, GraphQL, REST, Webpack, Lighthouse"
 *
 * Also handles bullet-style lists and pipes.
 */
function compressSkills(skillsText: string): string {
  const lines = skillsText.split(/\r?\n/);
  const out: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Skip lines that are PURE category headers (e.g. "Frontend:", "Backend / APIs:")
    if (/^[A-Z][\w\s&/,\-]{0,60}:\s*$/.test(line)) continue;

    // Strip a leading "Category:" prefix from mixed lines
    const stripped = line.replace(/^[A-Z][\w\s&/,\-]{0,60}:\s*/, "");

    // Split on common separators (commas, semicolons, pipes, bullets)
    const parts = stripped
      .split(/[,;|•]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    out.push(...parts);
  }

  // Deduplicate (case-insensitive, keep first-seen casing)
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const skill of out) {
    const key = skill.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(skill);
    }
  }

  return unique.join(", ");
}

/**
 * Split a long section's text into chunks of approximately `targetChar`
 * characters, breaking at paragraph boundaries (double newlines) when
 * possible. Falls back to word-boundary hard splits for very long
 * paragraphs.
 */
export function splitIntoChunks(text: string, targetChar: number): string[] {
  if (!text) return [];
  if (text.length <= targetChar) return [text];

  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const p = para.trim();
    if (!p) continue;

    // If adding this paragraph would overflow and we already have content, flush
    if (current && current.length + p.length + 2 > targetChar) {
      chunks.push(current.trim());
      current = "";
    }

    if (p.length > targetChar) {
      // Paragraph itself is too long — hard split at word boundaries
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      const words = p.split(/\s+/);
      let line = "";
      for (const w of words) {
        if (line && line.length + w.length + 1 > targetChar) {
          chunks.push(line.trim());
          line = "";
        }
        line += (line ? " " : "") + w;
      }
      if (line) current = line;
    } else {
      current += (current ? "\n\n" : "") + p;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}
