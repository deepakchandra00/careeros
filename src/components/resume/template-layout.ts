/**
 * Template pattern helpers.
 *
 * Maps a template ID to its structural pattern (sidebar-left, sidebar-right,
 * header-band, single-column) and sidebar width. This is the single source
 * of truth used by both the on-screen PageRenderer and the print/PDF path.
 *
 * The pattern + sidebar width come from the shared DOCX config so the HTML
 * preview and the Word export stay visually consistent.
 */
import { getDocxConfig, type DocxPattern } from "@/lib/resume/docx-config";
import { A4_WIDTH } from "@/lib/resume/layout-engine/types";

export type TemplatePattern = DocxPattern;

export interface TemplateLayoutInfo {
  pattern: TemplatePattern;
  /** Sidebar width in pixels (0 for non-sidebar patterns). */
  sidebarWidth: number;
}

/**
 * Get the structural pattern + sidebar width for a template ID.
 *
 * Falls back to `sidebar-left` with a 34% sidebar for unknown templates —
 * matching the universal fallback in docx-config.ts.
 */
export function getTemplateLayout(templateId: string | undefined | null): TemplateLayoutInfo {
  const id = (templateId || "").trim();
  const cfg = getDocxConfig(id);
  const sidebarWidth =
    cfg.pattern === "sidebar-left" || cfg.pattern === "sidebar-right"
      ? Math.round((A4_WIDTH * (cfg.sidebarWidthPct || 0)) / 100)
      : 0;
  return {
    pattern: cfg.pattern,
    sidebarWidth,
  };
}

/** Convenience: just the pattern. */
export function getTemplatePattern(templateId: string | undefined | null): TemplatePattern {
  return getTemplateLayout(templateId).pattern;
}

/** Convenience: just the sidebar width (px). */
export function getSidebarWidth(templateId: string | undefined | null): number {
  return getTemplateLayout(templateId).sidebarWidth;
}
