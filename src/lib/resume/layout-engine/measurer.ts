/**
 * Measurement Engine — Estimates the height of each LayoutNode.
 *
 * Pure TypeScript. No React. No DOM. No getBoundingClientRect.
 *
 * Uses data-driven heuristics to estimate how tall each section/entry
 * will be when rendered. This is not pixel-perfect, but it's accurate
 * enough for pagination decisions.
 *
 * Height estimation factors:
 * - Text length (characters per line, line height)
 * - Number of items (bullets, skills, projects)
 * - Section headers (fixed height)
 * - Spacing (margins, padding)
 */

import type { ResumeData, ExperienceItem, ProjectItem, EducationItem, SimpleItem } from "@/store/resume-store";
import { BlockType, type LayoutNode } from "./types";

// Constants for height estimation
const LINE_HEIGHT = 18;          // px per line of text (10pt font at 1.6 line-height)
const CHARS_PER_LINE = 95;       // characters that fit in one line at 794px width
const SECTION_HEADER_HEIGHT = 28; // section title + margin
const ENTRY_HEADER_HEIGHT = 22;  // role + company + dates line
const BULLET_HEIGHT = 20;        // one bullet point (with wrapping allowance)
const SKILL_CHIP_HEIGHT = 24;    // one row of skill chips
const SKILLS_PER_ROW = 4;        // number of skill chips per row
const SECTION_GAP = 16;          // gap between sections
const ENTRY_GAP = 10;            // gap between entries within a section

/**
 * Measure all LayoutNodes — sets their estimatedHeight.
 *
 * CRITICAL: Measures CHILDREN FIRST (bottom-up), then parents.
 * This ensures parent section heights include the correct child heights.
 * (Previously measured parents first — children were 0 when parent was calculated.)
 */
export function measureNodes(nodes: LayoutNode[]): LayoutNode[] {
  for (const node of nodes) {
    // Measure children FIRST (bottom-up)
    if (node.children) {
      measureNodes(node.children);
    }
    // Then measure the parent (now children have correct heights)
    node.estimatedHeight = measureNode(node);
  }
  return nodes;
}

/** Estimate the height of a single LayoutNode based on its type and data */
function measureNode(node: LayoutNode): number {
  switch (node.type) {
    case BlockType.Contact:
      return measureContact(node.data as ResumeData);

    case BlockType.Summary:
      return measureSummary(node.data as { text: string });

    case BlockType.Experience:
      return measureExperienceSection(node);

    case BlockType.ExperienceEntry:
      return measureExperienceEntry(node.data as ExperienceItem);

    case BlockType.Skills:
      return measureSkills(node.data as string[]);

    case BlockType.Projects:
      return measureProjectsSection(node);

    case BlockType.ProjectEntry:
      return measureProjectEntry(node.data as ProjectItem);

    case BlockType.Education:
      return measureEducationSection(node);

    case BlockType.EducationEntry:
      return measureEducationEntry(node.data as EducationItem);

    case BlockType.Certifications:
      return measureSimpleList(node.data as SimpleItem[]);

    case BlockType.Languages:
      return measureLanguages(node.data as string[]);

    case BlockType.Awards:
      return measureSimpleList(node.data as SimpleItem[]);

    case BlockType.Publications:
      return measureSimpleList(node.data as SimpleItem[]);

    case BlockType.Interests:
      return measureLanguages(node.data as string[]); // similar layout

    case BlockType.CustomSection:
      return measureCustomSection(node);

    default:
      return 100; // fallback
  }
}

/** Contact section: name, title, contact info */
function measureContact(data: ResumeData): number {
  let height = 0;
  if (data.name) height += 32;       // name (large font)
  if (data.title) height += 20;      // title
  const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
  if (contacts.length > 0) height += Math.ceil(contacts.length / 3) * LINE_HEIGHT; // contact line(s)
  return Math.max(height, 60);
}

/** Summary section: paragraph text */
function measureSummary(data: { text: string }): number {
  if (!data.text) return 0;
  const lines = Math.ceil(data.text.length / CHARS_PER_LINE);
  return SECTION_HEADER_HEIGHT + lines * LINE_HEIGHT;
}

/** Experience section: header + all entries (including entry gaps) */
function measureExperienceSection(node: LayoutNode): number {
  if (!node.children) return SECTION_HEADER_HEIGHT;
  let height = SECTION_HEADER_HEIGHT;
  for (const child of node.children) {
    height += child.estimatedHeight + child.marginTop + child.marginBottom;
  }
  return height;
}

/** Single experience entry: role, company, dates, bullets */
function measureExperienceEntry(data: ExperienceItem): number {
  let height = ENTRY_HEADER_HEIGHT; // role + company + dates
  const bullets = (data.bullets || []).filter((b) => b?.trim());
  for (const bullet of bullets) {
    const bulletLines = Math.ceil(bullet.length / (CHARS_PER_LINE - 15)); // bullets are indented
    height += bulletLines * BULLET_HEIGHT;
  }
  return Math.max(height, ENTRY_HEADER_HEIGHT + 20); // minimum
}

/** Skills section: chip grid */
function measureSkills(skills: string[]): number {
  if (!skills.length) return 0;
  const rows = Math.ceil(skills.length / SKILLS_PER_ROW);
  return SECTION_HEADER_HEIGHT + rows * SKILL_CHIP_HEIGHT;
}

/** Projects section: header + all entries (including entry gaps) */
function measureProjectsSection(node: LayoutNode): number {
  if (!node.children) return SECTION_HEADER_HEIGHT;
  let height = SECTION_HEADER_HEIGHT;
  for (const child of node.children) {
    height += child.estimatedHeight + child.marginTop + child.marginBottom;
  }
  return height;
}

/** Single project entry: name, description, tech, link */
function measureProjectEntry(data: ProjectItem): number {
  let height = ENTRY_HEADER_HEIGHT; // name
  if (data.description) {
    const lines = Math.ceil(data.description.length / (CHARS_PER_LINE - 15));
    height += lines * LINE_HEIGHT;
  }
  if (data.tech && data.tech.length > 0) {
    height += LINE_HEIGHT; // tech line
  }
  if (data.link) {
    height += LINE_HEIGHT; // link line
  }
  return Math.max(height, ENTRY_HEADER_HEIGHT + 20);
}

/** Education section: header + all entries (including entry gaps) */
function measureEducationSection(node: LayoutNode): number {
  if (!node.children) return SECTION_HEADER_HEIGHT;
  let height = SECTION_HEADER_HEIGHT;
  for (const child of node.children) {
    height += child.estimatedHeight + child.marginTop + child.marginBottom;
  }
  return height;
}

/** Single education entry: degree, school, dates, grade */
function measureEducationEntry(data: EducationItem): number {
  let height = ENTRY_HEADER_HEIGHT; // degree + school + dates
  if (data.grade) height += LINE_HEIGHT;
  if (data.location) height += LINE_HEIGHT;
  return Math.max(height, ENTRY_HEADER_HEIGHT);
}

/** Simple list (certifications, awards, publications) */
function measureSimpleList(items: SimpleItem[]): number {
  if (!items.length) return 0;
  let height = SECTION_HEADER_HEIGHT;
  for (const item of items) {
    const titleLines = Math.ceil((item.title || "").length / (CHARS_PER_LINE - 10));
    height += titleLines * LINE_HEIGHT;
    if (item.subtitle) height += LINE_HEIGHT;
    if (item.date) height += LINE_HEIGHT;
  }
  return height;
}

/** Languages / interests: comma-separated or pill layout */
function measureLanguages(items: string[]): number {
  if (!items.length) return 0;
  return SECTION_HEADER_HEIGHT + LINE_HEIGHT; // usually one or two lines
}

/** Custom section: header + items */
function measureCustomSection(node: LayoutNode): number {
  const data = node.data as { title: string; items: SimpleItem[] };
  if (!data.items || !data.items.length) return 0;
  let height = SECTION_HEADER_HEIGHT;
  for (const item of data.items) {
    const titleLines = Math.ceil((item.title || "").length / (CHARS_PER_LINE - 10));
    height += titleLines * LINE_HEIGHT;
    if (item.description) {
      const descLines = Math.ceil(item.description.length / (CHARS_PER_LINE - 10));
      height += descLines * LINE_HEIGHT;
    }
  }
  return height;
}
