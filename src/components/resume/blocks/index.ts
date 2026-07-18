/**
 * Barrel export for all resume block components.
 *
 * Each block is a small, self-contained React component that renders ONE
 * piece of the resume (one entry, one section, one header). Blocks receive
 * only their own data — never the full resume — which makes them safe to
 * compose and render in isolation for PDF export.
 */
export { HeaderBlock } from "./HeaderBlock";
export { SummaryBlock, SectionTitle } from "./SummaryBlock";
export { ExperienceBlock } from "./ExperienceBlock";
export { SkillsBlock } from "./SkillsBlock";
export { ProjectsBlock } from "./ProjectsBlock";
export { EducationBlock } from "./EducationBlock";
export { SimpleSectionBlock } from "./SimpleSectionBlock";
export { LanguagesBlock, InterestsBlock, CustomSectionBlock } from "./LanguagesBlock";
export { SectionHeaderBlock, titleForSection } from "./SectionHeaderBlock";
export type * from "./types";
