"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";

const PAPER = "resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl";
const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

// Avatar helper — supports circle, square, rounded, diamond shapes.
// Diamond is implemented as a rotated square: outer wrapper rotates 45deg,
// inner image/text rotates back -45deg to keep content upright.
function Avatar({ data, size, ring, ringWidth = 3, shape = "circle" }: { data: ResumeData; size: number; ring?: string; ringWidth?: number; shape?: "circle" | "square" | "rounded" | "diamond" }) {
  const borderStyle = ring ? `${ring} ${ringWidth}px solid` : undefined;
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "12px" : shape === "diamond" ? "0" : "0";
  const transform = shape === "diamond" ? "rotate(45deg)" : undefined;
  const innerTransform = shape === "diamond" ? "rotate(-45deg)" : undefined;
  const initials = data.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const innerSize = shape === "diamond" ? size * 0.707 : size;
  if (data.photo) {
    return (
      <div style={{ width: size, height: size, transform, display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties}>
        <img
          src={data.photo}
          alt={data.name}
          style={{ width: innerSize, height: innerSize, borderRadius, objectFit: "cover", border: borderStyle, transform: innerTransform } as React.CSSProperties}
        />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, transform, display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties}>
      <div
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius,
          background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.3,
          fontWeight: 700,
          border: borderStyle,
          transform: innerTransform,
        } as React.CSSProperties}
      >
        {initials}
      </div>
    </div>
  );
}

function range(start: string, end: string) {
  const s = (start ?? "").trim();
  const e = (end ?? "").trim();
  if (s && e) return `${s} — ${e}`;
  if (s) return `${s} — Present`;
  return e || "";
}

// Shared SectionHeader helper — supports multiple visual styles.
function SectionHeader({ title, color, style = "line", icon }: { title: string; color: string; style?: "line" | "bar" | "dot" | "plain" | "pill" | "underline"; icon?: string }) {
  if (style === "bar") {
    return (
      <div style={{ background: color, color: "white", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 4, marginBottom: 10, display: "inline-block", letterSpacing: 1 }}>
        {icon ? `${icon} ` : ""}{title.toUpperCase()}
      </div>
    );
  }
  if (style === "pill") {
    return (
      <div style={{ display: "inline-block", background: `${color}15`, color, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, marginBottom: 10, letterSpacing: 1 }}>
        {icon ? `${icon} ` : ""}{title.toUpperCase()}
      </div>
    );
  }
  if (style === "line") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 3, height: 14, background: color, borderRadius: 2 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5 }}>{icon ? `${icon} ` : ""}{title.toUpperCase()}</span>
      </div>
    );
  }
  if (style === "dot") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", letterSpacing: 0.5 }}>{title.toUpperCase()}</span>
      </div>
    );
  }
  if (style === "underline") {
    return (
      <div style={{ marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${color}` }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 1, textTransform: "uppercase" }}>{title}</span>
      </div>
    );
  }
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 10, letterSpacing: 0.5 }}>{title.toUpperCase()}</div>;
}

function Bullets({ bullets, color, char = "•" }: { bullets: string[]; color: string; char?: string }) {
  return (
    <>
      {bullets.filter((b) => b?.trim()).map((b, i) => (
        <div key={i} style={{ fontSize: 10, lineHeight: 1.6, paddingLeft: 12, position: "relative", marginBottom: 2 }}>
          <span style={{ position: "absolute", left: 0, color }}>{char}</span>
          {b}
        </div>
      ))}
    </>
  );
}

// Helper to render custom sections at the end of a main content area.
function CustomSections({ data, color, headerStyle }: { data: ResumeData; color: string; headerStyle: "line" | "bar" | "dot" | "plain" | "pill" | "underline" }) {
  return (
    <>
      {data.customSections.filter((cs) => cs.items.length > 0).map((cs) => (
        <div key={cs.id} style={{ marginBottom: 16 }}>
          <SectionHeader title={cs.title} color={color} style={headerStyle} />
          {cs.items.map((item) => (
            <div key={item.id} style={{ marginBottom: 4, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>
                {item.title}
                {item.date ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> · {item.date}</span> : null}
              </div>
              {item.subtitle && <div style={{ fontSize: 10, color, fontWeight: 600 }}>{item.subtitle}</div>}
              {item.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{item.description}</div>}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

// =====================================================================
// 1. PURPLE EXECUTIVE — Purple (#7c3aed) sidebar + top header band,
//    DIAMOND photo frame in header, accent bars for section headers,
//    skill chips in sidebar. Bold executive feel.
// =====================================================================
export function PurpleExecutiveTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const purple = "#7c3aed";
  const purpleDark = "#5b21b6";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif", position: "relative" }}>
      {/* Top header band — spans full width */}
      <div style={{ background: `linear-gradient(135deg, ${purple}, ${purpleDark})`, padding: "24px 32px 24px 264px", color: "white", position: "relative" }}>
        <div style={{ position: "absolute", right: 32, top: 24 }}>
          <Avatar data={data} size={92} shape="diamond" ring="white" ringWidth={3} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>{data.name}</h1>
        <p style={{ fontSize: 12, margin: "4px 0 0", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{data.title}</p>
      </div>
      <div style={{ display: "flex" }}>
        {/* Left purple sidebar */}
        <aside style={{ width: 232, background: purpleDark, color: "white", padding: "20px 16px", minHeight: 900 }}>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>SKILLS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ fontSize: 9, background: "rgba(255,255,255,0.15)", padding: "3px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)" }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>LANGUAGES</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, marginBottom: 3, paddingLeft: 10, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "#c4b5fd" }}>◆</span>{l}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>CERTIFICATIONS</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 6, fontSize: 9.5, lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 600 }}>{c.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 8.5 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>CONTACT</div>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, marginBottom: 3, color: "rgba(255,255,255,0.85)", wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "20px 24px", minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Profile" color={purple} style="bar" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Experience" color={purple} style="bar" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1e293b" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: purple, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={purple} char="◆" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={purple} style="bar" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: purple, marginTop: 2, fontWeight: 600 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Education" color={purple} style="bar" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: purple, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Achievements" color={purple} style="bar" />
              {data.awards.map((aw) => (
                <div key={aw.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#1e293b" }}>{aw.title}{aw.date ? ` (${aw.date})` : ""}</div>
                  {aw.subtitle && <div style={{ fontSize: 9.5, color: purple, fontWeight: 600 }}>{aw.subtitle}</div>}
                  {aw.description && <div style={{ fontSize: 9.5, color: "#64748b" }}>{aw.description}</div>}
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={purple} headerStyle="bar" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 2. BROWN CLASSIC — Brown (#92400e) serif classic, left sidebar with
//    circular photo, skill DOT ratings (1-5 filled dots based on level),
//    decorative arc top-right. Body in Georgia serif.
// =====================================================================
export function BrownClassicTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const brown = "#92400e";
  const cream = "#fdf6e3";
  return (
    <div className={PAPER} style={{ fontFamily: "Georgia, 'Times New Roman', serif", position: "relative", overflow: "hidden" }}>
      {/* Decorative arc top-right */}
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", top: -40, right: -40, opacity: 0.25, pointerEvents: "none" }}>
        <circle cx="70" cy="70" r="60" fill="none" stroke={brown} strokeWidth="2" />
        <circle cx="70" cy="70" r="48" fill="none" stroke={brown} strokeWidth="1" />
        <circle cx="70" cy="70" r="36" fill="none" stroke={brown} strokeWidth="0.5" />
      </svg>
      <div style={{ display: "flex" }}>
        {/* Left cream sidebar */}
        <aside style={{ width: 232, background: cream, padding: "24px 16px", minHeight: 1040, borderRight: `1px solid ${brown}30` }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <Avatar data={data} size={88} shape="circle" ring={brown} ringWidth={3} />
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: brown, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase", borderBottom: `1px solid ${brown}40`, paddingBottom: 3 }}>Skills</div>
              {data.skills.map((s, i) => {
                const lvl = data.skillLevels[s] ?? 70;
                const filled = Math.max(1, Math.min(5, Math.round((lvl / 100) * 5)));
                return (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: "#3f2a14", marginBottom: 2 }}>{s}</div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {[0, 1, 2, 3, 4].map((d) => (
                        <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: d < filled ? brown : `${brown}25` }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: brown, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase", borderBottom: `1px solid ${brown}40`, paddingBottom: 3 }}>Languages</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "#3f2a14", marginBottom: 2, fontStyle: "italic" }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: brown, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase", borderBottom: `1px solid ${brown}40`, paddingBottom: 3 }}>Certifications</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 5, fontSize: 9.5, color: "#3f2a14", lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  <div style={{ color: brown, fontStyle: "italic" }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: brown, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase", borderBottom: `1px solid ${brown}40`, paddingBottom: 3 }}>Contact</div>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "#3f2a14", marginBottom: 3, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "28px 28px", minWidth: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: 0.5 }}>{data.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, marginBottom: 16 }}>
            <div style={{ width: 32, height: 2, background: brown }} />
            <p style={{ fontSize: 12, color: brown, fontStyle: "italic", margin: 0 }}>{data.title}</p>
          </div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Summary" color={brown} style="plain" />
              <p style={{ fontSize: 10.5, lineHeight: 1.75, color: "#3f2a14" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Experience" color={brown} style="plain" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{e.role}</span>
                    <span style={{ fontSize: 9.5, color: "#7c6650", fontStyle: "italic" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: brown, fontStyle: "italic", marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={brown} char="◆" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={brown} style="plain" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a" }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#3f2a14", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 9, color: brown, fontStyle: "italic", marginTop: 2 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Education" color={brown} style="plain" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9.5, color: "#7c6650", fontStyle: "italic" }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: brown, fontStyle: "italic" }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Honors" color={brown} style="plain" />
              {data.awards.map((aw) => (
                <div key={aw.id} style={{ marginBottom: 4, fontSize: 10.5, color: "#3f2a14", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <span style={{ fontWeight: 700 }}>{aw.title}</span>{aw.date ? ` (${aw.date})` : ""}
                  {aw.subtitle ? ` — ${aw.subtitle}` : ""}
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={brown} headerStyle="plain" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 3. PEACH MODERN — Peach (#fb923c) + purple (#7c3aed), top header band,
//    progress bars for skills, PILL-shaped section headers.
//    Two-column layout with peach-tinted sidebar.
// =====================================================================
export function PeachModernTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const peach = "#fb923c";
  const purple = "#7c3aed";
  const peachLight = "#fff4ec";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif", background: peachLight }}>
      {/* Top header band */}
      <div style={{ background: `linear-gradient(120deg, ${purple}, ${purple}cc)`, padding: "20px 28px", display: "flex", alignItems: "center", gap: 18 }}>
        <Avatar data={data} size={80} shape="circle" ring="white" ringWidth={3} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}>{data.name}</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", margin: "3px 0 0", fontWeight: 500 }}>{data.title}</p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 9, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
          {[data.email, data.phone, data.location].filter(Boolean).map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex" }}>
        {/* Left peach sidebar */}
        <aside style={{ width: 232, background: peachLight, padding: "20px 16px", minHeight: 940, borderRight: `2px solid ${peach}40` }}>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Skills" color={purple} style="pill" />
              {data.skills.map((s, i) => {
                const lvl = data.skillLevels[s] ?? 70;
                return (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 600, color: "#1e293b" }}>{s}</span>
                      <span style={{ fontSize: 8.5, color: purple, fontWeight: 700 }}>{lvl}%</span>
                    </div>
                    <div style={{ height: 5, background: `${peach}40`, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${lvl}%`, height: "100%", background: `linear-gradient(90deg, ${peach}, ${purple})`, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Languages" color={purple} style="pill" />
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "#1e293b", marginBottom: 3, paddingLeft: 10, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: peach, fontSize: 8 }}>●</span>{l}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Interests" color={purple} style="pill" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 9, background: `${peach}30`, color: "#9a3412", padding: "2px 8px", borderRadius: 10 }}>{it}</span>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div>
              <SectionHeader title="Certifications" color={purple} style="pill" />
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 5, fontSize: 9.5, lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{c.title}</div>
                  <div style={{ color: purple, fontSize: 8.5 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "20px 24px", minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Profile" color={purple} style="pill" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Work Experience" color={purple} style="pill" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1e293b" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: peach, fontWeight: 700 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: purple, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={peach} />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={purple} style="pill" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: peach, marginTop: 2, fontWeight: 700 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <SectionHeader title="Education" color={purple} style="pill" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: peach, fontWeight: 700 }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: purple, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={purple} headerStyle="pill" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 4. WARM PROFESSIONAL — Warm brown (#a16207) sidebar, clean dividers,
//    NO photo, serif accents. Compact executive feel.
// =====================================================================
export function WarmProfessionalTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const warm = "#a16207";
  const warmLight = "#fef7e6";
  return (
    <div className={PAPER} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ display: "flex" }}>
        {/* Left warm sidebar */}
        <aside style={{ width: 232, background: warmLight, padding: "24px 18px", minHeight: 1040, borderRight: `3px solid ${warm}` }}>
          <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${warm}40` }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#422006", margin: 0, lineHeight: 1.15 }}>{data.name}</h1>
            <p style={{ fontSize: 10.5, color: warm, fontStyle: "italic", margin: "5px 0 0" }}>{data.title}</p>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: warm, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Contact</div>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "#422006", marginBottom: 4, lineHeight: 1.4, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: warm, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Skills</div>
              {data.skills.map((s, i) => (
                <div key={i} style={{ fontSize: 10, color: "#422006", marginBottom: 4, paddingLeft: 10, position: "relative", lineHeight: 1.4 }}>
                  <span style={{ position: "absolute", left: 0, color: warm, fontSize: 8 }}>◆</span>{s}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: warm, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Languages</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "#422006", marginBottom: 2, fontStyle: "italic" }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: warm, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Certifications</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 5, fontSize: 9.5, lineHeight: 1.4 }}>
                  <div style={{ color: "#422006", fontWeight: 600 }}>{c.title}</div>
                  <div style={{ color: warm, fontStyle: "italic" }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "24px 28px", minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${warm}30` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: warm, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Summary</div>
              <p style={{ fontSize: 11, lineHeight: 1.8, color: "#422006" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: warm, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, paddingBottom: 4, borderBottom: `1px solid ${warm}30` }}>Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1c1303" }}>{e.role}</span>
                    <span style={{ fontSize: 9.5, color: warm, fontStyle: "italic" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: warm, fontStyle: "italic", marginBottom: 4, fontWeight: 600 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={warm} char="◆" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: warm, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, paddingBottom: 4, borderBottom: `1px solid ${warm}30` }}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1c1303" }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 10.5, color: "#422006", lineHeight: 1.55 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 9, color: warm, fontStyle: "italic", marginTop: 2 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: warm, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, paddingBottom: 4, borderBottom: `1px solid ${warm}30` }}>Education</div>
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1c1303" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9.5, color: warm, fontStyle: "italic" }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: warm, fontStyle: "italic" }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {data.customSections.filter((cs) => cs.items.length > 0).map((cs) => (
            <div key={cs.id} style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: warm, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${warm}30` }}>{cs.title}</div>
              {cs.items.map((item) => (
                <div key={item.id} style={{ marginBottom: 5, fontSize: 10.5, color: "#422006", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <span style={{ fontWeight: 700 }}>{item.title}</span>{item.date ? ` (${item.date})` : ""}
                  {item.subtitle ? ` — ${item.subtitle}` : ""}
                </div>
              ))}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 5. EARTH PREMIUM — Earth tones (#854d0e), photo top-left, clean
//    two-column with thin separators, underlined section headers.
// =====================================================================
export function EarthPremiumTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const earth = "#854d0e";
  const earthDark = "#422006";
  const sand = "#fef7e6";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top header band — photo top-left + name */}
      <div style={{ padding: "24px 28px 18px", borderBottom: `2px solid ${earth}`, display: "flex", alignItems: "center", gap: 20 }}>
        <Avatar data={data} size={84} shape="circle" ring={earth} ringWidth={3} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: earthDark, margin: 0, letterSpacing: -0.3 }}>{data.name}</h1>
          <p style={{ fontSize: 12, color: earth, margin: "4px 0 0", fontWeight: 600, letterSpacing: 0.3 }}>{data.title}</p>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        {/* Left sand sidebar */}
        <aside style={{ width: 220, background: sand, padding: "20px 16px", minHeight: 940, borderRight: `1px solid ${earth}30` }}>
          <div style={{ marginBottom: 18 }}>
            <SectionHeader title="Contact" color={earth} style="underline" />
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: earthDark, marginBottom: 4, lineHeight: 1.4, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Skills" color={earth} style="underline" />
              {data.skills.map((s, i) => (
                <div key={i} style={{ fontSize: 10, color: earthDark, marginBottom: 4, paddingLeft: 10, position: "relative", lineHeight: 1.4 }}>
                  <span style={{ position: "absolute", left: 0, color: earth }}>▸</span>{s}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Languages" color={earth} style="underline" />
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: earthDark, marginBottom: 3 }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div>
              <SectionHeader title="Certifications" color={earth} style="underline" />
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 6, fontSize: 9.5, lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 600, color: earthDark }}>{c.title}</div>
                  <div style={{ color: earth, fontSize: 8.5 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "20px 24px", minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Profile" color={earth} style="underline" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Experience" color={earth} style="underline" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, paddingLeft: 14, borderLeft: `2px solid ${earth}30`, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: earthDark }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: earth, fontWeight: 600 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: earth, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={earth} char="▪" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={earth} style="underline" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: earthDark }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: earth, marginTop: 2, fontWeight: 600 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <SectionHeader title="Education" color={earth} style="underline" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: earthDark }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: earth, fontWeight: 600 }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: earth, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={earth} headerStyle="underline" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 6. PINK GEOMETRIC — Pink (#ec4899) + navy (#1e3a8a), geometric
//    triangle/rectangle patterns, modern grid layout, square avatar.
// =====================================================================
export function PinkGeometricTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const pink = "#ec4899";
  const navy = "#1e3a8a";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Decorative geometric shapes top-right */}
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none" }}>
        <polygon points="0,0 120,0 120,120" fill={navy} opacity="0.95" />
        <polygon points="60,0 120,0 120,60" fill={pink} opacity="0.4" />
      </svg>
      <div style={{ display: "flex" }}>
        {/* Left pink sidebar */}
        <aside style={{ width: 232, background: pink, color: "white", padding: "24px 16px", minHeight: 1040, position: "relative" }}>
          {/* Decorative bottom-right triangle */}
          <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: "absolute", bottom: 0, right: 0, pointerEvents: "none" }}>
            <polygon points="0,60 60,60 60,0" fill="rgba(255,255,255,0.15)" />
          </svg>
          <div style={{ textAlign: "center", marginBottom: 16, position: "relative" }}>
            <Avatar data={data} size={88} shape="square" ring="white" ringWidth={3} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Contact</div>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "white", marginBottom: 3, lineHeight: 1.4, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Skills</div>
              {data.skills.map((s, i) => (
                <div key={i} style={{ fontSize: 9.5, color: "white", marginBottom: 3, paddingLeft: 12, position: "relative", lineHeight: 1.4 }}>
                  <span style={{ position: "absolute", left: 0, color: "rgba(255,255,255,0.7)" }}>▶</span>{s}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Languages</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 9.5, color: "white", marginBottom: 2 }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Interests</div>
              {data.interests.map((it, i) => (
                <div key={i} style={{ fontSize: 9.5, color: "white", marginBottom: 2 }}>{it}</div>
              ))}
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "28px 28px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 18, height: 18, background: navy, transform: "rotate(45deg)" } as React.CSSProperties} />
            <h1 style={{ fontSize: 26, fontWeight: 800, color: navy, margin: 0, letterSpacing: -0.3 }}>{data.name}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 32, height: 3, background: pink }} />
            <p style={{ fontSize: 12, color: pink, fontWeight: 600, margin: 0 }}>{data.title}</p>
          </div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Summary" color={navy} style="plain" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Experience" color={navy} style="plain" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: navy }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: pink, fontWeight: 700 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: pink, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={navy} char="◆" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={navy} style="plain" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: navy }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: pink, marginTop: 2, fontWeight: 700 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <SectionHeader title="Education" color={navy} style="plain" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: navy }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: pink, fontWeight: 700 }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: pink, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={navy} headerStyle="plain" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 7. ROSE ELEGANT — Soft rose (#f43f5e) + beige, large circular photo
//    with decorative ring, elegant serif (Playfair-style).
// =====================================================================
export function RoseElegantTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const rose = "#f43f5e";
  const beige = "#fdf6f0";
  const serif = "'Playfair Display', Georgia, serif";
  return (
    <div className={PAPER} style={{ fontFamily: serif, background: beige }}>
      {/* Top header band — rose with photo + name */}
      <div style={{ background: `linear-gradient(120deg, ${rose}, #fb7185)`, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.5)" }} />
          <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)" }} />
          <Avatar data={data} size={88} shape="circle" ring="white" ringWidth={3} />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "white", margin: 0, letterSpacing: 0.5 }}>{data.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.7)" }} />
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", margin: 0, fontStyle: "italic" }}>{data.title}</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        {/* Left beige sidebar */}
        <aside style={{ width: 232, background: beige, padding: "20px 16px", minHeight: 940, borderRight: `1px solid ${rose}30` }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: rose, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase", borderBottom: `1px solid ${rose}40`, paddingBottom: 3, fontStyle: "italic" }}>Contact</div>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "#4a2a30", marginBottom: 4, lineHeight: 1.4, wordBreak: "break-word", fontStyle: "italic" }}>{c}</div>
            ))}
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: rose, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase", borderBottom: `1px solid ${rose}40`, paddingBottom: 3, fontStyle: "italic" }}>Skills</div>
              {data.skills.map((s, i) => {
                const lvl = data.skillLevels[s] ?? 70;
                return (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: "#4a2a30", marginBottom: 3, fontStyle: "italic" }}>{s}</div>
                    <div style={{ height: 3, background: `${rose}20`, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${lvl}%`, height: "100%", background: rose, borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: rose, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase", borderBottom: `1px solid ${rose}40`, paddingBottom: 3, fontStyle: "italic" }}>Languages</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "#4a2a30", marginBottom: 3, fontStyle: "italic" }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "awards") && data.awards.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: rose, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase", borderBottom: `1px solid ${rose}40`, paddingBottom: 3, fontStyle: "italic" }}>Honors</div>
              {data.awards.map((aw, i) => (
                <div key={i} style={{ marginBottom: 6, fontSize: 9.5, lineHeight: 1.4 }}>
                  <div style={{ color: "#4a2a30", fontWeight: 600 }}>{aw.title}</div>
                  <div style={{ color: rose, fontStyle: "italic" }}>{aw.subtitle}{aw.date ? ` · ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "20px 24px", minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ background: rose, color: "white", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 4, letterSpacing: 1, fontStyle: "italic" }}>PROFILE</div>
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.8, color: "#4a2a30", fontStyle: "italic" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ background: rose, color: "white", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 4, marginBottom: 10, display: "inline-block", letterSpacing: 1, fontStyle: "italic" }}>EXPERIENCE</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#3a1a25" }}>{e.role}</span>
                    <span style={{ fontSize: 9.5, color: rose, fontStyle: "italic" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: rose, fontStyle: "italic", marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={rose} char="❀" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ background: rose, color: "white", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 4, marginBottom: 10, display: "inline-block", letterSpacing: 1, fontStyle: "italic" }}>PROJECTS</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#3a1a25" }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400, fontStyle: "italic" }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#4a2a30", lineHeight: 1.55, fontStyle: "italic" }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: rose, marginTop: 2, fontWeight: 700, fontStyle: "italic" }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <div style={{ background: rose, color: "white", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 4, marginBottom: 10, display: "inline-block", letterSpacing: 1, fontStyle: "italic" }}>EDUCATION</div>
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#3a1a25" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9.5, color: rose, fontStyle: "italic" }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: rose, fontStyle: "italic" }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={rose} headerStyle="bar" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 8. FOUNDATION PURPLE — Purple (#6d28d9) + white, hexagonal pattern
//    background in header, bold header bar, two-column with thin separator.
// =====================================================================
export function FoundationPurpleTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const purple = "#6d28d9";
  const purpleDark = "#4c1d95";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top header band with hexagonal pattern background */}
      <div style={{ background: `linear-gradient(135deg, ${purple}, ${purpleDark})`, padding: "22px 28px", position: "relative", overflow: "hidden", color: "white" }}>
        {/* Hexagon pattern overlay (decorative SVG) */}
        <svg width="794" height="120" viewBox="0 0 794 120" style={{ position: "absolute", top: 0, left: 0, opacity: 0.15, pointerEvents: "none" }}>
          {[100, 220, 340, 460, 580, 700].map((x, i) => (
            <polygon key={i} points={`${x},10 ${x + 26},10 ${x + 39},32 ${x + 26},54 ${x},54 ${x - 13},32`} fill="none" stroke="white" strokeWidth="1" />
          ))}
          {[40, 160, 280, 400, 520, 640, 760].map((x, i) => (
            <polygon key={`b${i}`} points={`${x},50 ${x + 26},50 ${x + 39},72 ${x + 26},94 ${x},94 ${x - 13},72`} fill="none" stroke="white" strokeWidth="1" />
          ))}
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
          <Avatar data={data} size={80} shape="circle" ring="white" ringWidth={3} />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: 0, letterSpacing: -0.3 }}>{data.name}</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", margin: "4px 0 0", fontWeight: 500 }}>{data.title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8, fontSize: 9, color: "rgba(255,255,255,0.75)" }}>
              {[data.email, data.phone, data.location].filter(Boolean).map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        {/* Left sidebar */}
        <aside style={{ width: 220, background: "#faf7ff", padding: "20px 16px", minHeight: 940, borderRight: `1px solid ${purple}20` }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ background: purple, color: "white", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 4, marginBottom: 8, display: "inline-block", letterSpacing: 1 }}>CONTACT</div>
            {[data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "#3f2a14", marginBottom: 4, lineHeight: 1.4, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ background: purple, color: "white", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 4, marginBottom: 8, display: "inline-block", letterSpacing: 1 }}>SKILLS</div>
              {data.skills.map((s, i) => (
                <div key={i} style={{ fontSize: 10, color: "#2d1a4a", marginBottom: 4, paddingLeft: 12, position: "relative", lineHeight: 1.4 }}>
                  <span style={{ position: "absolute", left: 0, color: purple, fontSize: 8 }}>■</span>{s}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ background: purple, color: "white", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 4, marginBottom: 8, display: "inline-block", letterSpacing: 1 }}>LANGUAGES</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "#2d1a4a", marginBottom: 3 }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div>
              <div style={{ background: purple, color: "white", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 4, marginBottom: 8, display: "inline-block", letterSpacing: 1 }}>CERTS</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 6, fontSize: 9.5, lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 600, color: "#2d1a4a" }}>{c.title}</div>
                  <div style={{ color: purple, fontSize: 8.5 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "20px 24px", minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Profile" color={purple} style="bar" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Experience" color={purple} style="bar" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1e1b2e" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: purple, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={purple} char="■" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={purple} style="bar" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e1b2e" }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: purple, marginTop: 2, fontWeight: 700 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <SectionHeader title="Education" color={purple} style="bar" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e1b2e" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: purple, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={purple} headerStyle="bar" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 9. BLUE SIDEBAR PRO — Blue (#1d4ed8) sidebar + circular photo, clean
//    sans-serif. Centered name in main, two-column layout.
// =====================================================================
export function BlueSidebarProTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const blue = "#1d4ed8";
  const blueDark = "#1e3a8a";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: "flex" }}>
        {/* Left blue sidebar */}
        <aside style={{ width: 232, background: `linear-gradient(180deg, ${blue}, ${blueDark})`, color: "white", padding: "24px 16px", minHeight: 1040 }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <Avatar data={data} size={88} shape="circle" ring="white" ringWidth={3} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Contact</div>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.9)", marginBottom: 3, lineHeight: 1.4, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Skills</div>
              {data.skills.map((s, i) => (
                <div key={i} style={{ fontSize: 10, color: "white", marginBottom: 4, paddingLeft: 12, position: "relative", lineHeight: 1.4 }}>
                  <span style={{ position: "absolute", left: 0, color: "#bfdbfe", fontSize: 8 }}>●</span>{s}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Languages</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "white", marginBottom: 2 }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Interests</div>
              {data.interests.map((it, i) => (
                <div key={i} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>{it}</div>
              ))}
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "32px 28px", minWidth: 0 }}>
          <div style={{ textAlign: "center", marginBottom: 22, paddingBottom: 18, borderBottom: `2px solid ${blue}30` }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: -0.3 }}>{data.name}</h1>
            <p style={{ fontSize: 12, color: blue, margin: "6px 0 0", fontWeight: 600, letterSpacing: 0.5 }}>{data.title}</p>
          </div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Profile" color={blue} style="plain" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Experience" color={blue} style="plain" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: blue, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={blue} char="■" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={blue} style="plain" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: blue, marginTop: 2, fontWeight: 700 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <SectionHeader title="Education" color={blue} style="plain" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: blue, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={blue} headerStyle="plain" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 10. ASPIRE TEAL — Teal (#0d9488) dividers + dark blue accents,
//     two-column modern with sidebar on RIGHT. Underline-style headers.
// =====================================================================
export function AspireTealTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const teal = "#0d9488";
  const dark = "#134e4a";
  const sidebarBg = "#f8faf9";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top teal header band */}
      <div style={{ background: `linear-gradient(120deg, ${teal}, ${dark})`, padding: "20px 28px", color: "white" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>{data.name}</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", margin: "4px 0 0", fontWeight: 500 }}>{data.title}</p>
      </div>
      <div style={{ display: "flex" }}>
        {/* Left main content */}
        <main style={{ flex: 1, padding: "20px 24px", minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Profile" color={teal} style="underline" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Experience" color={teal} style="underline" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#134e4a" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: teal, fontWeight: 700 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: teal, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={teal} char="▸" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={teal} style="underline" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#134e4a" }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: teal, marginTop: 2, fontWeight: 700 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <SectionHeader title="Education" color={teal} style="underline" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#134e4a" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: teal, fontWeight: 700 }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: teal, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={teal} headerStyle="underline" />
        </main>
        {/* Right sidebar */}
        <aside style={{ width: 232, background: sidebarBg, padding: "20px 16px", minHeight: 940, borderLeft: `2px solid ${teal}40` }}>
          <div style={{ marginBottom: 18 }}>
            <SectionHeader title="Contact" color={teal} style="underline" />
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "#134e4a", marginBottom: 4, lineHeight: 1.4, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Skills" color={teal} style="underline" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ fontSize: 9, background: `${teal}15`, color: teal, padding: "3px 8px", borderRadius: 10, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Languages" color={teal} style="underline" />
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "#134e4a", marginBottom: 3 }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div>
              <SectionHeader title="Certifications" color={teal} style="underline" />
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 6, fontSize: 9.5, lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 600, color: "#134e4a" }}>{c.title}</div>
                  <div style={{ color: teal, fontSize: 8.5 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// =====================================================================
// 11. CANVA PINK BLUE — Pink (#e11d48) + light blue (#dbeafe), large
//     circular photo at top center overlapping header, modern Canva-style.
//     Pill-shaped section headers, playful rounded design.
// =====================================================================
export function CanvaPinkBlueTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const pink = "#e11d48";
  const blueLight = "#dbeafe";
  const blueAccent = "#3b82f6";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif", background: blueLight }}>
      {/* Top header band with centered photo overlapping */}
      <div style={{ background: `linear-gradient(120deg, ${pink}, #fb7185)`, padding: "16px 28px 38px", textAlign: "center", color: "white", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: blueLight, opacity: 0.4 }} />
            <Avatar data={data} size={88} shape="circle" ring="white" ringWidth={4} />
          </div>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0, letterSpacing: -0.3 }}>{data.name}</h1>
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.9)", margin: "4px 0 0", fontWeight: 500 }}>{data.title}</p>
      </div>
      <div style={{ display: "flex" }}>
        {/* Left pink-tinted sidebar */}
        <aside style={{ width: 232, background: "#fff1f3", padding: "20px 16px", minHeight: 900, borderRight: `2px solid ${pink}30` }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "inline-block", background: `${pink}15`, color: pink, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, marginBottom: 8, letterSpacing: 1 }}>CONTACT</div>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "#4a1a25", marginBottom: 4, lineHeight: 1.4, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "inline-block", background: `${pink}15`, color: pink, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, marginBottom: 8, letterSpacing: 1 }}>SKILLS</div>
              {data.skills.map((s, i) => (
                <div key={i} style={{ fontSize: 10, color: "#4a1a25", marginBottom: 4, paddingLeft: 12, position: "relative", lineHeight: 1.4 }}>
                  <span style={{ position: "absolute", left: 0, color: blueAccent, fontSize: 8 }}>●</span>{s}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "inline-block", background: `${pink}15`, color: pink, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, marginBottom: 8, letterSpacing: 1 }}>LANGUAGES</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "#4a1a25", marginBottom: 3 }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div>
              <div style={{ display: "inline-block", background: `${pink}15`, color: pink, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, marginBottom: 8, letterSpacing: 1 }}>INTERESTS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 9, background: `${blueAccent}20`, color: blueAccent, padding: "2px 8px", borderRadius: 10 }}>{it}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "20px 24px", minWidth: 0, background: "white" }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "inline-block", background: `${pink}15`, color: pink, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, marginBottom: 10, letterSpacing: 1 }}>PROFILE</div>
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "inline-block", background: `${pink}15`, color: pink, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, marginBottom: 10, letterSpacing: 1 }}>WORK EXPERIENCE</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1e1b2e" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: blueAccent, fontWeight: 700 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: pink, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={pink} char="●" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "inline-block", background: `${pink}15`, color: pink, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, marginBottom: 10, letterSpacing: 1 }}>PROJECTS</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e1b2e" }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: blueAccent, marginTop: 2, fontWeight: 700 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <div style={{ display: "inline-block", background: `${pink}15`, color: pink, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 12, marginBottom: 10, letterSpacing: 1 }}>EDUCATION</div>
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e1b2e" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: blueAccent, fontWeight: 700 }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: pink, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={pink} headerStyle="pill" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 12. COLLEGE CV TEAL — Single-column + teal (#0d9488) header band,
//     academic-focused. Underlined section headers, skill chips.
// =====================================================================
export function CollegeCVTealTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const teal = "#0d9488";
  const dark = "#134e4a";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top teal header band */}
      <div style={{ background: `linear-gradient(120deg, ${teal}, ${dark})`, padding: "24px 32px 18px", textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: 0, letterSpacing: -0.3 }}>{data.name}</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", margin: "4px 0 8px", fontWeight: 500 }}>{data.title}</p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14, fontSize: 9.5, color: "rgba(255,255,255,0.8)" }}>
          {[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "#5eead4", fontSize: 7 }}>●</span>{c}
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: "22px 32px" }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 18 }}>
            <SectionHeader title="Profile" color={teal} style="underline" />
            <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
          </div>
        )}
        {visible(sections, "skills") && data.skills.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <SectionHeader title="Skills" color={teal} style="underline" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ fontSize: 10, background: `${teal}15`, color: teal, padding: "4px 10px", borderRadius: 12, fontWeight: 600, border: `1px solid ${teal}30` }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <SectionHeader title="Experience" color={teal} style="underline" />
            {data.experience.map((e) => (
              <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#134e4a" }}>{e.role}</span>
                  <span style={{ fontSize: 9.5, color: teal, fontWeight: 700 }}>{range(e.start, e.end)}</span>
                </div>
                <div style={{ fontSize: 10.5, color: teal, fontWeight: 600, marginBottom: 4, fontStyle: "italic" }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                <Bullets bullets={e.bullets} color={teal} char="▸" />
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 18 }}>
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <SectionHeader title="Education" color={teal} style="underline" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#134e4a" }}>{ed.degree}</div>
                  <div style={{ fontSize: 10, color: teal, fontWeight: 600 }}>{ed.school}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{range(ed.start, ed.end)}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div>
              <SectionHeader title="Projects" color={teal} style="underline" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#134e4a" }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: teal, marginTop: 2, fontWeight: 700 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div>
              <SectionHeader title="Languages" color={teal} style="underline" />
              <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.6 }}>{data.languages.join(" · ")}</div>
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div>
              <SectionHeader title="Certifications" color={teal} style="underline" />
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 4, fontSize: 10, color: "#475569", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <span style={{ fontWeight: 700, color: "#134e4a" }}>{c.title}</span>
                  <span style={{ color: teal }}> — {c.subtitle}{c.date ? ` · ${c.date}` : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {visible(sections, "awards") && data.awards.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <SectionHeader title="Honors & Awards" color={teal} style="underline" />
            {data.awards.map((aw) => (
              <div key={aw.id} style={{ marginBottom: 4, fontSize: 10, color: "#475569", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <span style={{ fontWeight: 700, color: "#134e4a" }}>{aw.title}</span>{aw.date ? ` (${aw.date})` : ""}
                {aw.subtitle ? ` — ${aw.subtitle}` : ""}
              </div>
            ))}
          </div>
        )}
        {data.customSections.filter((cs) => cs.items.length > 0).map((cs) => (
          <div key={cs.id} style={{ marginTop: 18 }}>
            <SectionHeader title={cs.title} color={teal} style="underline" />
            {cs.items.map((item) => (
              <div key={item.id} style={{ marginBottom: 4, fontSize: 10, color: "#475569", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <span style={{ fontWeight: 700, color: "#134e4a" }}>{item.title}</span>{item.date ? ` (${item.date})` : ""}
                {item.subtitle ? ` — ${item.subtitle}` : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// 13. COMBINED BLUE — Blue (#1e40af) + white, circular photo in
//     header (overlapping sidebar edge), two-column. Bar headers.
// =====================================================================
export function CombinedBlueTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const blue = "#1e40af";
  const blueDark = "#1e3a8a";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: "flex" }}>
        {/* Left blue sidebar */}
        <aside style={{ width: 240, background: `linear-gradient(180deg, ${blue}, ${blueDark})`, color: "white", padding: "24px 18px", minHeight: 1040, position: "relative" }}>
          {/* Name at top of sidebar */}
          <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.25)" }}>
            <h1 style={{ fontSize: 19, fontWeight: 800, color: "white", margin: 0, lineHeight: 1.15, letterSpacing: -0.2 }}>{data.name}</h1>
            <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.85)", margin: "5px 0 0", fontWeight: 500 }}>{data.title}</p>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#bfdbfe", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Contact</div>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.9)", marginBottom: 4, lineHeight: 1.4, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#bfdbfe", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Skills</div>
              {data.skills.map((s, i) => {
                const lvl = data.skillLevels[s] ?? 70;
                return (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>{s}</div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${lvl}%`, height: "100%", background: "linear-gradient(90deg, #93c5fd, white)", borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#bfdbfe", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Languages</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>{l}</div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#bfdbfe", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Interests</div>
              {data.interests.map((it, i) => (
                <div key={i} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>{it}</div>
              ))}
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "24px 28px", minWidth: 0, position: "relative" }}>
          {/* Decorative circular photo at top-right of main, overlapping sidebar edge */}
          <div style={{ position: "absolute", top: 18, right: 24 }}>
            <Avatar data={data} size={88} shape="circle" ring={blue} ringWidth={3} />
          </div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18, maxWidth: 380 }}>
              <SectionHeader title="Profile" color={blue} style="bar" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Experience" color={blue} style="bar" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1e3a8a" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: blue, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color="#ef4444" char="◆" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={blue} style="bar" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e3a8a" }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: blue, marginTop: 2, fontWeight: 700 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Education" color={blue} style="bar" />
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e3a8a" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: blue, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Certifications" color={blue} style="bar" />
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 4, fontSize: 10, color: "#475569", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <span style={{ fontWeight: 700, color: "#1e3a8a" }}>{c.title}</span>
                  <span> — {c.subtitle}{c.date ? ` · ${c.date}` : ""}</span>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={blue} headerStyle="bar" />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 14. NAVY YELLOW PRO — Dark navy (#1e3a5f) + yellow (#eab308) accents,
//     circular photo with yellow ring background, modern bar headers.
// =====================================================================
export function NavyYellowProTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const navy = "#1e3a5f";
  const navyDark = "#15293f";
  const yellow = "#eab308";
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: "flex" }}>
        {/* Left navy sidebar */}
        <aside style={{ width: 240, background: `linear-gradient(180deg, ${navy}, ${navyDark})`, color: "white", padding: "24px 18px", minHeight: 1040 }}>
          <div style={{ textAlign: "center", marginBottom: 18, position: "relative", display: "inline-block", width: "100%" }}>
            <div style={{ display: "inline-block", position: "relative" }}>
              <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: `${yellow}30`, filter: "blur(6px)" }} />
              <Avatar data={data} size={92} shape="circle" ring={yellow} ringWidth={3} />
            </div>
          </div>
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: yellow, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Education</div>
              {data.education.map((ed) => (
                <div key={ed.id} style={{ marginBottom: 8, fontSize: 9.5, lineHeight: 1.4, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ color: "white", fontWeight: 600 }}>{ed.degree}</div>
                  <div style={{ color: yellow, fontSize: 9 }}>{ed.school}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 8.5 }}>{range(ed.start, ed.end)}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: yellow, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Skills</div>
              {data.skills.map((s, i) => (
                <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", marginBottom: 4, paddingLeft: 12, position: "relative", lineHeight: 1.4 }}>
                  <span style={{ position: "absolute", left: 0, color: yellow, fontSize: 8 }}>◆</span>{s}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: yellow, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Languages</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", marginBottom: 2 }}>{l}</div>
              ))}
            </div>
          )}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: yellow, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Contact</div>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", marginBottom: 3, lineHeight: 1.4, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "24px 28px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 4, height: 26, background: yellow, borderRadius: 2 }} />
            <h1 style={{ fontSize: 26, fontWeight: 800, color: navy, margin: 0, letterSpacing: -0.3 }}>{data.name}</h1>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0 14px", fontWeight: 500 }}>{data.title}</p>
          <div style={{ height: 1, background: `${navy}20`, margin: "14px 0 18px" }} />
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Profile" color={yellow} style="bar" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Experience" color={yellow} style="bar" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: navy }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: yellow, fontWeight: 700 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: navy, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={yellow} char="◆" />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Projects" color={yellow} style="bar" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: navy }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8.5, color: yellow, marginTop: 2, fontWeight: 700 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Certifications" color={yellow} style="bar" />
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 4, fontSize: 10, color: "#475569", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <span style={{ fontWeight: 700, color: navy }}>{c.title}</span>
                  <span> — {c.subtitle}{c.date ? ` · ${c.date}` : ""}</span>
                </div>
              ))}
            </div>
          )}
          <CustomSections data={data} color={yellow} headerStyle="bar" />
        </main>
      </div>
    </div>
  );
}

