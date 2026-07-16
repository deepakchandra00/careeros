"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";

const PAPER = "resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl";
const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

function Avatar({ data, size, ring, ringWidth = 3 }: { data: ResumeData; size: number; ring?: string; ringWidth?: number }) {
  const borderStyle = ring ? `${ring} ${ringWidth}px solid` : undefined;
  const initials = data.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  if (data.photo) return <img src={data.photo} alt={data.name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: borderStyle }} />;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "#f1f5f9", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, border: borderStyle }}>{initials}</div>;
}

function range(start: string, end: string) {
  const s = (start ?? "").trim(); const e = (end ?? "").trim();
  if (s && e) return `${s} — ${e}`; if (s) return `${s} — Present`; return e || "";
}

const ICONS: Record<string, string> = {
  experience: "💼", projects: "🎯", education: "🎓", skills: "⚡", certifications: "🏆",
  languages: "🌐", awards: "⭐", interests: "♥", references: "👤", custom: "▸",
};

function SectionHeader({ title, icon, color, style }: { title: string; icon?: string; color: string; style: "line" | "bar" | "dot" | "plain" }) {
  if (style === "bar") return <div style={{ background: color, color: "white", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 4, marginBottom: 10, display: "inline-block", letterSpacing: 0.5 }}>{icon} {title.toUpperCase()}</div>;
  if (style === "line") return <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><div style={{ width: 3, height: 14, background: color, borderRadius: 2 }} /><span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5 }}>{icon} {title.toUpperCase()}</span></div>;
  if (style === "dot") return <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} /><span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", letterSpacing: 0.5 }}>{title.toUpperCase()}</span></div>;
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 10, letterSpacing: 0.5 }}>{title.toUpperCase()}</div>;
}

function Bullets({ bullets, color, char = "•" }: { bullets: string[]; color: string; char?: string }) {
  return <>{bullets.filter(b => b?.trim()).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.6, paddingLeft: 12, position: "relative", marginBottom: 2 }}><span style={{ position: "absolute", left: 0, color }}>{char}</span>{b}</div>)}</>;
}

// =====================================================================
// 1. STANFORD — Clean two-column, gradient accent, icon headers, skill bars
// =====================================================================
export function StanfordTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#0f766e"; // teal-700
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Gradient header */}
      <div style={{ background: `linear-gradient(135deg, ${a}, #14b8a6)`, padding: "28px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar data={data} size={64} ring="white" ringWidth={3} />
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: 0, letterSpacing: -0.5 }}>{data.name}</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "4px 0 0", fontWeight: 500 }}>{data.title}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
            {[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <span key={i}>{c}</span>)}
          </div>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        {/* Left sidebar */}
        <aside style={{ width: 240, padding: "20px 16px", background: "#f8fafc", minHeight: 900 }}>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Skills" icon={ICONS.skills} color={a} style="line" />
              {data.skills.map((s, i) => {
                const lvl = data.skillLevels[s] ?? 75;
                return <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "#334155", marginBottom: 3 }}>{s}</div>
                  <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2 }}><div style={{ width: `${lvl}%`, height: "100%", background: `linear-gradient(90deg, ${a}, #14b8a6)`, borderRadius: 2 }} /></div>
                </div>;
              })}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Languages" icon={ICONS.languages} color={a} style="line" />
              {data.languages.map((l, i) => <div key={i} style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}>{l}</div>)}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Certifications" icon={ICONS.certifications} color={a} style="line" />
              {data.certifications.map((c, i) => <div key={i} style={{ marginBottom: 6 }}><div style={{ fontSize: 9, fontWeight: 600, color: "#334155" }}>{c.title}</div><div style={{ fontSize: 8, color: "#94a3b8" }}>{c.subtitle}</div></div>)}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div>
              <SectionHeader title="Interests" icon={ICONS.interests} color={a} style="line" />
              <div style={{ fontSize: 10, color: "#475569" }}>{data.interests.join(" · ")}</div>
            </div>
          )}
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, padding: "20px 24px" }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Profile" icon={ICONS.experience} color={a} style="line" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Experience" icon={ICONS.experience} color={a} style="line" />
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 14, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: a, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  <Bullets bullets={e.bullets} color={a} />
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Projects" icon={ICONS.projects} color={a} style="line" />
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{p.name}{p.link ? <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400 }}> — {p.link}</span> : null}</div>
                  {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8, color: "#94a3b8", marginTop: 2 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <SectionHeader title="Education" icon={ICONS.education} color={a} style="line" />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: a, fontWeight: 600 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 20 }}>
              <SectionHeader title={cs.title} color={a} style="line" />
              {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span>{item.date ? ` (${item.date})` : ""}</div>)}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 2. HARVARD — Single-column executive, serif, gold accents, border frame
// =====================================================================
export function HarvardTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#b8860b"; // dark goldenrod
  return (
    <div className={PAPER} style={{ fontFamily: "'Georgia', 'Times New Roman', serif", border: `2px solid ${a}30`, margin: 16 }}>
      {/* Centered header */}
      <div style={{ textAlign: "center", padding: "32px 32px 20px", borderBottom: `2px solid ${a}` }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: 1 }}>{data.name}</h1>
        <p style={{ fontSize: 13, color: a, fontStyle: "italic", margin: "6px 0 8px" }}>{data.title}</p>
        <div style={{ fontSize: 10, color: "#666" }}>
          {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join("  |  ")}
        </div>
      </div>
      <div style={{ padding: "20px 40px" }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: a, textAlign: "center", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>— Summary —</h2>
            <p style={{ fontSize: 11, lineHeight: 1.8, color: "#333", textAlign: "center" }}>{data.summary}</p>
          </div>
        )}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: a, textAlign: "center", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>— Experience —</h2>
            {data.experience.map(e => (
              <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{e.role}, {e.company}</span>
                  <span style={{ fontSize: 10, color: "#888", fontStyle: "italic" }}>{range(e.start, e.end)}</span>
                </div>
                {e.location && <div style={{ fontSize: 10, color: "#888", fontStyle: "italic", marginBottom: 4 }}>{e.location}</div>}
                {e.bullets.filter(b => b?.trim()).map((b, i) => <div key={i} style={{ fontSize: 10.5, lineHeight: 1.7, color: "#444", paddingLeft: 14, position: "relative", marginBottom: 2 }}><span style={{ position: "absolute", left: 0, color: a }}>◆</span>{b}</div>)}
              </div>
            ))}
          </div>
        )}
        {visible(sections, "education") && data.education.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: a, textAlign: "center", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>— Education —</h2>
            {data.education.map(ed => (
              <div key={ed.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, breakInside: "avoid" }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{ed.degree}, {ed.school}</span>
                <span style={{ fontSize: 10, color: "#888", fontStyle: "italic" }}>{range(ed.start, ed.end)}</span>
              </div>
            ))}
          </div>
        )}
        {visible(sections, "skills") && data.skills.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: a, textAlign: "center", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>— Skills —</h2>
            <p style={{ fontSize: 10.5, lineHeight: 1.8, color: "#444", textAlign: "center" }}>{data.skills.join("  ·  ")}</p>
          </div>
        )}
        {visible(sections, "projects") && data.projects.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: a, textAlign: "center", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>— Projects —</h2>
            {data.projects.map(p => <div key={p.id} style={{ marginBottom: 6, fontSize: 10.5, color: "#444", breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{p.name}</span> — {p.description}</div>)}
          </div>
        )}
        {visible(sections, "awards") && data.awards.length > 0 && (
          <div>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: a, textAlign: "center", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>— Awards —</h2>
            {data.awards.map(aw => <div key={aw.id} style={{ fontSize: 10.5, color: "#444", marginBottom: 3, breakInside: "avoid" }}><span style={{ fontWeight: 700 }}>{aw.title}</span>{aw.date ? ` (${aw.date})` : ""}</div>)}
          </div>
        )}
        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
          <div key={cs.id} style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: a, textAlign: "center", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>— {cs.title} —</h2>
            {cs.items.map(item => <div key={item.id} style={{ fontSize: 10.5, color: "#444", marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// 3. SILICON VALLEY — Dark sidebar, neon accent, monospace headers
// =====================================================================
export function SiliconValleyTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#10b981"; // emerald
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif", display: "flex" }}>
      {/* Dark sidebar */}
      <aside style={{ width: 260, background: "#0f172a", color: "#e2e8f0", padding: "28px 20px", minHeight: 1123 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Avatar data={data} size={80} ring={a} ringWidth={2} />
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0, textAlign: "center" }}>{data.name}</h1>
        <p style={{ fontSize: 11, color: a, textAlign: "center", margin: "4px 0 20px", fontFamily: "monospace" }}>{data.title}</p>
        
        {visible(sections, "skills") && data.skills.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 9, fontWeight: 700, color: a, fontFamily: "monospace", marginBottom: 8, letterSpacing: 1 }}>{ "// SKILLS" }</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {data.skills.map((s, i) => <span key={i} style={{ fontSize: 9, background: "#1e293b", color: "#94a3b8", padding: "3px 8px", borderRadius: 3, fontFamily: "monospace", border: `1px solid ${a}30` }}>{s}</span>)}
            </div>
          </div>
        )}
        {visible(sections, "languages") && data.languages.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 9, fontWeight: 700, color: a, fontFamily: "monospace", marginBottom: 6, letterSpacing: 1 }}>{ "// LANGUAGES" }</h3>
            {data.languages.map((l, i) => <div key={i} style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", marginBottom: 2 }}>{l}</div>)}
          </div>
        )}
        {visible(sections, "certifications") && data.certifications.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 9, fontWeight: 700, color: a, fontFamily: "monospace", marginBottom: 6, letterSpacing: 1 }}>{ "// CERTS" }</h3>
            {data.certifications.map((c, i) => <div key={i} style={{ marginBottom: 4 }}><div style={{ fontSize: 9, color: "#cbd5e1", fontFamily: "monospace" }}>{c.title}</div></div>)}
          </div>
        )}
        <div style={{ marginTop: 20, fontSize: 8, color: "#475569", fontFamily: "monospace" }}>
          {[data.email, data.phone, data.location, data.linkedin, data.github].filter(Boolean).map((c, i) => <div key={i} style={{ marginBottom: 3 }}>{c}</div>)}
        </div>
      </aside>
      {/* Main */}
      <main style={{ flex: 1, padding: "28px 24px" }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 20, borderLeft: `3px solid ${a}`, paddingLeft: 12 }}>
            <p style={{ fontSize: 11, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p>
          </div>
        )}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 10, fontWeight: 700, color: a, fontFamily: "monospace", marginBottom: 10, letterSpacing: 1 }}>EXPERIENCE</h3>
            {data.experience.map(e => (
              <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{e.role} <span style={{ color: a, fontWeight: 400 }}>@ {e.company}</span></span>
                  <span style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace" }}>{range(e.start, e.end)}</span>
                </div>
                <Bullets bullets={e.bullets} color={a} char="▸" />
              </div>
            ))}
          </div>
        )}
        {visible(sections, "projects") && data.projects.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 10, fontWeight: 700, color: a, fontFamily: "monospace", marginBottom: 10, letterSpacing: 1 }}>PROJECTS</h3>
            {data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{p.name} {p.link && <span style={{ fontSize: 9, color: "#94a3b8" }}>→ {p.link}</span>}</div>
                {p.description && <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
              </div>
            ))}
          </div>
        )}
        {visible(sections, "education") && data.education.length > 0 && (
          <div>
            <h3 style={{ fontSize: 10, fontWeight: 700, color: a, fontFamily: "monospace", marginBottom: 10, letterSpacing: 1 }}>EDUCATION</h3>
            {data.education.map(ed => (
              <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span>
                  <span style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace" }}>{range(ed.start, ed.end)}</span>
                </div>
                <div style={{ fontSize: 10, color: a }}>{ed.school}</div>
              </div>
            ))}
          </div>
        )}
        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
          <div key={cs.id} style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 10, fontWeight: 700, color: a, fontFamily: "monospace", marginBottom: 10, letterSpacing: 1 }}>{cs.title.toUpperCase()}</h3>
            {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
          </div>
        ))}
      </main>
    </div>
  );
}

// =====================================================================
// 4. MANHATTAN — Minimal corporate, thin accent line, generous whitespace
// =====================================================================
export function ManhattanTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#0f172a"; // slate-900
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif", padding: "48px 56px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, color: a, margin: 0, letterSpacing: -1 }}>{data.name}</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
          <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{data.title}</p>
          <div style={{ fontSize: 10, color: "#94a3b8" }}>{[data.email, data.phone, data.location].filter(Boolean).join("  ·  ")}</div>
        </div>
        <div style={{ height: 1, background: a, marginTop: 16 }} />
      </div>
      
      {visible(sections, "summary") && data.summary && (
        <p style={{ fontSize: 11, lineHeight: 1.8, color: "#475569", marginBottom: 28, maxWidth: 600 }}>{data.summary}</p>
      )}
      {visible(sections, "experience") && data.experience.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          {data.experience.map(e => (
            <div key={e.id} style={{ display: "flex", gap: 20, marginBottom: 18, breakInside: "avoid" }}>
              <div style={{ width: 80, flexShrink: 0, textAlign: "right" }}>
                <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>{range(e.start, e.end)}</span>
              </div>
              <div style={{ flex: 1, borderLeft: "1px solid #e2e8f0", paddingLeft: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: a, marginBottom: 2 }}>{e.role}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>{e.company}{e.location ? `, ${e.location}` : ""}</div>
                <Bullets bullets={e.bullets} color="#cbd5e1" />
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 32 }}>
        {visible(sections, "education") && data.education.length > 0 && (
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Education</h3>
            {data.education.map(ed => (
              <div key={ed.id} style={{ marginBottom: 6, fontSize: 10, color: "#475569", breakInside: "avoid" }}>
                <span style={{ fontWeight: 700, color: a }}>{ed.degree}</span><br />
                {ed.school} · {range(ed.start, ed.end)}
              </div>
            ))}
          </div>
        )}
        {visible(sections, "skills") && data.skills.length > 0 && (
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Skills</h3>
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.8 }}>{data.skills.join(" · ")}</div>
          </div>
        )}
      </div>
      {visible(sections, "projects") && data.projects.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Projects</h3>
          {data.projects.map(p => <div key={p.id} style={{ fontSize: 10, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: a }}>{p.name}</span> — {p.description}</div>)}
        </div>
      )}
      {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
        <div key={cs.id} style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{cs.title}</h3>
          {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 5. PRAGUE — Two-column colored panel, timeline experience
// =====================================================================
export function PragueTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#7c3aed"; // violet-600
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif", display: "flex" }}>
      {/* Colored left panel */}
      <aside style={{ width: 220, background: a, color: "white", padding: "24px 16px", minHeight: 1123 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Avatar data={data} size={72} ring="white" ringWidth={3} />
        </div>
        <h1 style={{ fontSize: 16, fontWeight: 800, textAlign: "center", margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 10, textAlign: "center", color: "rgba(255,255,255,0.7)", margin: "4px 0 16px" }}>{data.title}</p>
        
        {visible(sections, "skills") && data.skills.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: 1.5 }}>SKILLS</h3>
            {data.skills.map((s, i) => <div key={i} style={{ fontSize: 9, marginBottom: 3, color: "rgba(255,255,255,0.9)" }}>{s}</div>)}
          </div>
        )}
        {visible(sections, "languages") && data.languages.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: 1.5 }}>LANGUAGES</h3>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.9)" }}>{data.languages.join(", ")}</div>
          </div>
        )}
        {visible(sections, "certifications") && data.certifications.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: 1.5 }}>CERTIFICATIONS</h3>
            {data.certifications.map((c, i) => <div key={i} style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", marginBottom: 4 }}>{c.title}</div>)}
          </div>
        )}
        <div style={{ marginTop: 20, fontSize: 8, color: "rgba(255,255,255,0.5)" }}>
          {[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <div key={i} style={{ marginBottom: 2 }}>{c}</div>)}
        </div>
      </aside>
      {/* Main with timeline */}
      <main style={{ flex: 1, padding: "24px 20px" }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 20, fontSize: 10.5, lineHeight: 1.7, color: "#475569" }}>{data.summary}</div>
        )}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: a, marginBottom: 12 }}>Experience</h3>
            <div style={{ position: "relative", paddingLeft: 16 }}>
              <div style={{ position: "absolute", left: 3, top: 4, bottom: 4, width: 2, background: `${a}30` }} />
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 14, position: "relative", breakInside: "avoid" }}>
                  <div style={{ position: "absolute", left: -16, top: 2, width: 8, height: 8, borderRadius: "50%", background: a, border: "2px solid white" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{e.role} · {e.company}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>{range(e.start, e.end)}</span>
                  </div>
                  <Bullets bullets={e.bullets} color={a} />
                </div>
              ))}
            </div>
          </div>
        )}
        {visible(sections, "education") && data.education.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: a, marginBottom: 8 }}>Education</h3>
            {data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span> — {ed.school} ({range(ed.start, ed.end)})</div>)}
          </div>
        )}
        {visible(sections, "projects") && data.projects.length > 0 && (
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: a, marginBottom: 8 }}>Projects</h3>
            {data.projects.map(p => <div key={p.id} style={{ fontSize: 10, color: "#475569", marginBottom: 6, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{p.name}</span> — {p.description}</div>)}
          </div>
        )}
        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
          <div key={cs.id} style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: a, marginBottom: 8 }}>{cs.title}</h3>
            {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
          </div>
        ))}
      </main>
    </div>
  );
}

// =====================================================================
// 6. TOKYO — Compact, grid-based, accent color bars, no sidebar
// =====================================================================
export function TokyoTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#e11d48"; // rose-600
  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 28px" }}>
      {/* Header with accent bar */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: `3px solid ${a}` }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: -0.5 }}>{data.name}</h1>
          <p style={{ fontSize: 12, color: a, fontWeight: 600, margin: "2px 0 0" }}>{data.title}</p>
        </div>
        <div style={{ fontSize: 9, color: "#64748b", textAlign: "right", lineHeight: 1.6 }}>
          {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).map((c, i) => <div key={i}>{c}</div>)}
        </div>
      </div>
      
      {/* Two-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left column */}
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 6, borderLeft: `3px solid ${a}`, paddingLeft: 6 }}>PROFILE</div>
              <p style={{ fontSize: 9.5, lineHeight: 1.6, color: "#475569" }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, borderLeft: `3px solid ${a}`, paddingLeft: 6 }}>EXPERIENCE</div>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 10, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#1e293b" }}>{e.role}</span>
                    <span style={{ fontSize: 8, color: "#94a3b8" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 9, color: a, marginBottom: 3 }}>{e.company}</div>
                  {e.bullets.filter(b => b?.trim()).slice(0, 3).map((b, i) => <div key={i} style={{ fontSize: 9, lineHeight: 1.5, color: "#475569", paddingLeft: 8, position: "relative", marginBottom: 1 }}><span style={{ position: "absolute", left: 0, color: a }}>—</span>{b}</div>)}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Right column */}
        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, borderLeft: `3px solid ${a}`, paddingLeft: 6 }}>SKILLS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.map((s, i) => <span key={i} style={{ fontSize: 8.5, background: `${a}10`, color: a, padding: "3px 8px", borderRadius: 3, fontWeight: 600 }}>{s}</span>)}
              </div>
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, borderLeft: `3px solid ${a}`, paddingLeft: 6 }}>EDUCATION</div>
              {data.education.map(ed => <div key={ed.id} style={{ fontSize: 9, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span><br />{ed.school} · {range(ed.start, ed.end)}</div>)}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, borderLeft: `3px solid ${a}`, paddingLeft: 6 }}>PROJECTS</div>
              {data.projects.map(p => <div key={p.id} style={{ fontSize: 9, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{p.name}</span> — {p.description}</div>)}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, borderLeft: `3px solid ${a}`, paddingLeft: 6 }}>LANGUAGES</div>
              <div style={{ fontSize: 9, color: "#475569" }}>{data.languages.join(" · ")}</div>
            </div>
          )}
        </div>
      </div>
      {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
        <div key={cs.id} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 6, borderLeft: `3px solid ${a}`, paddingLeft: 6 }}>{cs.title.toUpperCase()}</div>
          {cs.items.map(item => <div key={item.id} style={{ fontSize: 9, color: "#475569", marginBottom: 2 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 7. OXFORD — Academic, navy sidebar, serif, education-first
// =====================================================================
export function OxfordTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#1e3a5f";
  return (
    <div className={PAPER} style={{ fontFamily: "Georgia, serif", display: "flex" }}>
      <aside style={{ width: 200, background: a, color: "white", padding: "24px 16px", minHeight: 1123 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}><Avatar data={data} size={64} ring="white" /></div>
        <h1 style={{ fontSize: 16, fontWeight: 700, textAlign: "center", margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 10, textAlign: "center", color: "rgba(255,255,255,0.7)", margin: "4px 0 16px" }}>{data.title}</p>
        {visible(sections, "skills") && data.skills.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 4, letterSpacing: 1 }}>SKILLS</h3>{data.skills.map((s, i) => <div key={i} style={{ fontSize: 9, marginBottom: 2, color: "rgba(255,255,255,0.85)" }}>{s}</div>)}</div>)}
        {visible(sections, "languages") && data.languages.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 4, letterSpacing: 1 }}>LANGUAGES</h3><div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)" }}>{data.languages.join(", ")}</div></div>)}
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 16 }}>{[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <div key={i} style={{ marginBottom: 2 }}>{c}</div>)}</div>
      </aside>
      <main style={{ flex: 1, padding: "24px 20px" }}>
        {visible(sections, "summary") && data.summary && <p style={{ fontSize: 10.5, lineHeight: 1.8, color: "#333", marginBottom: 16, fontStyle: "italic" }}>{data.summary}</p>}
        {visible(sections, "education") && data.education.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 12, fontWeight: 700, color: a, borderBottom: `2px solid ${a}`, marginBottom: 8, paddingBottom: 2 }}>Education</h3>{data.education.map(ed => <div key={ed.id} style={{ marginBottom: 6, fontSize: 10, breakInside: "avoid" }}><span style={{ fontWeight: 700 }}>{ed.degree}</span> — {ed.school} ({range(ed.start, ed.end)})</div>)}</div>)}
        {visible(sections, "experience") && data.experience.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 12, fontWeight: 700, color: a, borderBottom: `2px solid ${a}`, marginBottom: 8, paddingBottom: 2 }}>Experience</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 10, breakInside: "avoid" }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, fontWeight: 700 }}>{e.role}, {e.company}</span><span style={{ fontSize: 9, color: "#666", fontStyle: "italic" }}>{range(e.start, e.end)}</span></div><Bullets bullets={e.bullets} color={a} /></div>))}</div>)}
        {visible(sections, "projects") && data.projects.length > 0 && (<div><h3 style={{ fontSize: 12, fontWeight: 700, color: a, borderBottom: `2px solid ${a}`, marginBottom: 8, paddingBottom: 2 }}>Projects</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 10, marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700 }}>{p.name}</span> — {p.description}</div>)}</div>)}
        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (<div key={cs.id} style={{ marginTop: 16 }}><h3 style={{ fontSize: 12, fontWeight: 700, color: a, borderBottom: `2px solid ${a}`, marginBottom: 8, paddingBottom: 2 }}>{cs.title}</h3>{cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}</div>))}
      </main>
    </div>
  );
}

// =====================================================================
// 8. BERLIN — Bold amber header, two-col grid, geometric
// =====================================================================
export function BerlinTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#f59e0b";
  return (
    <div className={PAPER} style={{ fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: a, padding: "24px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 50, height: 50, background: "#1e293b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: a, fontSize: 18, fontWeight: 900 }}>{data.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span></div>
        <div><h1 style={{ fontSize: 26, fontWeight: 900, color: "#1e293b", margin: 0 }}>{data.name}</h1><p style={{ fontSize: 12, color: "#1e293bcc", fontWeight: 600, margin: 0 }}>{data.title}</p></div>
        <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 9, color: "#1e293bcc" }}>{[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <div key={i}>{c}</div>)}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ padding: "16px 20px", borderRight: "1px solid #e2e8f0" }}>
          {visible(sections, "summary") && data.summary && <div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 6 }}>PROFILE</h3><p style={{ fontSize: 10, lineHeight: 1.6, color: "#475569" }}>{data.summary}</p></div>}
          {visible(sections, "experience") && data.experience.length > 0 && (<div><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 8 }}>EXPERIENCE</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 10, breakInside: "avoid" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{e.role}</div><div style={{ fontSize: 9, color: a, fontWeight: 600, marginBottom: 2 }}>{e.company} · {range(e.start, e.end)}</div>{e.bullets.filter(b => b?.trim()).slice(0, 2).map((b, i) => <div key={i} style={{ fontSize: 9.5, lineHeight: 1.5, color: "#475569", paddingLeft: 8, position: "relative" }}><span style={{ position: "absolute", left: 0, color: a }}>{"▸"}</span>{b}</div>)}</div>))}</div>)}
        </div>
        <div style={{ padding: "16px 20px" }}>
          {visible(sections, "skills") && data.skills.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 8 }}>SKILLS</h3><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{data.skills.map((s, i) => <span key={i} style={{ fontSize: 9, background: `${a}15`, color: "#92400e", padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>{s}</span>)}</div></div>)}
          {visible(sections, "education") && data.education.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 8 }}>EDUCATION</h3>{data.education.map(ed => <div key={ed.id} style={{ fontSize: 9.5, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span><br />{ed.school} · {range(ed.start, ed.end)}</div>)}</div>)}
          {visible(sections, "projects") && data.projects.length > 0 && (<div><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 8 }}>PROJECTS</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 9.5, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{p.name}</span> — {p.description}</div>)}</div>)}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 9. MIAMI — Creative, coral gradient sidebar, playful
// =====================================================================
export function MiamiTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#fb7185";
  return (
    <div className={PAPER} style={{ fontFamily: "system-ui, sans-serif", display: "flex" }}>
      <aside style={{ width: 240, background: `linear-gradient(180deg, ${a}, #f43f5e)`, color: "white", padding: "24px 16px", minHeight: 1123 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}><Avatar data={data} size={72} ring="white" ringWidth={3} /></div>
        <h1 style={{ fontSize: 18, fontWeight: 800, textAlign: "center", margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 10, textAlign: "center", color: "rgba(255,255,255,0.8)", margin: "4px 0 20px" }}>{data.title}</p>
        {visible(sections, "skills") && data.skills.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: 1 }}>SKILLS</h3>{data.skills.map((s, i) => <span key={i} style={{ fontSize: 10, display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 10, marginRight: 4, marginBottom: 4 }}>{s}</span>)}</div>)}
        {visible(sections, "languages") && data.languages.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 4, letterSpacing: 1 }}>LANGUAGES</h3><div style={{ fontSize: 10 }}>{data.languages.join(" · ")}</div></div>)}
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 20 }}>{[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <div key={i} style={{ marginBottom: 3 }}>{c}</div>)}</div>
      </aside>
      <main style={{ flex: 1, padding: "24px 20px" }}>
        {visible(sections, "summary") && data.summary && <div style={{ marginBottom: 16, borderLeft: `4px solid ${a}`, paddingLeft: 12 }}><p style={{ fontSize: 11, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p></div>}
        {visible(sections, "experience") && data.experience.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 14, fontWeight: 800, color: a, marginBottom: 10 }}>Experience</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" }}><div style={{ fontSize: 12, fontWeight: 800, color: "#1e293b" }}>{e.role}</div><div style={{ fontSize: 10, color: a, fontWeight: 600, marginBottom: 4 }}>{e.company} · {range(e.start, e.end)}</div><Bullets bullets={e.bullets} color={a} char="◆" /></div>))}</div>)}
        {visible(sections, "projects") && data.projects.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 14, fontWeight: 800, color: a, marginBottom: 10 }}>Projects</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 10, marginBottom: 6, breakInside: "avoid" }}><span style={{ fontWeight: 800, color: "#1e293b" }}>{p.name}</span> — {p.description}</div>)}</div>)}
        {visible(sections, "education") && data.education.length > 0 && (<div><h3 style={{ fontSize: 14, fontWeight: 800, color: a, marginBottom: 10 }}>Education</h3>{data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 800, color: "#1e293b" }}>{ed.degree}</span> — {ed.school}</div>)}</div>)}
        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (<div key={cs.id} style={{ marginTop: 16 }}><h3 style={{ fontSize: 14, fontWeight: 800, color: a, marginBottom: 10 }}>{cs.title}</h3>{cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}</div>))}
      </main>
    </div>
  );
}

// =====================================================================
// 10. SEOUL — Engineer, dark header, green, monospace
// =====================================================================
export function SeoulTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#22c55e";
  return (
    <div className={PAPER} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ background: "#0f172a", padding: "20px 28px", color: "#e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><h1 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>{data.name}</h1><p style={{ fontSize: 11, color: a, margin: "2px 0 0" }}>{">"} {data.title}</p></div>
          <div style={{ fontSize: 9, color: "#64748b", textAlign: "right" }}>{[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <div key={i}>{c}</div>)}</div>
        </div>
      </div>
      <div style={{ padding: "20px 24px" }}>
        {visible(sections, "summary") && data.summary && (<div style={{ marginBottom: 16, padding: "8px 12px", background: "#f8fafc", borderRadius: 4, borderLeft: `3px solid ${a}` }}><span style={{ fontSize: 9, color: "#94a3b8" }}>{"// about"}</span><p style={{ fontSize: 10, lineHeight: 1.6, color: "#475569", margin: "4px 0 0" }}>{data.summary}</p></div>)}
        {visible(sections, "experience") && data.experience.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8 }}>{"// experience"}</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 10, breakInside: "avoid" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{e.role} <span style={{ color: a }}>@ {e.company}</span></div><div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 3 }}>{range(e.start, e.end)}</div>{e.bullets.filter(b => b?.trim()).map((b, i) => <div key={i} style={{ fontSize: 9.5, lineHeight: 1.6, color: "#475569", paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: a }}>{"▸"}</span>{b}</div>)}</div>))}</div>)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {visible(sections, "skills") && data.skills.length > 0 && (<div><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8 }}>{"// skills"}</h3>{data.skills.map((s, i) => <div key={i} style={{ fontSize: 9, color: "#475569", marginBottom: 2 }}><span style={{ color: a }}>{"•"}</span> {s}</div>)}</div>)}
          {visible(sections, "education") && data.education.length > 0 && (<div><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8 }}>{"// education"}</h3>{data.education.map(ed => <div key={ed.id} style={{ fontSize: 9, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span><br />{ed.school}</div>)}</div>)}
        </div>
        {visible(sections, "projects") && data.projects.length > 0 && (<div style={{ marginTop: 16 }}><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8 }}>{"// projects"}</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 9.5, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{p.name}</span> — {p.description}</div>)}</div>)}
        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (<div key={cs.id} style={{ marginTop: 16 }}><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8 }}>{"// "}{cs.title.toLowerCase()}</h3>{cs.items.map(item => <div key={item.id} style={{ fontSize: 9.5, color: "#475569", marginBottom: 2 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}</div>))}
      </div>
    </div>
  );
}

// =====================================================================
// 11. DUBAI — Luxury, gold on dark, serif, elegant
// =====================================================================
export function DubaiTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#c5a572";
  return (
    <div className={PAPER} style={{ fontFamily: "Georgia, serif", display: "flex" }}>
      <aside style={{ width: 220, background: "#1a1a2e", color: "#e0d8c8", padding: "28px 18px", minHeight: 1123 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}><Avatar data={data} size={68} ring={a} ringWidth={2} /></div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: a, textAlign: "center", margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 10, textAlign: "center", color: "#8b7d6b", margin: "4px 0 20px" }}>{data.title}</p>
        {visible(sections, "skills") && data.skills.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 9, fontWeight: 700, color: a, marginBottom: 6, letterSpacing: 2, textTransform: "uppercase" }}>Skills</h3>{data.skills.map((s, i) => <div key={i} style={{ fontSize: 10, color: "#c0b8a8", marginBottom: 3 }}>{s}</div>)}</div>)}
        {visible(sections, "languages") && data.languages.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 9, fontWeight: 700, color: a, marginBottom: 6, letterSpacing: 2, textTransform: "uppercase" }}>Languages</h3><div style={{ fontSize: 10, color: "#c0b8a8" }}>{data.languages.join(" · ")}</div></div>)}
        <div style={{ fontSize: 9, color: "#6b5d4b", marginTop: 20, fontStyle: "italic" }}>{[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <div key={i} style={{ marginBottom: 3 }}>{c}</div>)}</div>
      </aside>
      <main style={{ flex: 1, padding: "28px 24px" }}>
        {visible(sections, "summary") && data.summary && <p style={{ fontSize: 11, lineHeight: 1.9, color: "#444", marginBottom: 20, fontStyle: "italic" }}>{data.summary}</p>}
        {visible(sections, "experience") && data.experience.length > 0 && (<div style={{ marginBottom: 20 }}><h3 style={{ fontSize: 13, fontWeight: 700, color: a, marginBottom: 10, textTransform: "uppercase", letterSpacing: 2 }}>Experience</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{e.role}</span><span style={{ fontSize: 9, color: "#8b7d6b", fontStyle: "italic" }}>{range(e.start, e.end)}</span></div><div style={{ fontSize: 11, color: a, fontStyle: "italic", marginBottom: 4 }}>{e.company}</div>{e.bullets.filter(b => b?.trim()).map((b, i) => <div key={i} style={{ fontSize: 10.5, lineHeight: 1.7, color: "#555", paddingLeft: 14, position: "relative" }}><span style={{ position: "absolute", left: 0, color: a }}>{"◆"}</span>{b}</div>)}</div>))}</div>)}
        {visible(sections, "education") && data.education.length > 0 && (<div style={{ marginBottom: 20 }}><h3 style={{ fontSize: 13, fontWeight: 700, color: a, marginBottom: 10, textTransform: "uppercase", letterSpacing: 2 }}>Education</h3>{data.education.map(ed => <div key={ed.id} style={{ fontSize: 10.5, color: "#444", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1a1a2e" }}>{ed.degree}</span> — {ed.school} ({range(ed.start, ed.end)})</div>)}</div>)}
        {visible(sections, "projects") && data.projects.length > 0 && (<div><h3 style={{ fontSize: 13, fontWeight: 700, color: a, marginBottom: 10, textTransform: "uppercase", letterSpacing: 2 }}>Projects</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 10.5, color: "#444", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1a1a2e" }}>{p.name}</span> — {p.description}</div>)}</div>)}
        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (<div key={cs.id} style={{ marginTop: 20 }}><h3 style={{ fontSize: 13, fontWeight: 700, color: a, marginBottom: 10, textTransform: "uppercase", letterSpacing: 2 }}>{cs.title}</h3>{cs.items.map(item => <div key={item.id} style={{ fontSize: 10.5, color: "#444", marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}</div>))}
      </main>
    </div>
  );
}

// =====================================================================
// 12. SINGAPORE — Modern card-based, teal, no sidebar
// =====================================================================
export function SingaporeTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#0891b2";
  return (
    <div className={PAPER} style={{ fontFamily: "system-ui, sans-serif", padding: "28px 32px", background: "#f8fafc" }}>
      <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>{data.name}</h1><div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><p style={{ fontSize: 12, color: a, fontWeight: 600 }}>{data.title}</p><div style={{ fontSize: 9, color: "#64748b" }}>{[data.email, data.phone, data.location].filter(Boolean).join(" · ")}</div></div></div>
      {visible(sections, "summary") && data.summary && <div style={{ background: "white", borderRadius: 8, padding: "12px 16px", marginBottom: 12, borderLeft: `3px solid ${a}` }}><p style={{ fontSize: 10, lineHeight: 1.6, color: "#475569", margin: 0 }}>{data.summary}</p></div>}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div>
          {visible(sections, "experience") && data.experience.length > 0 && (<div style={{ background: "white", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 8, textTransform: "uppercase" }}>Experience</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 10, breakInside: "avoid" }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{e.role}</span><span style={{ fontSize: 9, color: "#94a3b8" }}>{range(e.start, e.end)}</span></div><div style={{ fontSize: 10, color: a, marginBottom: 3 }}>{e.company}</div><Bullets bullets={e.bullets} color="#cbd5e1" /></div>))}</div>)}
          {visible(sections, "projects") && data.projects.length > 0 && (<div style={{ background: "white", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 8, textTransform: "uppercase" }}>Projects</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 10, marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#0f172a" }}>{p.name}</span> — {p.description}</div>)}</div>)}
        </div>
        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (<div style={{ background: "white", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 8, textTransform: "uppercase" }}>Skills</h3>{data.skills.map((s, i) => <div key={i} style={{ fontSize: 9, color: "#475569", marginBottom: 3 }}>{s}</div>)}</div>)}
          {visible(sections, "education") && data.education.length > 0 && (<div style={{ background: "white", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 8, textTransform: "uppercase" }}>Education</h3>{data.education.map(ed => <div key={ed.id} style={{ fontSize: 9, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#0f172a" }}>{ed.degree}</span><br />{ed.school}</div>)}</div>)}
        </div>
      </div>
      {data.customSections.filter(cs => cs.items.length > 0).map(cs => (<div key={cs.id} style={{ background: "white", borderRadius: 8, padding: "12px 16px", marginTop: 12 }}><h3 style={{ fontSize: 10, fontWeight: 800, color: a, marginBottom: 8, textTransform: "uppercase" }}>{cs.title}</h3>{cs.items.map(item => <div key={item.id} style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}</div>))}
    </div>
  );
}

// =====================================================================
// 13. STOCKHOLM — Nordic minimal, thin lines, light
// =====================================================================
export function StockholmTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#475569";
  return (
    <div className={PAPER} style={{ fontFamily: "system-ui, sans-serif", padding: "40px 48px" }}>
      <div style={{ marginBottom: 24 }}><h1 style={{ fontSize: 30, fontWeight: 300, color: "#0f172a", margin: 0, letterSpacing: -0.5 }}>{data.name}</h1><p style={{ fontSize: 13, color: a, fontWeight: 400, margin: "4px 0 0" }}>{data.title}</p><div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>{[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join("  ·  ")}</div></div>
      {visible(sections, "summary") && data.summary && <div style={{ marginBottom: 24 }}><p style={{ fontSize: 11, lineHeight: 1.8, color: "#475569", maxWidth: 580 }}>{data.summary}</p></div>}
      {visible(sections, "experience") && data.experience.length > 0 && (<div style={{ marginBottom: 24 }}><h3 style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginBottom: 12, textTransform: "uppercase", letterSpacing: 2 }}>Experience</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 14, breakInside: "avoid" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{e.role}</span><span style={{ fontSize: 9, color: "#94a3b8" }}>{range(e.start, e.end)}</span></div><div style={{ fontSize: 10, color: a, marginBottom: 4 }}>{e.company}</div>{e.bullets.filter(b => b?.trim()).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.7, color: "#475569", paddingLeft: 10, position: "relative", marginBottom: 1 }}><span style={{ position: "absolute", left: 0, color: "#cbd5e1" }}>{"—"}</span>{b}</div>)}</div>))}</div>)}
      <div style={{ display: "flex", gap: 40 }}>
        {visible(sections, "education") && data.education.length > 0 && (<div><h3 style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Education</h3>{data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 600, color: "#0f172a" }}>{ed.degree}</span><br />{ed.school}</div>)}</div>)}
        {visible(sections, "skills") && data.skills.length > 0 && (<div><h3 style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Skills</h3><div style={{ fontSize: 10, color: "#475569", lineHeight: 1.8 }}>{data.skills.join(" · ")}</div></div>)}
      </div>
      {visible(sections, "projects") && data.projects.length > 0 && (<div style={{ marginTop: 24 }}><h3 style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Projects</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 10, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 600, color: "#0f172a" }}>{p.name}</span> — {p.description}</div>)}</div>)}
      {data.customSections.filter(cs => cs.items.length > 0).map(cs => (<div key={cs.id} style={{ marginTop: 20 }}><h3 style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>{cs.title}</h3>{cs.items.map(item => <div key={item.id} style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}><span style={{ fontWeight: 600 }}>{item.title}</span></div>)}</div>))}
    </div>
  );
}

// =====================================================================
// 14. MUMBAI — Vibrant orange sidebar, bold, Indian professional
// =====================================================================
export function MumbaiTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#ea580c";
  return (
    <div className={PAPER} style={{ fontFamily: "system-ui, sans-serif", display: "flex" }}>
      <aside style={{ width: 220, background: a, color: "white", padding: "24px 16px", minHeight: 1123 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}><Avatar data={data} size={64} ring="white" /></div>
        <h1 style={{ fontSize: 17, fontWeight: 800, textAlign: "center", margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 10, textAlign: "center", color: "rgba(255,255,255,0.8)", margin: "4px 0 16px" }}>{data.title}</p>
        {visible(sections, "skills") && data.skills.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: 1 }}>SKILLS</h3>{data.skills.map((s, i) => <div key={i} style={{ fontSize: 9.5, marginBottom: 2 }}>{s}</div>)}</div>)}
        {visible(sections, "languages") && data.languages.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 4, letterSpacing: 1 }}>LANGUAGES</h3><div style={{ fontSize: 9.5 }}>{data.languages.join(", ")}</div></div>)}
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 16 }}>{[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <div key={i} style={{ marginBottom: 2 }}>{c}</div>)}</div>
      </aside>
      <main style={{ flex: 1, padding: "24px 20px" }}>
        {visible(sections, "summary") && data.summary && <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569", marginBottom: 16 }}>{data.summary}</p>}
        {visible(sections, "experience") && data.experience.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 13, fontWeight: 800, color: a, marginBottom: 8, borderBottom: `2px solid ${a}30`, paddingBottom: 4 }}>Experience</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 10, breakInside: "avoid" }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{e.role} · {e.company}</span><span style={{ fontSize: 9, color: "#94a3b8" }}>{range(e.start, e.end)}</span></div><Bullets bullets={e.bullets} color={a} /></div>))}</div>)}
        {visible(sections, "education") && data.education.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 13, fontWeight: 800, color: a, marginBottom: 8, borderBottom: `2px solid ${a}30`, paddingBottom: 4 }}>Education</h3>{data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span> — {ed.school} ({range(ed.start, ed.end)})</div>)}</div>)}
        {visible(sections, "projects") && data.projects.length > 0 && (<div><h3 style={{ fontSize: 13, fontWeight: 800, color: a, marginBottom: 8, borderBottom: `2px solid ${a}30`, paddingBottom: 4 }}>Projects</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 10, marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{p.name}</span> — {p.description}</div>)}</div>)}
        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (<div key={cs.id} style={{ marginTop: 16 }}><h3 style={{ fontSize: 13, fontWeight: 800, color: a, marginBottom: 8, borderBottom: `2px solid ${a}30`, paddingBottom: 4 }}>{cs.title}</h3>{cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}</div>))}
      </main>
    </div>
  );
}

// =====================================================================
// 15. TORONTO — Navy sidebar + amber accent, dual color
// =====================================================================
export function TorontoTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#1e40af"; const b = "#f59e0b";
  return (
    <div className={PAPER} style={{ fontFamily: "system-ui, sans-serif", display: "flex" }}>
      <aside style={{ width: 200, background: a, color: "white", padding: "24px 16px", minHeight: 1123, borderTop: `4px solid ${b}` }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}><Avatar data={data} size={60} ring={b} ringWidth={2} /></div>
        <h1 style={{ fontSize: 15, fontWeight: 800, textAlign: "center", margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 9, textAlign: "center", color: b, margin: "4px 0 16px" }}>{data.title}</p>
        {visible(sections, "skills") && data.skills.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 8, fontWeight: 700, color: b, marginBottom: 6, letterSpacing: 1 }}>SKILLS</h3>{data.skills.map((s, i) => <div key={i} style={{ fontSize: 9, marginBottom: 2, color: "rgba(255,255,255,0.85)" }}>{s}</div>)}</div>)}
        {visible(sections, "languages") && data.languages.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 8, fontWeight: 700, color: b, marginBottom: 4, letterSpacing: 1 }}>LANGUAGES</h3><div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)" }}>{data.languages.join(", ")}</div></div>)}
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 16 }}>{[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <div key={i} style={{ marginBottom: 2 }}>{c}</div>)}</div>
      </aside>
      <main style={{ flex: 1, padding: "24px 20px", borderTop: `4px solid ${a}` }}>
        {visible(sections, "summary") && data.summary && <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569", marginBottom: 16 }}>{data.summary}</p>}
        {visible(sections, "experience") && data.experience.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 12, fontWeight: 800, color: a, marginBottom: 8 }}>Experience</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 10, breakInside: "avoid", borderLeft: `2px solid ${b}40`, paddingLeft: 10 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{e.role}</span><span style={{ fontSize: 9, color: b, fontWeight: 600 }}>{range(e.start, e.end)}</span></div><div style={{ fontSize: 10, color: a, marginBottom: 3 }}>{e.company}</div><Bullets bullets={e.bullets} color="#cbd5e1" /></div>))}</div>)}
        {visible(sections, "education") && data.education.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 12, fontWeight: 800, color: a, marginBottom: 8 }}>Education</h3>{data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700 }}>{ed.degree}</span> — {ed.school} ({range(ed.start, ed.end)})</div>)}</div>)}
        {visible(sections, "projects") && data.projects.length > 0 && (<div><h3 style={{ fontSize: 12, fontWeight: 800, color: a, marginBottom: 8 }}>Projects</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 10, marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700 }}>{p.name}</span> — {p.description}</div>)}</div>)}
        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (<div key={cs.id} style={{ marginTop: 16 }}><h3 style={{ fontSize: 12, fontWeight: 800, color: a, marginBottom: 8 }}>{cs.title}</h3>{cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}</div>))}
      </main>
    </div>
  );
}

// =====================================================================
// 16. SYDNEY — Fresh teal header, two-col, no sidebar
// =====================================================================
export function SydneyTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const a = "#14b8a6";
  return (
    <div className={PAPER} style={{ fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg, ${a}, #0d9488)`, padding: "24px 32px", color: "white" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "4px 0 8px" }}>{data.title}</p>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{[data.email, data.phone, data.location].filter(Boolean).join("  ·  ")}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, padding: "20px" }}>
        <div style={{ paddingRight: 20, borderRight: "1px solid #e2e8f0" }}>
          {visible(sections, "summary") && data.summary && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 6, textTransform: "uppercase" }}>About</h3><p style={{ fontSize: 10, lineHeight: 1.7, color: "#475569" }}>{data.summary}</p></div>)}
          {visible(sections, "experience") && data.experience.length > 0 && (<div><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, textTransform: "uppercase" }}>Experience</h3>{data.experience.map(e => (<div key={e.id} style={{ marginBottom: 10, breakInside: "avoid" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{e.role}</div><div style={{ fontSize: 9, color: a, marginBottom: 3 }}>{e.company} · {range(e.start, e.end)}</div>{e.bullets.filter(b => b?.trim()).slice(0, 3).map((b, i) => <div key={i} style={{ fontSize: 9.5, lineHeight: 1.5, color: "#475569", paddingLeft: 8, position: "relative" }}><span style={{ position: "absolute", left: 0, color: a }}>{"•"}</span>{b}</div>)}</div>))}</div>)}
        </div>
        <div style={{ paddingLeft: 20 }}>
          {visible(sections, "skills") && data.skills.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, textTransform: "uppercase" }}>Skills</h3><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{data.skills.map((s, i) => <span key={i} style={{ fontSize: 9, background: `${a}15`, color: "#0d9488", padding: "3px 8px", borderRadius: 10 }}>{s}</span>)}</div></div>)}
          {visible(sections, "education") && data.education.length > 0 && (<div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, textTransform: "uppercase" }}>Education</h3>{data.education.map(ed => <div key={ed.id} style={{ fontSize: 9.5, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{ed.degree}</span><br />{ed.school}</div>)}</div>)}
          {visible(sections, "projects") && data.projects.length > 0 && (<div><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 8, textTransform: "uppercase" }}>Projects</h3>{data.projects.map(p => <div key={p.id} style={{ fontSize: 9.5, color: "#475569", marginBottom: 4, breakInside: "avoid" }}><span style={{ fontWeight: 700, color: "#1e293b" }}>{p.name}</span> — {p.description}</div>)}</div>)}
        </div>
      </div>
      {data.customSections.filter(cs => cs.items.length > 0).map(cs => (<div key={cs.id} style={{ padding: "0 20px 12px" }}><h3 style={{ fontSize: 10, fontWeight: 700, color: a, marginBottom: 6, textTransform: "uppercase" }}>{cs.title}</h3>{cs.items.map(item => <div key={item.id} style={{ fontSize: 9.5, color: "#475569", marginBottom: 2 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}</div>))}
    </div>
  );
}
