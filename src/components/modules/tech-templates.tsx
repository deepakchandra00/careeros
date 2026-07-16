"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";

const PAPER = "resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl";
const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

// Avatar helper — supports circle, square, and rounded shapes for futuristic layouts
function Avatar({ data, size, ring, ringWidth = 3, shape = "circle" }: { data: ResumeData; size: number; ring?: string; ringWidth?: number; shape?: "circle" | "square" | "rounded" }) {
  const borderStyle = ring ? `${ring} ${ringWidth}px solid` : undefined;
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "14px" : "0";
  const initials = data.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  if (data.photo) return <img src={data.photo} alt={data.name} style={{ width: size, height: size, borderRadius, objectFit: "cover", border: borderStyle }} />;
  return <div style={{ width: size, height: size, borderRadius, background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, border: borderStyle }}>{initials}</div>;
}

function range(start: string, end: string) {
  const s = (start ?? "").trim(); const e = (end ?? "").trim();
  if (s && e) return `${s} — ${e}`; if (s) return `${s} — Present`; return e || "";
}

// Small radial donut used by Quantum
function RadialSkill({ label, level, color }: { label: string; level: number; color: string }) {
  const size = 58;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (level / 100) * c;
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">{level}</text>
      </svg>
      <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.75)", marginTop: 4, fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
}

// =====================================================================
// 1. QUANTUM — Deep navy + cyan + violet. Diagonal clip-path header,
//    glowing radial skill chart, achievement counters, progress bars.
//    Font: Space Grotesk.
// =====================================================================
export function QuantumTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const bg = "#0a0e27";
  const cyan = "#06b6d4";
  const violet = "#8b5cf6";
  const font = "'Space Grotesk', 'Inter', system-ui, sans-serif";
  const yearsExp = data.experience.reduce((acc, e) => {
    const startYear = parseInt(e.start, 10); const endYear = e.end?.toLowerCase().includes("present") ? new Date().getFullYear() : parseInt(e.end, 10);
    if (!isNaN(startYear) && !isNaN(endYear) && endYear >= startYear) return acc + (endYear - startYear);
    return acc;
  }, 0) || data.experience.length;
  const counters = [
    { label: "YEARS_EXP", value: String(yearsExp) },
    { label: "PROJECTS_SHIPPED", value: String(data.projects.length) },
    { label: "SKILLS_INDEX", value: String(data.skills.length) },
    { label: "CERTIFICATIONS", value: String(data.certifications.length) },
  ];
  const topSkills = data.skills.slice(0, 3);
  return (
    <div className={PAPER} style={{ fontFamily: font, background: bg, color: "#e2e8f0", position: "relative", overflow: "hidden" }}>
      {/* Ambient glow blobs (decorative) */}
      <div style={{ position: "absolute", top: -120, right: -80, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${cyan}40, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 240, left: -100, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${violet}35, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }} />

      {/* Diagonal split header (clip-path cuts bottom-left corner) */}
      <div style={{ position: "relative", padding: "30px 36px 26px", background: `linear-gradient(115deg, ${violet}25 0%, ${cyan}20 60%, transparent 100%)`, clipPath: "polygon(0 0, 100% 0, 100% 86%, 0 100%)", borderBottom: `1px solid ${cyan}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, position: "relative" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -6, borderRadius: "16px", background: `linear-gradient(135deg, ${cyan}, ${violet})`, filter: "blur(8px)", opacity: 0.7 }} />
            <Avatar data={data} size={96} shape="rounded" ring={`transparent`} ringWidth={0} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "14px", border: `2px solid ${cyan}`, boxShadow: `0 0 14px ${cyan}80, inset 0 0 8px ${cyan}40`, pointerEvents: "none" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8.5, color: cyan, letterSpacing: 3, fontWeight: 600, marginBottom: 4 }}>{"> SYSTEM.ONLINE"}</div>
            <h1 style={{ fontSize: 34, fontWeight: 700, color: "white", margin: 0, letterSpacing: -1, lineHeight: 1.05 }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <div style={{ height: 2, width: 28, background: `linear-gradient(90deg, ${cyan}, ${violet})` }} />
              <p style={{ fontSize: 13, color: cyan, margin: 0, fontWeight: 500, letterSpacing: 0.5 }}>{data.title}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, fontSize: 9.5, color: "rgba(226,232,240,0.7)" }}>
              {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ color: violet }}>▸</span>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement counters strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: "18px 36px 22px" }}>
        {counters.map((c, i) => (
          <div key={i} style={{ position: "relative", padding: "12px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${cyan}25`, borderRadius: 8, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: `linear-gradient(180deg, ${cyan}, ${violet})` }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1, letterSpacing: -0.5 }}>{c.value}</div>
            <div style={{ fontSize: 7.5, color: cyan, marginTop: 4, letterSpacing: 1.2, fontWeight: 600 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column main */}
      <div style={{ display: "flex", padding: "0 36px 32px", gap: 22, position: "relative" }}>
        {/* Left rail: radial chart + skill matrix + meta */}
        <aside style={{ width: 250, flexShrink: 0 }}>
          {/* Radial chart for top skills */}
          {visible(sections, "skills") && topSkills.length > 0 && (
            <div style={{ marginBottom: 22, padding: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${cyan}25`, borderRadius: 10 }}>
              <div style={{ fontSize: 9, color: violet, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>▸ SKILL MATRIX</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                {topSkills.map((s, i) => <RadialSkill key={i} label={s} level={data.skillLevels[s] ?? 80} color={i % 2 === 0 ? cyan : violet} />)}
              </div>
            </div>
          )}
          {/* Remaining skills as glowing bars */}
          {visible(sections, "skills") && data.skills.length > 3 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 9, color: violet, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>▸ ADDITIONAL</div>
              {data.skills.slice(3).map((s, i) => {
                const lvl = data.skillLevels[s] ?? 70;
                return (
                  <div key={i} style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 9, color: "rgba(226,232,240,0.85)", fontWeight: 500 }}>{s}</span>
                      <span style={{ fontSize: 8, color: cyan, fontFamily: "monospace" }}>{lvl}%</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${lvl}%`, height: "100%", background: `linear-gradient(90deg, ${cyan}, ${violet})`, boxShadow: `0 0 6px ${cyan}90` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 9, color: violet, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>▸ LANGUAGES</div>
              {data.languages.map((l, i) => <div key={i} style={{ fontSize: 9.5, color: "rgba(226,232,240,0.8)", marginBottom: 4, paddingLeft: 10, position: "relative" }}><span style={{ position: "absolute", left: 0, color: cyan }}>◆</span>{l}</div>)}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 9, color: violet, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>▸ CERTS</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 7, padding: "7px 9px", background: "rgba(255,255,255,0.03)", border: `1px solid ${cyan}20`, borderRadius: 6, breakInside: "avoid" }}>
                  <div style={{ fontSize: 9, color: "white", fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 8, color: cyan, marginTop: 2 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: violet, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>▸ INTERESTS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.interests.map((t, i) => <span key={i} style={{ fontSize: 8.5, color: "rgba(226,232,240,0.75)", padding: "3px 7px", border: `1px solid ${violet}40`, borderRadius: 10, background: `${violet}10` }}>{t}</span>)}
              </div>
            </div>
          )}
        </aside>

        {/* Main column */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 14, height: 2, background: `linear-gradient(90deg, ${cyan}, ${violet})` }} />
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2.5, fontWeight: 700 }}>PROFILE</span>
              </div>
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "rgba(226,232,240,0.78)", margin: 0 }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 14, height: 2, background: `linear-gradient(90deg, ${cyan}, ${violet})` }} />
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2.5, fontWeight: 700 }}>EXPERIENCE</span>
              </div>
              <div style={{ position: "relative", paddingLeft: 18 }}>
                <div style={{ position: "absolute", left: 4, top: 4, bottom: 4, width: 2, background: `linear-gradient(180deg, ${cyan}, ${violet}80, transparent)` }} />
                {data.experience.map(e => (
                  <div key={e.id} style={{ marginBottom: 16, position: "relative", breakInside: "avoid" }}>
                    <div style={{ position: "absolute", left: -18, top: 4, width: 10, height: 10, borderRadius: "50%", background: bg, border: `2px solid ${cyan}`, boxShadow: `0 0 8px ${cyan}` }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{e.role}</span>
                      <span style={{ fontSize: 9, color: cyan, fontFamily: "monospace", flexShrink: 0 }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontSize: 10, color: violet, fontWeight: 600, marginBottom: 5 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                    {e.bullets.filter(b => b?.trim()).map((b, i) => (
                      <div key={i} style={{ fontSize: 10, lineHeight: 1.6, color: "rgba(226,232,240,0.78)", paddingLeft: 12, position: "relative", marginBottom: 2 }}>
                        <span style={{ position: "absolute", left: 0, color: cyan }}>▸</span>{b}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 14, height: 2, background: `linear-gradient(90deg, ${cyan}, ${violet})` }} />
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2.5, fontWeight: 700 }}>PROJECTS</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.projects.map(p => (
                  <div key={p.id} style={{ padding: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${cyan}25`, borderRadius: 8, breakInside: "avoid", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: 30, height: 30, background: `radial-gradient(circle at top right, ${violet}30, transparent 70%)` }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: "white", marginBottom: 4 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 9.5, lineHeight: 1.5, color: "rgba(226,232,240,0.7)", marginBottom: 6 }}>{p.description}</div>}
                    {p.tech.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{p.tech.map((t, i) => <span key={i} style={{ fontSize: 7.5, color: cyan, padding: "1px 5px", border: `1px solid ${cyan}40`, borderRadius: 3 }}>{t}</span>)}</div>}
                    {p.link && <div style={{ fontSize: 8, color: violet, marginTop: 6, fontFamily: "monospace" }}>↗ {p.link}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 14, height: 2, background: `linear-gradient(90deg, ${cyan}, ${violet})` }} />
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2.5, fontWeight: 700 }}>EDUCATION</span>
              </div>
              {data.education.map(ed => (
                <div key={ed.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${cyan}20`, borderRadius: 6, marginBottom: 6, breakInside: "avoid" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{ed.degree}</div>
                    <div style={{ fontSize: 9.5, color: cyan }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 9, color: "rgba(226,232,240,0.6)", fontFamily: "monospace" }}>{range(ed.start, ed.end)}</span>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "awards") && data.awards.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 14, height: 2, background: `linear-gradient(90deg, ${cyan}, ${violet})` }} />
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2.5, fontWeight: 700 }}>AWARDS</span>
              </div>
              {data.awards.map(aw => (
                <div key={aw.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(226,232,240,0.8)", marginBottom: 4, paddingLeft: 12, position: "relative", breakInside: "avoid" }}>
                  <span><span style={{ position: "absolute", left: 0, color: violet }}>★</span>{aw.title}{aw.subtitle ? ` · ${aw.subtitle}` : ""}</span>
                  <span style={{ color: cyan, fontFamily: "monospace" }}>{aw.date}</span>
                </div>
              ))}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 14, height: 2, background: `linear-gradient(90deg, ${cyan}, ${violet})` }} />
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2.5, fontWeight: 700 }}>{cs.title.toUpperCase()}</span>
              </div>
              {cs.items.map(item => (
                <div key={item.id} style={{ fontSize: 10, color: "rgba(226,232,240,0.8)", marginBottom: 4, paddingLeft: 12, position: "relative", breakInside: "avoid" }}>
                  <span style={{ position: "absolute", left: 0, color: cyan }}>▸</span>
                  <span style={{ fontWeight: 600, color: "white" }}>{item.title}</span>{item.date ? ` · ${item.date}` : ""}{item.description ? ` — ${item.description}` : ""}
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
// 2. NEBULA — Dark charcoal + emerald. Abstract wave SVG background,
//    floating info cards with soft ambient shadows, blurred gradient
//    glow, creative timeline with decorative connectors. Font: Sora.
// =====================================================================
export function NebulaTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const bg = "#1a1a1a";
  const emerald = "#10b981";
  const emeraldDark = "#047857";
  const font = "'Sora', 'Inter', system-ui, sans-serif";
  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${emerald}25`,
    borderRadius: 14,
    boxShadow: `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.05)`,
    position: "relative",
  };
  return (
    <div className={PAPER} style={{ fontFamily: font, background: bg, color: "#e5e7eb", position: "relative", overflow: "hidden", padding: "30px 32px" }}>
      {/* Abstract wave SVG background (decorative) */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.12, pointerEvents: "none" }} viewBox="0 0 794 1123" preserveAspectRatio="none">
        <path d="M-50,180 C120,120 260,240 420,180 C580,120 720,240 850,180" stroke={emerald} strokeWidth="1.2" fill="none" />
        <path d="M-50,380 C120,320 260,440 420,380 C580,320 720,440 850,380" stroke={emerald} strokeWidth="1" fill="none" opacity="0.7" />
        <path d="M-50,580 C120,520 260,640 420,580 C580,520 720,640 850,580" stroke={emerald} strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M-50,780 C120,720 260,840 420,780 C580,720 720,840 850,780" stroke={emerald} strokeWidth="0.8" fill="none" opacity="0.4" />
        <path d="M-50,980 C120,920 260,1040 420,980 C580,920 720,1040 850,980" stroke={emerald} strokeWidth="0.6" fill="none" opacity="0.3" />
      </svg>
      {/* Blurred emerald gradient glow (decorative) */}
      <div style={{ position: "absolute", top: -120, right: -100, width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, ${emerald}45, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${emeraldDark}50, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Floating header card */}
      <div style={{ ...cardStyle, padding: "22px 24px", marginBottom: 18, display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -5, borderRadius: "50%", background: `radial-gradient(circle, ${emerald}50, transparent 70%)`, filter: "blur(10px)" }} />
          <Avatar data={data} size={92} shape="rounded" ring={emerald} ringWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8.5, color: emerald, letterSpacing: 3, fontWeight: 600, marginBottom: 4 }}>PORTFOLIO · v2.0</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "white", margin: 0, letterSpacing: -0.8, lineHeight: 1.05 }}>{data.name}</h1>
          <p style={{ fontSize: 13, color: emerald, margin: "6px 0 10px", fontWeight: 500 }}>{data.title}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
              <span key={i} style={{ fontSize: 9, color: "rgba(229,231,235,0.75)", padding: "3px 9px", background: "rgba(16,185,129,0.08)", border: `1px solid ${emerald}25`, borderRadius: 10 }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary floating card */}
      {visible(sections, "summary") && data.summary && (
        <div style={{ ...cardStyle, padding: "16px 20px", marginBottom: 16, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={emerald} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 2" /></svg>
            <span style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700 }}>SUMMARY</span>
          </div>
          <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "rgba(229,231,235,0.78)", margin: 0 }}>{data.summary}</p>
        </div>
      )}

      {/* Two-column: timeline + side panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, position: "relative", zIndex: 1 }}>
        {/* Experience timeline (creative connectors) */}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ ...cardStyle, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={emerald} strokeWidth="2"><path d="M2 7l10-5 10 5-10 5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
              <span style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700 }}>EXPERIENCE TIMELINE</span>
            </div>
            <div style={{ position: "relative" }}>
              {/* Decorative vertical connector */}
              <svg style={{ position: "absolute", left: 6, top: 0, height: "100%", width: 30, pointerEvents: "none" }} preserveAspectRatio="none">
                <line x1="6" y1="0" x2="6" y2="100%" stroke={emerald} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              </svg>
              {data.experience.map((e, idx) => (
                <div key={e.id} style={{ marginBottom: 16, paddingLeft: 32, position: "relative", breakInside: "avoid" }}>
                  {/* Glowing connector dot */}
                  <div style={{ position: "absolute", left: 0, top: 4, width: 14, height: 14, borderRadius: "50%", background: bg, border: `2px solid ${emerald}`, boxShadow: `0 0 10px ${emerald}` }} />
                  <div style={{ position: "absolute", left: 14, top: 11, width: 14, height: 1, background: emerald, opacity: 0.6 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: emerald, fontWeight: 600 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: emerald, fontWeight: 600, marginBottom: 6 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  {e.bullets.filter(b => b?.trim()).map((b, i) => (
                    <div key={i} style={{ fontSize: 9.5, lineHeight: 1.6, color: "rgba(229,231,235,0.75)", paddingLeft: 12, position: "relative", marginBottom: 2 }}>
                      <span style={{ position: "absolute", left: 0, color: emerald }}>›</span>{b}
                    </div>
                  ))}
                  {idx < data.experience.length - 1 && <div style={{ height: 6 }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side stack: skills + meta */}
        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...cardStyle, padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={emerald} strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                <span style={{ fontSize: 10.5, color: "white", letterSpacing: 1.8, fontWeight: 700 }}>SKILLS</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ fontSize: 9, color: "rgba(229,231,235,0.9)", padding: "4px 8px", background: `linear-gradient(135deg, ${emerald}18, ${emeraldDark}10)`, border: `1px solid ${emerald}30`, borderRadius: 6, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...cardStyle, padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={emerald} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                <span style={{ fontSize: 10.5, color: "white", letterSpacing: 1.8, fontWeight: 700 }}>PROJECTS</span>
              </div>
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 8.5, color: "rgba(229,231,235,0.7)", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 7.5, color: emerald, marginTop: 3 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...cardStyle, padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 1.8, fontWeight: 700, marginBottom: 8 }}>EDUCATION</div>
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{ed.degree}</div>
                  <div style={{ fontSize: 9, color: emerald }}>{ed.school}</div>
                  <div style={{ fontSize: 8, color: "rgba(229,231,235,0.5)" }}>{range(ed.start, ed.end)}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...cardStyle, padding: "14px 18px", marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 1.8, fontWeight: 700, marginBottom: 8 }}>LANGUAGES</div>
              <div style={{ fontSize: 9.5, color: "rgba(229,231,235,0.85)", lineHeight: 1.7 }}>{data.languages.join(" · ")}</div>
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...cardStyle, padding: "14px 18px", marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 1.8, fontWeight: 700, marginBottom: 8 }}>CERTIFICATIONS</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 9, color: "rgba(229,231,235,0.8)", marginBottom: 4, breakInside: "avoid" }}><span style={{ color: emerald }}>✓</span> {c.title}</div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...cardStyle, padding: "14px 18px" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 1.8, fontWeight: 700, marginBottom: 8 }}>INTERESTS</div>
              <div style={{ fontSize: 9, color: "rgba(229,231,235,0.8)", lineHeight: 1.7 }}>{data.interests.join(" · ")}</div>
            </div>
          )}
        </div>
      </div>

      {/* Awards full-width card */}
      {visible(sections, "awards") && data.awards.length > 0 && (
        <div style={{ ...cardStyle, padding: "16px 20px", marginTop: 14, position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>AWARDS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {data.awards.map(aw => (
              <div key={aw.id} style={{ fontSize: 9.5, color: "rgba(229,231,235,0.85)", breakInside: "avoid" }}><span style={{ color: emerald, marginRight: 6 }}>★</span><span style={{ fontWeight: 600, color: "white" }}>{aw.title}</span>{aw.date ? ` · ${aw.date}` : ""}</div>
            ))}
          </div>
        </div>
      )}

      {/* Custom sections */}
      {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
        <div key={cs.id} style={{ ...cardStyle, padding: "16px 20px", marginTop: 14, position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>{cs.title.toUpperCase()}</div>
          {cs.items.map(item => (
            <div key={item.id} style={{ fontSize: 9.5, color: "rgba(229,231,235,0.8)", marginBottom: 4, breakInside: "avoid" }}>
              <span style={{ color: emerald, marginRight: 6 }}>›</span>
              <span style={{ fontWeight: 600, color: "white" }}>{item.title}</span>{item.date ? ` · ${item.date}` : ""}{item.description ? ` — ${item.description}` : ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 3. CYBER — Black + electric blue. Wireframe dotted grid background
//    (radial-gradient), monospace data-viz style, terminal section
//    headers, monospace counter boxes. Font: JetBrains Mono / Fira Code.
// =====================================================================
export function CyberTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const bg = "#0a0a0a";
  const blue = "#3b82f6";
  const blueBright = "#60a5fa";
  const font = "'JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', monospace";
  const yearsExp = data.experience.reduce((acc, e) => {
    const s = parseInt(e.start, 10); const en = e.end?.toLowerCase().includes("present") ? new Date().getFullYear() : parseInt(e.end, 10);
    if (!isNaN(s) && !isNaN(en) && en >= s) return acc + (en - s);
    return acc;
  }, 0) || data.experience.length;
  const counters = [
    { label: "YRS_EXP", value: String(yearsExp).padStart(2, "0") },
    { label: "PROJECTS", value: String(data.projects.length).padStart(2, "0") },
    { label: "SKILLS", value: String(data.skills.length).padStart(2, "0") },
    { label: "CERTS", value: String(data.certifications.length).padStart(2, "0") },
  ];
  const terminalHeader = (label: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 11, color: blueBright, fontWeight: 700, letterSpacing: 0.5 }}>
      <span style={{ color: blue }}>{">"}</span>
      <span>{label.toLowerCase()}</span>
      <span style={{ display: "inline-block", width: 7, height: 12, background: blueBright, marginLeft: 2 }} />
      <span style={{ flex: 1, height: 1, background: `${blue}30`, marginLeft: 6 }} />
    </div>
  );
  return (
    <div className={PAPER} style={{ fontFamily: font, background: bg, color: "#d1d5db", position: "relative", overflow: "hidden", padding: "26px 30px" }}>
      {/* Wireframe dotted grid background (decorative) */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${blue}22 1px, transparent 1px)`, backgroundSize: "16px 16px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${blue}, ${blueBright}, ${blue})` }} />

      {/* Terminal header */}
      <div style={{ position: "relative", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "6px 10px", background: "rgba(59,130,246,0.05)", border: `1px solid ${blue}40`, borderRadius: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#eab308" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 9, color: "rgba(96,165,250,0.7)", marginLeft: 8 }}>~/resume/{data.name.toLowerCase().replace(/\s+/g, "_")}.md</span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ position: "relative" }}>
            {/* Wireframe corners around avatar */}
            <div style={{ position: "absolute", top: -4, left: -4, width: 12, height: 12, borderTop: `2px solid ${blue}`, borderLeft: `2px solid ${blue}` }} />
            <div style={{ position: "absolute", top: -4, right: -4, width: 12, height: 12, borderTop: `2px solid ${blue}`, borderRight: `2px solid ${blue}` }} />
            <div style={{ position: "absolute", bottom: -4, left: -4, width: 12, height: 12, borderBottom: `2px solid ${blue}`, borderLeft: `2px solid ${blue}` }} />
            <div style={{ position: "absolute", bottom: -4, right: -4, width: 12, height: 12, borderBottom: `2px solid ${blue}`, borderRight: `2px solid ${blue}` }} />
            <Avatar data={data} size={88} shape="square" ring={blue} ringWidth={1} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: blue, marginBottom: 4 }}>{`$ whoami`}</div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: "white", margin: 0, letterSpacing: -0.5, lineHeight: 1.05 }}>{data.name}</h1>
            <div style={{ fontSize: 9, color: blue, marginTop: 4 }}>{`# ${data.title}`}</div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 14px", fontSize: 9, color: "rgba(209,213,221,0.8)" }}>
              {[
                ["email", data.email], ["phone", data.phone], ["location", data.location], ["linkedin", data.linkedin], ["github", data.github], ["website", data.website],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><span style={{ color: blueBright }}>{k}:</span> <span style={{ color: "rgba(209,213,221,0.7)" }}>{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement counters in monospace boxes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20, position: "relative" }}>
        {counters.map((c, i) => (
          <div key={i} style={{ padding: "10px 12px", background: "rgba(59,130,246,0.06)", border: `1px solid ${blue}40`, position: "relative" }}>
            <div style={{ position: "absolute", top: -1, left: -1, width: 8, height: 8, borderTop: `1px solid ${blueBright}`, borderLeft: `1px solid ${blueBright}` }} />
            <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderBottom: `1px solid ${blueBright}`, borderRight: `1px solid ${blueBright}` }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 7.5, color: blueBright, marginTop: 4, letterSpacing: 1 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column main */}
      <div style={{ display: "flex", gap: 18, position: "relative" }}>
        {/* Left: skills, languages, certs */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {terminalHeader("skills")}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ fontSize: 9, color: blueBright, padding: "3px 7px", background: `${blue}15`, border: `1px solid ${blue}40`, fontWeight: 600 }}>[{s}]</span>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {terminalHeader("languages")}
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 9.5, color: "rgba(209,213,221,0.85)", marginBottom: 3 }}><span style={{ color: blueBright }}>{">"}</span> {l}</div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {terminalHeader("certifications")}
              {data.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 9, color: "rgba(209,213,221,0.85)", marginBottom: 6, breakInside: "avoid" }}>
                  <div><span style={{ color: blueBright }}>+</span> <span style={{ color: "white", fontWeight: 600 }}>{c.title}</span></div>
                  <div style={{ paddingLeft: 12, color: "rgba(96,165,250,0.7)" }}>{`└─ ${c.subtitle}${c.date ? ` (${c.date})` : ""}`}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div>
              {terminalHeader("interests")}
              {data.interests.map((t, i) => (
                <div key={i} style={{ fontSize: 9, color: "rgba(209,213,221,0.8)", marginBottom: 2 }}><span style={{ color: blueBright }}>#</span> {t}</div>
              ))}
            </div>
          )}
        </aside>

        {/* Right: profile, experience, projects, education */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 18 }}>
              {terminalHeader("profile")}
              <div style={{ fontSize: 9.5, lineHeight: 1.7, color: "rgba(209,213,221,0.8)", paddingLeft: 12, borderLeft: `2px solid ${blue}40` }}>{data.summary}</div>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {terminalHeader("experience")}
              {data.experience.map((e, idx) => (
                <div key={e.id} style={{ marginBottom: 12, breakInside: "avoid" }}>
                  <div style={{ fontSize: 9, color: blueBright, marginBottom: 2 }}>{`[role_${idx + 1}]`}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: blueBright }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 9.5, color: blue, marginBottom: 5 }}>{`@ ${e.company}`}{e.location ? ` :: ${e.location}` : ""}</div>
                  {e.bullets.filter(b => b?.trim()).map((b, i) => (
                    <div key={i} style={{ fontSize: 9.5, lineHeight: 1.6, color: "rgba(209,213,221,0.78)", paddingLeft: 14, position: "relative", marginBottom: 2 }}>
                      <span style={{ position: "absolute", left: 0, color: blueBright }}>{">"}</span>{b}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {terminalHeader("projects")}
              {data.projects.map((p, idx) => (
                <div key={p.id} style={{ marginBottom: 8, breakInside: "avoid", padding: "8px 10px", background: "rgba(59,130,246,0.04)", border: `1px solid ${blue}30` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "white" }}>{`[${idx + 1}] ${p.name}`}</span>
                    {p.link && <span style={{ fontSize: 8, color: blueBright }}>↗ {p.link}</span>}
                  </div>
                  {p.description && <div style={{ fontSize: 9, color: "rgba(209,213,221,0.75)", lineHeight: 1.5, marginTop: 3 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 8, color: blueBright, marginTop: 4 }}>{`stack: [${p.tech.join(", ")}]`}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {terminalHeader("education")}
              {data.education.map((ed, idx) => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" }}>
                  <div style={{ fontSize: 9, color: blueBright }}>{`[edu_${idx + 1}]`}</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "white" }}>{ed.degree}</span>
                    <span style={{ fontSize: 9, color: blueBright }}>{range(ed.start, ed.end)}</span>
                  </div>
                  <div style={{ fontSize: 9, color: blue }}>{`${ed.school}${ed.grade ? ` :: ${ed.grade}` : ""}`}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "awards") && data.awards.length > 0 && (
            <div>
              {terminalHeader("awards")}
              {data.awards.map((aw, i) => (
                <div key={i} style={{ fontSize: 9.5, color: "rgba(209,213,221,0.85)", marginBottom: 4, breakInside: "avoid" }}>
                  <span style={{ color: blueBright }}>{">"}</span> <span style={{ color: "white", fontWeight: 600 }}>{aw.title}</span>{aw.subtitle ? ` @ ${aw.subtitle}` : ""}{aw.date ? ` [${aw.date}]` : ""}
                </div>
              ))}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ marginBottom: 18 }}>
              {terminalHeader(cs.title)}
              {cs.items.map(item => (
                <div key={item.id} style={{ fontSize: 9.5, color: "rgba(209,213,221,0.85)", marginBottom: 4, breakInside: "avoid" }}>
                  <span style={{ color: blueBright }}>{">"}</span> <span style={{ color: "white", fontWeight: 600 }}>{item.title}</span>{item.date ? ` [${item.date}]` : ""}{item.description ? ` — ${item.description}` : ""}
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
// 4. VOLTAGE — Dark navy + coral. Overlapping cards with slight
//    rotation, gradient glows behind cards, creative vertical timeline
//    with glowing dots. Font: Manrope.
// =====================================================================
export function VoltageTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const bg = "#0f172a";
  const coral = "#fb7185";
  const coralDark = "#e11d48";
  const slate = "#1e293b";
  const font = "'Manrope', 'Inter', system-ui, sans-serif";
  const cardBase: React.CSSProperties = {
    background: `linear-gradient(160deg, ${slate}, ${bg})`,
    border: `1px solid ${coral}25`,
    borderRadius: 14,
    boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
    position: "relative",
  };
  return (
    <div className={PAPER} style={{ fontFamily: font, background: bg, color: "#e2e8f0", position: "relative", overflow: "hidden", padding: "32px 32px 28px" }}>
      {/* Coral gradient glow background (decorative) */}
      <div style={{ position: "absolute", top: -100, left: -120, width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, ${coral}40, transparent 70%)`, filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 100, right: -100, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${coralDark}35, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Header (overlapping layout: name card on top of photo card) */}
      <div style={{ position: "relative", marginBottom: 26, zIndex: 2 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 0 }}>
          {/* Avatar card (rotated slightly) */}
          <div style={{ transform: "rotate(-2deg)", marginRight: -28, zIndex: 1, position: "relative" }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: `radial-gradient(circle, ${coral}55, transparent 70%)`, filter: "blur(14px)" }} />
            <Avatar data={data} size={96} shape="circle" ring={coral} ringWidth={3} />
          </div>
          {/* Name card */}
          <div style={{ ...cardBase, flex: 1, padding: "18px 22px 16px 38px", transform: "rotate(0.3deg)", zIndex: 2 }}>
            <div style={{ fontSize: 8.5, color: coral, letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>● PORTFOLIO_2024</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "white", margin: 0, letterSpacing: -1, lineHeight: 1.05, textShadow: `0 0 18px ${coral}50` }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <div style={{ height: 2, width: 24, background: coral }} />
              <p style={{ fontSize: 12.5, color: coral, margin: 0, fontWeight: 600 }}>{data.title}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10, fontSize: 9, color: "rgba(226,232,240,0.7)" }}>
              {[data.email, data.phone, data.location].filter(Boolean).map((c, i) => <span key={i}>· {c}</span>)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4, fontSize: 9, color: "rgba(226,232,240,0.55)" }}>
              {[data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => <span key={i}>↗ {c}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement counters (3 boxes) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22, position: "relative", zIndex: 2 }}>
        {[
          { label: "YEARS EXPERIENCE", value: String(data.experience.length) },
          { label: "PROJECTS SHIPPED", value: String(data.projects.length) },
          { label: "SKILLS MASTERED", value: String(data.skills.length) },
        ].map((c, i) => (
          <div key={i} style={{ ...cardBase, padding: "14px 16px", textAlign: "left", transform: i === 1 ? "rotate(0.5deg)" : "rotate(0deg)" }}>
            <div style={{ position: "absolute", top: -8, right: -8, width: 16, height: 16, borderRadius: "50%", background: `radial-gradient(circle, ${coral}, transparent 70%)`, filter: "blur(4px)" }} />
            <div style={{ fontSize: 26, fontWeight: 800, color: "white", lineHeight: 1, letterSpacing: -1 }}>{c.value}</div>
            <div style={{ fontSize: 8, color: coral, marginTop: 5, letterSpacing: 1.5, fontWeight: 700 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column: timeline + side */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, position: "relative", zIndex: 2 }}>
        {/* Experience vertical timeline with glowing dots */}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ ...cardBase, padding: "20px 22px", transform: "rotate(-0.3deg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 18, background: coral, borderRadius: 2, boxShadow: `0 0 10px ${coral}` }} />
              <span style={{ fontSize: 11.5, color: "white", letterSpacing: 2, fontWeight: 800 }}>EXPERIENCE</span>
            </div>
            <div style={{ position: "relative", paddingLeft: 22 }}>
              {/* Glowing vertical line */}
              <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: `linear-gradient(180deg, ${coral}, ${coralDark}40, transparent)` }} />
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 16, position: "relative", breakInside: "avoid" }}>
                  {/* Glowing dot */}
                  <div style={{ position: "absolute", left: -22, top: 4, width: 12, height: 12, borderRadius: "50%", background: bg, border: `2px solid ${coral}`, boxShadow: `0 0 10px ${coral}, 0 0 4px ${coral}` }} />
                  <div style={{ position: "absolute", left: -10, top: 10, width: 10, height: 1, background: coral, opacity: 0.6 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: coral, fontWeight: 600 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: coral, fontWeight: 600, marginBottom: 5 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                  {e.bullets.filter(b => b?.trim()).map((b, i) => (
                    <div key={i} style={{ fontSize: 10, lineHeight: 1.6, color: "rgba(226,232,240,0.78)", paddingLeft: 12, position: "relative", marginBottom: 2 }}>
                      <span style={{ position: "absolute", left: 0, color: coral }}>▸</span>{b}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side stack */}
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...cardBase, padding: "14px 16px", marginBottom: 12, transform: "rotate(0.5deg)" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>PROFILE</div>
              <p style={{ fontSize: 9.5, lineHeight: 1.65, color: "rgba(226,232,240,0.78)", margin: 0 }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...cardBase, padding: "14px 16px", marginBottom: 12, transform: "rotate(-0.4deg)" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>SKILLS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ fontSize: 9, color: "white", padding: "3px 8px", background: `${coral}20`, border: `1px solid ${coral}40`, borderRadius: 4, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...cardBase, padding: "14px 16px", marginBottom: 12, transform: "rotate(0.3deg)" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>PROJECTS</div>
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 7, breakInside: "avoid" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 8.5, color: "rgba(226,232,240,0.7)", lineHeight: 1.45, marginTop: 2 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontSize: 7.5, color: coral, marginTop: 3 }}>{p.tech.join(" · ")}</div>}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...cardBase, padding: "14px 16px", marginBottom: 12, transform: "rotate(-0.3deg)" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>EDUCATION</div>
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 6, breakInside: "avoid" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{ed.degree}</div>
                  <div style={{ fontSize: 9, color: coral }}>{ed.school}</div>
                  <div style={{ fontSize: 8, color: "rgba(226,232,240,0.55)" }}>{range(ed.start, ed.end)}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...cardBase, padding: "14px 16px", marginBottom: 12, transform: "rotate(0.4deg)" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>CERTIFICATIONS</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 9, color: "rgba(226,232,240,0.85)", marginBottom: 4, breakInside: "avoid" }}><span style={{ color: coral, marginRight: 5 }}>✦</span>{c.title}</div>
              ))}
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...cardBase, padding: "14px 16px", marginBottom: 12, transform: "rotate(-0.5deg)" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>LANGUAGES</div>
              <div style={{ fontSize: 9.5, color: "rgba(226,232,240,0.85)", lineHeight: 1.7 }}>{data.languages.join(" · ")}</div>
            </div>
          )}
          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...cardBase, padding: "14px 16px", transform: "rotate(0.3deg)" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>AWARDS</div>
              {data.awards.map((aw, i) => (
                <div key={i} style={{ fontSize: 9, color: "rgba(226,232,240,0.85)", marginBottom: 4, breakInside: "avoid" }}><span style={{ color: coral, marginRight: 5 }}>★</span>{aw.title}{aw.date ? ` · ${aw.date}` : ""}</div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...cardBase, padding: "14px 16px", marginTop: 12, transform: "rotate(-0.4deg)" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>INTERESTS</div>
              <div style={{ fontSize: 9, color: "rgba(226,232,240,0.8)", lineHeight: 1.7 }}>{data.interests.join(" · ")}</div>
            </div>
          )}
        </div>
      </div>

      {/* Custom sections */}
      {data.customSections.filter(cs => cs.items.length > 0).map((cs, idx) => (
        <div key={cs.id} style={{ ...cardBase, padding: "14px 18px", marginTop: 12, transform: idx % 2 === 0 ? "rotate(-0.3deg)" : "rotate(0.3deg)", position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>{cs.title.toUpperCase()}</div>
          {cs.items.map(item => (
            <div key={item.id} style={{ fontSize: 9.5, color: "rgba(226,232,240,0.85)", marginBottom: 4, breakInside: "avoid" }}>
              <span style={{ color: coral, marginRight: 5 }}>▸</span>
              <span style={{ fontWeight: 700, color: "white" }}>{item.title}</span>{item.date ? ` · ${item.date}` : ""}{item.description ? ` — ${item.description}` : ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 5. SYNTHWAVE — Deep purple + pink + cyan. Retro-futuristic, glowing
//    neon borders, decorative gradient connectors, perspective grid
//    floor effect at bottom. Font: Space Grotesk.
// =====================================================================
export function SynthwaveTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const bg = "#1e1b4b";
  const bgDeep = "#0f0a2e";
  const pink = "#ec4899";
  const cyan = "#06b6d4";
  const font = "'Space Grotesk', 'Inter', system-ui, sans-serif";
  const neonCard: React.CSSProperties = {
    background: "rgba(30, 27, 75, 0.6)",
    border: `1px solid ${pink}50`,
    borderRadius: 12,
    boxShadow: `0 0 18px ${pink}30, inset 0 0 20px rgba(236, 72, 153, 0.04)`,
    position: "relative",
  };
  return (
    <div className={PAPER} style={{ fontFamily: font, background: `linear-gradient(180deg, ${bg} 0%, ${bgDeep} 100%)`, color: "#e9d5ff", position: "relative", overflow: "hidden", padding: "32px 32px 56px" }}>
      {/* Top gradient glow (decorative) */}
      <div style={{ position: "absolute", top: -120, left: "20%", width: 500, height: 300, borderRadius: "50%", background: `radial-gradient(ellipse, ${pink}40, transparent 70%)`, filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -80, right: "10%", width: 380, height: 280, borderRadius: "50%", background: `radial-gradient(ellipse, ${cyan}35, transparent 70%)`, filter: "blur(70px)", pointerEvents: "none" }} />

      {/* Perspective grid floor at bottom (decorative) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, perspective: "300px", pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: -100, right: -100, bottom: -50, transform: "rotateX(60deg)", transformOrigin: "bottom", backgroundImage: `linear-gradient(${pink}50 1px, transparent 1px), linear-gradient(90deg, ${cyan}50 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(180deg, transparent, ${bgDeep})` }} />
      </div>

      {/* Decorative sun circle (retro-futuristic) */}
      <div style={{ position: "absolute", top: 20, right: 30, width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(180deg, ${pink}, ${cyan})`, opacity: 0.2, filter: "blur(2px)", pointerEvents: "none" }} />

      {/* Header card with neon glowing border */}
      <div style={{ ...neonCard, padding: "22px 24px", marginBottom: 18, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `2px solid ${pink}`, boxShadow: `0 0 16px ${pink}, 0 0 30px ${pink}50, inset 0 0 10px ${pink}40` }} />
            <Avatar data={data} size={92} shape="circle" ring={cyan} ringWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8.5, letterSpacing: 4, fontWeight: 700, marginBottom: 4, background: `linear-gradient(90deg, ${pink}, ${cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{"// SYSTEM_READY"}</div>
            <h1 style={{ fontSize: 34, fontWeight: 700, color: "white", margin: 0, letterSpacing: -1, lineHeight: 1.05, textShadow: `0 0 18px ${pink}80, 0 0 4px ${cyan}50` }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <div style={{ height: 2, width: 32, background: `linear-gradient(90deg, ${pink}, ${cyan})`, boxShadow: `0 0 8px ${pink}` }} />
              <p style={{ fontSize: 13, color: cyan, margin: 0, fontWeight: 500, textShadow: `0 0 8px ${cyan}80` }}>{data.title}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10, fontSize: 9, color: "rgba(233, 213, 255, 0.75)" }}>
              {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ color: pink }}>◆</span>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement counters with neon borders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18, position: "relative", zIndex: 1 }}>
        {[
          { label: "EXPERIENCE", value: `${data.experience.length}+` },
          { label: "PROJECTS", value: String(data.projects.length) },
          { label: "SKILLS", value: String(data.skills.length) },
          { label: "CERTS", value: String(data.certifications.length) },
        ].map((c, i) => (
          <div key={i} style={{ padding: "12px 12px", background: "rgba(30, 27, 75, 0.5)", border: `1px solid ${i % 2 === 0 ? pink : cyan}50`, borderRadius: 8, boxShadow: `0 0 12px ${i % 2 === 0 ? pink : cyan}25` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1, textShadow: `0 0 8px ${i % 2 === 0 ? pink : cyan}` }}>{c.value}</div>
            <div style={{ fontSize: 7.5, color: i % 2 === 0 ? pink : cyan, marginTop: 4, letterSpacing: 1.5, fontWeight: 700 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Decorative gradient connector line (between header and content) */}
      <div style={{ position: "relative", zIndex: 1, height: 2, background: `linear-gradient(90deg, transparent, ${pink}, ${cyan}, transparent)`, marginBottom: 16, boxShadow: `0 0 8px ${pink}` }} />

      {/* Two-column main */}
      <div style={{ display: "flex", gap: 14, position: "relative", zIndex: 1 }}>
        {/* Left rail */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...neonCard, padding: "16px 16px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ color: pink, fontSize: 12 }}>◈</span>
                <span style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 700, textShadow: `0 0 8px ${pink}` }}>SKILLS</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ fontSize: 9, color: "white", padding: "3px 8px", background: `${pink}15`, border: `1px solid ${pink}50`, borderRadius: 4, boxShadow: `0 0 6px ${pink}20`, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...neonCard, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 700, marginBottom: 8, textShadow: `0 0 8px ${cyan}` }}>LANGUAGES</div>
              {data.languages.map((l, i) => <div key={i} style={{ fontSize: 9.5, color: "rgba(233, 213, 255, 0.85)", marginBottom: 3 }}><span style={{ color: cyan }}>▸</span> {l}</div>)}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...neonCard, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 700, marginBottom: 8, textShadow: `0 0 8px ${pink}` }}>CERTIFICATIONS</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 6, breakInside: "avoid" }}>
                  <div style={{ fontSize: 9, color: "white", fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 8, color: pink }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...neonCard, padding: "14px 16px" }}>
              <div style={{ fontSize: 10.5, color: "white", letterSpacing: 2, fontWeight: 700, marginBottom: 8, textShadow: `0 0 8px ${cyan}` }}>INTERESTS</div>
              <div style={{ fontSize: 9, color: "rgba(233, 213, 255, 0.8)", lineHeight: 1.7 }}>{data.interests.join(" · ")}</div>
            </div>
          )}
        </aside>

        {/* Main column */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...neonCard, padding: "14px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ color: pink, fontSize: 12 }}>◈</span>
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700, textShadow: `0 0 8px ${pink}` }}>PROFILE</span>
              </div>
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "rgba(233, 213, 255, 0.82)", margin: 0 }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...neonCard, padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ color: cyan, fontSize: 12 }}>◈</span>
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700, textShadow: `0 0 8px ${cyan}` }}>EXPERIENCE</span>
              </div>
              <div style={{ position: "relative", paddingLeft: 18 }}>
                {/* Gradient connector line */}
                <div style={{ position: "absolute", left: 4, top: 4, bottom: 4, width: 2, background: `linear-gradient(180deg, ${pink}, ${cyan})`, boxShadow: `0 0 8px ${pink}` }} />
                {data.experience.map(e => (
                  <div key={e.id} style={{ marginBottom: 12, position: "relative", breakInside: "avoid" }}>
                    {/* Glowing pink dot */}
                    <div style={{ position: "absolute", left: -18, top: 4, width: 10, height: 10, borderRadius: "50%", background: bg, border: `2px solid ${pink}`, boxShadow: `0 0 10px ${pink}, 0 0 4px ${pink}` }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "white", textShadow: `0 0 6px ${pink}50` }}>{e.role}</span>
                      <span style={{ fontSize: 9, color: cyan, fontWeight: 600 }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontSize: 10, color: pink, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                    {e.bullets.filter(b => b?.trim()).map((b, i) => (
                      <div key={i} style={{ fontSize: 10, lineHeight: 1.6, color: "rgba(233, 213, 255, 0.78)", paddingLeft: 12, position: "relative", marginBottom: 2 }}>
                        <span style={{ position: "absolute", left: 0, color: cyan }}>▸</span>{b}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...neonCard, padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ color: pink, fontSize: 12 }}>◈</span>
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700, textShadow: `0 0 8px ${pink}` }}>PROJECTS</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {data.projects.map(p => (
                  <div key={p.id} style={{ padding: 10, background: "rgba(236, 72, 153, 0.05)", border: `1px solid ${pink}30`, borderRadius: 6, breakInside: "avoid" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "white", marginBottom: 3 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 9, lineHeight: 1.5, color: "rgba(233, 213, 255, 0.7)", marginBottom: 5 }}>{p.description}</div>}
                    {p.tech.length > 0 && <div style={{ fontSize: 7.5, color: cyan }}>{p.tech.join(" · ")}</div>}
                    {p.link && <div style={{ fontSize: 8, color: pink, marginTop: 4 }}>↗ {p.link}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...neonCard, padding: "14px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ color: cyan, fontSize: 12 }}>◈</span>
                <span style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700, textShadow: `0 0 8px ${cyan}` }}>EDUCATION</span>
              </div>
              {data.education.map(ed => (
                <div key={ed.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 10, breakInside: "avoid" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "white" }}>{ed.degree}</span>
                    <div style={{ fontSize: 9, color: pink }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 9, color: cyan, fontFamily: "monospace" }}>{range(ed.start, ed.end)}</span>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...neonCard, padding: "14px 18px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700, marginBottom: 8, textShadow: `0 0 8px ${pink}` }}>◈ AWARDS</div>
              {data.awards.map(aw => (
                <div key={aw.id} style={{ fontSize: 9.5, color: "rgba(233, 213, 255, 0.85)", marginBottom: 3, breakInside: "avoid" }}><span style={{ color: pink }}>★</span> <span style={{ color: "white", fontWeight: 600 }}>{aw.title}</span>{aw.date ? ` · ${aw.date}` : ""}</div>
              ))}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...neonCard, padding: "14px 18px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "white", letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>◈ {cs.title.toUpperCase()}</div>
              {cs.items.map(item => (
                <div key={item.id} style={{ fontSize: 9.5, color: "rgba(233, 213, 255, 0.85)", marginBottom: 3, breakInside: "avoid" }}>
                  <span style={{ color: pink, marginRight: 4 }}>▸</span>
                  <span style={{ fontWeight: 700, color: "white" }}>{item.title}</span>{item.date ? ` · ${item.date}` : ""}{item.description ? ` — ${item.description}` : ""}
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
// 6. HOLOGRAM — Light theme with translucent frosted-glass panels
//    (backdrop-filter: blur), blurred pastel gradient background,
//    neon highlights, minimalist UI cards with thin borders. Font: Manrope.
// =====================================================================
export function HologramTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const cyan = "#06b6d4";
  const pink = "#ec4899";
  const violet = "#8b5cf6";
  const font = "'Manrope', 'Inter', system-ui, sans-serif";
  const glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.9)",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
    position: "relative",
  };
  const headerLabel = (label: string, color: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      <span style={{ fontSize: 11, color: "#1e293b", letterSpacing: 2, fontWeight: 700 }}>{label.toUpperCase()}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}40, transparent)` }} />
    </div>
  );
  return (
    <div className={PAPER} style={{ fontFamily: font, background: "#fafbff", color: "#1e293b", position: "relative", overflow: "hidden", padding: "32px 32px 32px" }}>
      {/* Blurred pastel gradient blobs (decorative) */}
      <div style={{ position: "absolute", top: -120, left: -120, width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, ${cyan}40, transparent 70%)`, filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 120, right: -100, width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, ${pink}35, transparent 70%)`, filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: "30%", width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, ${violet}30, transparent 70%)`, filter: "blur(70px)", pointerEvents: "none" }} />

      {/* Frosted glass header */}
      <div style={{ ...glass, padding: "22px 26px", marginBottom: 18, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: `linear-gradient(135deg, ${cyan}, ${pink}, ${violet})`, filter: "blur(4px)", opacity: 0.6 }} />
            <Avatar data={data} size={94} shape="circle" ring="rgba(255,255,255,0.9)" ringWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8.5, letterSpacing: 3, fontWeight: 700, marginBottom: 4, background: `linear-gradient(90deg, ${cyan}, ${violet})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{"// HOLOGRAM_PROFILE"}</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: -1, lineHeight: 1.05 }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <div style={{ height: 2, width: 28, background: `linear-gradient(90deg, ${cyan}, ${violet})` }} />
              <p style={{ fontSize: 13, color: "#475569", margin: 0, fontWeight: 600 }}>{data.title}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ fontSize: 9, color: "#475569", padding: "3px 9px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.95)", borderRadius: 10, boxShadow: `0 1px 3px ${[cyan, pink, violet][i % 3]}20` }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement counters as frosted pills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18, position: "relative", zIndex: 1 }}>
        {[
          { label: "EXPERIENCE", value: `${data.experience.length}+`, color: cyan },
          { label: "PROJECTS", value: String(data.projects.length), color: pink },
          { label: "SKILLS", value: String(data.skills.length), color: violet },
          { label: "CERTS", value: String(data.certifications.length), color: cyan },
        ].map((c, i) => (
          <div key={i} style={{ ...glass, padding: "12px 14px", textAlign: "left" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1, letterSpacing: -0.5 }}>{c.value}</div>
            <div style={{ fontSize: 7.5, color: c.color, marginTop: 4, letterSpacing: 1.5, fontWeight: 700 }}>{c.label}</div>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: c.color, borderRadius: "16px 0 0 16px", opacity: 0.6 }} />
          </div>
        ))}
      </div>

      {/* Two-column main */}
      <div style={{ display: "flex", gap: 14, position: "relative", zIndex: 1 }}>
        {/* Left rail */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...glass, padding: "16px 18px", marginBottom: 12 }}>
              {headerLabel("Skills", cyan)}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {data.skills.map((s, i) => {
                  const lvl = data.skillLevels[s] ?? 70;
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 9.5, color: "#334155", fontWeight: 600 }}>{s}</span>
                        <span style={{ fontSize: 8, color: cyan, fontFamily: "monospace" }}>{lvl}%</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(15,23,42,0.08)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${lvl}%`, height: "100%", background: `linear-gradient(90deg, ${cyan}, ${violet})`, boxShadow: `0 0 6px ${cyan}60` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...glass, padding: "14px 18px", marginBottom: 12 }}>
              {headerLabel("Languages", violet)}
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 9.5, color: "#475569", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: violet }} />{l}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...glass, padding: "14px 18px", marginBottom: 12 }}>
              {headerLabel("Certifications", pink)}
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 7, breakInside: "avoid" }}>
                  <div style={{ fontSize: 9.5, color: "#1e293b", fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 8.5, color: pink }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...glass, padding: "14px 18px" }}>
              {headerLabel("Interests", cyan)}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.interests.map((t, i) => (
                  <span key={i} style={{ fontSize: 8.5, color: "#475569", padding: "3px 8px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 8 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main column */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...glass, padding: "16px 20px", marginBottom: 12 }}>
              {headerLabel("Profile", violet)}
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#475569", margin: 0 }}>{data.summary}</p>
            </div>
          )}
          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...glass, padding: "16px 20px", marginBottom: 12 }}>
              {headerLabel("Experience", cyan)}
              <div style={{ position: "relative", paddingLeft: 18 }}>
                <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 2, background: `linear-gradient(180deg, ${cyan}, ${violet})`, opacity: 0.4 }} />
                {data.experience.map(e => (
                  <div key={e.id} style={{ marginBottom: 12, position: "relative", breakInside: "avoid" }}>
                    <div style={{ position: "absolute", left: -18, top: 4, width: 10, height: 10, borderRadius: "50%", background: "white", border: `2px solid ${cyan}`, boxShadow: `0 0 8px ${cyan}60` }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{e.role}</span>
                      <span style={{ fontSize: 9, color: cyan, fontWeight: 600 }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontSize: 10, color: violet, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                    {e.bullets.filter(b => b?.trim()).map((b, i) => (
                      <div key={i} style={{ fontSize: 10, lineHeight: 1.6, color: "#475569", paddingLeft: 12, position: "relative", marginBottom: 2 }}>
                        <span style={{ position: "absolute", left: 0, color: cyan }}>▸</span>{b}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...glass, padding: "16px 20px", marginBottom: 12 }}>
              {headerLabel("Projects", pink)}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {data.projects.map(p => (
                  <div key={p.id} style={{ padding: 10, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(236,72,153,0.25)", borderRadius: 8, breakInside: "avoid" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 9, lineHeight: 1.5, color: "#64748b", marginBottom: 4 }}>{p.description}</div>}
                    {p.tech.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{p.tech.map((t, i) => <span key={i} style={{ fontSize: 7.5, color: pink, padding: "1px 5px", background: `${pink}10`, borderRadius: 3 }}>{t}</span>)}</div>}
                    {p.link && <div style={{ fontSize: 8, color: cyan, marginTop: 4 }}>↗ {p.link}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...glass, padding: "14px 20px", marginBottom: 12 }}>
              {headerLabel("Education", violet)}
              {data.education.map(ed => (
                <div key={ed.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, breakInside: "avoid" }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{ed.degree}</span>
                    <div style={{ fontSize: 9.5, color: violet }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 9, color: "#94a3b8" }}>{range(ed.start, ed.end)}</span>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...glass, padding: "14px 20px", marginBottom: 12 }}>
              {headerLabel("Awards", pink)}
              {data.awards.map(aw => (
                <div key={aw.id} style={{ fontSize: 9.5, color: "#475569", marginBottom: 3, breakInside: "avoid" }}><span style={{ color: pink, marginRight: 5 }}>★</span><span style={{ fontWeight: 700, color: "#0f172a" }}>{aw.title}</span>{aw.date ? ` · ${aw.date}` : ""}</div>
              ))}
            </div>
          )}
          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...glass, padding: "14px 20px", marginBottom: 12 }}>
              {headerLabel(cs.title, cyan)}
              {cs.items.map(item => (
                <div key={item.id} style={{ fontSize: 9.5, color: "#475569", marginBottom: 3, breakInside: "avoid" }}>
                  <span style={{ color: violet, marginRight: 5 }}>▸</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{item.title}</span>{item.date ? ` · ${item.date}` : ""}{item.description ? ` — ${item.description}` : ""}
                </div>
              ))}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
