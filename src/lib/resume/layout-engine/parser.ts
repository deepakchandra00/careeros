/**
 * Section Parser — Converts Resume JSON into a tree of LayoutNodes.
 *
 * Pure TypeScript. No React. No DOM.
 *
 * Input: ResumeData (from the Zustand store)
 * Output: LayoutNode[] (a tree of sections and entries)
 */

import type { ResumeData } from "@/store/resume-store";
import { BlockType, DEFAULT_PAGINATION_RULES, type LayoutNode, type PaginationRules } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

/** Parse a ResumeData object into a tree of LayoutNodes */
export function parseResume(data: ResumeData, sectionOrder: string[]): LayoutNode[] {
  const nodes: LayoutNode[] = [];

  for (const sectionId of sectionOrder) {
    const node = parseSection(sectionId, data);
    if (node) nodes.push(node);
  }

  return nodes;
}

/** Parse a single section into a LayoutNode (with children for list sections) */
function parseSection(sectionId: string, data: ResumeData): LayoutNode | null {
  switch (sectionId) {
    case "personal":
      return createNode(BlockType.Contact, data, DEFAULT_PAGINATION_RULES[BlockType.Contact], 10);

    case "summary":
      if (!data.summary?.trim()) return null;
      return createNode(BlockType.Summary, { text: data.summary }, DEFAULT_PAGINATION_RULES[BlockType.Summary], 16);

    case "experience": {
      if (!data.experience.length) return null;
      const children = data.experience.map((exp) =>
        createNode(
          BlockType.ExperienceEntry,
          exp,
          DEFAULT_PAGINATION_RULES[BlockType.ExperienceEntry],
          8,
          8
        )
      );
      return createNode(BlockType.Experience, null, DEFAULT_PAGINATION_RULES[BlockType.Experience], 20, 12, children);
    }

    case "skills":
      if (!data.skills.length) return null;
      return createNode(BlockType.Skills, data.skills, DEFAULT_PAGINATION_RULES[BlockType.Skills], 20, 12);

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
      return createNode(BlockType.Projects, null, DEFAULT_PAGINATION_RULES[BlockType.Projects], 20, 12, children);
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
      return createNode(BlockType.Education, null, DEFAULT_PAGINATION_RULES[BlockType.Education], 20, 12, children);
    }

    case "certifications":
      if (!data.certifications.length) return null;
      return createNode(BlockType.Certifications, data.certifications, DEFAULT_PAGINATION_RULES[BlockType.Certifications], 20, 12);

    case "languages":
      if (!data.languages.length) return null;
      return createNode(BlockType.Languages, data.languages, DEFAULT_PAGINATION_RULES[BlockType.Languages], 20, 12);

    case "awards":
      if (!data.awards.length) return null;
      return createNode(BlockType.Awards, data.awards, DEFAULT_PAGINATION_RULES[BlockType.Awards], 20, 12);

    case "publications":
      if (!data.publications.length) return null;
      return createNode(BlockType.Publications, data.publications, DEFAULT_PAGINATION_RULES[BlockType.Publications], 20, 12);

    case "interests":
      if (!data.interests.length) return null;
      return createNode(BlockType.Interests, data.interests, DEFAULT_PAGINATION_RULES[BlockType.Interests], 20, 12);

    case "references":
      // References typically not shown by default
      return null;

    default:
      // Check custom sections
      const custom = data.customSections.find((cs) => cs.id === sectionId || cs.title.toLowerCase() === sectionId);
      if (custom && custom.items.length > 0) {
        return createNode(BlockType.CustomSection, custom, DEFAULT_PAGINATION_RULES[BlockType.CustomSection], 20, 12);
      }
      return null;
  }
}

/** Create a LayoutNode with the given parameters */
function createNode(
  type: BlockType,
  data: unknown,
  rules: PaginationRules,
  marginTop: number = 0,
  marginBottom: number = 0,
  children?: LayoutNode[]
): LayoutNode {
  return {
    id: uid(),
    type,
    estimatedHeight: 0, // Will be set by the measurer
    marginTop,
    marginBottom,
    rules,
    data,
    children,
  };
}
