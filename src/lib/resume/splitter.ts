/**
 * Splits raw resume text into logical sections for chunked AI parsing.
 * Pure string processing — no AI, no cost, instant.
 *
 * Each section is sent to the LLM separately in parallel, avoiding timeouts
 * on large resumes while capturing ALL data.
 */

export interface ResumeSections {
  contact: string;
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  certifications: string;
  /** Full text, for fallback single-call parsing. */
  full: string;
}

// Headers that indicate section boundaries (case-insensitive)
const SECTION_PATTERNS: { section: keyof Omit<ResumeSections, "full">; regex: RegExp }[] = [
  { section: "summary", regex: /^\s*(professional\s+summary|summary|profile|objective|about\s+me|career\s+objective)\s*:?\s*$/im },
  { section: "skills", regex: /^\s*(technical\s+skills|skills|key\s+skills|core\s+competencies|areas\s+of\s+expertise)\s*:?\s*$/im },
  { section: "experience", regex: /^\s*(professional\s+experience|work\s+experience|experience|employment|employment\s+history|career\s+history|professional\s+background)\s*:?\s*$/im },
  { section: "projects", regex: /^\s*(key\s+projects|projects|notable\s+projects|personal\s+projects)\s*:?\s*$/im },
  { section: "education", regex: /^\s*(education|academic|qualifications|educational\s+qualifications)\s*:?\s*$/im },
  { section: "certifications", regex: /^\s*(certifications?|certificates?|licenses?|courses?)\s*:?\s*$/im },
];

export function splitResumeSections(text: string): ResumeSections {
  const lines = text.split("\n");
  const sections: ResumeSections = {
    contact: "",
    summary: "",
    skills: "",
    experience: "",
    projects: "",
    education: "",
    certifications: "",
    full: text,
  };

  // Find all section header line indices
  const foundHeaders: { lineIdx: number; section: keyof Omit<ResumeSections, "full"> }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length > 80) continue; // headers are short
    for (const { section, regex } of SECTION_PATTERNS) {
      if (regex.test(line)) {
        // Avoid duplicate headers (e.g. "Skills" appearing twice)
        if (!foundHeaders.some((h) => h.section === section)) {
          foundHeaders.push({ lineIdx: i, section });
        }
        break;
      }
    }
  }

  // Sort by line index
  foundHeaders.sort((a, b) => a.lineIdx - b.lineIdx);

  // Contact block = everything before the first section header
  const firstHeaderIdx = foundHeaders.length > 0 ? foundHeaders[0].lineIdx : lines.length;
  sections.contact = lines.slice(0, firstHeaderIdx).join("\n").trim();

  // Extract each section's content (from its header to the next header)
  for (let i = 0; i < foundHeaders.length; i++) {
    const current = foundHeaders[i];
    const nextIdx = i + 1 < foundHeaders.length ? foundHeaders[i + 1].lineIdx : lines.length;
    const content = lines.slice(current.lineIdx + 1, nextIdx).join("\n").trim();
    // Append if the section already has content (e.g. certifications appearing again)
    if (sections[current.section] && sections[current.section].length > 0) {
      sections[current.section] += "\n\n" + content;
    } else {
      sections[current.section] = content;
    }
  }

  // If no sections were detected, treat the whole text as contact (fallback)
  if (foundHeaders.length === 0) {
    sections.contact = text;
  }

  return sections;
}

/**
 * Compress skills text: remove category prefixes, just list raw skill names.
 * "Frontend: React.js, Next.js, TypeScript" → "React.js, Next.js, TypeScript"
 */
export function compressSkills(skillsText: string): string {
  if (!skillsText) return "";
  const lines = skillsText.split("\n");
  const allSkills: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Remove category prefix like "Frontend:" or "Architecture & Performance:"
    const colonIdx = trimmed.indexOf(":");
    const skillPart = colonIdx > 0 && colonIdx < 40 ? trimmed.slice(colonIdx + 1).trim() : trimmed;
    // Split by comma
    const skills = skillPart.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    allSkills.push(...skills);
  }
  return allSkills.join(", ");
}
