"use client";

import * as React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  type LucideIcon,
} from "lucide-react";
import {
  type ResumeData,
  type ExperienceItem,
  type ProjectItem,
  type EducationItem,
  type SimpleItem,
  type ReferenceItem,
  type TemplateStyle,
} from "@/store/resume-store";
import { cn } from "@/lib/utils";
import {
  SoftwareEngineerTemplate,
  AcademicTemplate,
  CreativeTemplate,
  WebDeveloperTemplate,
  UxDesignerTemplate,
  TeacherTemplate,
  ProductManagerTemplate,
  FinanceTemplate,
  BusinessAnalystTemplate,
} from "@/components/modules/resume-templates-extended";
import {
  StanfordTemplate,
  HarvardTemplate,
  SiliconValleyTemplate,
  ManhattanTemplate,
  PragueTemplate,
  TokyoTemplate,
  OxfordTemplate,
  BerlinTemplate,
  MiamiTemplate,
  SeoulTemplate,
  DubaiTemplate,
  SingaporeTemplate,
  StockholmTemplate,
  MumbaiTemplate,
  TorontoTemplate,
  SydneyTemplate,
} from "@/components/modules/pro-templates";
import {
  QuantumTemplate,
  NebulaTemplate,
  CyberTemplate,
  VoltageTemplate,
  SynthwaveTemplate,
  HologramTemplate,
} from "@/components/modules/tech-templates";
import {
  VogueTemplate,
  MaisonTemplate,
  AtelierTemplate,
  RivieraTemplate,
  NoirTemplate,
  HeritageTemplate,
} from "@/components/modules/luxury-templates";
import {
  PurpleExecutiveTemplate,
  BrownClassicTemplate,
  PeachModernTemplate,
  WarmProfessionalTemplate,
  EarthPremiumTemplate,
  PinkGeometricTemplate,
  RoseElegantTemplate,
  FoundationPurpleTemplate,
  BlueSidebarProTemplate,
  AspireTealTemplate,
  CanvaPinkBlueTemplate,
  CollegeCVTealTemplate,
  CombinedBlueTemplate,
  NavyYellowProTemplate,
} from "@/components/modules/premium-templates-v2";

/* ============================================================
 * Catalog exports — template / font / accent option tables
 * ========================================================== */

export const TEMPLATE_OPTIONS: {
  id: string;
  name: string;
  description: string;
  accent: string;
}[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Two-column sidebar",
    accent: "#10b981",
  },
  {
    id: "ats",
    name: "ATS",
    description: "Single-column, parseable",
    accent: "#374151",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Centered serif header",
    accent: "#b45309",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean, airy",
    accent: "#0f172a",
  },
  {
    id: "software-engineer",
    name: "Software Engineer",
    description: "Dark sidebar + photo",
    accent: "#1e293b",
  },
  {
    id: "academic",
    name: "Academic CV",
    description: "Scholarly sidebar",
    accent: "#374151",
  },
  {
    id: "creative",
    name: "Creative Designer",
    description: "Bold + skill bars",
    accent: "#ea580c",
  },
  {
    id: "web-developer",
    name: "Web Developer",
    description: "Diagonal + skill bars",
    accent: "#f97316",
  },
  {
    id: "ux-designer",
    name: "UX Designer",
    description: "Timeline + photo",
    accent: "#1e3a5f",
  },
  {
    id: "teacher",
    name: "Teacher",
    description: "Diagonal + skill bars",
    accent: "#eab308",
  },
  {
    id: "product-manager",
    name: "Product Manager",
    description: "Green bars + photo",
    accent: "#059669",
  },
  {
    id: "finance",
    name: "Finance Executive",
    description: "Header band + 2-col",
    accent: "#1f2937",
  },
  {
    id: "business-analyst",
    name: "Business Analyst",
    description: "Navy + yellow timeline",
    accent: "#1e3a5f",
  },
];

export const FONT_OPTIONS: { id: string; name: string; stack: string }[] = [
  {
    id: "sans",
    name: "Sans",
    stack:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  {
    id: "serif",
    name: "Serif",
    stack: "ui-serif, Georgia, Cambria, Times New Roman, serif",
  },
  {
    id: "mono",
    name: "Mono",
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
];

export const ACCENT_OPTIONS: string[] = [
  "#10b981",
  "#0891b2",
  "#7c3aed",
  "#b45309",
  "#dc2626",
  "#0f172a",
  "#db2777",
  "#0d9488",
];

/* ============================================================
 * Shared helpers
 * ========================================================== */

function fontStackFor(font: string): string {
  return FONT_OPTIONS.find((f) => f.id === font)?.stack ?? FONT_OPTIONS[0].stack;
}

/** "Start – End" using en dash. If only start present: "Start – Present". */
function formatRange(start: string, end: string): string {
  const s = (start ?? "").trim();
  const e = (end ?? "").trim();
  if (s && e) return `${s} \u2013 ${e}`;
  if (s) return `${s} \u2013 Present`;
  if (e) return e;
  return "";
}

function nonEmptyBullets(bullets: string[]): string[] {
  return (bullets ?? []).map((b) => (b ?? "").trim()).filter(Boolean);
}

function joinTech(tech: string[]): string {
  return (tech ?? []).map((t) => (t ?? "").trim()).filter(Boolean).join(", ");
}

interface ContactEntry {
  icon: LucideIcon;
  value: string;
}

function buildContact(data: ResumeData): ContactEntry[] {
  const out: ContactEntry[] = [];
  if (data.email) out.push({ icon: Mail, value: data.email });
  if (data.phone) out.push({ icon: Phone, value: data.phone });
  if (data.location) out.push({ icon: MapPin, value: data.location });
  if (data.linkedin) out.push({ icon: Linkedin, value: data.linkedin });
  if (data.github) out.push({ icon: Github, value: data.github });
  if (data.website) out.push({ icon: Globe, value: data.website });
  return out;
}

function buildContactStrings(data: ResumeData): string[] {
  const out: string[] = [];
  if (data.email) out.push(data.email);
  if (data.phone) out.push(data.phone);
  if (data.location) out.push(data.location);
  if (data.linkedin) out.push(data.linkedin);
  if (data.github) out.push(data.github);
  if (data.website) out.push(data.website);
  return out;
}

/** translucent accent (hex alpha suffix). Falls back gracefully. */
function alpha(hex: string, a: string): string {
  // strip any leading alpha that's already there
  const h = hex.replace(/#[0-9a-fA-F]{8}$/, (m) => m.slice(0, 7));
  return `${h}${a}`;
}

interface TemplateProps {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}

/* ============================================================
 * Root exported component
 * ========================================================== */

export interface ResumePreviewProps {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  className?: string;
}

// Export internal base templates for use by the resume-render route (per-template dynamic import)
export { ModernTemplate, AtsTemplate, ExecutiveTemplate, MinimalTemplate };

export function ResumePreview({
  data,
  style,
  sections,
  className,
}: ResumePreviewProps) {
  const fontStack = fontStackFor(style.font);
  const accent = style.accent || "#10b981";
  const template = style.template || "modern";

  let body: React.ReactNode;
  if (template === "ats") {
    body = <AtsTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "executive") {
    body = (
      <ExecutiveTemplate data={data} sections={sections} accent={accent} />
    );
  } else if (template === "minimal") {
    body = <MinimalTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "software-engineer") {
    body = <SoftwareEngineerTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "academic") {
    body = <AcademicTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "creative") {
    body = <CreativeTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "web-developer") {
    body = <WebDeveloperTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "ux-designer") {
    body = <UxDesignerTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "teacher") {
    body = <TeacherTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "product-manager") {
    body = <ProductManagerTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "finance") {
    body = <FinanceTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "business-analyst") {
    body = <BusinessAnalystTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-purple-executive") {
    body = <PurpleExecutiveTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-brown-classic") {
    body = <BrownClassicTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-peach-modern") {
    body = <PeachModernTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-warm-professional") {
    body = <WarmProfessionalTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-earth-premium") {
    body = <EarthPremiumTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-pink-geometric") {
    body = <PinkGeometricTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-rose-elegant") {
    body = <RoseElegantTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-foundation-purple") {
    body = <FoundationPurpleTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-blue-sidebar") {
    body = <BlueSidebarProTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-aspire-teal") {
    body = <AspireTealTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-canva-pink-blue") {
    body = <CanvaPinkBlueTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-college-teal") {
    body = <CollegeCVTealTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-combined-blue") {
    body = <CombinedBlueTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "premium-navy-yellow") {
    body = <NavyYellowProTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "stanford") {
    body = <StanfordTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "harvard") {
    body = <HarvardTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "silicon-valley") {
    body = <SiliconValleyTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "manhattan") {
    body = <ManhattanTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "prague") {
    body = <PragueTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "tokyo") {
    body = <TokyoTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "oxford") {
    body = <OxfordTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "berlin") {
    body = <BerlinTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "miami") {
    body = <MiamiTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "seoul") {
    body = <SeoulTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "dubai") {
    body = <DubaiTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "singapore") {
    body = <SingaporeTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "stockholm") {
    body = <StockholmTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "mumbai") {
    body = <MumbaiTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "toronto") {
    body = <TorontoTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "sydney") {
    body = <SydneyTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "quantum") {
    body = <QuantumTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "nebula") {
    body = <NebulaTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "cyber") {
    body = <CyberTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "voltage") {
    body = <VoltageTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "synthwave") {
    body = <SynthwaveTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "hologram") {
    body = <HologramTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "vogue") {
    body = <VogueTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "maison") {
    body = <MaisonTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "atelier") {
    body = <AtelierTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "riviera") {
    body = <RivieraTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "noir") {
    body = <NoirTemplate data={data} sections={sections} accent={accent} />;
  } else if (template === "heritage") {
    body = <HeritageTemplate data={data} sections={sections} accent={accent} />;
  } else {
    body = <ModernTemplate data={data} sections={sections} accent={accent} />;
  }

  return (
    <div
      className={cn(
        "resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl",
        className,
      )}
      style={{ fontFamily: fontStack }}
    >
      {body}
    </div>
  );
}

/* ============================================================
 * 1) MODERN — two-column sidebar
 * ========================================================== */

function ModernTemplate({ data, sections, accent }: TemplateProps) {
  const showPersonal = sections.personal !== false;
  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;
  const showSkills = sections.skills && data.skills.length > 0;
  const showLanguages = sections.languages && data.languages.length > 0;
  const showCerts =
    sections.certifications && data.certifications.length > 0;
  const showInterests = sections.interests && data.interests.length > 0;
  const showPubs = sections.publications && data.publications.length > 0;

  const sidebarHasContent =
    showContact ||
    showSkills ||
    showLanguages ||
    showCerts ||
    showInterests ||
    showPubs;

  const showSummary = sections.summary && data.summary.trim().length > 0;
  const showExperience = sections.experience && data.experience.length > 0;
  const showProjects = sections.projects && data.projects.length > 0;
  const showEducation = sections.education && data.education.length > 0;
  const showAwards = sections.awards && data.awards.length > 0;
  const showReferences = sections.references && data.references.length > 0;

  return (
    <div className="grid grid-cols-[34%_1fr] min-h-[1123px]">
      {/* ---------- Sidebar ---------- */}
      <aside
        className="flex flex-col gap-6 p-6 text-white"
        style={{ backgroundColor: accent }}
      >
        {sidebarHasContent ? (
          <>
            {showContact && (
              <ModernSidebarSection title="Contact">
                <ul className="space-y-1.5 text-[12px]">
                  {contacts.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 leading-snug"
                    >
                      <c.icon className="mt-[2px] size-3 shrink-0 opacity-85" />
                      <span className="break-words">{c.value}</span>
                    </li>
                  ))}
                </ul>
              </ModernSidebarSection>
            )}

            {showSkills && (
              <ModernSidebarSection title="Skills">
                <ul className="flex flex-wrap gap-1.5">
                  {data.skills.map((s, i) => (
                    <li
                      key={i}
                      className="rounded px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </ModernSidebarSection>
            )}

            {showLanguages && (
              <ModernSidebarSection title="Languages">
                <ul className="space-y-1 text-[12px]">
                  {data.languages.map((l, i) => (
                    <li key={i} className="leading-snug">
                      {l}
                    </li>
                  ))}
                </ul>
              </ModernSidebarSection>
            )}

            {showCerts && (
              <ModernSidebarSection title="Certifications">
                <ul className="space-y-2 text-[12px]">
                  {data.certifications.map((c) => (
                    <li key={c.id} className="leading-snug">
                      <div className="font-semibold">{c.title}</div>
                      {c.subtitle && (
                        <div className="opacity-85">{c.subtitle}</div>
                      )}
                      {c.date && (
                        <div className="opacity-70 text-[11px]">{c.date}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </ModernSidebarSection>
            )}

            {showInterests && (
              <ModernSidebarSection title="Interests">
                <ul className="flex flex-wrap gap-1.5">
                  {data.interests.map((it, i) => (
                    <li
                      key={i}
                      className="rounded px-2 py-0.5 text-[11px]"
                      style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </ModernSidebarSection>
            )}

            {showPubs && (
              <ModernSidebarSection title="Publications">
                <ul className="space-y-2 text-[12px]">
                  {data.publications.map((p) => (
                    <li key={p.id} className="leading-snug">
                      <div className="font-semibold">{p.title}</div>
                      {p.subtitle && (
                        <div className="opacity-85">{p.subtitle}</div>
                      )}
                      {p.date && (
                        <div className="opacity-70 text-[11px]">{p.date}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </ModernSidebarSection>
            )}
          </>
        ) : null}
      </aside>

      {/* ---------- Main ---------- */}
      <main className="flex flex-col gap-5 p-7">
        {showPersonal && (
          <header className="space-y-1">
            <h1 className="text-[32px] font-bold leading-tight tracking-tight">
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p
                className="text-[15px] font-semibold"
                style={{ color: accent }}
              >
                {data.title}
              </p>
            )}
          </header>
        )}

        {showSummary && (
          <ModernMainSection title="Summary" accent={accent}>
            <p className="text-[13px] leading-relaxed text-slate-700">
              {data.summary}
            </p>
          </ModernMainSection>
        )}

        {showExperience && (
          <ModernMainSection title="Experience" accent={accent}>
            <div className="flex flex-col gap-4">
              {data.experience.map((exp) => (
                <ModernExperience key={exp.id} exp={exp} accent={accent} />
              ))}
            </div>
          </ModernMainSection>
        )}

        {showProjects && (
          <ModernMainSection title="Projects" accent={accent}>
            <div className="flex flex-col gap-3">
              {data.projects.map((p) => (
                <ModernProject key={p.id} project={p} accent={accent} />
              ))}
            </div>
          </ModernMainSection>
        )}

        {showEducation && (
          <ModernMainSection title="Education" accent={accent}>
            <div className="flex flex-col gap-2">
              {data.education.map((ed) => (
                <ModernEducation key={ed.id} edu={ed} />
              ))}
            </div>
          </ModernMainSection>
        )}

        {showAwards && (
          <ModernMainSection title="Awards" accent={accent}>
            <ul className="flex flex-col gap-2">
              {data.awards.map((a) => (
                <li key={a.id} className="text-[13px] leading-snug">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-slate-900">
                      {a.title}
                    </span>
                    {a.date && (
                      <span className="shrink-0 text-[11px] text-slate-500">
                        {a.date}
                      </span>
                    )}
                  </div>
                  {a.subtitle && (
                    <div className="text-slate-600">{a.subtitle}</div>
                  )}
                  {a.description && (
                    <div className="text-slate-600">{a.description}</div>
                  )}
                </li>
              ))}
            </ul>
          </ModernMainSection>
        )}

        {showReferences && (
          <ModernMainSection title="References" accent={accent}>
            <div className="grid grid-cols-2 gap-3">
              {data.references.map((r) => (
                <div key={r.id} className="text-[12px] leading-snug">
                  <div className="font-semibold text-slate-900">{r.name}</div>
                  {r.role && <div className="text-slate-600">{r.role}</div>}
                  {r.company && (
                    <div className="text-slate-600">{r.company}</div>
                  )}
                  {r.contact && (
                    <div className="text-slate-500">{r.contact}</div>
                  )}
                </div>
              ))}
            </div>
          </ModernMainSection>
        )}

        {sections.custom !== false &&
          data.customSections
            .filter((s) => s.items.length > 0)
            .map((section) => (
              <ModernMainSection
                key={section.id}
                title={section.title}
                accent={accent}
              >
                <ul className="flex flex-col gap-2">
                  {section.items.map((item) => (
                    <li key={item.id} className="text-[13px] leading-snug">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold text-slate-900">
                          {item.title}
                        </span>
                        {item.date && (
                          <span className="shrink-0 text-[11px] text-slate-500">
                            {item.date}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-slate-600">{item.subtitle}</div>
                      )}
                      {item.description && (
                        <div className="text-slate-600">{item.description}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </ModernMainSection>
            ))}
      </main>
    </div>
  );
}

function ModernSidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] opacity-95">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ModernMainSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className="mb-2 border-b pb-1 text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ color: accent, borderColor: alpha(accent, "33") }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function ModernExperience({
  exp,
  accent,
}: {
  exp: ExperienceItem;
  accent: string;
}) {
  const bullets = nonEmptyBullets(exp.bullets);
  const range = formatRange(exp.start, exp.end);
  return (
    <div className="resume-no-break">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[14px] font-bold text-slate-900">{exp.role}</div>
          <div className="text-[13px] text-slate-700">
            {exp.company}
            {exp.location ? ` · ${exp.location}` : ""}
          </div>
        </div>
        {range && (
          <span className="shrink-0 text-[11px] font-medium text-slate-500">
            {range}
          </span>
        )}
      </div>
      {bullets.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2 text-[12.5px] leading-snug text-slate-700"
            >
              <span
                className="mt-[6px] size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ModernProject({
  project,
  accent,
}: {
  project: ProjectItem;
  accent: string;
}) {
  const tech = joinTech(project.tech);
  return (
    <div className="resume-no-break">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[13.5px] font-bold text-slate-900">
          {project.name}
        </div>
        {project.link && (
          <span
            className="shrink-0 text-[11px] font-medium"
            style={{ color: accent }}
          >
            {project.link}
          </span>
        )}
      </div>
      {project.description && (
        <p className="mt-0.5 text-[12.5px] leading-snug text-slate-700">
          {project.description}
        </p>
      )}
      {tech && (
        <p className="mt-0.5 text-[11.5px] text-slate-500">
          <span className="font-medium">Tech:</span> {tech}
        </p>
      )}
    </div>
  );
}

function ModernEducation({ edu }: { edu: EducationItem }) {
  const range = formatRange(edu.start, edu.end);
  return (
    <div className="resume-no-break">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[13px] font-bold text-slate-900">{edu.degree}</div>
        {range && (
          <span className="shrink-0 text-[11px] text-slate-500">{range}</span>
        )}
      </div>
      <div className="text-[12.5px] text-slate-700">
        {edu.school}
        {edu.location ? ` · ${edu.location}` : ""}
      </div>
      {edu.grade && (
        <div className="text-[11.5px] text-slate-500">{edu.grade}</div>
      )}
    </div>
  );
}

/* ============================================================
 * 2) ATS — single-column, plain, maximally parseable
 * ========================================================== */

function AtsTemplate({ data, sections, accent }: TemplateProps) {
  const showPersonal = sections.personal !== false;
  const contacts = buildContactStrings(data);

  const showSummary = sections.summary && data.summary.trim().length > 0;
  const showExperience = sections.experience && data.experience.length > 0;
  const showSkills = sections.skills && data.skills.length > 0;
  const showProjects = sections.projects && data.projects.length > 0;
  const showEducation = sections.education && data.education.length > 0;
  const showCerts =
    sections.certifications && data.certifications.length > 0;
  const showLanguages = sections.languages && data.languages.length > 0;
  const showAwards = sections.awards && data.awards.length > 0;
  const showPubs = sections.publications && data.publications.length > 0;
  const showInterests = sections.interests && data.interests.length > 0;
  const showReferences = sections.references && data.references.length > 0;

  return (
    <div className="mx-auto max-w-[760px] p-10">
      {showPersonal && (
        <header className="mb-6 text-center">
          <h1 className="text-[26px] font-bold leading-tight text-slate-900">
            {data.name || "Your Name"}
          </h1>
          {data.title && (
            <p className="mt-1 text-[14px] text-slate-600">{data.title}</p>
          )}
          {contacts.length > 0 && (
            <p className="mt-2 text-[12px] text-slate-700">
              {contacts.join(" | ")}
            </p>
          )}
        </header>
      )}

      {showSummary && (
        <AtsSection title="Summary">
          <p className="text-[13px] leading-relaxed text-slate-800">
            {data.summary}
          </p>
        </AtsSection>
      )}

      {showExperience && (
        <AtsSection title="Experience">
          <div className="flex flex-col gap-3">
            {data.experience.map((exp) => (
              <AtsExperience key={exp.id} exp={exp} />
            ))}
          </div>
        </AtsSection>
      )}

      {showEducation && (
        <AtsSection title="Education">
          <div className="flex flex-col gap-2">
            {data.education.map((ed) => (
              <AtsEducation key={ed.id} edu={ed} />
            ))}
          </div>
        </AtsSection>
      )}

      {showSkills && (
        <AtsSection title="Skills">
          <p className="text-[13px] leading-relaxed text-slate-800">
            {data.skills.join(", ")}
          </p>
        </AtsSection>
      )}

      {showProjects && (
        <AtsSection title="Projects">
          <div className="flex flex-col gap-2">
            {data.projects.map((p) => (
              <AtsProject key={p.id} project={p} />
            ))}
          </div>
        </AtsSection>
      )}

      {showCerts && (
        <AtsSection title="Certifications">
          <ul className="flex flex-col gap-1">
            {data.certifications.map((c) => (
              <li key={c.id} className="text-[13px] text-slate-800">
                <span className="font-semibold">{c.title}</span>
                {c.subtitle ? `, ${c.subtitle}` : ""}
                {c.date ? ` (${c.date})` : ""}
              </li>
            ))}
          </ul>
        </AtsSection>
      )}

      {showLanguages && (
        <AtsSection title="Languages">
          <p className="text-[13px] text-slate-800">
            {data.languages.join(", ")}
          </p>
        </AtsSection>
      )}

      {showAwards && (
        <AtsSection title="Awards">
          <ul className="flex flex-col gap-1">
            {data.awards.map((a) => (
              <li key={a.id} className="text-[13px] text-slate-800">
                <span className="font-semibold">{a.title}</span>
                {a.subtitle ? `, ${a.subtitle}` : ""}
                {a.date ? ` (${a.date})` : ""}
                {a.description ? ` — ${a.description}` : ""}
              </li>
            ))}
          </ul>
        </AtsSection>
      )}

      {showPubs && (
        <AtsSection title="Publications">
          <ul className="flex flex-col gap-1">
            {data.publications.map((p) => (
              <li key={p.id} className="text-[13px] text-slate-800">
                <span className="font-semibold">{p.title}</span>
                {p.subtitle ? `, ${p.subtitle}` : ""}
                {p.date ? ` (${p.date})` : ""}
                {p.description ? ` — ${p.description}` : ""}
              </li>
            ))}
          </ul>
        </AtsSection>
      )}

      {showInterests && (
        <AtsSection title="Interests">
          <p className="text-[13px] text-slate-800">
            {data.interests.join(", ")}
          </p>
        </AtsSection>
      )}

      {showReferences && (
        <AtsSection title="References">
          <div className="flex flex-col gap-1">
            {data.references.map((r) => (
              <div key={r.id} className="text-[13px] text-slate-800">
                <span className="font-semibold">{r.name}</span>
                {r.role ? `, ${r.role}` : ""}
                {r.company ? `, ${r.company}` : ""}
                {r.contact ? ` — ${r.contact}` : ""}
              </div>
            ))}
          </div>
        </AtsSection>
      )}

      {sections.custom !== false &&
        data.customSections
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <AtsSection key={section.id} title={section.title}>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <li key={item.id} className="text-[13px] text-slate-800">
                    <span className="font-semibold">{item.title}</span>
                    {item.subtitle ? `, ${item.subtitle}` : ""}
                    {item.date ? ` (${item.date})` : ""}
                    {item.description ? ` — ${item.description}` : ""}
                  </li>
                ))}
              </ul>
            </AtsSection>
          ))}
    </div>
  );
}

function AtsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 border-b border-slate-400 pb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-800">
        {title}
      </h2>
      {children}
    </section>
  );
}

function AtsExperience({ exp }: { exp: ExperienceItem }) {
  const bullets = nonEmptyBullets(exp.bullets);
  const range = formatRange(exp.start, exp.end);
  const metaLine = [exp.company, exp.location, range]
    .filter((x) => !!x && x.trim().length > 0)
    .join(" | ");
  return (
    <div className="resume-no-break">
      <div className="text-[13.5px] font-bold text-slate-900">{exp.role}</div>
      {metaLine && (
        <div className="text-[12px] text-slate-700">{metaLine}</div>
      )}
      {bullets.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="pl-4 text-[12.5px] leading-snug text-slate-800"
              style={{ textIndent: "-12px" }}
            >
              • {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AtsEducation({ edu }: { edu: EducationItem }) {
  const range = formatRange(edu.start, edu.end);
  const meta = [edu.school, edu.location, range, edu.grade]
    .filter((x) => !!x && x.trim().length > 0)
    .join(" | ");
  return (
    <div className="resume-no-break">
      <div className="text-[13px] font-bold text-slate-900">{edu.degree}</div>
      {meta && <div className="text-[12px] text-slate-700">{meta}</div>}
    </div>
  );
}

function AtsProject({ project }: { project: ProjectItem }) {
  const tech = joinTech(project.tech);
  return (
    <div className="resume-no-break">
      <div className="text-[13px] font-bold text-slate-900">
        {project.name}
        {project.link ? ` — ${project.link}` : ""}
      </div>
      {project.description && (
        <div className="text-[12.5px] text-slate-800">
          {project.description}
        </div>
      )}
      {tech && (
        <div className="text-[12px] text-slate-700">
          <span className="font-semibold">Tech:</span> {tech}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * 3) EXECUTIVE — centered serif header, gold/amber accent
 * ========================================================== */

function ExecutiveTemplate({ data, sections, accent }: TemplateProps) {
  const showPersonal = sections.personal !== false;
  const contacts = buildContactStrings(data);

  const showSummary = sections.summary && data.summary.trim().length > 0;
  const showExperience = sections.experience && data.experience.length > 0;
  const showProjects = sections.projects && data.projects.length > 0;
  const showEducation = sections.education && data.education.length > 0;
  const showCerts =
    sections.certifications && data.certifications.length > 0;
  const showLanguages = sections.languages && data.languages.length > 0;
  const showAwards = sections.awards && data.awards.length > 0;
  const showPubs = sections.publications && data.publications.length > 0;
  const showInterests = sections.interests && data.interests.length > 0;
  const showReferences = sections.references && data.references.length > 0;

  return (
    <div className="mx-auto max-w-[780px] p-10">
      {showPersonal && (
        <header className="mb-6 text-center">
          <h1
            className="text-[34px] font-bold leading-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {data.name || "Your Name"}
          </h1>
          {data.title && (
            <p
              className="mt-2 text-[15px] italic"
              style={{ color: accent, fontFamily: "Georgia, serif" }}
            >
              {data.title}
            </p>
          )}
          {contacts.length > 0 && (
            <p className="mt-2 text-[12px] text-slate-700">
              {contacts.join("  \u2022  ")}
            </p>
          )}
          <div
            className="mt-4 w-full"
            style={{
              borderTop: `3px double ${accent}`,
              borderBottom: `1px solid ${accent}`,
              height: 6,
            }}
          />
        </header>
      )}

      {showSummary && (
        <ExecSection title="Profile" accent={accent}>
          <p className="text-center text-[13px] leading-relaxed text-slate-700">
            {data.summary}
          </p>
        </ExecSection>
      )}

      {showExperience && (
        <ExecSection title="Experience" accent={accent}>
          <div className="flex flex-col gap-3">
            {data.experience.map((exp) => (
              <ExecExperience key={exp.id} exp={exp} accent={accent} />
            ))}
          </div>
        </ExecSection>
      )}

      {showProjects && (
        <ExecSection title="Selected Projects" accent={accent}>
          <div className="flex flex-col gap-2">
            {data.projects.map((p) => (
              <ExecProject key={p.id} project={p} accent={accent} />
            ))}
          </div>
        </ExecSection>
      )}

      {showEducation && showCerts ? (
        <div className="mb-5 grid grid-cols-2 gap-6">
          <ExecSection title="Education" accent={accent} flush>
            <div className="flex flex-col gap-2">
              {data.education.map((ed) => (
                <ExecEducation key={ed.id} edu={ed} accent={accent} />
              ))}
            </div>
          </ExecSection>
          <ExecSection title="Certifications" accent={accent} flush>
            <ul className="flex flex-col gap-1.5">
              {data.certifications.map((c) => (
                <li
                  key={c.id}
                  className="text-[12.5px] leading-snug text-slate-700"
                >
                  <span className="font-semibold text-slate-900">
                    {c.title}
                  </span>
                  {c.subtitle && (
                    <span className="italic" style={{ color: accent }}>
                      {" "}
                      — {c.subtitle}
                    </span>
                  )}
                  {c.date && (
                    <span className="text-slate-500"> · {c.date}</span>
                  )}
                </li>
              ))}
            </ul>
          </ExecSection>
        </div>
      ) : (
        <>
          {showEducation && (
            <ExecSection title="Education" accent={accent}>
              <div className="flex flex-col gap-2">
                {data.education.map((ed) => (
                  <ExecEducation key={ed.id} edu={ed} accent={accent} />
                ))}
              </div>
            </ExecSection>
          )}
          {showCerts && (
            <ExecSection title="Certifications" accent={accent}>
              <ul className="flex flex-col gap-1.5">
                {data.certifications.map((c) => (
                  <li
                    key={c.id}
                    className="text-[12.5px] leading-snug text-slate-700"
                  >
                    <span className="font-semibold text-slate-900">
                      {c.title}
                    </span>
                    {c.subtitle && (
                      <span className="italic" style={{ color: accent }}>
                        {" "}
                        — {c.subtitle}
                      </span>
                    )}
                    {c.date && (
                      <span className="text-slate-500"> · {c.date}</span>
                    )}
                  </li>
                ))}
              </ul>
            </ExecSection>
          )}
        </>
      )}

      {showAwards && showLanguages ? (
        <div className="mb-5 grid grid-cols-2 gap-6">
          <ExecSection title="Awards" accent={accent} flush>
            <ul className="flex flex-col gap-1.5">
              {data.awards.map((a) => (
                <li
                  key={a.id}
                  className="text-[12.5px] leading-snug text-slate-700"
                >
                  <span className="font-semibold text-slate-900">
                    {a.title}
                  </span>
                  {a.subtitle && (
                    <span className="italic" style={{ color: accent }}>
                      {" "}
                      — {a.subtitle}
                    </span>
                  )}
                  {a.date && (
                    <span className="text-slate-500"> · {a.date}</span>
                  )}
                  {a.description && (
                    <div className="text-slate-600">{a.description}</div>
                  )}
                </li>
              ))}
            </ul>
          </ExecSection>
          <ExecSection title="Languages" accent={accent} flush>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-slate-700">
              {data.languages.map((l, i) => (
                <li key={i}>
                  <span style={{ color: accent }}>◆</span> {l}
                </li>
              ))}
            </ul>
          </ExecSection>
        </div>
      ) : (
        <>
          {showAwards && (
            <ExecSection title="Awards" accent={accent}>
              <ul className="flex flex-col gap-1.5">
                {data.awards.map((a) => (
                  <li
                    key={a.id}
                    className="text-[12.5px] leading-snug text-slate-700"
                  >
                    <span className="font-semibold text-slate-900">
                      {a.title}
                    </span>
                    {a.subtitle && (
                      <span className="italic" style={{ color: accent }}>
                        {" "}
                        — {a.subtitle}
                      </span>
                    )}
                    {a.date && (
                      <span className="text-slate-500"> · {a.date}</span>
                    )}
                    {a.description && (
                      <div className="text-slate-600">{a.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            </ExecSection>
          )}
          {showLanguages && (
            <ExecSection title="Languages" accent={accent}>
              <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-slate-700">
                {data.languages.map((l, i) => (
                  <li key={i}>
                    <span style={{ color: accent }}>◆</span> {l}
                  </li>
                ))}
              </ul>
            </ExecSection>
          )}
        </>
      )}

      {showPubs && (
        <ExecSection title="Publications" accent={accent}>
          <ul className="flex flex-col gap-1.5">
            {data.publications.map((p) => (
              <li
                key={p.id}
                className="text-[12.5px] leading-snug text-slate-700"
              >
                <span className="font-semibold text-slate-900">{p.title}</span>
                {p.subtitle && <span> — {p.subtitle}</span>}
                {p.date && <span className="text-slate-500"> · {p.date}</span>}
                {p.description && <div>{p.description}</div>}
              </li>
            ))}
          </ul>
        </ExecSection>
      )}

      {showInterests && (
        <ExecSection title="Interests" accent={accent}>
          <p className="text-[12.5px] text-slate-700">
            {data.interests.join(" · ")}
          </p>
        </ExecSection>
      )}

      {showReferences && (
        <ExecSection title="References" accent={accent}>
          <div className="grid grid-cols-2 gap-4">
            {data.references.map((r) => (
              <div key={r.id} className="text-[12px] leading-snug text-slate-700">
                <div className="font-semibold text-slate-900">{r.name}</div>
                {r.role && <div>{r.role}</div>}
                {r.company && <div>{r.company}</div>}
                {r.contact && <div className="text-slate-500">{r.contact}</div>}
              </div>
            ))}
          </div>
        </ExecSection>
      )}

      {sections.custom !== false &&
        data.customSections
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <ExecSection
              key={section.id}
              title={section.title}
              accent={accent}
            >
              <ul className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <li
                    key={item.id}
                    className="text-[12.5px] leading-snug text-slate-700"
                  >
                    <span className="font-semibold text-slate-900">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="italic" style={{ color: accent }}>
                        {" "}
                        — {item.subtitle}
                      </span>
                    )}
                    {item.date && (
                      <span className="text-slate-500"> · {item.date}</span>
                    )}
                    {item.description && (
                      <div className="text-slate-600">{item.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            </ExecSection>
          ))}
    </div>
  );
}

function ExecSection({
  title,
  accent,
  flush,
  children,
}: {
  title: string;
  accent: string;
  flush?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={flush ? "" : "mb-5"}>
      <h2
        className="mb-3 text-center text-[13px] font-bold uppercase tracking-[0.22em]"
        style={{ color: accent, fontFamily: "Georgia, serif" }}
      >
        <span className="mr-2">—</span>
        {title}
        <span className="ml-2">—</span>
      </h2>
      {children}
    </section>
  );
}

function ExecExperience({
  exp,
  accent,
}: {
  exp: ExperienceItem;
  accent: string;
}) {
  const bullets = nonEmptyBullets(exp.bullets);
  const range = formatRange(exp.start, exp.end);
  return (
    <div className="resume-no-break">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-[14px]">
          <span
            className="font-bold text-slate-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {exp.role}
          </span>
          {exp.company && (
            <span style={{ color: accent }}> · {exp.company}</span>
          )}
        </div>
        {range && (
          <span className="shrink-0 text-[11.5px] italic text-slate-500">
            {range}
          </span>
        )}
      </div>
      {exp.location && (
        <div className="text-[11.5px] italic text-slate-500">
          {exp.location}
        </div>
      )}
      {bullets.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2 text-[12.5px] leading-snug text-slate-700"
            >
              <span className="shrink-0 text-[10px]" style={{ color: accent }}>
                ◆
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExecEducation({
  edu,
  accent,
}: {
  edu: EducationItem;
  accent: string;
}) {
  const range = formatRange(edu.start, edu.end);
  return (
    <div className="resume-no-break">
      <div
        className="text-[13px] font-bold text-slate-900"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {edu.degree}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[12px]" style={{ color: accent }}>
          {edu.school}
          {edu.location ? ` · ${edu.location}` : ""}
        </div>
        {range && (
          <span className="shrink-0 text-[11px] italic text-slate-500">
            {range}
          </span>
        )}
      </div>
      {edu.grade && (
        <div className="text-[11.5px] text-slate-500">{edu.grade}</div>
      )}
    </div>
  );
}

function ExecProject({
  project,
  accent,
}: {
  project: ProjectItem;
  accent: string;
}) {
  const tech = joinTech(project.tech);
  return (
    <div className="resume-no-break">
      <div className="flex items-baseline justify-between gap-3">
        <div
          className="text-[13px] font-bold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {project.name}
        </div>
        {project.link && (
          <span className="shrink-0 text-[11px] italic" style={{ color: accent }}>
            {project.link}
          </span>
        )}
      </div>
      {project.description && (
        <p className="text-[12.5px] leading-snug text-slate-700">
          {project.description}
        </p>
      )}
      {tech && (
        <p className="text-[11.5px] text-slate-500">
          <span className="italic" style={{ color: accent }}>
            Tech:
          </span>{" "}
          {tech}
        </p>
      )}
    </div>
  );
}

/* ============================================================
 * 4) MINIMAL — ultra-clean, airy, Apple-like
 * ========================================================== */

function MinimalTemplate({ data, sections, accent }: TemplateProps) {
  const showPersonal = sections.personal !== false;
  const contacts = buildContactStrings(data);

  const showSummary = sections.summary && data.summary.trim().length > 0;
  const showExperience = sections.experience && data.experience.length > 0;
  const showSkills = sections.skills && data.skills.length > 0;
  const showProjects = sections.projects && data.projects.length > 0;
  const showEducation = sections.education && data.education.length > 0;
  const showCerts =
    sections.certifications && data.certifications.length > 0;
  const showLanguages = sections.languages && data.languages.length > 0;
  const showAwards = sections.awards && data.awards.length > 0;
  const showPubs = sections.publications && data.publications.length > 0;
  const showInterests = sections.interests && data.interests.length > 0;
  const showReferences = sections.references && data.references.length > 0;

  return (
    <div className="mx-auto max-w-[760px] px-12 py-12">
      {showPersonal && (
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[34px] font-light leading-tight tracking-tight text-slate-900">
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p className="mt-1 text-[14px] text-slate-500">{data.title}</p>
            )}
          </div>
          {contacts.length > 0 && (
            <address className="flex flex-col items-end gap-0.5 text-right text-[11.5px] not-italic leading-relaxed text-slate-500">
              {contacts.map((c, i) => (
                <span key={i} className="break-words">
                  {c}
                </span>
              ))}
            </address>
          )}
        </header>
      )}

      {showSummary && (
        <MinimalSection title="Profile">
          <p className="text-[13.5px] leading-relaxed text-slate-600">
            {data.summary}
          </p>
        </MinimalSection>
      )}

      {showExperience && (
        <MinimalSection title="Experience">
          <div className="flex flex-col gap-6">
            {data.experience.map((exp) => (
              <MinimalExperience key={exp.id} exp={exp} accent={accent} />
            ))}
          </div>
        </MinimalSection>
      )}

      {showProjects && (
        <MinimalSection title="Projects">
          <div className="flex flex-col gap-5">
            {data.projects.map((p) => (
              <MinimalProject key={p.id} project={p} />
            ))}
          </div>
        </MinimalSection>
      )}

      {showEducation && (
        <MinimalSection title="Education">
          <div className="flex flex-col gap-4">
            {data.education.map((ed) => (
              <MinimalEducation key={ed.id} edu={ed} />
            ))}
          </div>
        </MinimalSection>
      )}

      {showSkills && (
        <MinimalSection title="Skills">
          <ul className="flex flex-wrap gap-2">
            {data.skills.map((s, i) => (
              <li
                key={i}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11.5px] text-slate-600"
              >
                {s}
              </li>
            ))}
          </ul>
        </MinimalSection>
      )}

      {showCerts && (
        <MinimalSection title="Certifications">
          <ul className="flex flex-col gap-2">
            {data.certifications.map((c) => (
              <li
                key={c.id}
                className="flex items-baseline justify-between gap-3 text-[13px] text-slate-700"
              >
                <span>
                  <span className="font-medium text-slate-800">{c.title}</span>
                  {c.subtitle ? (
                    <span className="text-slate-500"> · {c.subtitle}</span>
                  ) : null}
                </span>
                {c.date && (
                  <span className="shrink-0 text-[11.5px] text-slate-400">
                    {c.date}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </MinimalSection>
      )}

      {showLanguages && (
        <MinimalSection title="Languages">
          <p className="text-[13px] text-slate-600">
            {data.languages.join(" · ")}
          </p>
        </MinimalSection>
      )}

      {showAwards && (
        <MinimalSection title="Awards">
          <ul className="flex flex-col gap-3">
            {data.awards.map((a) => (
              <li
                key={a.id}
                className="flex items-baseline justify-between gap-3 text-[13px] text-slate-700"
              >
                <span>
                  <span className="font-medium text-slate-800">{a.title}</span>
                  {a.subtitle ? (
                    <span className="text-slate-500"> · {a.subtitle}</span>
                  ) : null}
                  {a.description ? (
                    <span className="text-slate-500"> — {a.description}</span>
                  ) : null}
                </span>
                {a.date && (
                  <span className="shrink-0 text-[11.5px] text-slate-400">
                    {a.date}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </MinimalSection>
      )}

      {showPubs && (
        <MinimalSection title="Publications">
          <ul className="flex flex-col gap-2">
            {data.publications.map((p) => (
              <li
                key={p.id}
                className="flex items-baseline justify-between gap-3 text-[13px] text-slate-700"
              >
                <span>
                  <span className="font-medium text-slate-800">{p.title}</span>
                  {p.subtitle ? (
                    <span className="text-slate-500"> · {p.subtitle}</span>
                  ) : null}
                  {p.description ? (
                    <span className="text-slate-500"> — {p.description}</span>
                  ) : null}
                </span>
                {p.date && (
                  <span className="shrink-0 text-[11.5px] text-slate-400">
                    {p.date}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </MinimalSection>
      )}

      {showInterests && (
        <MinimalSection title="Interests">
          <p className="text-[13px] text-slate-600">
            {data.interests.join(" · ")}
          </p>
        </MinimalSection>
      )}

      {showReferences && (
        <MinimalSection title="References">
          <div className="grid grid-cols-2 gap-4">
            {data.references.map((r) => (
              <div key={r.id} className="text-[12.5px] leading-relaxed text-slate-600">
                <div className="font-medium text-slate-800">{r.name}</div>
                {r.role && <div>{r.role}</div>}
                {r.company && <div>{r.company}</div>}
                {r.contact && <div className="text-slate-400">{r.contact}</div>}
              </div>
            ))}
          </div>
        </MinimalSection>
      )}

      {sections.custom !== false &&
        data.customSections
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <MinimalSection key={section.id} title={section.title}>
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between gap-3 text-[13px] text-slate-700"
                  >
                    <span>
                      <span className="font-medium text-slate-800">
                        {item.title}
                      </span>
                      {item.subtitle ? (
                        <span className="text-slate-500">
                          {" "}
                          · {item.subtitle}
                        </span>
                      ) : null}
                      {item.description ? (
                        <span className="text-slate-500">
                          {" "}
                          — {item.description}
                        </span>
                      ) : null}
                    </span>
                    {item.date && (
                      <span className="shrink-0 text-[11.5px] text-slate-400">
                        {item.date}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </MinimalSection>
          ))}
    </div>
  );
}

function MinimalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-9">
      <h2 className="mb-4 text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

function MinimalExperience({
  exp,
  accent,
}: {
  exp: ExperienceItem;
  accent: string;
}) {
  const bullets = nonEmptyBullets(exp.bullets);
  const range = formatRange(exp.start, exp.end);
  return (
    <div className="resume-no-break">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[15px] font-medium text-slate-900">
            {exp.role}
          </div>
          {exp.company && (
            <div className="text-[13px] text-slate-500">{exp.company}</div>
          )}
        </div>
        {range && (
          <span className="shrink-0 text-[11.5px] text-slate-400">
            {range}
          </span>
        )}
      </div>
      {exp.location && (
        <div className="text-[11.5px] text-slate-400">{exp.location}</div>
      )}
      {bullets.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2 text-[13px] leading-relaxed text-slate-600"
            >
              <span
                className="mt-[2px] shrink-0 text-[12px]"
                style={{ color: accent }}
              >
                —
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MinimalProject({ project }: { project: ProjectItem }) {
  const tech = joinTech(project.tech);
  return (
    <div className="resume-no-break">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[14px] font-medium text-slate-900">
          {project.name}
        </div>
        {project.link && (
          <span className="shrink-0 text-[11.5px] text-slate-400">
            {project.link}
          </span>
        )}
      </div>
      {project.description && (
        <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">
          {project.description}
        </p>
      )}
      {tech && (
        <p className="mt-0.5 text-[11.5px] text-slate-400">{tech}</p>
      )}
    </div>
  );
}

function MinimalEducation({ edu }: { edu: EducationItem }) {
  const range = formatRange(edu.start, edu.end);
  return (
    <div className="resume-no-break">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[14px] font-medium text-slate-900">
            {edu.degree}
          </div>
          {edu.school && (
            <div className="text-[13px] text-slate-500">{edu.school}</div>
          )}
        </div>
        {range && (
          <span className="shrink-0 text-[11.5px] text-slate-400">
            {range}
          </span>
        )}
      </div>
      {(edu.location || edu.grade) && (
        <div className="text-[11.5px] text-slate-400">
          {[edu.location, edu.grade].filter(Boolean).join(" · ")}
        </div>
      )}
    </div>
  );
}
