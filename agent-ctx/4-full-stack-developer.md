# Task ID: 4 — Agent: full-stack-developer

## Task: Add Custom Sections editor card + render custom sections in all templates + update docx export

### Scope note (important)
The task description listed 6 template files to update (4 + 9 + 16 + 6 + 6 + 14 = 55 templates). However, on inspection only **2** of those files actually exist in the project:

- `/home/z/my-project/src/components/modules/resume-templates.tsx` — 4 base templates (Modern, ATS, Executive, Minimal) ✅ updated
- `/home/z/my-project/src/components/modules/resume-templates-extended.tsx` — 9 extended templates (SoftwareEngineer, Academic, Creative, WebDeveloper, UxDesigner, Teacher, ProductManager, Finance, BusinessAnalyst) ✅ updated

The other 4 files mentioned in the task description DO NOT EXIST in the project:
- `pro-templates.tsx` (Stanford, Harvard, SiliconValley, …) — not present
- `tech-templates.tsx` (Quantum, Nebula, Cyber, …) — not present
- `luxury-templates.tsx` (Vogue, Maison, Atelier, …) — not present
- `premium-templates-v2.tsx` (14 premium templates) — not present

Grep across `src/` for the template names (Stanford, Harvard, Quantum, Vogue, etc.) returns zero matches. Only 13 templates exist (4 base + 9 extended); all 13 were updated with custom-sections rendering.

### Part A — Custom Sections editor card
- **Note on file location**: The task said "add a 'Custom Sections' editor card to `resume-builder.tsx`". However, `resume-builder.tsx` only hosts the module shell + toolbar + preview; the actual editor cards live in `resume-editor.tsx` (rendered via `<ResumeEditor />`). I added the card in `resume-editor.tsx` — the only correct place — and it will appear inside `resume-builder.tsx` automatically.
- Imported `LayoutList` from `lucide-react` for the card icon.
- Imported `CustomSection` type from `@/store/resume-store`.
- Added three new components at the end of the entry-card section (after `ReferenceEntryCard`):
  - `CustomItemEntryCard({ sectionId, item })` — renders title/subtitle (grid-2), date, description textarea, and a ghost-variant "Remove item" `IconButtonRow` (reuses the existing `IconButtonRow` component with `deleteLabel="Remove item"`).
  - `CustomSectionEntryCard({ section })` — renders an editable section-title `Input`, a ghost-variant "Remove section" `Button` (red destructive styling), the list of `CustomItemEntryCard`s, an empty-state paragraph when items is empty, and an `AddButton` labelled "Add item" wired to `addCustomSectionItem(section.id)`.
  - `CustomSectionsCard()` — a Collapsible-based card visually identical to the existing `SectionCard` (icon chip + title "Custom Sections" + count badge + chevron). Could not reuse `SectionCard` directly because its `id` prop is typed as `SectionId` (a strict union that does not include "custom"), and the task explicitly forbade modifying the store. So I built a self-contained `CustomSectionsCard` that mirrors the `SectionCard` visual pattern: `rounded-xl border bg-card`, `CollapsibleTrigger` button with `size-7` icon chip and `text-sm font-semibold` title, `Separator`, `space-y-3 p-3` body. The body maps `customSections` to `CustomSectionEntryCard`s, shows an empty-state paragraph when there are zero sections, and renders an `AddButton` labelled "Add custom section" wired to `addCustomSection`.
- Wired store actions: `addCustomSection`, `updateCustomSection`, `removeCustomSection`, `addCustomSectionItem`, `updateCustomSectionItem`, `removeCustomSectionItem` — all used exactly as defined in `resume-store.ts`.
- Mounted `<CustomSectionsCard />` after the References `SectionCard` at the end of `ResumeEditor`'s returned `<div className="space-y-3">`.

### Part B — Custom sections rendering in templates

#### resume-templates.tsx (4 base templates, Tailwind class-based)
For each template, custom sections are rendered after the References section, in the MAIN column, using that template's existing section-header component and matching item styling.

1. **ModernTemplate** — uses `<ModernMainSection title={cs.title} accent={accent}>`. Items follow the Awards pattern: bold title left + accent-less date right (text-[11px] text-slate-500), subtitle/description in text-slate-600. Wrapped in `<ul className="flex flex-col gap-2">`.
2. **AtsTemplate** — uses `<AtsSection title={cs.title}>`. Items are inline (parseable single line): bold title + `, subtitle` + ` (date)` + ` — description` — same pattern as the existing ATS Awards/Certs entries. Wrapped in `<ul className="flex flex-col gap-1">`.
3. **ExecutiveTemplate** — uses `<ExecSection title={cs.title} accent={accent}>`. Items follow the Awards pattern: bold title + italic accent-colored `— subtitle` + slate-500 `· date` + slate-600 description div. Wrapped in `<ul className="flex flex-col gap-1.5">`.
4. **MinimalTemplate** — uses `<MinimalSection title={cs.title}>`. Items follow the Awards pattern: title (font-medium text-slate-800) + `· subtitle` (text-slate-500) + `— description` (text-slate-500) inline, with date right-aligned (text-[11.5px] text-slate-400). Wrapped in `<ul className="flex flex-col gap-3">`.

Each template filters `data.customSections.filter(cs => cs.items.length > 0)` to skip empty sections, and uses `cs.id` as the React key.

#### resume-templates-extended.tsx (9 extended templates, inline-style-based)
For each template, custom sections are rendered in the MAIN column (NOT the sidebar) after the last main-column section. Each uses that template's existing section-header component and item styling (matching the Awards/Certifications pattern where present).

1. **SoftwareEngineerTemplate** — `<SeMainSection title={cs.title} accent={accent}>`. Items: bold 12px title (#0f172a) + 11px subtitle (#334155) + 10.5px date (#64748b) + 11px description (#475569, lineHeight 1.4). After Certifications.
2. **AcademicTemplate** — `<AcMainSection title={cs.title} accent={accent} serif={serif}>`. Items: bold 11.5px serif title (#111827) + italic `— subtitle` + `· date` (#6b7280) + description div. Matches Publications pattern. After References.
3. **CreativeTemplate** — `<CrMainPill title={cs.title} accent={accent}>`. Items: bold 11.5px title (#1f2937) + `— subtitle` + `· date` (#6b7280) + description div. Matches Awards pattern. After Awards.
4. **WebDeveloperTemplate** — `<WdMainSection title={cs.title} accent={orange}>`. Items: bold 11.5px title (#111827) + `— subtitle` + `· date` (#6b7280) + description div. After Education.
5. **UxDesignerTemplate** — `<UxMainSection title={cs.title} accent={accent}>`. Items: bold 11.5px title (#111827) + `— subtitle` + `· date` (#6b7280) + description div. Matches Awards pattern. After Awards.
6. **TeacherTemplate** — `<TeMainSection title={cs.title} accent={yellow}>`. Items: bold 11.5px title (#111827) with date right-aligned (10.5px #6b7280), subtitle, description (#4b5563). Matches Achievements pattern. After Achievements.
7. **ProductManagerTemplate** — `<PmMainBar title={cs.title} accent={teal}>`. Items: bold 11.5px title (#111827) + `— subtitle` + `· date` (#6b7280) + description div. Matches Certifications pattern. After Certifications.
8. **FinanceTemplate** — `<FiSection title={cs.title}>` in the LEFT (main) column (not the right sidebar). Items: bold 11px title (#111827) + 11px subtitle (#4b5563) + 10px date (#6b7280) + description (#4b5563, marginTop 2). Rendered in the left cell after Education, before the right sidebar `</div>`.
9. **BusinessAnalystTemplate** — uses inline `<section>` with the navy-on-yellow header style (`color: navy, backgroundColor: yellow, padding: "4px 12px", margin: "0 0 10px 0"`) matching the template's other main-column section headers. Items: bold 11.5px title (#111827) + `— subtitle` + `· date` (#6b7280) + description div. Matches Certifications pattern. After Certifications.

### Part C — docx export (`src/lib/resume/export-docx.ts`)
- Added a new shared helper `appendCustomSectionsDocx(target, data, headerFn, itemOpts)` near the top of the file (after `bulletPara`):
  - `target: Paragraph[]` — the array to push paragraphs into (template-specific; e.g. `main` for sidebar templates, `children` for single-column templates, `left` for Finance).
  - `headerFn: (title: string) => void` — pushes a template-specific header paragraph into the same target array. Each template passes its own `header`/`h`/`lHeader` closure so the header style matches the rest of the template.
  - `itemOpts: { titleSize?, titleColor?, mutedColor?, font? }` — optional item-styling overrides. Serif templates (Executive, Academic) pass `{ font: SERIF }` so item text uses Georgia; others use the default (sans, DARK title, MUTED secondary).
  - For each non-empty custom section: calls `headerFn(cs.title.toUpperCase())`, then for each item pushes a paragraph with bold title + ` — subtitle` (muted) + italic `(date)` (muted, 1pt smaller) + a separate description paragraph (muted, 1pt smaller) when present.
- Called `appendCustomSectionsDocx` at the correct insertion point in each of the 12 build functions:
  1. `buildModern` — appends to `mainChildren`, header uses accent-colored `para([run(t, { bold, size: PT(9), color: A })], { spacing: { before: 120, after: 50 } })` to match the existing References header. Inserted after the references block, before the 2-column table is built.
  2. `buildAts` — appends to `children`, header uses the existing `h(t)` closure. Inserted before `return children`.
  3. `buildExecutive` — appends to `children`, header uses `h(t)`, itemOpts `{ font: SERIF }`. Inserted before `return children`.
  4. `buildMinimal` — appends to `children`, header uses `h(t)`. Inserted before `return children`.
  5. `buildSoftwareEngineer` — appends to `main`, header uses `header(t)`. Inserted after Certifications, before the 2-column table is built.
  6. `buildAcademic` — appends to `main`, header uses `header(t)`, itemOpts `{ font: SERIF }`. Inserted after References.
  7. `buildCreative` — appends to `main`, header uses `header(t)`. Inserted after Awards.
  8. `buildWebDeveloper` — appends to `main`, header uses `header(t)`. Inserted after Education.
  9. `buildUxDesigner` — appends to `main`, header uses `header(t)`. Inserted after Awards.
  10. `buildTeacher` — appends to `main`, header uses `header(t)`. Inserted after Achievements (awards).
  11. `buildProductManager` — appends to `main`, header uses `header(t)`. Inserted after Awards.
  12. `buildFinance` — appends to `left` (main column), header uses `lHeader(t)`. Inserted after Education, before `const right: Paragraph[] = []`.
  13. `buildBusinessAnalyst` — appends to `main`, header uses `header(t)` (the yellow-on-navy header closure). Inserted after Certifications.

For sidebar templates, custom sections are correctly placed in the MAIN cell, not the sidebar — they appear in the body of the resume where they belong, with the same accent color, header style, and item typography as the template's other main-column sections.

### Lint result
- `bun run lint` → **0 errors, 9 warnings** (all 9 are pre-existing `jsx-a11y/alt-text` warnings on `@react-pdf/renderer` `<Image>` elements in `src/lib/resume/export-pdf.tsx` — none in any file I touched).
- `bunx tsc --noEmit` filtered for my 3 modified files (`resume-editor`, `resume-templates`, `export-docx`) → no output (clean).

### Files modified
1. `/home/z/my-project/src/components/modules/resume-editor.tsx` — added `LayoutList` import, `CustomSection` type import, three new components (`CustomItemEntryCard`, `CustomSectionEntryCard`, `CustomSectionsCard`), and mounted `<CustomSectionsCard />` after the References SectionCard.
2. `/home/z/my-project/src/components/modules/resume-templates.tsx` — added custom-sections rendering to ModernTemplate, AtsTemplate, ExecutiveTemplate, MinimalTemplate (each using its own section-header component and matching item styling).
3. `/home/z/my-project/src/components/modules/resume-templates-extended.tsx` — added custom-sections rendering to all 9 extended templates (SoftwareEngineer, Academic, Creative, WebDeveloper, UxDesigner, Teacher, ProductManager, Finance, BusinessAnalyst). For Finance, custom sections go in the LEFT (main) column; for the other 8 sidebar templates, they go in the MAIN cell after the last main-column section.
4. `/home/z/my-project/src/lib/resume/export-docx.ts` — added `appendCustomSectionsDocx` helper and called it in all 12 build functions (buildModern, buildAts, buildExecutive, buildMinimal, buildSoftwareEngineer, buildAcademic, buildCreative, buildWebDeveloper, buildUxDesigner, buildTeacher, buildProductManager, buildFinance, buildBusinessAnalyst — that's actually 13 build functions; all 13 were updated).

### What I did NOT touch (per task instructions)
- The import handler in `resume-builder.tsx` (handled by another agent — Task 3).
- The `parse-resume-chunked` route.
- The resume store (already done).
- No test code written.
- No existing template styling was changed — all custom-sections rendering uses each template's existing accent color, section-header component, and item typography.

### Issues encountered
1. **Missing template files**: The task description listed 4 template files (pro-templates.tsx, tech-templates.tsx, luxury-templates.tsx, premium-templates-v2.tsx) that do not exist in the project. Confirmed via `find` and `grep` — only `resume-templates.tsx` and `resume-templates-extended.tsx` exist. Updated all 13 templates in the 2 existing files.
2. **Editor file location**: The task said "add a 'Custom Sections' editor card to `resume-builder.tsx`", but the actual editor cards live in `resume-editor.tsx` (which `resume-builder.tsx` imports and renders via `<ResumeEditor />`). Added the card in `resume-editor.tsx` — the only correct place.
3. **SectionId type restriction**: Could not reuse the existing `SectionCard` component for the custom-sections card because its `id` prop is typed as `SectionId` (a strict union that does not include "custom"), and the task forbade modifying the store. Built a self-contained `CustomSectionsCard` that mirrors the `SectionCard` visual pattern (Collapsible + icon chip + title + count badge + chevron + Separator + body) but doesn't require the id.
