// Template bridge: map our CareerOS templateId + user style overrides → a
// PagePerfect Template instance. The PagePerfect engine only knows about
// Template objects; this bridge produces one with the user's accent/font applied
// on top of the base template config.

import type { TemplateStyle } from "@/store/resume-store";
import { fontStack, getTemplate, type Template } from "./templates";

// Map our CareerOS template IDs to PagePerfect base template IDs.
// The upstream repo now has 67 templates. We map our canonical IDs to the
// closest upstream template. Unknown IDs fall back to "modern".
const TEMPLATE_MAP: Record<string, string> = {
  // Base layouts
  modern: "modern",
  ats: "ats",
  executive: "classic",
  minimal: "minimal",
  leftSidebar: "leftSidebar",
  rightSidebar: "rightSidebar",
  twoColumn: "twoColumn",
  threeColumn: "threeColumn",
  headerTwoCol: "headerTwoCol",
  // ATS Pro templates — now native in the upstream repo
  "professional-one-column": "professionalOneColumn",
  "professional-timeline": "professionalTimeline",
  "professionalOneColumn": "professionalOneColumn",
  "professionalTimeline": "professionalTimeline",
  "modern-executive": "nunitoDarkCard",
  // Legacy aliases (kept so old localStorage values don't break)
  "software-engineer": "leftSidebar",
  academic: "leftSidebar",
  creative: "creative",
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
