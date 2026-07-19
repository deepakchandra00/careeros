// PagePerfect engine barrel — public API for the resume rendering engine.
//
// Architecture (adapted from pageperfect-resume-engine):
//   schema.ts      — Resume data schema + normalize()
//   templates.ts   — Template configs (layout + theme + spacing + sections)
//   model.ts       — Resume → Block[] grouped by BlockGroup (per section)
//   BlockView.tsx  — Pure presentation: renders each Block kind
//   engine.tsx     — measure → paginate → render pages (preview == print)
//   adapter.ts     — our ResumeData → PagePerfect Resume
//   template-bridge.ts — our templateId + style overrides → PagePerfect Template

export { resumeSchema, normalizeResume } from "./schema";
export type {
  Resume,
  Experience,
  Project,
  Education,
  SkillGroup,
  Certification,
  Language,
  Award,
  Publication,
  Reference,
} from "./schema";

export {
  templates,
  templateById,
  getTemplate,
  fontStack,
} from "./templates";
export type {
  Template,
  Theme,
  Spacing,
  SectionId,
  LayoutKind,
} from "./templates";

export {
  buildGroupsFor,
  buildSectionGroups,
  themeCssVars,
} from "./model";
export type { Block, BlockGroup, EntryData } from "./model";

export { BlockView } from "./BlockView";

export {
  ResumeDocument,
  resolveRegions,
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
} from "./engine";

export { toPagePerfectResume } from "./adapter";
export { resolveTemplate } from "./template-bridge";
