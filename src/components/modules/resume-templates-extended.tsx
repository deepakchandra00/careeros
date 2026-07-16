"use client";

import * as React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  Users,
  BookOpen,
  Heart,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { ResumeData, SimpleItem, TemplateStyle } from "@/store/resume-store";

/* ============================================================
 * Shared helpers
 * ========================================================== */

const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

function Avatar({
  data,
  size,
  ring,
}: {
  data: ResumeData;
  size: number;
  ring?: string;
}) {
  if (data.photo)
    return (
      <img
        src={data.photo}
        alt={data.name || "Avatar"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: ring ? `${ring} 3px solid` : undefined,
        }}
      />
    );
  const initials = data.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#cbd5e1",
        color: "#475569",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        border: ring ? `${ring} 3px solid` : undefined,
      }}
    >
      {initials}
    </div>
  );
}

function SkillBar({
  skill,
  level,
  accent,
  trackColor,
}: {
  skill: string;
  level?: number;
  accent: string;
  trackColor?: string;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          marginBottom: 2,
        }}
      >
        <span>{skill}</span>
        {level != null && <span style={{ color: "#94a3b8" }}>{level}%</span>}
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: trackColor || "rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            width: `${level ?? 80}%`,
            height: "100%",
            borderRadius: 2,
            background: accent,
          }}
        />
      </div>
    </div>
  );
}

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
  return (tech ?? [])
    .map((t) => (t ?? "").trim())
    .filter(Boolean)
    .join(", ");
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

/* ----- Custom sections (shared across extended templates) ----- */

/**
 * Render a single custom-section item as a generic block. Templates wrap
 * this inside their own section header style via `renderCustomSections`.
 */
function CustomSectionItems({
  items,
  accent,
}: {
  items: SimpleItem[];
  accent: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item) => (
        <div key={item.id} style={{ breakInside: "avoid" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
              {item.title}
            </div>
            {item.date && (
              <div style={{ fontSize: 10.5, color: "#64748b" }}>{item.date}</div>
            )}
          </div>
          {item.subtitle && (
            <div style={{ fontSize: 11, color: accent, fontWeight: 600 }}>
              {item.subtitle}
            </div>
          )}
          {item.description && (
            <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.5 }}>
              {item.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Shared helper that renders every custom section (with at least one item)
 * as JSX. Each template passes its own `renderSection` callback so the
 * section header matches the template's existing visual style.
 *
 * Signature: renderCustomSections(data, accent, renderSection)
 */
function renderCustomSections(
  data: ResumeData,
  accent: string,
  renderSection: (title: string, children: React.ReactNode) => React.ReactNode,
): React.ReactNode {
  const visible = data.customSections.filter((s) => s.items.length > 0);
  if (visible.length === 0) return null;
  return visible.map((section) =>
    renderSection(
      section.title,
      <CustomSectionItems
        key={section.id}
        items={section.items}
        accent={accent}
      />,
    ),
  );
}

/* ============================================================
 * 1) SOFTWARE ENGINEER — two-col, dark navy sidebar
 * ========================================================== */

export function SoftwareEngineerTemplate({
  data,
  sections,
  accent,
}: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const showPersonal = visible(sections, "personal");
  const showSummary =
    visible(sections, "summary") && data.summary.trim().length > 0;
  const showExperience =
    visible(sections, "experience") && data.experience.length > 0;
  const showSkills = visible(sections, "skills") && data.skills.length > 0;
  const showProjects = visible(sections, "projects") && data.projects.length > 0;
  const showEducation =
    visible(sections, "education") && data.education.length > 0;
  const showCerts =
    visible(sections, "certifications") && data.certifications.length > 0;
  const showLanguages =
    visible(sections, "languages") && data.languages.length > 0;

  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "32% 68%", minHeight: 1123 }}>
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: "#1e293b",
          color: "white",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {showPersonal && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <Avatar data={data} size={100} />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p
                style={{
                  fontSize: 12,
                  color: "#cbd5e1",
                  margin: "4px 0 0 0",
                  lineHeight: 1.3,
                }}
              >
                {data.title}
              </p>
            )}
          </div>
        )}

        {showContact && (
          <SeSidebarSection title="Contact">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {contacts.map((c, i) => {
                const Icon = c.icon;
                return (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      fontSize: 11,
                      color: "#e2e8f0",
                      lineHeight: 1.3,
                    }}
                  >
                    <Icon size={12} color="white" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ wordBreak: "break-word" }}>{c.value}</span>
                  </li>
                );
              })}
            </ul>
          </SeSidebarSection>
        )}

        {showSkills && (
          <SeSidebarSection title="Skills">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {data.skills.map((s, i) => (
                <li key={i} style={{ fontSize: 11, color: "#e2e8f0", lineHeight: 1.4 }}>
                  {s}
                </li>
              ))}
            </ul>
          </SeSidebarSection>
        )}

        {showLanguages && (
          <SeSidebarSection title="Languages">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {data.languages.map((l, i) => (
                <li key={i} style={{ fontSize: 11, color: "#e2e8f0" }}>
                  {l}
                </li>
              ))}
            </ul>
          </SeSidebarSection>
        )}
      </aside>

      {/* Main */}
      <main
        style={{
          backgroundColor: "white",
          padding: 28,
          color: "#1e293b",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {showSummary && (
          <SeMainSection title="Summary" accent={accent}>
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.5,
                margin: 0,
                color: "#334155",
              }}
            >
              {data.summary}
            </p>
          </SeMainSection>
        )}

        {showExperience && (
          <SeMainSection title="Experience" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.experience.map((exp) => {
                const bullets = nonEmptyBullets(exp.bullets);
                const range = formatRange(exp.start, exp.end);
                return (
                  <div key={exp.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {exp.role}
                        </div>
                        <div style={{ fontSize: 12, color: accent }}>
                          {exp.company}
                          {exp.location ? ` · ${exp.location}` : ""}
                        </div>
                      </div>
                      {range && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            flexShrink: 0,
                          }}
                        >
                          {range}
                        </span>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul
                        style={{
                          margin: "6px 0 0 0",
                          padding: 0,
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: 11.5,
                              color: "#334155",
                              paddingLeft: 12,
                              position: "relative",
                              lineHeight: 1.4,
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                left: 0,
                                color: accent,
                              }}
                            >
                              •
                            </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </SeMainSection>
        )}

        {showProjects && (
          <SeMainSection title="Projects" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.projects.map((p) => {
                const tech = joinTech(p.tech);
                return (
                  <div key={p.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>
                        {p.name}
                      </div>
                      {p.link && (
                        <span style={{ fontSize: 10.5, color: accent, flexShrink: 0 }}>
                          {p.link}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p
                        style={{
                          margin: "2px 0 0 0",
                          fontSize: 11.5,
                          color: "#334155",
                          lineHeight: 1.4,
                        }}
                      >
                        {p.description}
                      </p>
                    )}
                    {tech && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 10.5, color: "#64748b" }}>
                        <span style={{ fontWeight: 600 }}>Tech:</span> {tech}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </SeMainSection>
        )}

        {showEducation && (
          <SeMainSection title="Education" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.education.map((ed) => {
                const range = formatRange(ed.start, ed.end);
                return (
                  <div key={ed.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>
                        {ed.degree}
                      </div>
                      {range && (
                        <span style={{ fontSize: 11, color: "#64748b", flexShrink: 0 }}>
                          {range}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#334155" }}>
                      {ed.school}
                      {ed.location ? ` · ${ed.location}` : ""}
                    </div>
                    {ed.grade && (
                      <div style={{ fontSize: 11, color: "#64748b" }}>{ed.grade}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </SeMainSection>
        )}

        {showCerts && (
          <SeMainSection title="Certifications" accent={accent}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {data.certifications.map((c) => (
                <li key={c.id} style={{ breakInside: "avoid" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                    {c.title}
                  </div>
                  {c.subtitle && (
                    <div style={{ fontSize: 11, color: "#334155" }}>{c.subtitle}</div>
                  )}
                  {c.date && (
                    <div style={{ fontSize: 10.5, color: "#64748b" }}>{c.date}</div>
                  )}
                </li>
              ))}
            </ul>
          </SeMainSection>
        )}

        {visible(sections, "custom") &&
          renderCustomSections(data, accent, (title, children) => (
            <SeMainSection title={title} accent={accent}>
              {children}
            </SeMainSection>
          ))}
      </main>
    </div>
  );
}

function SeSidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          color: "white",
          opacity: 0.9,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SeMainSection({
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
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#0f172a",
          margin: "0 0 10px 0",
          paddingBottom: 4,
          borderBottom: `1px solid ${accent}`,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ============================================================
 * 2) ACADEMIC — two-col, dark gray sidebar, Georgia serif
 * ========================================================== */

export function AcademicTemplate({
  data,
  sections,
  accent,
}: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const serif = "Georgia, 'Times New Roman', serif";
  const showPersonal = visible(sections, "personal");
  const showSummary =
    visible(sections, "summary") && data.summary.trim().length > 0;
  const showExperience =
    visible(sections, "experience") && data.experience.length > 0;
  const showSkills = visible(sections, "skills") && data.skills.length > 0;
  const showEducation =
    visible(sections, "education") && data.education.length > 0;
  const showLanguages =
    visible(sections, "languages") && data.languages.length > 0;
  const showPubs =
    visible(sections, "publications") && data.publications.length > 0;
  const showAwards = visible(sections, "awards") && data.awards.length > 0;
  const showReferences =
    visible(sections, "references") && data.references.length > 0;

  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "35% 65%",
        minHeight: 1123,
        fontFamily: serif,
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: "#374151",
          color: "white",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {showPersonal && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Avatar data={data} size={90} />
            </div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
                fontFamily: serif,
              }}
            >
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p
                style={{
                  fontSize: 12,
                  fontStyle: "italic",
                  color: "#d1d5db",
                  margin: "4px 0 0 0",
                }}
              >
                {data.title}
              </p>
            )}
          </div>
        )}

        {showContact && (
          <AcSidebarSection title="Contact" serif={serif}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {contacts.map((c, i) => {
                const Icon = c.icon;
                return (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      fontSize: 11,
                      color: "#e5e7eb",
                      lineHeight: 1.3,
                    }}
                  >
                    <Icon size={12} color="white" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ wordBreak: "break-word" }}>{c.value}</span>
                  </li>
                );
              })}
            </ul>
          </AcSidebarSection>
        )}

        {showEducation && (
          <AcSidebarSection title="Education" serif={serif}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.education.map((ed) => {
                const range = formatRange(ed.start, ed.end);
                return (
                  <div key={ed.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "white",
                        lineHeight: 1.3,
                      }}
                    >
                      {ed.degree}
                    </div>
                    <div style={{ fontSize: 11, color: "#d1d5db" }}>{ed.school}</div>
                    {(range || ed.location) && (
                      <div style={{ fontSize: 10.5, color: "#9ca3af" }}>
                        {[range, ed.location].filter(Boolean).join(" · ")}
                      </div>
                    )}
                    {ed.grade && (
                      <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{ed.grade}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </AcSidebarSection>
        )}

        {showSkills && (
          <AcSidebarSection title="Research Areas" serif={serif}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {data.skills.map((s, i) => (
                <li key={i} style={{ fontSize: 11, color: "#e5e7eb", lineHeight: 1.4 }}>
                  {s}
                </li>
              ))}
            </ul>
          </AcSidebarSection>
        )}

        {showLanguages && (
          <AcSidebarSection title="Languages" serif={serif}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {data.languages.map((l, i) => (
                <li key={i} style={{ fontSize: 11, color: "#e5e7eb" }}>
                  {l}
                </li>
              ))}
            </ul>
          </AcSidebarSection>
        )}
      </aside>

      {/* Main */}
      <main
        style={{
          backgroundColor: "white",
          padding: 28,
          color: "#1f2937",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          fontFamily: serif,
        }}
      >
        {showSummary && (
          <AcMainSection title="Profile Summary" accent={accent} serif={serif}>
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                margin: 0,
                color: "#374151",
                textAlign: "justify",
              }}
            >
              {data.summary}
            </p>
          </AcMainSection>
        )}

        {showExperience && (
          <AcMainSection title="Professional Experience" accent={accent} serif={serif}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.experience.map((exp) => {
                const bullets = nonEmptyBullets(exp.bullets);
                const range = formatRange(exp.start, exp.end);
                return (
                  <div key={exp.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                            fontFamily: serif,
                          }}
                        >
                          {exp.role}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: accent,
                            fontStyle: "italic",
                          }}
                        >
                          {exp.company}
                          {exp.location ? `, ${exp.location}` : ""}
                        </div>
                      </div>
                      {range && (
                        <span
                          style={{
                            fontSize: 11,
                            fontStyle: "italic",
                            color: "#6b7280",
                            flexShrink: 0,
                          }}
                        >
                          {range}
                        </span>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul
                        style={{
                          margin: "6px 0 0 0",
                          padding: 0,
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: 11.5,
                              color: "#374151",
                              paddingLeft: 14,
                              position: "relative",
                              lineHeight: 1.5,
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                left: 0,
                                color: accent,
                              }}
                            >
                              ◆
                            </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </AcMainSection>
        )}

        {showPubs && (
          <AcMainSection title="Publications" accent={accent} serif={serif}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {data.publications.map((p) => (
                <li
                  key={p.id}
                  style={{
                    fontSize: 11.5,
                    color: "#374151",
                    lineHeight: 1.5,
                    breakInside: "avoid",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#111827" }}>{p.title}</span>
                  {p.subtitle && (
                    <span style={{ fontStyle: "italic" }}> — {p.subtitle}</span>
                  )}
                  {p.date && (
                    <span style={{ color: "#6b7280" }}> · {p.date}</span>
                  )}
                  {p.description && <div>{p.description}</div>}
                </li>
              ))}
            </ul>
          </AcMainSection>
        )}

        {showAwards && (
          <AcMainSection title="Awards & Honors" accent={accent} serif={serif}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {data.awards.map((a) => (
                <li
                  key={a.id}
                  style={{
                    fontSize: 11.5,
                    color: "#374151",
                    lineHeight: 1.5,
                    breakInside: "avoid",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#111827" }}>{a.title}</span>
                  {a.subtitle && (
                    <span style={{ fontStyle: "italic" }}> — {a.subtitle}</span>
                  )}
                  {a.date && (
                    <span style={{ color: "#6b7280" }}> · {a.date}</span>
                  )}
                  {a.description && <div>{a.description}</div>}
                </li>
              ))}
            </ul>
          </AcMainSection>
        )}

        {showReferences && (
          <AcMainSection title="References" accent={accent} serif={serif}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {data.references.map((r) => (
                <div
                  key={r.id}
                  style={{ fontSize: 11.5, color: "#374151", lineHeight: 1.4, breakInside: "avoid" }}
                >
                  <div style={{ fontWeight: 700, color: "#111827" }}>{r.name}</div>
                  {r.role && <div style={{ fontStyle: "italic" }}>{r.role}</div>}
                  {r.company && <div>{r.company}</div>}
                  {r.contact && (
                    <div style={{ color: "#6b7280" }}>{r.contact}</div>
                  )}
                </div>
              ))}
            </div>
          </AcMainSection>
        )}

        {visible(sections, "custom") &&
          renderCustomSections(data, accent, (title, children) => (
            <AcMainSection title={title} accent={accent} serif={serif}>
              {children}
            </AcMainSection>
          ))}
      </main>
    </div>
  );
}

function AcSidebarSection({
  title,
  serif,
  children,
}: {
  title: string;
  serif: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontFamily: serif,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          paddingBottom: 4,
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          color: "white",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function AcMainSection({
  title,
  accent,
  serif,
  children,
}: {
  title: string;
  accent: string;
  serif: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontFamily: serif,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#111827",
          margin: "0 0 10px 0",
          paddingBottom: 4,
          borderBottom: `1px solid ${accent}`,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ============================================================
 * 3) CREATIVE — two-col, orange sidebar, pill section headers
 * ============================================================ */

export function CreativeTemplate({
  data,
  sections,
  accent,
}: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const orangeDark = "#c2410c";
  const showPersonal = visible(sections, "personal");
  const showSummary =
    visible(sections, "summary") && data.summary.trim().length > 0;
  const showExperience =
    visible(sections, "experience") && data.experience.length > 0;
  const showSkills = visible(sections, "skills") && data.skills.length > 0;
  const showProjects = visible(sections, "projects") && data.projects.length > 0;
  const showEducation =
    visible(sections, "education") && data.education.length > 0;
  const showLanguages =
    visible(sections, "languages") && data.languages.length > 0;
  const showAwards = visible(sections, "awards") && data.awards.length > 0;

  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "35% 65%", minHeight: 1123 }}>
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: "#ea580c",
          color: "white",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {showPersonal && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Avatar data={data} size={80} ring="white" />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p style={{ fontSize: 11, color: "#fff7ed", margin: "4px 0 0 0" }}>
                {data.title}
              </p>
            )}
          </div>
        )}

        {showContact && (
          <CrSidebarSection title="Contact">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {contacts.map((c, i) => {
                const Icon = c.icon;
                return (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      fontSize: 11,
                      lineHeight: 1.3,
                    }}
                  >
                    <Icon size={12} color="white" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ wordBreak: "break-word" }}>{c.value}</span>
                  </li>
                );
              })}
            </ul>
          </CrSidebarSection>
        )}

        {showSkills && (
          <CrSidebarSection title="Pro Skills">
            <div>
              {data.skills.map((s, i) => (
                <SkillBar
                  key={i}
                  skill={s}
                  level={data.skillLevels[s]}
                  accent={orangeDark}
                  trackColor="rgba(255,255,255,0.35)"
                />
              ))}
            </div>
          </CrSidebarSection>
        )}

        {showLanguages && (
          <CrSidebarSection title="Languages">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {data.languages.map((l, i) => (
                <li key={i} style={{ fontSize: 11 }}>
                  {l}
                </li>
              ))}
            </ul>
          </CrSidebarSection>
        )}
      </aside>

      {/* Main */}
      <main
        style={{
          backgroundColor: "white",
          padding: 28,
          color: "#1f2937",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {showPersonal && (
          <header style={{ marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.1, color: "#1f2937" }}>
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p style={{ fontSize: 13, color: "#ea580c", margin: "4px 0 0 0", fontWeight: 600 }}>
                {data.title}
              </p>
            )}
          </header>
        )}

        {showSummary && (
          <CrMainPill title="About" accent={accent}>
            <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: "#374151" }}>
              {data.summary}
            </p>
          </CrMainPill>
        )}

        {showExperience && (
          <CrMainPill title="Experience" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.experience.map((exp) => {
                const bullets = nonEmptyBullets(exp.bullets);
                const range = formatRange(exp.start, exp.end);
                return (
                  <div key={exp.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1f2937" }}>
                          {exp.role}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#ea580c", fontWeight: 600 }}>
                          {exp.company}
                          {exp.location ? ` · ${exp.location}` : ""}
                        </div>
                      </div>
                      {range && (
                        <span style={{ fontSize: 10.5, color: "#6b7280", flexShrink: 0 }}>
                          {range}
                        </span>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul
                        style={{
                          margin: "4px 0 0 0",
                          padding: 0,
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: 11,
                              color: "#374151",
                              paddingLeft: 12,
                              position: "relative",
                              lineHeight: 1.4,
                            }}
                          >
                            <span style={{ position: "absolute", left: 0, color: "#ea580c" }}>
                              •
                            </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </CrMainPill>
        )}

        {showProjects && (
          <CrMainPill title="Projects" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.projects.map((p) => {
                const tech = joinTech(p.tech);
                return (
                  <div key={p.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>
                        {p.name}
                      </div>
                      {p.link && (
                        <span style={{ fontSize: 10.5, color: "#ea580c", flexShrink: 0 }}>
                          {p.link}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#374151", lineHeight: 1.4 }}>
                        {p.description}
                      </p>
                    )}
                    {tech && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 10.5, color: "#6b7280" }}>
                        {tech}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CrMainPill>
        )}

        {showEducation && (
          <CrMainPill title="Education" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.education.map((ed) => {
                const range = formatRange(ed.start, ed.end);
                return (
                  <div key={ed.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>
                        {ed.degree}
                      </div>
                      {range && (
                        <span style={{ fontSize: 10.5, color: "#6b7280", flexShrink: 0 }}>
                          {range}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#374151" }}>
                      {ed.school}
                      {ed.location ? ` · ${ed.location}` : ""}
                    </div>
                    {ed.grade && (
                      <div style={{ fontSize: 10.5, color: "#6b7280" }}>{ed.grade}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CrMainPill>
        )}

        {showAwards && (
          <CrMainPill title="Awards" accent={accent}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {data.awards.map((a) => (
                <li key={a.id} style={{ fontSize: 11.5, color: "#374151", breakInside: "avoid" }}>
                  <span style={{ fontWeight: 700, color: "#1f2937" }}>{a.title}</span>
                  {a.subtitle && <span> — {a.subtitle}</span>}
                  {a.date && <span style={{ color: "#6b7280" }}> · {a.date}</span>}
                  {a.description && <div>{a.description}</div>}
                </li>
              ))}
            </ul>
          </CrMainPill>
        )}

        {visible(sections, "custom") &&
          renderCustomSections(data, accent, (title, children) => (
            <CrMainPill title={title} accent={accent}>
              {children}
            </CrMainPill>
          ))}
      </main>
    </div>
  );
}

function CrSidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          color: "white",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CrMainPill({
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
      <h2 style={{ margin: "0 0 10px 0" }}>
        <span
          style={{
            display: "inline-block",
            backgroundColor: accent,
            color: "white",
            padding: "2px 10px",
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
}

/* ============================================================
 * 4) WEB DEVELOPER — two-col, dark sidebar with diagonal orange band
 * ============================================================ */

export function WebDeveloperTemplate({
  data,
  sections,
  accent,
}: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const orange = "#f97316";
  const showPersonal = visible(sections, "personal");
  const showSummary =
    visible(sections, "summary") && data.summary.trim().length > 0;
  const showExperience =
    visible(sections, "experience") && data.experience.length > 0;
  const showSkills = visible(sections, "skills") && data.skills.length > 0;
  const showProjects = visible(sections, "projects") && data.projects.length > 0;
  const showEducation =
    visible(sections, "education") && data.education.length > 0;
  const showLanguages =
    visible(sections, "languages") && data.languages.length > 0;
  const showInterests =
    visible(sections, "interests") && data.interests.length > 0;

  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "33% 67%", minHeight: 1123 }}>
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Diagonal orange band */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            backgroundColor: orange,
            clipPath: "polygon(0 0, 100% 0, 100% 60%, 0 100%)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            paddingTop: 32,
          }}
        >
          {showPersonal && (
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <Avatar data={data} size={80} ring="white" />
              </div>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.2,
                  color: "white",
                }}
              >
                {data.name || "Your Name"}
              </h1>
              {data.title && (
                <p style={{ fontSize: 12, color: orange, margin: "4px 0 0 0", fontWeight: 600 }}>
                  {data.title}
                </p>
              )}
            </div>
          )}

          {showContact && (
            <WdSidebarSection title="Contact" accent={orange}>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                {contacts.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 6,
                        fontSize: 11,
                        color: "#e5e7eb",
                        lineHeight: 1.3,
                      }}
                    >
                      <Icon size={12} color={orange} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ wordBreak: "break-word" }}>{c.value}</span>
                    </li>
                  );
                })}
              </ul>
            </WdSidebarSection>
          )}

          {showSkills && (
            <WdSidebarSection title="Work Skills" accent={orange}>
              <div>
                {data.skills.map((s, i) => (
                  <SkillBar
                    key={i}
                    skill={s}
                    level={data.skillLevels[s]}
                    accent={orange}
                    trackColor="rgba(255,255,255,0.15)"
                  />
                ))}
              </div>
            </WdSidebarSection>
          )}

          {showLanguages && (
            <WdSidebarSection title="Languages" accent={orange}>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {data.languages.map((l, i) => (
                  <li key={i} style={{ fontSize: 11, color: "#e5e7eb" }}>
                    {l}
                  </li>
                ))}
              </ul>
            </WdSidebarSection>
          )}

          {showInterests && (
            <WdSidebarSection title="Interests" accent={orange}>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                }}
              >
                {data.interests.map((it, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 10.5,
                      padding: "2px 7px",
                      borderRadius: 10,
                      backgroundColor: "rgba(249,115,22,0.18)",
                      color: "#fed7aa",
                    }}
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </WdSidebarSection>
          )}
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          backgroundColor: "white",
          padding: 28,
          color: "#1f2937",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {showSummary && (
          <WdMainSection title="About Me" accent={orange}>
            <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: "#374151" }}>
              {data.summary}
            </p>
          </WdMainSection>
        )}

        {showExperience && (
          <WdMainSection title="Work Experience" accent={orange}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.experience.map((exp) => {
                const bullets = nonEmptyBullets(exp.bullets);
                const range = formatRange(exp.start, exp.end);
                return (
                  <div
                    key={exp.id}
                    style={{
                      breakInside: "avoid",
                      display: "grid",
                      gridTemplateColumns: "90px 1fr",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: orange, paddingTop: 2 }}>
                      {range}
                    </div>
                    <div style={{ borderLeft: `2px solid ${orange}`, paddingLeft: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                        {exp.role}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#6b7280", marginBottom: 4 }}>
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </div>
                      {bullets.length > 0 && (
                        <ul
                          style={{
                            margin: 0,
                            padding: 0,
                            listStyle: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {bullets.map((b, i) => (
                            <li
                              key={i}
                              style={{
                                fontSize: 11,
                                color: "#374151",
                                paddingLeft: 12,
                                position: "relative",
                                lineHeight: 1.4,
                              }}
                            >
                              <span style={{ position: "absolute", left: 0, color: orange }}>
                                •
                              </span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </WdMainSection>
        )}

        {showProjects && (
          <WdMainSection title="Projects" accent={orange}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.projects.map((p) => {
                const tech = joinTech(p.tech);
                return (
                  <div key={p.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                        {p.name}
                      </div>
                      {p.link && (
                        <span style={{ fontSize: 10.5, color: orange, flexShrink: 0 }}>
                          {p.link}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#374151", lineHeight: 1.4 }}>
                        {p.description}
                      </p>
                    )}
                    {tech && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 10.5, color: "#6b7280" }}>
                        {tech}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </WdMainSection>
        )}

        {showEducation && (
          <WdMainSection title="Education" accent={orange}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.education.map((ed) => {
                const range = formatRange(ed.start, ed.end);
                return (
                  <div
                    key={ed.id}
                    style={{
                      breakInside: "avoid",
                      display: "grid",
                      gridTemplateColumns: "90px 1fr",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: orange, paddingTop: 2 }}>
                      {range}
                    </div>
                    <div style={{ borderLeft: `2px solid ${orange}`, paddingLeft: 12 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>
                        {ed.degree}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#6b7280" }}>
                        {ed.school}
                        {ed.location ? ` · ${ed.location}` : ""}
                      </div>
                      {ed.grade && (
                        <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{ed.grade}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </WdMainSection>
        )}

        {visible(sections, "custom") &&
          renderCustomSections(data, accent, (title, children) => (
            <WdMainSection title={title} accent={accent}>
              {children}
            </WdMainSection>
          ))}
      </main>
    </div>
  );
}

function WdSidebarSection({
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
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: accent,
          }}
        />
        {title}
      </h2>
      {children}
    </section>
  );
}

function WdMainSection({
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
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#111827",
          margin: "0 0 10px 0",
          paddingBottom: 4,
          borderBottom: `1px solid ${accent}`,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accent,
          }}
        />
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ============================================================
 * 5) UX DESIGNER — two-col, dark blue sidebar, vertical timelines
 * ============================================================ */

export function UxDesignerTemplate({
  data,
  sections,
  accent,
}: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const showPersonal = visible(sections, "personal");
  const showSummary =
    visible(sections, "summary") && data.summary.trim().length > 0;
  const showExperience =
    visible(sections, "experience") && data.experience.length > 0;
  const showSkills = visible(sections, "skills") && data.skills.length > 0;
  const showProjects = visible(sections, "projects") && data.projects.length > 0;
  const showEducation =
    visible(sections, "education") && data.education.length > 0;
  const showLanguages =
    visible(sections, "languages") && data.languages.length > 0;
  const showAwards = visible(sections, "awards") && data.awards.length > 0;

  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;

  // Split skills into 2 sub-columns
  const half = Math.ceil(data.skills.length / 2);
  const skillsLeft = data.skills.slice(0, half);
  const skillsRight = data.skills.slice(half);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "32% 68%", minHeight: 1123 }}>
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: "#1e3a5f",
          color: "white",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {showPersonal && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Avatar data={data} size={100} ring="white" />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p style={{ fontSize: 11, color: "#cbd5e1", margin: "4px 0 0 0" }}>
                {data.title}
              </p>
            )}
          </div>
        )}

        {showContact && (
          <UxSidebarSection title="Contact">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {contacts.map((c, i) => {
                const Icon = c.icon;
                return (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      fontSize: 11,
                      color: "#e2e8f0",
                      lineHeight: 1.3,
                    }}
                  >
                    <Icon size={12} color="white" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ wordBreak: "break-word" }}>{c.value}</span>
                  </li>
                );
              })}
            </ul>
          </UxSidebarSection>
        )}

        {showSkills && (
          <UxSidebarSection title="Skills">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {skillsLeft.map((s, i) => (
                  <li key={i} style={{ fontSize: 10.5, color: "#e2e8f0", lineHeight: 1.3 }}>
                    {s}
                  </li>
                ))}
              </ul>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {skillsRight.map((s, i) => (
                  <li key={i} style={{ fontSize: 10.5, color: "#e2e8f0", lineHeight: 1.3 }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </UxSidebarSection>
        )}

        {showLanguages && (
          <UxSidebarSection title="Languages">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
              }}
            >
              {data.languages.map((l, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 10.5,
                    padding: "2px 8px",
                    borderRadius: 10,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                >
                  {l}
                </li>
              ))}
            </ul>
          </UxSidebarSection>
        )}
      </aside>

      {/* Main */}
      <main
        style={{
          backgroundColor: "white",
          padding: 28,
          color: "#1f2937",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {showPersonal && (
          <header style={{ marginBottom: 4 }}>
            <p style={{ fontSize: 12, fontStyle: "italic", color: "#9ca3af", margin: 0 }}>
              Hello, I&apos;m
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "2px 0 0 0", lineHeight: 1.1, color: "#1e3a5f" }}>
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0 0" }}>{data.title}</p>
            )}
          </header>
        )}

        {showSummary && (
          <UxMainSection title="Profile" accent={accent}>
            <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: "#374151" }}>
              {data.summary}
            </p>
          </UxMainSection>
        )}

        {showExperience && (
          <UxMainSection title="Experience" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.experience.map((exp) => {
                const bullets = nonEmptyBullets(exp.bullets);
                const range = formatRange(exp.start, exp.end);
                return (
                  <div key={exp.id} style={{ breakInside: "avoid", display: "flex", gap: 12 }}>
                    <div
                      style={{
                        position: "relative",
                        width: 12,
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: -14,
                          width: 2,
                          background: "#e5e7eb",
                        }}
                      />
                      <div
                        style={{
                          position: "relative",
                          marginTop: 4,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: accent,
                          border: "2px solid white",
                          boxShadow: "0 0 0 1px #e5e7eb",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, paddingBottom: 2 }}>
                      {range && (
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
                          {range}
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                        {exp.role}
                      </div>
                      <div style={{ fontSize: 11.5, color: accent, marginBottom: 4 }}>
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </div>
                      {bullets.length > 0 && (
                        <ul
                          style={{
                            margin: 0,
                            padding: 0,
                            listStyle: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {bullets.map((b, i) => (
                            <li
                              key={i}
                              style={{
                                fontSize: 11,
                                color: "#374151",
                                paddingLeft: 12,
                                position: "relative",
                                lineHeight: 1.4,
                              }}
                            >
                              <span style={{ position: "absolute", left: 0, color: "#9ca3af" }}>
                                –
                              </span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </UxMainSection>
        )}

        {showProjects && (
          <UxMainSection title="Projects" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.projects.map((p) => {
                const tech = joinTech(p.tech);
                return (
                  <div key={p.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                        {p.name}
                      </div>
                      {p.link && (
                        <span style={{ fontSize: 10.5, color: accent, flexShrink: 0 }}>
                          {p.link}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#374151", lineHeight: 1.4 }}>
                        {p.description}
                      </p>
                    )}
                    {tech && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 10.5, color: "#6b7280" }}>
                        {tech}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </UxMainSection>
        )}

        {showEducation && (
          <UxMainSection title="Education" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.education.map((ed) => {
                const range = formatRange(ed.start, ed.end);
                return (
                  <div key={ed.id} style={{ breakInside: "avoid", display: "flex", gap: 12 }}>
                    <div
                      style={{
                        position: "relative",
                        width: 12,
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: -14,
                          width: 2,
                          background: "#e5e7eb",
                        }}
                      />
                      <div
                        style={{
                          position: "relative",
                          marginTop: 4,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: accent,
                          border: "2px solid white",
                          boxShadow: "0 0 0 1px #e5e7eb",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      {range && (
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
                          {range}
                        </div>
                      )}
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>
                        {ed.degree}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#374151" }}>
                        {ed.school}
                        {ed.location ? ` · ${ed.location}` : ""}
                      </div>
                      {ed.grade && (
                        <div style={{ fontSize: 10.5, color: "#6b7280" }}>{ed.grade}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </UxMainSection>
        )}

        {showAwards && (
          <UxMainSection title="Awards" accent={accent}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {data.awards.map((a) => (
                <li key={a.id} style={{ fontSize: 11.5, color: "#374151", breakInside: "avoid" }}>
                  <span style={{ fontWeight: 700, color: "#111827" }}>{a.title}</span>
                  {a.subtitle && <span> — {a.subtitle}</span>}
                  {a.date && <span style={{ color: "#6b7280" }}> · {a.date}</span>}
                  {a.description && <div>{a.description}</div>}
                </li>
              ))}
            </ul>
          </UxMainSection>
        )}

        {visible(sections, "custom") &&
          renderCustomSections(data, accent, (title, children) => (
            <UxMainSection title={title} accent={accent}>
              {children}
            </UxMainSection>
          ))}
      </main>
    </div>
  );
}

function UxSidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          color: "white",
          opacity: 0.95,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function UxMainSection({
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
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#1e3a5f",
          margin: "0 0 10px 0",
          paddingBottom: 4,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ============================================================
 * 6) TEACHER — two-col, dark sidebar with diagonal yellow band
 * ============================================================ */

export function TeacherTemplate({
  data,
  sections,
  accent,
}: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const yellow = "#eab308";
  const showPersonal = visible(sections, "personal");
  const showSummary =
    visible(sections, "summary") && data.summary.trim().length > 0;
  const showExperience =
    visible(sections, "experience") && data.experience.length > 0;
  const showSkills = visible(sections, "skills") && data.skills.length > 0;
  const showEducation =
    visible(sections, "education") && data.education.length > 0;
  const showLanguages =
    visible(sections, "languages") && data.languages.length > 0;
  const showAwards = visible(sections, "awards") && data.awards.length > 0;
  const showCerts =
    visible(sections, "certifications") && data.certifications.length > 0;

  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "33% 67%", minHeight: 1123 }}>
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: "#374151",
          color: "white",
          position: "relative",
          padding: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 90,
            backgroundColor: yellow,
            clipPath: "polygon(0 0, 100% 0, 100% 55%, 0 100%)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: 28,
            paddingTop: 30,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {showPersonal && (
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <Avatar data={data} size={80} ring="white" />
              </div>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.2,
                  color: "white",
                }}
              >
                {data.name || "Your Name"}
              </h1>
              {data.title && (
                <p style={{ fontSize: 12, color: yellow, margin: "4px 0 0 0", fontWeight: 600 }}>
                  {data.title}
                </p>
              )}
            </div>
          )}

          {showContact && (
            <TeSidebarSection title="Contact">
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                {contacts.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 6,
                        fontSize: 11,
                        color: "#e5e7eb",
                        lineHeight: 1.3,
                      }}
                    >
                      <Icon size={12} color={yellow} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ wordBreak: "break-word" }}>{c.value}</span>
                    </li>
                  );
                })}
              </ul>
            </TeSidebarSection>
          )}

          {showSkills && (
            <TeSidebarSection title="Skills">
              <div>
                {data.skills.map((s, i) => (
                  <SkillBar
                    key={i}
                    skill={s}
                    level={data.skillLevels[s]}
                    accent={yellow}
                    trackColor="rgba(255,255,255,0.15)"
                  />
                ))}
              </div>
            </TeSidebarSection>
          )}

          {showLanguages && (
            <TeSidebarSection title="Languages">
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {data.languages.map((l, i) => (
                  <li key={i} style={{ fontSize: 11, color: "#e5e7eb" }}>
                    {l}
                  </li>
                ))}
              </ul>
            </TeSidebarSection>
          )}

          {showCerts && (
            <TeSidebarSection title="Certifications">
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                {data.certifications.map((c) => (
                  <li key={c.id} style={{ fontSize: 11, color: "#e5e7eb", breakInside: "avoid" }}>
                    <div style={{ fontWeight: 600, color: "white" }}>{c.title}</div>
                    {c.subtitle && <div style={{ color: "#d1d5db" }}>{c.subtitle}</div>}
                    {c.date && <div style={{ color: yellow }}>{c.date}</div>}
                  </li>
                ))}
              </ul>
            </TeSidebarSection>
          )}
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          backgroundColor: "#f3f4f6",
          padding: 28,
          color: "#1f2937",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {showSummary && (
          <TeMainSection title="Profile Summary" accent={yellow}>
            <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: "#374151" }}>
              {data.summary}
            </p>
          </TeMainSection>
        )}

        {showExperience && (
          <TeMainSection title="Experience" accent={yellow}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.experience.map((exp) => {
                const bullets = nonEmptyBullets(exp.bullets);
                const range = formatRange(exp.start, exp.end);
                return (
                  <div key={exp.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                          {exp.role}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#6b7280" }}>
                          {exp.company}
                          {exp.location ? ` · ${exp.location}` : ""}
                        </div>
                      </div>
                      {range && (
                        <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>
                          {range}
                        </span>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul
                        style={{
                          margin: "4px 0 0 0",
                          padding: 0,
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: 11,
                              color: "#374151",
                              paddingLeft: 12,
                              position: "relative",
                              lineHeight: 1.4,
                            }}
                          >
                            <span style={{ position: "absolute", left: 0, color: yellow }}>
                              •
                            </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </TeMainSection>
        )}

        {showEducation && (
          <TeMainSection title="Education" accent={yellow}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.education.map((ed) => {
                const range = formatRange(ed.start, ed.end);
                return (
                  <div key={ed.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>
                        {ed.degree}
                      </div>
                      {range && (
                        <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>
                          {range}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#374151" }}>
                      {ed.school}
                      {ed.location ? ` · ${ed.location}` : ""}
                    </div>
                    {ed.grade && (
                      <div style={{ fontSize: 10.5, color: "#6b7280" }}>{ed.grade}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </TeMainSection>
        )}

        {showAwards && (
          <TeMainSection title="Achievements" accent={yellow}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {data.awards.map((a) => (
                <li key={a.id} style={{ fontSize: 11.5, color: "#374151", breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#111827" }}>{a.title}</span>
                    {a.date && (
                      <span style={{ fontSize: 10.5, color: "#6b7280" }}>{a.date}</span>
                    )}
                  </div>
                  {a.subtitle && <div>{a.subtitle}</div>}
                  {a.description && <div style={{ color: "#4b5563" }}>{a.description}</div>}
                </li>
              ))}
            </ul>
          </TeMainSection>
        )}

        {visible(sections, "custom") &&
          renderCustomSections(data, accent, (title, children) => (
            <TeMainSection title={title} accent={accent}>
              {children}
            </TeMainSection>
          ))}
      </main>
    </div>
  );
}

function TeSidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          color: "white",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function TeMainSection({
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
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#111827",
          margin: "0 0 10px 0",
          paddingBottom: 4,
          borderBottom: `1px solid ${accent}`,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ============================================================
 * 7) PRODUCT MANAGER — two-col, teal sidebar, full-width section bars
 * ========================================================== */

export function ProductManagerTemplate({
  data,
  sections,
  accent,
}: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const teal = "#059669";
  const showPersonal = visible(sections, "personal");
  const showSummary =
    visible(sections, "summary") && data.summary.trim().length > 0;
  const showExperience =
    visible(sections, "experience") && data.experience.length > 0;
  const showSkills = visible(sections, "skills") && data.skills.length > 0;
  const showEducation =
    visible(sections, "education") && data.education.length > 0;
  const showLanguages =
    visible(sections, "languages") && data.languages.length > 0;
  const showProjects = visible(sections, "projects") && data.projects.length > 0;
  const showCerts =
    visible(sections, "certifications") && data.certifications.length > 0;

  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "35% 65%", minHeight: 1123 }}>
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: teal,
          color: "white",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {showPersonal && (
          <div>
            <div style={{ marginBottom: 14, display: "flex", justifyContent: "flex-start" }}>
              <Avatar data={data} size={80} ring="white" />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p style={{ fontSize: 11, color: "#d1fae5", margin: "4px 0 0 0" }}>{data.title}</p>
            )}
          </div>
        )}

        {showSummary && (
          <PmSidebarSection title="About Me">
            <p style={{ fontSize: 11.5, lineHeight: 1.5, margin: 0, color: "#ecfdf5" }}>
              {data.summary}
            </p>
          </PmSidebarSection>
        )}

        {showContact && (
          <PmSidebarSection title="Contact">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {contacts.map((c, i) => {
                const Icon = c.icon;
                return (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      fontSize: 11,
                      color: "#ecfdf5",
                      lineHeight: 1.3,
                    }}
                  >
                    <Icon size={12} color="white" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ wordBreak: "break-word" }}>{c.value}</span>
                  </li>
                );
              })}
            </ul>
          </PmSidebarSection>
        )}

        {showSkills && (
          <PmSidebarSection title="Skills Summary">
            <div>
              {data.skills.map((s, i) => (
                <SkillBar
                  key={i}
                  skill={s}
                  level={data.skillLevels[s]}
                  accent="white"
                  trackColor="rgba(255,255,255,0.25)"
                />
              ))}
            </div>
          </PmSidebarSection>
        )}

        {showLanguages && (
          <PmSidebarSection title="Languages">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {data.languages.map((l, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "#ecfdf5",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "white",
                      flexShrink: 0,
                    }}
                  />
                  {l}
                </li>
              ))}
            </ul>
          </PmSidebarSection>
        )}
      </aside>

      {/* Main */}
      <main
        style={{
          backgroundColor: "white",
          padding: 28,
          color: "#1f2937",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {showPersonal && (
          <header style={{ marginBottom: 4 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.1,
                color: "#111827",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p style={{ fontSize: 13, color: teal, margin: "4px 0 0 0", fontWeight: 600 }}>
                {data.title}
              </p>
            )}
          </header>
        )}

        {showExperience && (
          <PmMainBar title="Experience" accent={teal}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.experience.map((exp) => {
                const bullets = nonEmptyBullets(exp.bullets);
                const range = formatRange(exp.start, exp.end);
                return (
                  <div key={exp.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                          {exp.role}
                        </div>
                        <div style={{ fontSize: 11.5, color: teal, fontWeight: 600 }}>
                          {exp.company}
                          {exp.location ? ` · ${exp.location}` : ""}
                        </div>
                      </div>
                      {range && (
                        <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>
                          {range}
                        </span>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul
                        style={{
                          margin: "4px 0 0 0",
                          padding: 0,
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: 11,
                              color: "#374151",
                              paddingLeft: 12,
                              position: "relative",
                              lineHeight: 1.4,
                            }}
                          >
                            <span style={{ position: "absolute", left: 0, color: teal }}>
                              •
                            </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </PmMainBar>
        )}

        {showProjects && (
          <PmMainBar title="Projects" accent={teal}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.projects.map((p) => {
                const tech = joinTech(p.tech);
                return (
                  <div key={p.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                        {p.name}
                      </div>
                      {p.link && (
                        <span style={{ fontSize: 10.5, color: teal, flexShrink: 0 }}>
                          {p.link}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#374151", lineHeight: 1.4 }}>
                        {p.description}
                      </p>
                    )}
                    {tech && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 10.5, color: "#6b7280" }}>
                        {tech}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </PmMainBar>
        )}

        {showEducation && (
          <PmMainBar title="Education" accent={teal}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.education.map((ed) => {
                const range = formatRange(ed.start, ed.end);
                return (
                  <div key={ed.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>
                        {ed.degree}
                      </div>
                      {range && (
                        <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>
                          {range}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#374151" }}>
                      {ed.school}
                      {ed.location ? ` · ${ed.location}` : ""}
                    </div>
                    {ed.grade && (
                      <div style={{ fontSize: 10.5, color: "#6b7280" }}>{ed.grade}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </PmMainBar>
        )}

        {showCerts && (
          <PmMainBar title="Certifications" accent={teal}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {data.certifications.map((c) => (
                <li key={c.id} style={{ fontSize: 11.5, color: "#374151", breakInside: "avoid" }}>
                  <span style={{ fontWeight: 700, color: "#111827" }}>{c.title}</span>
                  {c.subtitle && <span> — {c.subtitle}</span>}
                  {c.date && <span style={{ color: "#6b7280" }}> · {c.date}</span>}
                </li>
              ))}
            </ul>
          </PmMainBar>
        )}

        {visible(sections, "custom") &&
          renderCustomSections(data, accent, (title, children) => (
            <PmMainBar title={title} accent={accent}>
              {children}
            </PmMainBar>
          ))}
      </main>
    </div>
  );
}

function PmSidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          color: "white",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function PmMainBar({
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
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "white",
          backgroundColor: accent,
          padding: "4px 12px",
          margin: "0 0 10px 0",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ============================================================
 * 8) FINANCE — top header band + two-col body, no heavy color
 * ============================================================ */

export function FinanceTemplate({
  data,
  sections,
  accent,
}: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const showPersonal = visible(sections, "personal");
  const showSummary =
    visible(sections, "summary") && data.summary.trim().length > 0;
  const showExperience =
    visible(sections, "experience") && data.experience.length > 0;
  const showSkills = visible(sections, "skills") && data.skills.length > 0;
  const showEducation =
    visible(sections, "education") && data.education.length > 0;
  const showCerts =
    visible(sections, "certifications") && data.certifications.length > 0;
  const showInterests =
    visible(sections, "interests") && data.interests.length > 0;
  const showLanguages =
    visible(sections, "languages") && data.languages.length > 0;

  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;

  return (
    <div style={{ minHeight: 1123, display: "flex", flexDirection: "column" }}>
      {/* Top header band */}
      {showPersonal && (
        <div
          style={{
            backgroundColor: "#e5e7eb",
            padding: 24,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", paddingRight: 90 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.1,
                color: "#111827",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p
                style={{
                  fontSize: 13,
                  color: "#374151",
                  margin: "4px 0 0 0",
                  fontWeight: 500,
                }}
              >
                {data.title}
              </p>
            )}
            {showContact && (
              <p
                style={{
                  fontSize: 11,
                  color: "#4b5563",
                  margin: "6px 0 0 0",
                  lineHeight: 1.4,
                }}
              >
                {contacts.map((c) => c.value).join("  |  ")}
              </p>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              right: 24,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <Avatar data={data} size={80} />
          </div>
        </div>
      )}

      {/* Two-column body */}
      <div style={{ display: "grid", gridTemplateColumns: "68% 32%", flex: 1 }}>
        {/* Left main */}
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            backgroundColor: "white",
          }}
        >
          {showSummary && (
            <FiSection title="Profile Summary">
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: "#374151" }}>
                {data.summary}
              </p>
            </FiSection>
          )}

          {showExperience && (
            <FiSection title="Work Experience">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.experience.map((exp) => {
                  const bullets = nonEmptyBullets(exp.bullets);
                  const range = formatRange(exp.start, exp.end);
                  return (
                    <div key={exp.id} style={{ breakInside: "avoid" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>
                          {exp.role}
                          {exp.company && (
                            <span style={{ color: "#4b5563", fontWeight: 500 }}>
                              {" "}— {exp.company}
                              {exp.location ? `, ${exp.location}` : ""}
                            </span>
                          )}
                        </div>
                        {range && (
                          <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>
                            {range}
                          </span>
                        )}
                      </div>
                      {bullets.length > 0 && (
                        <ul
                          style={{
                            margin: "4px 0 0 0",
                            padding: 0,
                            listStyle: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {bullets.map((b, i) => (
                            <li
                              key={i}
                              style={{
                                fontSize: 11,
                                color: "#374151",
                                paddingLeft: 12,
                                position: "relative",
                                lineHeight: 1.4,
                              }}
                            >
                              <span style={{ position: "absolute", left: 0, color: "#6b7280" }}>
                                •
                              </span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </FiSection>
          )}

          {showSkills && (
            <FiSection title="Professional Qualifications">
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: "#374151" }}>
                {data.skills.join(" · ")}
              </p>
            </FiSection>
          )}

          {showEducation && (
            <FiSection title="Education">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.education.map((ed) => {
                  const range = formatRange(ed.start, ed.end);
                  return (
                    <div key={ed.id} style={{ breakInside: "avoid" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>
                          {ed.degree}
                        </div>
                        {range && (
                          <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>
                            {range}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#374151" }}>
                        {ed.school}
                        {ed.location ? ` · ${ed.location}` : ""}
                      </div>
                      {ed.grade && (
                        <div style={{ fontSize: 10.5, color: "#6b7280" }}>{ed.grade}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </FiSection>
          )}
        </div>

        {/* Right sidebar */}
        <div
          style={{
            padding: 24,
            backgroundColor: "#f9fafb",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            borderLeft: "1px solid #e5e7eb",
          }}
        >
          {showSkills && (
            <FiSection title="Key Skills">
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                {data.skills.map((s, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      fontSize: 11,
                      color: "#374151",
                      lineHeight: 1.3,
                    }}
                  >
                    <FileText size={11} color="#6b7280" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </FiSection>
          )}

          {showCerts && (
            <FiSection title="Certifications">
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {data.certifications.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      display: "flex",
                      gap: 8,
                      fontSize: 11,
                      color: "#374151",
                      breakInside: "avoid",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "1.5px solid #4b5563",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#4b5563",
                      }}
                    >
                      ✓
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#111827", fontSize: 11 }}>
                        {c.title}
                      </div>
                      {c.subtitle && <div style={{ color: "#4b5563" }}>{c.subtitle}</div>}
                      {c.date && <div style={{ color: "#6b7280", fontSize: 10 }}>{c.date}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </FiSection>
          )}

          {showLanguages && (
            <FiSection title="Languages">
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {data.languages.map((l, i) => (
                  <li key={i} style={{ fontSize: 11, color: "#374151" }}>
                    {l}
                  </li>
                ))}
              </ul>
            </FiSection>
          )}

          {showInterests && (
            <FiSection title="Interests">
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {data.interests.map((it, i) => (
                  <li key={i} style={{ fontSize: 11, color: "#374151" }}>
                    {it}
                  </li>
                ))}
              </ul>
            </FiSection>
          )}

          {visible(sections, "custom") &&
            renderCustomSections(data, accent, (title, children) => (
              <FiSection title={title}>{children}</FiSection>
            ))}
        </div>
      </div>
    </div>
  );
}

function FiSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#111827",
          margin: "0 0 8px 0",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ============================================================
 * 9) BUSINESS ANALYST — two-col, navy sidebar, yellow timeline accents
 * ============================================================ */

export function BusinessAnalystTemplate({
  data,
  sections,
  accent,
}: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const navy = "#1e3a5f";
  const yellow = "#fbbf24";
  const showPersonal = visible(sections, "personal");
  const showSummary =
    visible(sections, "summary") && data.summary.trim().length > 0;
  const showExperience =
    visible(sections, "experience") && data.experience.length > 0;
  const showSkills = visible(sections, "skills") && data.skills.length > 0;
  const showProjects = visible(sections, "projects") && data.projects.length > 0;
  const showEducation =
    visible(sections, "education") && data.education.length > 0;
  const showLanguages =
    visible(sections, "languages") && data.languages.length > 0;
  const showAwards = visible(sections, "awards") && data.awards.length > 0;
  const showCerts =
    visible(sections, "certifications") && data.certifications.length > 0;

  const contacts = buildContact(data);
  const showContact = showPersonal && contacts.length > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "30% 70%", minHeight: 1123 }}>
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: navy,
          color: "white",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {showPersonal && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Avatar data={data} size={90} ring={yellow} />
            </div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              {data.name || "Your Name"}
            </h1>
            {data.title && (
              <p style={{ fontSize: 11, color: yellow, margin: "4px 0 0 0" }}>{data.title}</p>
            )}
          </div>
        )}

        {showContact && (
          <BaSidebarSection title="Contact" yellow={yellow}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {contacts.map((c, i) => {
                const Icon = c.icon;
                return (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      fontSize: 11,
                      color: "#e2e8f0",
                      lineHeight: 1.3,
                    }}
                  >
                    <Icon size={12} color="white" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ wordBreak: "break-word" }}>{c.value}</span>
                  </li>
                );
              })}
            </ul>
          </BaSidebarSection>
        )}

        {showEducation && (
          <BaSidebarSection title="Education" yellow={yellow}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.education.map((ed, idx) => {
                const range = formatRange(ed.start, ed.end);
                const isLast = idx === data.education.length - 1;
                return (
                  <div
                    key={ed.id}
                    style={{
                      breakInside: "avoid",
                      display: "flex",
                      gap: 10,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: 10,
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 4,
                          bottom: isLast ? -8 : -16,
                          width: 2,
                          background: yellow,
                        }}
                      />
                      <div
                        style={{
                          position: "relative",
                          marginTop: 2,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: yellow,
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : 4 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: "white" }}>
                        {ed.degree}
                      </div>
                      <div style={{ fontSize: 11, color: "#cbd5e1" }}>{ed.school}</div>
                      {(range || ed.location) && (
                        <div style={{ fontSize: 10.5, color: "#94a3b8" }}>
                          {[range, ed.location].filter(Boolean).join(" · ")}
                        </div>
                      )}
                      {ed.grade && (
                        <div style={{ fontSize: 10.5, color: yellow }}>{ed.grade}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </BaSidebarSection>
        )}

        {showSkills && (
          <BaSidebarSection title="Key Skills" yellow={yellow}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {data.skills.map((s, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "#e2e8f0",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: yellow,
                      flexShrink: 0,
                    }}
                  />
                  {s}
                </li>
              ))}
            </ul>
          </BaSidebarSection>
        )}

        {showLanguages && (
          <BaSidebarSection title="Languages" yellow={yellow}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {data.languages.map((l, i) => (
                <li key={i} style={{ fontSize: 11, color: "#e2e8f0" }}>
                  {l}
                </li>
              ))}
            </ul>
          </BaSidebarSection>
        )}
      </aside>

      {/* Main */}
      <main
        style={{
          backgroundColor: "white",
          padding: 28,
          color: "#1f2937",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {showPersonal && (
          <header style={{ marginBottom: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 4,
                  height: 40,
                  background: yellow,
                  flexShrink: 0,
                }}
              />
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.1,
                  color: navy,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {data.name || "Your Name"}
              </h1>
            </div>
            {data.title && (
              <p
                style={{
                  fontSize: 12,
                  color: "#475569",
                  margin: "6px 0 0 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}
              >
                {data.title}
              </p>
            )}
          </header>
        )}

        {showSummary && (
          <section>
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: navy,
                backgroundColor: yellow,
                padding: "4px 12px",
                margin: "0 0 10px 0",
              }}
            >
              Profile Summary
            </h2>
            <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: "#374151" }}>
              {data.summary}
            </p>
          </section>
        )}

        {showExperience && (
          <section>
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: navy,
                backgroundColor: yellow,
                padding: "4px 12px",
                margin: "0 0 10px 0",
              }}
            >
              Work Experience
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.experience.map((exp, idx) => {
                const bullets = nonEmptyBullets(exp.bullets);
                const range = formatRange(exp.start, exp.end);
                const isLast = idx === data.experience.length - 1;
                return (
                  <div
                    key={exp.id}
                    style={{
                      breakInside: "avoid",
                      display: "flex",
                      gap: 12,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: 12,
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 6,
                          bottom: isLast ? -8 : -18,
                          width: 2,
                          background: yellow,
                        }}
                      />
                      <div
                        style={{
                          position: "relative",
                          marginTop: 4,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: yellow,
                          border: "2px solid white",
                          boxShadow: "0 0 0 1px #fbbf24",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : 4 }}>
                      {range && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: navy, marginBottom: 2 }}>
                          {range}
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                        {exp.role}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#475569", marginBottom: 4 }}>
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </div>
                      {bullets.length > 0 && (
                        <ul
                          style={{
                            margin: 0,
                            padding: 0,
                            listStyle: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {bullets.map((b, i) => (
                            <li
                              key={i}
                              style={{
                                fontSize: 11,
                                color: "#374151",
                                paddingLeft: 12,
                                position: "relative",
                                lineHeight: 1.4,
                              }}
                            >
                              <span style={{ position: "absolute", left: 0, color: yellow }}>
                                •
                              </span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {showProjects && (
          <section>
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: navy,
                backgroundColor: yellow,
                padding: "4px 12px",
                margin: "0 0 10px 0",
              }}
            >
              Projects
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.projects.map((p) => {
                const tech = joinTech(p.tech);
                return (
                  <div key={p.id} style={{ breakInside: "avoid" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                        {p.name}
                      </div>
                      {p.link && (
                        <span style={{ fontSize: 10.5, color: navy, flexShrink: 0 }}>
                          {p.link}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#374151", lineHeight: 1.4 }}>
                        {p.description}
                      </p>
                    )}
                    {tech && (
                      <p style={{ margin: "2px 0 0 0", fontSize: 10.5, color: "#6b7280" }}>
                        {tech}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {showAwards && (
          <section>
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: navy,
                backgroundColor: yellow,
                padding: "4px 12px",
                margin: "0 0 10px 0",
              }}
            >
              Achievements
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {data.awards.map((a) => (
                <li key={a.id} style={{ fontSize: 11.5, color: "#374151", breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#111827" }}>{a.title}</span>
                    {a.date && (
                      <span style={{ fontSize: 10.5, color: "#6b7280" }}>{a.date}</span>
                    )}
                  </div>
                  {a.subtitle && <div>{a.subtitle}</div>}
                  {a.description && <div style={{ color: "#475569" }}>{a.description}</div>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {showCerts && (
          <section>
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: navy,
                backgroundColor: yellow,
                padding: "4px 12px",
                margin: "0 0 10px 0",
              }}
            >
              Certifications
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {data.certifications.map((c) => (
                <li key={c.id} style={{ fontSize: 11.5, color: "#374151", breakInside: "avoid" }}>
                  <span style={{ fontWeight: 700, color: "#111827" }}>{c.title}</span>
                  {c.subtitle && <span> — {c.subtitle}</span>}
                  {c.date && <span style={{ color: "#6b7280" }}> · {c.date}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {visible(sections, "custom") &&
          renderCustomSections(data, accent, (title, children) => (
            <section>
              <h2
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: navy,
                  backgroundColor: yellow,
                  padding: "4px 12px",
                  margin: "0 0 10px 0",
                }}
              >
                {title}
              </h2>
              {children}
            </section>
          ))}
      </main>
    </div>
  );
}

function BaSidebarSection({
  title,
  yellow,
  children,
}: {
  title: string;
  yellow: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          color: yellow,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
