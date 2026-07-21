// Template bridge: map our CareerOS templateId + user style overrides → a
// PagePerfect Template instance.
//
// IMPORTANT: We do NOT blindly override font/accent from the user's style.
// Each of the 67 upstream templates has its own carefully-designed font and
// accent color. We only override:
//   - accent: when the user has explicitly picked a different color
//   - font: NEVER — each template's font is part of its visual identity

import type { TemplateStyle } from "@/store/resume-store";
import { getTemplate, templateById, type Template } from "./templates";

// Legacy aliases — old CareerOS kebab-case IDs that map to upstream camelCase IDs.
const LEGACY_ALIASES: Record<string, string> = {
  "professional-one-column": "professionalOneColumn",
  "professional-timeline": "professionalTimeline",
  "modern-executive": "nunitoDarkCard",
  "software-engineer": "techEngineer",
  academic: "minimalSwiss",
  creative: "creativeAgency",
  "web-developer": "developer",
  "ux-designer": "designerPortfolio",
  teacher: "fresher",
  "product-manager": "productManager",
  "business-analyst": "consultant",
  executive: "classic",
  minimal: "minimalSwiss",
};

export function resolveTemplate(style: TemplateStyle): Template {
  // 1. Try the template ID directly — the upstream repo has 67 templates
  //    with camelCase IDs that match exactly what our store uses.
  let baseId = style.template;
  if (!templateById.has(baseId)) {
    // 2. Try legacy aliases
    baseId = LEGACY_ALIASES[style.template] ?? "modern";
  }
  const base = getTemplate(baseId);

  // Only override accent if the user has explicitly set one that differs
  // from the template's default accent. This preserves each template's
  // carefully-designed color scheme.
  const userAccent = style.accent;
  const templateAccent = base.theme.accent;
  const shouldOverrideAccent =
    userAccent &&
    userAccent !== templateAccent &&
    userAccent !== "#10b981"; // don't override with the store default

  const theme = shouldOverrideAccent
    ? { ...base.theme, accent: userAccent }
    : base.theme;

  return { ...base, theme };
}
