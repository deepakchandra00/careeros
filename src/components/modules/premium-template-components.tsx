"use client";

import * as React from "react";
import {
  Mail, Phone, MapPin, Linkedin, Github, Globe,
  GraduationCap, Briefcase, Lightbulb, Trophy, ChartBar, User, Star,
  type LucideIcon,
} from "lucide-react";
import type { ResumeData } from "@/store/resume-store";

const PAPER = "resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl";
const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

function Avatar({ data, size, ring, ringWidth = 3, shape = "circle" }: { data: ResumeData; size: number; ring?: string; ringWidth?: number; shape?: "circle" | "diamond" | "square" }) {
  const borderStyle = ring ? `${ring} ${ringWidth}px solid` : undefined;
  const baseStyle: React.CSSProperties = { width: size, height: size, objectFit: "cover", border: borderStyle };
  const placeholderStyle: React.CSSProperties = { width: size, height: size, background: "#cbd5e1", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, border: borderStyle };
  const initials = data.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  if (shape === "diamond") {
    const dStyle: React.CSSProperties = { width: size, height: size, transform: "rotate(45deg)", overflow: "hidden", border: ring ? `${ring} ${ringWidth}px solid` : undefined };
    const inner: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
    const phInner: React.CSSProperties = { width: "100%", height: "100%", background: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" };
    if (data.photo) return <div style={dStyle}><img src={data.photo} alt="" style={{ ...inner, transform: "rotate(-45deg) scale(1.42)" }} /></div>;
    return <div style={dStyle}><div style={phInner}><span style={{ transform: "rotate(-45deg)", fontSize: size * 0.35, fontWeight: 700 }}>{initials}</span></div></div>;
  }
  if (shape === "square") { baseStyle.borderRadius = "8px"; placeholderStyle.borderRadius = "8px"; }
  else { baseStyle.borderRadius = "50%"; placeholderStyle.borderRadius = "50%"; }
  if (data.photo) return <img src={data.photo} alt={data.name || "Avatar"} style={baseStyle} />;
  return <div style={placeholderStyle}>{initials}</div>;
}

function formatRange(start: string, end: string): string {
  const s = (start ?? "").trim(); const e = (end ?? "").trim();
  if (s && e) return `${s} \u2013 ${e}`; if (s) return `${s} \u2013 Present`; if (e) return e; return "";
}
function nonEmptyBullets(b: string[]): string[] { return (b ?? []).map(x => (x ?? "").trim()).filter(Boolean); }
function joinTech(t: string[]): string { return (t ?? []).map(x => (x ?? "").trim()).filter(Boolean).join(", "); }
interface ContactEntry { icon: LucideIcon; value: string; }
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

// Shared content renderer for experience, projects, education, etc.
function RenderExperience({ data, headerColor, bulletChar = "\u2022", font = "sans-serif" }: { data: ResumeData; headerColor: string; bulletChar?: string; font?: string }) {
  return (
    <>
      {nonEmptyBullets(data.experience.flatMap(e => [])).length === 0 && data.experience.length === 0 ? null : null}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: headerColor, marginBottom: 8, fontFamily: font }}>Experience</h3>
          {data.experience.map((e) => (
            <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: 11, fontFamily: font }}>{e.role}{e.company ? `  ·  ${e.company}` : ""}</span>
                <span style={{ fontSize: 9, color: "#64748b", fontFamily: font }}>{formatRange(e.start, e.end)}</span>
              </div>
              {e.location && <div style={{ fontSize: 9, color: "#64748b", fontStyle: "italic", marginBottom: 4, fontFamily: font }}>{e.location}</div>}
              {nonEmptyBullets(e.bullets).map((b, i) => (
                <div key={i} style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 2, paddingLeft: 12, position: "relative", fontFamily: font }}>
                  <span style={{ position: "absolute", left: 0, color: headerColor }}>{bulletChar}</span>{b}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {data.projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: headerColor, marginBottom: 8, fontFamily: font }}>Projects</h3>
          {data.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
              <span style={{ fontWeight: 700, fontSize: 11, fontFamily: font }}>{p.name}</span>
              {p.link && <span style={{ fontSize: 9, color: "#64748b", fontFamily: font }}>  —  {p.link}</span>}
              {p.description && <div style={{ fontSize: 10, lineHeight: 1.5, fontFamily: font }}>{p.description}</div>}
              {p.tech.length > 0 && <div style={{ fontSize: 9, color: "#64748b", fontStyle: "italic", fontFamily: font }}>Tech: {joinTech(p.tech)}</div>}
            </div>
          ))}
        </div>
      )}
      {data.education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: headerColor, marginBottom: 8, fontFamily: font }}>Education</h3>
          {data.education.map((ed) => (
            <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 11, fontFamily: font }}>{ed.degree}</span>
                <span style={{ fontSize: 9, color: "#64748b", fontFamily: font }}>{formatRange(ed.start, ed.end)}</span>
              </div>
              <div style={{ fontSize: 9, color: "#64748b", fontFamily: font }}>{[ed.school, ed.grade].filter(Boolean).join("  |  ")}</div>
            </div>
          ))}
        </div>
      )}
      {data.awards.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: headerColor, marginBottom: 8, fontFamily: font }}>Awards</h3>
          {data.awards.map((a) => (
            <div key={a.id} style={{ marginBottom: 4, fontSize: 10, fontFamily: font }}>
              <span style={{ fontWeight: 700 }}>{a.title}</span>{a.date ? `  (${a.date})` : ""}
              {a.subtitle && <div style={{ fontSize: 9, color: "#64748b" }}>{a.subtitle}</div>}
            </div>
          ))}
        </div>
      )}
      {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
        <div key={cs.id} style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: headerColor, marginBottom: 8, fontFamily: font }}>{cs.title}</h3>
          {cs.items.map(item => (
            <div key={item.id} style={{ marginBottom: 4, fontSize: 10, fontFamily: font }}>
              <span style={{ fontWeight: 700 }}>{item.title}</span>
              {item.subtitle && <span style={{ color: "#64748b" }}>  —  {item.subtitle}</span>}
              {item.date && <span style={{ color: "#64748b" }}>  ({item.date})</span>}
              {item.description && <div style={{ fontSize: 9, color: "#64748b" }}>{item.description}</div>}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function SidebarContent({ data, bg, textColor }: { data: ResumeData; bg: string; textColor: string }) {
  const contacts = buildContact(data);
  return (
    <>
      {contacts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: textColor, marginBottom: 6, opacity: 0.8 }}>Contact</h3>
          {contacts.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3, fontSize: 9, color: textColor, opacity: 0.9 }}>
              <c.icon style={{ width: 10, height: 10, opacity: 0.7 }} /> {c.value}
            </div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: textColor, marginBottom: 6, opacity: 0.8 }}>Skills</h3>
          {data.skills.map((s, i) => <div key={i} style={{ fontSize: 9, color: textColor, opacity: 0.9, marginBottom: 2 }}>{s}</div>)}
        </div>
      )}
      {data.languages.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: textColor, marginBottom: 6, opacity: 0.8 }}>Languages</h3>
          <div style={{ fontSize: 9, color: textColor, opacity: 0.9 }}>{data.languages.join(", ")}</div>
        </div>
      )}
      {data.certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: textColor, marginBottom: 6, opacity: 0.8 }}>Certifications</h3>
          {data.certifications.map((c, i) => <div key={i} style={{ fontSize: 9, color: textColor, opacity: 0.9, marginBottom: 3, fontWeight: 600 }}>{c.title}<div style={{ fontWeight: 400, opacity: 0.7 }}>{c.subtitle}</div></div>)}
        </div>
      )}
    </>
  );
}

// =====================================================================
// 1. PURPLE EXECUTIVE — header+two-col, purple sidebar, diamond photo in header
// =====================================================================
export function PurpleExecutiveTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const c = "#6c5ce7"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font }}>
      {/* Purple header band with name + diamond photo */}
      <div style={{ background: c, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}>{data.name}</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>{data.title}</p>
        </div>
        <Avatar data={data} size={70} shape="diamond" ring="white" />
      </div>
      {/* Two-column body */}
      <div style={{ display: "grid", gridTemplateColumns: "25% 75%" }}>
        <aside style={{ background: c, padding: 16, color: "white" }}>
          <SidebarContent data={data} bg={c} textColor="white" />
        </aside>
        <main style={{ padding: 20 }}>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16, color: "#333" }}>{data.summary}</p>}
          <RenderExperience data={data} headerColor={c} bulletChar="\u25C6" font={font} />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 2. BROWN CLASSIC — header+two-col, white sidebar with brown accents, plain headers
// =====================================================================
export function BrownClassicTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const c = "#8B5A2B"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font, position: "relative", overflow: "hidden" }}>
      {/* Brown arcs decoration top-right */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", border: `${c}40 3px solid`, background: "transparent" }} />
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", border: `${c}30 3px solid` }} />
      {/* Two-column */}
      <div style={{ display: "grid", gridTemplateColumns: "25% 75%" }}>
        <aside style={{ padding: 20, borderRight: `${c}20 1px solid` }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Avatar data={data} size={70} /></div>
          <SidebarContent data={data} bg="white" textColor="#333" />
          {data.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Skills</h3>
              {data.skills.map((s, i) => {
                const lvl = data.skillLevels[s] ?? 80; const filled = Math.round(lvl / 20);
                return <div key={i} style={{ display: "flex", gap: 2, marginBottom: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 8, width: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</span>
                  {[1,2,3,4,5].map(d => <div key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: d <= filled ? c : "#e2e8f0" }} />)}
                </div>;
              })}
            </div>
          )}
        </aside>
        <main style={{ padding: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{data.name}</h1>
          <p style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>{data.title}</p>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          <RenderExperience data={data} headerColor="#000" bulletChar="\u2022" font={font} />
        </main>
      </div>
      {/* Brown arc bottom-right */}
      <div style={{ position: "absolute", bottom: -30, right: -30, width: 100, height: 100, borderRadius: "50%", border: `${c}30 3px solid` }} />
    </div>
  );
}

// =====================================================================
// 3. PEACH MODERN — header+two-col, peach sidebar (wide), purple pill headers
// =====================================================================
export function PeachModernTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const peach = "#F8E1D8"; const purple = "#6B46C1"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font, background: "#FFD1B3" }}>
      {/* Purple header band */}
      <div style={{ background: purple, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar data={data} size={60} ring="white" />
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>{data.name}</h1>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>{data.title}</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "35% 65%", background: "white" }}>
        <aside style={{ background: peach, padding: 16 }}>
          <SidebarContent data={data} bg={peach} textColor="#333" />
          {data.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 8, color: purple }}>Skills</h3>
              {data.skills.map((s, i) => {
                const lvl = data.skillLevels[s] ?? 80;
                return <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 9, marginBottom: 2 }}>{s}</div>
                  <div style={{ height: 4, background: "#e2d6e8", borderRadius: 2 }}><div style={{ width: `${lvl}%`, height: "100%", background: purple, borderRadius: 2 }} /></div>
                </div>;
              })}
            </div>
          )}
        </aside>
        <main style={{ padding: 16 }}>
          {data.summary && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: "inline-block", background: purple, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 10, marginBottom: 6 }}>About Me</span>
              <p style={{ fontSize: 10, lineHeight: 1.6 }}>{data.summary}</p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: "inline-block", background: purple, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 10, marginBottom: 6 }}>Work Experience</span>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{e.role} · {e.company}</span>
                    <span style={{ fontSize: 9, color: "#64748b" }}>{formatRange(e.start, e.end)}</span>
                  </div>
                  {nonEmptyBullets(e.bullets).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.5, paddingLeft: 8 }}>{b}</div>)}
                </div>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <span style={{ display: "inline-block", background: purple, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 10, marginBottom: 6 }}>Education</span>
              {data.education.map(ed => (
                <div key={ed.id} style={{ fontSize: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700 }}>{ed.degree}</span> — {ed.school} ({formatRange(ed.start, ed.end)})
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 4. WARM PROFESSIONAL — two-col, light peach sidebar, plain headers, name in sidebar
// =====================================================================
export function WarmProfessionalTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const c = "#E8B9A0"; const dark = "#2D1B09"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font, border: "1px solid #f0f0f0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "25% 75%" }}>
        <aside style={{ background: c, padding: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: dark, margin: 0, lineHeight: 1.2 }}>{data.name}</h1>
          <p style={{ fontSize: 10, color: dark, marginBottom: 16 }}>{data.title}</p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Avatar data={data} size={60} /></div>
          <SidebarContent data={data} bg={c} textColor={dark} />
        </aside>
        <main style={{ padding: 20 }}>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          <RenderExperience data={data} headerColor={dark} bulletChar="\u2022" font={font} />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 5. EARTH PREMIUM — two-col, brown sidebar, name in main-top, underline headers
// =====================================================================
export function EarthPremiumTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const c = "#5D4037"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font }}>
      <div style={{ display: "grid", gridTemplateColumns: "20% 80%" }}>
        <aside style={{ background: c, padding: 16, color: "white" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Avatar data={data} size={60} ring="white" /></div>
          <SidebarContent data={data} bg={c} textColor="white" />
        </aside>
        <main style={{ padding: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{data.name}</h1>
          <p style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>{data.title}</p>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, borderBottom: `2px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Experience</h3>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{e.role} · {e.company}</span>
                    <span style={{ fontSize: 9, color: "#64748b" }}>{formatRange(e.start, e.end)}</span>
                  </div>
                  {nonEmptyBullets(e.bullets).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.5, paddingLeft: 12 }}>{b}</div>)}
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, borderBottom: `2px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Projects</h3>
              {data.projects.map(p => <div key={p.id} style={{ marginBottom: 6, fontSize: 10 }}><span style={{ fontWeight: 700 }}>{p.name}</span> — {p.description}</div>)}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, borderBottom: `2px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Education</h3>
              {data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{ed.degree}</span> — {ed.school} ({formatRange(ed.start, ed.end)})</div>)}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, borderBottom: `2px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>{cs.title}</h3>
              {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{item.title}</span>{item.date ? ` (${item.date})` : ""}</div>)}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 6. PINK GEOMETRIC — two-col, pink sidebar, square photo, navy plain headers
// =====================================================================
export function PinkGeometricTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const pink = "#ec4899"; const navy = "#1E3A8A"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font, position: "relative", overflow: "hidden" }}>
      {/* Geometric decorations */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: navy, clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 50, height: 50, background: pink, clipPath: "polygon(0 100%, 0 0, 100% 100%)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "25% 75%" }}>
        <aside style={{ background: pink, padding: 16, color: "white" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Avatar data={data} size={60} ring="white" /></div>
          <SidebarContent data={data} bg={pink} textColor="white" />
        </aside>
        <main style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Avatar data={data} size={50} shape="square" ring={pink} ringWidth={2} />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: navy, margin: 0 }}>{data.name}</h1>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{data.title}</p>
            </div>
          </div>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          <RenderExperience data={data} headerColor={navy} bulletChar="\u25C6" font={font} />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 7. ROSE ELEGANT — header+two-col, light pink sidebar, brown bar headers, name in main
// =====================================================================
export function RoseElegantTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const pink = "#FCE4EC"; const brown = "#8B5A2B"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font }}>
      {/* Brown header band */}
      <div style={{ background: brown, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar data={data} size={55} ring="white" />
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>{data.name}</h1>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>{data.title}</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "25% 75%" }}>
        <aside style={{ background: pink, padding: 16 }}>
          <SidebarContent data={data} bg={pink} textColor="#333" />
          {data.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 8, color: brown }}>Skills</h3>
              {data.skills.map((s, i) => {
                const lvl = data.skillLevels[s] ?? 80;
                return <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 9, marginBottom: 2 }}>{s}</div>
                  <div style={{ height: 4, background: "#e8d5c5", borderRadius: 2 }}><div style={{ width: `${lvl}%`, height: "100%", background: brown, borderRadius: 2 }} /></div>
                </div>;
              })}
            </div>
          )}
        </aside>
        <main style={{ padding: 16 }}>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: brown, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>EXPERIENCE</div>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{e.role} · {e.company}</span>
                    <span style={{ fontSize: 9, color: "#64748b" }}>{formatRange(e.start, e.end)}</span>
                  </div>
                  {nonEmptyBullets(e.bullets).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: brown }}>{"\u2022"}</span>{b}</div>)}
                </div>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <div style={{ background: brown, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>EDUCATION</div>
              {data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{ed.degree}</span> — {ed.school} ({formatRange(ed.start, ed.end)})</div>)}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 16 }}>
              <div style={{ background: brown, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>{cs.title.toUpperCase()}</div>
              {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 8. FOUNDATION PURPLE — header+two-col, white sidebar, purple bar headers, square bullets
// =====================================================================
export function FoundationPurpleTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const c = "#6d28d9"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font, position: "relative", overflow: "hidden" }}>
      {/* Hexagonal pattern background */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, opacity: 0.05, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='46' viewBox='0 0 40 46'%3E%3Cpath fill='${c}' d='M20 0L40 11.5v23L20 46 0 34.5v-23z'/%3E%3C/svg%3E")` }} />
      {/* Purple header band */}
      <div style={{ background: c, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar data={data} size={55} ring="white" />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>{data.name}</h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>{data.title}</p>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "25% 75%" }}>
        <aside style={{ padding: 16, borderRight: "#e2e8f0 1px solid" }}>
          <SidebarContent data={data} bg="white" textColor="#333" />
        </aside>
        <main style={{ padding: 16 }}>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: c, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>EXPERIENCE</div>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{e.role} · {e.company}</span>
                    <span style={{ fontSize: 9, color: "#64748b" }}>{formatRange(e.start, e.end)}</span>
                  </div>
                  {nonEmptyBullets(e.bullets).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: c }}>{"\u25A0"}</span>{b}</div>)}
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: c, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>PROJECTS</div>
              {data.projects.map(p => <div key={p.id} style={{ fontSize: 10, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>{p.name}</span> — {p.description}</div>)}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <div style={{ background: c, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>EDUCATION</div>
              {data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{ed.degree}</span> — {ed.school}</div>)}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 16 }}>
              <div style={{ background: c, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>{cs.title.toUpperCase()}</div>
              {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 9. BLUE SIDEBAR PRO — two-col, blue sidebar, name in main-top centered, plain headers
// =====================================================================
export function BlueSidebarProTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const c = "#2b5f8f"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font }}>
      <div style={{ display: "grid", gridTemplateColumns: "25% 75%" }}>
        <aside style={{ background: c, padding: 16, color: "white" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Avatar data={data} size={60} ring="white" /></div>
          <SidebarContent data={data} bg={c} textColor="white" />
        </aside>
        <main style={{ padding: 20 }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{data.name}</h1>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{data.title}</p>
          </div>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          <RenderExperience data={data} headerColor="#000" bulletChar="\u25A0" font={font} />
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 10. ASPIRE TEAL — header+two-col (NO sidebar!), teal header, underline headers, no photo
// =====================================================================
export function AspireTealTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const c = "#0d9488"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font }}>
      {/* Teal header band — full width, NO sidebar */}
      <div style={{ background: c, padding: "20px 28px", textAlign: "left" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>{data.title}</p>
      </div>
      {/* Two-column content below header — NO colored sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "70% 30%" }}>
        <main style={{ padding: 20 }}>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, borderBottom: `2px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Experience</h3>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{e.role} · {e.company}</span>
                    <span style={{ fontSize: 9, color: "#64748b" }}>{formatRange(e.start, e.end)}</span>
                  </div>
                  {nonEmptyBullets(e.bullets).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: c }}>{"\u2022"}</span>{b}</div>)}
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, borderBottom: `2px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Projects</h3>
              {data.projects.map(p => <div key={p.id} style={{ fontSize: 10, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>{p.name}</span> — {p.description}</div>)}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, borderBottom: `2px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Education</h3>
              {data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{ed.degree}</span> — {ed.school} ({formatRange(ed.start, ed.end)})</div>)}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, borderBottom: `2px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>{cs.title}</h3>
              {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
            </div>
          ))}
        </main>
        {/* Right column — light gray sidebar with skills/contact (NOT a colored sidebar) */}
        <aside style={{ background: "#f8f9fa", padding: 16 }}>
          <SidebarContent data={data} bg="#f8f9fa" textColor="#333" />
          {data.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 8, color: c }}>Skills</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.map((s, i) => <span key={i} style={{ fontSize: 8, background: c, color: "white", padding: "2px 8px", borderRadius: 8 }}>{s}</span>)}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// =====================================================================
// 11. CANVA PINK BLUE — header+two-col, pink sidebar, name centered top, pink pill headers
// =====================================================================
export function CanvaPinkBlueTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const pink = "#ffd1dc"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font }}>
      {/* Pink header band — full width, name centered */}
      <div style={{ background: pink, padding: "16px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Avatar data={data} size={55} /></div>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{data.title}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "25% 75%" }}>
        <aside style={{ background: pink, padding: 16 }}>
          <SidebarContent data={data} bg={pink} textColor="#333" />
        </aside>
        <main style={{ padding: 16 }}>
          {data.summary && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: "inline-block", background: pink, color: "#333", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 10, marginBottom: 6 }}>About Me</span>
              <p style={{ fontSize: 10, lineHeight: 1.6 }}>{data.summary}</p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: "inline-block", background: pink, color: "#333", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 10, marginBottom: 6 }}>Work Experience</span>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{e.role} · {e.company}</span>
                    <span style={{ fontSize: 9, color: "#64748b" }}>{formatRange(e.start, e.end)}</span>
                  </div>
                  {nonEmptyBullets(e.bullets).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.5, paddingLeft: 12 }}>{"\u2022"} {b}</div>)}
                </div>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <span style={{ display: "inline-block", background: pink, color: "#333", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 10, marginBottom: 6 }}>Education</span>
              {data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{ed.degree}</span> — {ed.school}</div>)}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 16 }}>
              <span style={{ display: "inline-block", background: pink, color: "#333", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 10, marginBottom: 6 }}>{cs.title}</span>
              {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 12. COLLEGE CV TEAL — single column, full-width teal header band
// =====================================================================
export function CollegeCVTealTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const c = "#0d9488"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font }}>
      <div style={{ background: c, padding: "20px 28px", textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>{data.name}</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: "4px 0" }}>{data.title}</p>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
          {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join("  |  ")}
        </div>
      </div>
      <div style={{ padding: 20 }}>
        {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
        {data.skills.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, borderBottom: `2px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {data.skills.map((s, i) => <span key={i} style={{ fontSize: 9, background: `${c}15`, color: c, padding: "2px 8px", borderRadius: 8 }}>{s}</span>)}
            </div>
          </div>
        )}
        <RenderExperience data={data} headerColor={c} bulletChar="\u2022" font={font} />
      </div>
    </div>
  );
}

// =====================================================================
// 13. COMBINED BLUE — header+two-col, blue sidebar (wide), overlapping photo, name in sidebar, plain blue headers, red diamond bullets
// =====================================================================
export function CombinedBlueTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const c = "#1e40af"; const red = "#dc2626"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font, position: "relative" }}>
      <div style={{ display: "grid", gridTemplateColumns: "30% 70%" }}>
        <aside style={{ background: c, padding: 16, color: "white", position: "relative" }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0, lineHeight: 1.2 }}>{data.name}</h1>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginBottom: 12 }}>{data.title}</p>
          <SidebarContent data={data} bg={c} textColor="white" />
          {data.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "white", marginBottom: 8, opacity: 0.8 }}>Skills</h3>
              {data.skills.map((s, i) => {
                const lvl = data.skillLevels[s] ?? 80;
                return <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 8, color: "white", marginBottom: 2 }}>{s}</div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 2 }}><div style={{ width: `${lvl}%`, height: "100%", background: "#0d9488", borderRadius: 2 }} /></div>
                </div>;
              })}
            </div>
          )}
        </aside>
        <main style={{ padding: 20, position: "relative" }}>
          {/* Photo overlapping the boundary */}
          <div style={{ position: "absolute", top: 12, left: -45, zIndex: 1 }}>
            <Avatar data={data} size={80} ring="white" ringWidth={4} />
          </div>
          <div style={{ marginLeft: 50, marginBottom: 16 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: c, margin: 0 }}>{data.name}</h1>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{data.title}</p>
          </div>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, marginBottom: 8 }}>Experience</h3>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{e.role} · {e.company}</span>
                    <span style={{ fontSize: 9, color: red }}>{formatRange(e.start, e.end)}</span>
                  </div>
                  {nonEmptyBullets(e.bullets).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: red }}>{"\u25C6"}</span>{b}</div>)}
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, marginBottom: 8 }}>Projects</h3>
              {data.projects.map(p => <div key={p.id} style={{ fontSize: 10, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>{p.name}</span> — {p.description}</div>)}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, marginBottom: 8 }}>Education</h3>
              {data.education.map(ed => <div key={ed.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{ed.degree}</span> — {ed.school} ({formatRange(ed.start, ed.end)})</div>)}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: c, marginBottom: 8 }}>{cs.title}</h3>
              {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

// =====================================================================
// 14. NAVY YELLOW PRO — two-col, navy sidebar, yellow border photo, yellow bar headers, red diamond bullets
// =====================================================================
export function NavyYellowProTemplate({ data, sections, accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const navy = "#1e3a5f"; const yellow = "#fbbf24"; const font = "sans-serif";
  return (
    <div className={PAPER} style={{ fontFamily: font }}>
      <div style={{ display: "grid", gridTemplateColumns: "30% 70%" }}>
        <aside style={{ background: navy, padding: 16, color: "white" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Avatar data={data} size={70} ring={yellow} ringWidth={3} /></div>
          <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: yellow, marginBottom: 6 }}>Contact</h3>
          {buildContact(data).map((c, i) => <div key={i} style={{ fontSize: 9, color: "white", marginBottom: 3, opacity: 0.9 }}>{c.value}</div>)}
          {data.education.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: yellow, marginBottom: 6 }}>Education</h3>
              {data.education.map((ed, i) => (
                <div key={ed.id} style={{ marginBottom: 8, position: "relative", paddingLeft: 12 }}>
                  <div style={{ position: "absolute", left: 0, top: 4, width: 6, height: 6, borderRadius: "50%", background: yellow }} />
                  {i < data.education.length - 1 && <div style={{ position: "absolute", left: 2, top: 12, bottom: -8, width: 2, background: yellow }} />}
                  <div style={{ fontSize: 9, fontWeight: 600, color: "white" }}>{ed.degree}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>{ed.school} ({formatRange(ed.start, ed.end)})</div>
                </div>
              ))}
            </div>
          )}
          {data.skills.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: yellow, marginBottom: 6 }}>Skills</h3>
              {data.skills.map((s, i) => <div key={i} style={{ fontSize: 9, color: "white", marginBottom: 2, opacity: 0.9 }}>{s}</div>)}
            </div>
          )}
        </aside>
        <main style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 4, height: 24, background: yellow }} />
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{data.name}</h1>
          </div>
          <p style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>{data.title}</p>
          {data.summary && <p style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: yellow, color: navy, fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>EXPERIENCE</div>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{e.role} · {e.company}</span>
                    <span style={{ fontSize: 9, color: "#64748b" }}>{formatRange(e.start, e.end)}</span>
                  </div>
                  {nonEmptyBullets(e.bullets).map((b, i) => <div key={i} style={{ fontSize: 10, lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: yellow }}>{"\u2022"}</span>{b}</div>)}
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: yellow, color: navy, fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>PROJECTS</div>
              {data.projects.map(p => <div key={p.id} style={{ fontSize: 10, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>{p.name}</span> — {p.description}</div>)}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 16 }}>
              <div style={{ background: yellow, color: navy, fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block" }}>{cs.title.toUpperCase()}</div>
              {cs.items.map(item => <div key={item.id} style={{ fontSize: 10, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{item.title}</span></div>)}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
