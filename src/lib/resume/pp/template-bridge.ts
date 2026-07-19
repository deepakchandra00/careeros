// Template bridge: map our CareerOS templateId + user style overrides → a
// PagePerfect Template instance. The PagePerfect engine only knows about
// Template objects; this bridge produces one with the user's accent/font applied
// on top of the base template config.

import type { TemplateStyle } from "@/store/resume-store";
import { fontStack, getTemplate, type Template } from "./templates";

// Map our CareerOS template IDs to PagePerfect base template IDs.
// After the template cleanup, we only have a handful of canonical layout IDs.
// Unknown IDs fall back to "modern" (leftSidebar).
const TEMPLATE_MAP: Record<string, string> = {
  modern: "modern",
  ats: "ats",
  executive: "executive",
  minimal: "minimal",
  leftSidebar: "leftSidebar",
  rightSidebar: "rightSidebar",
  twoColumn: "twoColumn",
  threeColumn: "threeColumn",
  headerTwoCol: "headerTwoCol",
  // ATS Pro templates (from dummy/ folder in careeros repo)
  "professional-one-column": "professional-one-column",
  "professional-timeline": "professional-timeline",
  "modern-executive": "modern-executive",
  // Legacy aliases (kept so old localStorage values don't break) — all map to
  // a PagePerfect base layout.
  "software-engineer": "leftSidebar",
  academic: "leftSidebar",
  creative: "leftSidebar",
  "web-developer": "leftSidebar",
  "ux-designer": "leftSidebar",
  teacher: "leftSidebar",
  "product-manager": "leftSidebar",
  finance: "headerTwoCol",
  "business-analyst": "leftSidebar",
};

export function resolveTemplate(style: TemplateStyle): Template {
  const baseId = TEMPLATE_MAP[style.template] ?? "modern";
  const base = getTemplate(baseId);

  // Apply accent override.
  const accent = style.accent || base.theme.accent;

  // Apply font override.
  const fontStackCss = fontStack(style.font);

  const theme = {
    ...base.theme,
    accent,
    headingFont: fontStackCss,
    bodyFont: fontStackCss,
  };

  return { ...base, theme };
}
