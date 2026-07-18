/**
 * Section Parser — Converts Resume JSON into a tree of LayoutNodes.
 *
 * Pure TypeScript. No React. No DOM.
 *
 * Input: ResumeData (from the Zustand store)
 * Output: LayoutNode[] (a tree of sections and entries)
 */

import type { ResumeData, SectionSettings } from "@/store/resume-store";
import { BlockType, DEFAULT_PAGINATION_RULES, type LayoutNode, type PaginationRules } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * Parse a ResumeData object into a tree of LayoutNodes.
 *
 * @param data - The resume data
 * @param sectionOrder - The visible section order
 * @param sectionSettings - Per-section overrides for keepTogether / startOnNewPage.
 *        When undefined, the default rules per BlockType are used.
 */
export function parseResume(
  data: ResumeData,
  sectionOrder: string[],
  sectionSettings?: Record<string, SectionSettings>
): LayoutNode[] {
  const nodes: LayoutNode[] = [];

  for (const sectionId of sectionOrder) {
    const node = parseSection(sectionId, data, sectionSettings);
    if (node) nodes.push(node);
  }

  return nodes;
}

/**
 * Apply per-section overrides on top of the default pagination rules.
 * - `keepTogether` forces `keepTogether: true` and `allowSplit: false`.
 * - `startOnNewPage` is read by the paginator itself (not stored on the node),
 *   but we tag the node with a flag for downstream consumers.
 */
function applySectionOverrides(
  base: PaginationRules,
  settings?: SectionSettings
): PaginationRules {
  if (!settings) return base;
  return {
    ...base,
    keepTogether: settings.keepTogether ? true : base.keepTogether,
    allowSplit: settings.keepTogether ? false : base.allowSplit,
  };
}

/** Parse a single section into a LayoutNode (with children for list sections) */
function parseSection(
  sectionId: string,
  data: ResumeData,
  sectionSettings?: Record<string, SectionSettings>
): LayoutNode | null {
  const settings = sectionSettings?.[sectionId];

  switch (sectionId) {
    case "personal":
      return createNode(
        BlockType.Contact,
        data,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Contact], settings),
        10,
        0,
        undefined,
        sectionId
      );

    case "summary":
      if (!data.summary?.trim()) return null;
      return createNode(
        BlockType.Summary,
        { text: data.summary },
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Summary], settings),
        16,
        0,
        undefined,
        sectionId
      );

    case "experience": {
      if (!data.experience.length) return null;
      const children = data.experience.map((exp) =>
        createNode(
          BlockType.ExperienceEntry,
          exp,
          DEFAULT_PAGINATION_RULES[BlockType.ExperienceEntry],
          8,
          8,
        )
      );
      return createNode(
        BlockType.Experience,
        null,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Experience], settings),
        20,
        12,
        children,
        sectionId
      );
    }

    case "skills":
      if (!data.skills.length) return null;
      return createNode(
        BlockType.Skills,
        data.skills,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Skills], settings),
        20,
        12,
        undefined,
        sectionId
      );

    case "projects": {
      if (!data.projects.length) return null;
      const children = data.projects.map((proj) =>
        createNode(
          BlockType.ProjectEntry,
          proj,
          DEFAULT_PAGINATION_RULES[BlockType.ProjectEntry],
          8,
          8
        )
      );
      return createNode(
        BlockType.Projects,
        null,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Projects], settings),
        20,
        12,
        children,
        sectionId
      );
    }

    case "education": {
      if (!data.education.length) return null;
      const children = data.education.map((edu) =>
        createNode(
          BlockType.EducationEntry,
          edu,
          DEFAULT_PAGINATION_RULES[BlockType.EducationEntry],
          6,
          6
        )
      );
      return createNode(
        BlockType.Education,
        null,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Education], settings),
        20,
        12,
        children,
        sectionId
      );
    }

    case "certifications":
      if (!data.certifications.length) return null;
      return createNode(
        BlockType.Certifications,
        data.certifications,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Certifications], settings),
        20,
        12,
        undefined,
        sectionId
      );

    case "languages":
      if (!data.languages.length) return null;
      return createNode(
        BlockType.Languages,
        data.languages,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Languages], settings),
        20,
        12,
        undefined,
        sectionId
      );

    case "awards":
      if (!data.awards.length) return null;
      return createNode(
        BlockType.Awards,
        data.awards,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Awards], settings),
        20,
        12,
        undefined,
        sectionId
      );

    case "publications":
      if (!data.publications.length) return null;
      return createNode(
        BlockType.Publications,
        data.publications,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Publications], settings),
        20,
        12,
        undefined,
        sectionId
      );

    case "interests":
      if (!data.interests.length) return null;
      return createNode(
        BlockType.Interests,
        data.interests,
        applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.Interests], settings),
        20,
        12,
        undefined,
        sectionId
      );

    case "references":
      // References typically not shown by default
      return null;

    default: {
      // Check custom sections
      const custom = data.customSections.find((cs) => cs.id === sectionId || cs.title.toLowerCase() === sectionId);
      if (custom && custom.items.length > 0) {
        return createNode(
          BlockType.CustomSection,
          custom,
          applySectionOverrides(DEFAULT_PAGINATION_RULES[BlockType.CustomSection], settings),
          20,
          12,
          undefined,
          sectionId
        );
      }
      return null;
    }
  }
}

/**
 * Create a LayoutNode with the given parameters.
 *
 * @param id - Optional explicit ID. When omitted, a unique id is generated.
 *             Top-level section nodes use the sectionId as their id so the
 *             paginator can match them against `pageBreaks`.
 */
function createNode(
  type: BlockType,
  data: unknown,
  rules: PaginationRules,
  marginTop: number = 0,
  marginBottom: number = 0,
  children?: LayoutNode[],
  id?: string
): LayoutNode {
  return {
    id: id ?? uid(),
    type,
    estimatedHeight: 0, // Will be set by the measurer
    marginTop,
    marginBottom,
    rules,
    data,
    children,
  };
}
