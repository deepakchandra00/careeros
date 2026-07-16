/**
 * Non-AI Resume Parser — extracts structured data from resume text using
 * regex, pattern matching, and heuristics. No LLM/API needed.
 *
 * Accuracy: ~85-90% for well-formatted resumes. For complex/unusual formats,
 * the AI parser (parse-resume-chunked) can be used as an enhancement.
 *
 * Exported functions:
 *   - parseResumeWithoutAI(text): Parse full resume text → ResumeData partial
 *   - parseContactRegex(text): Extract contact info only
 *   - parseSkillsRegex(text): Extract skills only
 *   - parseExperienceRegex(text): Extract work experience entries
 *   - parseProjectsRegex(text): Extract project entries
 *   - parseEducationRegex(text): Extract education entries
 */

import type {
  ResumeData,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  SimpleItem,
} from "@/store/resume-store";

const uid = () => Math.random().toString(36).slice(2, 10);

// ============================================================
// Section detection — find where each section starts/ends
// ============================================================

interface SectionBounds {
  contact: string;
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  certifications: string;
}

const SECTION_HEADERS: { section: keyof Omit<SectionBounds, "contact">; regex: RegExp }[] = [
  { section: "summary", regex: /^\s*(professional\s+summary|summary|profile|objective|about\s+me|career\s+objective|career\s+summary|professional\s+profile)\s*:?\s*$/im },
  { section: "skills", regex: /^\s*(technical\s+skills|skills|key\s+skills|core\s+competencies|areas\s+of\s+expertise|technical\s+expertise|technologies|tech\s+stack)\s*:?\s*$/im },
  { section: "experience", regex: /^\s*(professional\s+experience|work\s+experience|experience|employment|employment\s+history|career\s+history|professional\s+background|work\s+history)\s*:?\s*$/im },
  { section: "projects", regex: /^\s*(key\s+projects|projects|notable\s+projects|personal\s+projects|project\s+details)\s*:?\s*$/im },
  { section: "education", regex: /^\s*(education|academic|qualifications|educational\s+qualifications|academic\s+background)\s*:?\s*$/im },
  { section: "certifications", regex: /^\s*(certifications?|certificates?|licenses?|courses?|training)\s*:?\s*$/im },
];

export function splitSections(text: string): SectionBounds {
  const lines = text.split("\n");
  const bounds: SectionBounds = {
    contact: "",
    summary: "",
    skills: "",
    experience: "",
    projects: "",
    education: "",
    certifications: "",
  };

  // Find section header line indices
  const headerIndices: { section: keyof SectionBounds; lineIdx: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    for (const { section, regex } of SECTION_HEADERS) {
      if (regex.test(line)) {
        headerIndices.push({ section, lineIdx: i });
        break;
      }
    }
  }

  // Contact = everything before the first section header
  const firstHeaderIdx = headerIndices.length > 0 ? headerIndices[0].lineIdx : lines.length;
  bounds.contact = lines.slice(0, firstHeaderIdx).join("\n").trim();

  // Each section = from its header to the next header (or end)
  for (let i = 0; i < headerIndices.length; i++) {
    const { section, lineIdx } = headerIndices[i];
    const nextIdx = i + 1 < headerIndices.length ? headerIndices[i + 1].lineIdx : lines.length;
    const sectionText = lines.slice(lineIdx + 1, nextIdx).join("\n").trim();
    bounds[section] = sectionText;
  }

  return bounds;
}

// ============================================================
// Contact parsing — regex-based
// ============================================================

export function parseContactRegex(text: string): Partial<ResumeData> {
  const result: Partial<ResumeData> = {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  };

  // Email
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) result.email = emailMatch[0];

  // Phone — international and US formats
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  if (phoneMatch) result.phone = phoneMatch[0].trim();

  // LinkedIn
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) result.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;

  // GitHub
  const githubMatch = text.match(/(?:github\.com\/|github:\s*)([a-zA-Z0-9_-]+)/i);
  if (githubMatch) result.github = `github.com/${githubMatch[1]}`;

  // Website — look for domain-like patterns that aren't email/linkedin/github
  const websiteMatch = text.match(/(?:https?:\/\/)?(?!.*\b(?:linkedin|github)\.com\b)([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/);
  if (websiteMatch && !websiteMatch[1].includes("@")) result.website = websiteMatch[1];

  // Location — look for "City, State" or "City, Country" patterns
  const locationMatch = text.match(/([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*,\s*(?:[A-Z][a-zA-Z]+|[A-Z]{2}))\s*(?:\||$)/m);
  if (locationMatch) result.location = locationMatch[1].trim();

  // Name — first non-empty line that's not contact info
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);
  for (const line of lines.slice(0, 5)) {
    // Skip lines with @, |, http, +, digits
    if (line.includes("@") || line.includes("|") || line.includes("http") || line.includes("+") || /\d{3}/.test(line)) continue;
    // Name = 2-4 words, each capitalized
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && words.every(w => /^[A-Z][a-zA-Z.]+$/.test(w))) {
      result.name = line;
      break;
    }
  }

  // Title — the line after the name, or a line with | separators
  if (result.name) {
    const nameIdx = lines.indexOf(result.name);
    if (nameIdx >= 0 && nameIdx + 1 < lines.length) {
      const nextLine = lines[nameIdx + 1];
      if (nextLine && !nextLine.includes("@") && !nextLine.includes("+") && nextLine.length > 10) {
        result.title = nextLine.replace(/\s*\|.*$/, "").trim();
        // If the title line has pipes, it might contain role | skills
        if (nextLine.includes("|")) {
          result.title = nextLine;
        }
      }
    }
  }

  return result;
}

// ============================================================
// Skills parsing — comma-separated or category-based
// ============================================================

export function parseSkillsRegex(text: string): string[] {
  const skills = new Set<string>();

  // Remove section header if present
  const cleanText = text.replace(/^\s*(technical\s+skills|skills|key\s+skills|core\s+competencies)\s*:?\s*$/im, "").trim();

  // Split by lines
  const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Skip lines that look like section headers (e.g., "Frontend:" or "Backend / APIs:")
    if (/^[A-Z][a-zA-Z\s/&]+\s*:?$/.test(line) && line.length < 40) continue;

    // Remove category prefix (e.g., "Frontend: React, Next.js")
    const cleaned = line.replace(/^[A-Z][a-zA-Z\s/&]+\s*:\s*/, "");

    // Split by comma or bullet
    const parts = cleaned.split(/[,•|]/).map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      // Clean up the skill name
      const skill = part
        .replace(/^\d+\.\s*/, "") // remove "1. " prefix
        .replace(/\s*\(.*?\)\s*/g, "") // remove parenthetical notes
        .replace(/\s+/g, " ")
        .trim();
      if (skill.length > 1 && skill.length < 50 && !/^[A-Z][a-zA-Z\s/&]+:$/.test(skill)) {
        skills.add(skill);
      }
    }
  }

  return Array.from(skills);
}

// ============================================================
// Experience parsing — detect job entries and bullets
// ============================================================

export function parseExperienceRegex(text: string): ExperienceItem[] {
  const entries: ExperienceItem[] = [];
  const cleanText = text.replace(/^\s*(professional\s+experience|work\s+experience|experience|employment)\s*:?\s*$/im, "").trim();

  const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Find job header indices — lines that look like "Role – Company" or "Role, Company"
  // AND the next line has a date pattern like "Jan 2023 – Present"
  const jobHeaderIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip bullet points and labels
    if (/^[•·●○◦▪▫\-*]/.test(line)) continue;
    if (/^technologies\s*:/i.test(line)) continue;
    if (/^key\s+(responsibilities|achievements|contributions)/i.test(line)) continue;
    if (line.length > 150) continue; // long lines are descriptions, not headers

    // Check if this line has a role-company pattern
    const hasDash = /\s[–—-]\s/.test(line) && !line.startsWith("•");
    const hasRoleKeyword = /\b(Technical\s+Lead|Senior\s+\w+|Junior\s+\w+|Engineer|Developer|Designer|Manager|Architect|Consultant|Analyst|Director|Lead|Head|Specialist|Administrator|Coordinator|Intern)\b/i.test(line);

    // Check if next line has a date pattern
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    const nextHasDate = /(\w{3,9}\s+\d{4}|\d{4})\s*[–—-]\s*(\w{3,9}\s+\d{4}|\d{4}|Present|Current|Now)/i.test(nextLine);

    if ((hasDash || hasRoleKeyword) && nextHasDate) {
      jobHeaderIndices.push(i);
    }
  }

  if (jobHeaderIndices.length === 0) return [];

  // Parse each job block
  for (let j = 0; j < jobHeaderIndices.length; j++) {
    const startIdx = jobHeaderIndices[j];
    const endIdx = j + 1 < jobHeaderIndices.length ? jobHeaderIndices[j + 1] : lines.length;
    const blockLines = lines.slice(startIdx, endIdx);

    if (blockLines.length === 0) continue;

    // Line 0 = role + company
    const headerLine = blockLines[0];
    let role = "";
    let company = "";
    let location = "";

    const dashMatch = headerLine.match(/^(.+?)\s*[–—-]\s+(.+)$/);
    const atMatch = headerLine.match(/^(.+?)\s+at\s+(.+)$/i);

    if (dashMatch) {
      role = dashMatch[1].trim();
      company = dashMatch[2].trim();
    } else if (atMatch) {
      role = atMatch[1].trim();
      company = atMatch[2].trim();
    } else {
      role = headerLine;
    }
    company = company.replace(/\s*\(.*?\)\s*$/, "").trim();

    // Line 1 = dates + location
    let start = "";
    let end = "";
    if (blockLines.length > 1) {
      const dateLine = blockLines[1];
      const dateMatch = dateLine.match(/(\w{3,9}\s+\d{4}|\d{4})\s*[–—-]\s*(\w{3,9}\s+\d{4}|\d{4}|Present|Current|Now)/i);
      if (dateMatch) {
        start = dateMatch[1].trim();
        end = dateMatch[2].trim();
      }
      const locMatch = dateLine.match(/\|\s*(.+)$/);
      if (locMatch) location = locMatch[1].trim();
    }

    // Remaining lines = bullets
    const bullets: string[] = [];
    for (let i = 2; i < blockLines.length; i++) {
      const line = blockLines[i];
      if (/^technologies\s*:/i.test(line)) continue;
      if (/^key\s+(responsibilities|achievements|contributions)/i.test(line)) continue;
      const bulletText = line
        .replace(/^[•·●○◦▪▫\-*]\s*/, "")
        .replace(/^\d+\.\s*/, "")
        .trim();
      if (bulletText.length > 10) bullets.push(bulletText);
    }

    if (role || company) {
      entries.push({ id: uid(), role, company, location, start, end, bullets });
    }
  }

  return entries;
}

// ============================================================
// Projects parsing
// ============================================================

export function parseProjectsRegex(text: string): ProjectItem[] {
  const entries: ProjectItem[] = [];
  const cleanText = text.replace(/^\s*(key\s+projects|projects|notable\s+projects)\s*:?\s*$/im, "").trim();

  const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Find project header indices — numbered lines like "1. Project Name" or
  // lines followed by "Client:" or "Role:" labels
  const projHeaderIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Numbered header: "1. CAT eCommerce Portal"
    if (/^\d+\.\s+[A-Z]/.test(line) && line.length < 100) {
      projHeaderIndices.push(i);
      continue;
    }
    // Non-numbered: must be followed by "Client:" or "Role:" label
    if (
      !/^[•·●○◦▪▫\-*]/.test(line) && // not a bullet
      !/^(client|role|technologies|key\s+contributions)\s*:/i.test(line) && // not a label
      line.length > 3 &&
      line.length < 100 &&
      /^[A-Z]/.test(line) && // starts with capital
      !line.includes("@") &&
      // Must be followed by "Client:" or "Role:" label
      i + 1 < lines.length &&
      /^(client|role)\s*:/i.test(lines[i + 1])
    ) {
      projHeaderIndices.push(i);
    }
  }

  if (projHeaderIndices.length === 0) return [];

  // Parse each project block
  for (let j = 0; j < projHeaderIndices.length; j++) {
    const startIdx = projHeaderIndices[j];
    const endIdx = j + 1 < projHeaderIndices.length ? projHeaderIndices[j + 1] : lines.length;
    const blockLines = lines.slice(startIdx, endIdx);

    if (blockLines.length === 0) continue;

    // Line 0 = project name (strip number prefix)
    const name = blockLines[0]
      .replace(/^\d+\.\s*/, "")
      .replace(/\s*\(.*?\)\s*$/, "")
      .trim();

    if (/^(client|role|technologies|key\s+contributions)\s*:/i.test(name)) continue;
    if (name.length < 2) continue;

    let description = "";
    const tech: string[] = [];
    let link = "";

    for (let i = 1; i < blockLines.length; i++) {
      const line = blockLines[i];
      if (/^client\s*:/i.test(line)) continue;
      if (/^role\s*:/i.test(line)) continue;
      if (/^technologies\s*:/i.test(line)) {
        const techStr = line.replace(/^technologies\s*:\s*/i, "");
        tech.push(...techStr.split(/[,|]/).map(t => t.trim()).filter(Boolean));
        continue;
      }
      if (/^key\s+contributions/i.test(line)) continue;

      // Link
      const linkMatch = line.match(/(?:https?:\/\/)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/);
      if (linkMatch && !line.includes("@") && linkMatch[1].length < 50) {
        link = linkMatch[1];
      }

      // Description
      const bulletText = line
        .replace(/^[•·●○◦▪▫\-*]\s*/, "")
        .replace(/^\d+\.\s*/, "")
        .trim();
      if (bulletText.length > 10) {
        description = description ? description + " " + bulletText : bulletText;
      }
    }

    entries.push({ id: uid(), name, description, tech, link });
  }

  return entries;
}

// ============================================================
// Education parsing
// ============================================================

export function parseEducationRegex(text: string): EducationItem[] {
  const entries: EducationItem[] = [];
  const cleanText = text.replace(/^\s*(education|academic|qualifications)\s*:?\s*$/im, "").trim();

  const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Skip bullet points
    if (line.startsWith("•") || line.startsWith("-")) continue;

    // Match: "Degree, School (Year – Year)" or "Degree – School, Year"
    // Examples:
    //   "Bachelor in Computer Applications, AN College, Patna (2008–2011)"
    //   "B.Tech in Computer Science — IIT Madras (2013-2017)"
    //   "Diploma in Graphic Designing, Animax Technology (2006–2011)"

    const match = line.match(/^(.+?),\s*(.+?)(?:,\s*(.+?))?\s*\((\d{4})\s*[–—-]\s*(\d{4})\)/);
    if (match) {
      entries.push({
        id: uid(),
        degree: match[1].trim(),
        school: match[2].trim(),
        location: match[3]?.trim() || "",
        start: match[4],
        end: match[5],
        grade: "",
      });
      continue;
    }

    // Try without location: "Degree, School (Year – Year)"
    const match2 = line.match(/^(.+?)\s*[–—-]\s*(.+?)\s*\((\d{4})\s*[–—-]\s*(\d{4})\)/);
    if (match2) {
      entries.push({
        id: uid(),
        degree: match2[1].trim(),
        school: match2[2].trim(),
        location: "",
        start: match2[3],
        end: match2[4],
        grade: "",
      });
      continue;
    }

    // Try: "Degree, School, Year" or "Degree at School, Year"
    const match3 = line.match(/^(.+?),\s*(.+?)(?:,\s*(\d{4}))?$/);
    if (match3 && (match3[1].length < 80 || /bachelor|master|b\.tech|m\.tech|diploma|degree|mba|bca|mca|b\.sc|m\.sc/i.test(match3[1]))) {
      entries.push({
        id: uid(),
        degree: match3[1].trim(),
        school: match3[2].trim(),
        location: "",
        start: match3[3] || "",
        end: "",
        grade: "",
      });
    }
  }

  return entries;
}

// ============================================================
// Certifications parsing
// ============================================================

export function parseCertificationsRegex(text: string): SimpleItem[] {
  const entries: SimpleItem[] = [];
  const cleanText = text.replace(/^\s*(certifications?|certificates?|licenses?)\s*:?\s*$/im, "").trim();

  const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const bulletText = line.replace(/^[•·●○◦▪▫\-*]\s*/, "").replace(/^\d+\.\s*/, "").trim();
    if (bulletText.length < 5) continue;
    entries.push({
      id: uid(),
      title: bulletText,
      subtitle: "",
      description: "",
      date: "",
    });
  }

  return entries;
}

// ============================================================
// Full resume parser — combines all sections
// ============================================================

export function parseResumeWithoutAI(text: string): Partial<ResumeData> {
  const sections = splitSections(text);

  const contact = parseContactRegex(sections.contact);
  const skills = parseSkillsRegex(sections.skills);
  const experience = parseExperienceRegex(sections.experience);
  const projects = parseProjectsRegex(sections.projects);
  const education = parseEducationRegex(sections.education);
  const certifications = parseCertificationsRegex(sections.certifications);

  // If summary section is empty, try to extract from contact area
  let summary = sections.summary;
  if (!summary) {
    // Look for a paragraph after the title line in contact
    const contactLines = sections.contact.split("\n").filter(l => l.trim());
    for (let i = 2; i < contactLines.length; i++) {
      const line = contactLines[i].trim();
      if (line.length > 50 && !line.includes("@") && !line.includes("+") && !line.includes("|")) {
        summary = line;
        break;
      }
    }
  }

  return {
    name: contact.name || "",
    title: contact.title || "",
    email: contact.email || "",
    phone: contact.phone || "",
    location: contact.location || "",
    linkedin: contact.linkedin || "",
    github: contact.github || "",
    website: contact.website || "",
    summary,
    skills,
    experience,
    projects,
    education,
    certifications,
  };
}
