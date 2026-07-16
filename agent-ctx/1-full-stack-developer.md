# Task 1 — full-stack-developer — LinkedIn Optimizer Upgrade

## Files touched
- CREATED `/home/z/my-project/src/app/api/ai/linkedin/analyze/route.ts`
  - Deep section-by-section LinkedIn analysis endpoint
  - Body: `{ resumeText, linkedinText? }` — `linkedinText` optional
  - Returns STRICT JSON: `headline {current, score, issues[], suggested}`, `about {current, score, checks[{label,pass}], suggested}`, `experience[] {company, role, currentBullets[], rewrittenBullets[]}`, `skillsGap {resume[], linkedin[], market[], missing[]}`, `featured[]`, `seoScore`, `keywordCoverage[{keyword, present}]`, `recruiterKeywords[]`, `profileHealth {strength, activity, postsNeeded, recommendationsNeeded, skillsMissing, headlineStatus}`, `bannerIdea {text, layout}`
  - Uses `complete()` + `extractJson()` from `@/lib/ai`; `aiOk`/`aiError` from `../_helpers`. `runtime = "nodejs"`, `maxDuration = 60`.
- CREATED `/home/z/my-project/src/app/api/ai/linkedin/networking/route.ts`
  - Body: `{ name, resumeText, targetRole? }` → returns `{ connectionRequest, recruiterMessage, thankYou, referralRequest }`
  - Same helpers/runtime config as above.
- REWROTE `/home/z/my-project/src/components/modules/linkedin.tsx`
  - Old single-call module replaced with 4-tab experience (Import / Analysis / SEO & Networking / Profile Health)
  - Uses shared helpers: `useAI`, `ModuleHeader`, `AIButton`, `ScoreRing`, `Pill`, `AIEmptyState`, `TypingDots`, `useResumeStore`, `useCareerStore`, `extractTextFromFile`
  - On analysis complete → calls `useCareerStore.getState().setScore("linkedin", seoScore, "SEO")` and shows success toast + switches to Analysis tab
  - `CopyButton`, `MessageBlock`, `HealthMetric`, `ActionItem`, `SectionTitle` sub-components defined inside the file
  - `export function LinkedinModule()` (no default export) — matches page.tsx import
  - "use client" at top
  - Responsive: `sm:grid-cols-2`, `lg:grid-cols-3`, scrollable long lists use `max-h-72 overflow-y-auto scroll-thin`
  - Color tokens: `text-primary`, `bg-primary/10`, `text-muted-foreground`, `bg-muted` + status colors (red-500, emerald-500, amber-500) — no indigo/blue, no hardcoded colors elsewhere

## Lint result
- `bun run lint` → **0 errors, 9 warnings** (all 9 are pre-existing `jsx-a11y/alt-text` warnings on @react-pdf/renderer `<Image>` in `src/lib/resume/export-pdf.tsx` from Task 9-pdf — NOT in my files)
- `bunx tsc --noEmit` → 0 errors in any of the 3 files I created/modified

## Dev server
- `dev.log` shows clean compiles after the change (200 responses, no compile errors)

## Tab summary (what the user will see)
1. **Import** — 3 radio-like options (Upload PDF via `extractTextFromFile` / Paste textarea / Use my resume). After capture shows parsed-summary card (name, title, detected sections) + Analyze button. Empty/loading/error states use `AIEmptyState`, `TypingDots`, red-tinted card.
2. **Analysis** — Headline card (small ScoreRing 80px + current headline + red issues list + green suggested headline w/ CopyButton), About card (ScoreRing + 7 check pills pass/fail + suggested rewrite w/ scrollable CopyButton), Experience card (per role: before/after bullets side-by-side + per-role CopyButton), Skills Gap card (3-col grid Resume | LinkedIn | Market + red "Missing" panel + CopyButton), Featured card (list of 6 suggestion types w/ star icon).
3. **SEO & Networking** — Search Visibility card (large 130px ScoreRing + scrollable keyword-coverage matrix w/ ✓/✗ + recruiter keyword pills + CopyButton), Banner Generator card (gradient mockup w/ name, tagline, top-4 skills, QR placeholder + layout description + CopyButton), Networking Messages card (Connection Request / Recruiter Message / Thank You / Referral Request each w/ CopyButton + "Generate networking messages" button → calls `/api/ai/linkedin/networking`).
4. **Profile Health** — Weekly Profile Health card (large 130px ScoreRing overall strength + 6-metric grid: Strength% w/ Progress bar, Activity Pill, Posts needed, Recommendations needed, Skills missing, Headline status Pill) + AI Career Copilot card (weekly insight message personalized from `d.title` + 3 numbered actionable recommendations derived from analysis fields).

## Issues encountered
- None blocking. The `/agent-ctx` directory at filesystem root was not writable so I created `/home/z/my-project/agent-ctx` instead and put this note there too.
