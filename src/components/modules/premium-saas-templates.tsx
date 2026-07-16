"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";

const PAPER = "resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl";
const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

// Avatar helper — supports circle, square, and rounded shapes
function Avatar({ data, size, ring, ringWidth = 3, shape = "circle" }: {
  data: ResumeData;
  size: number;
  ring?: string;
  ringWidth?: number;
  shape?: "circle" | "square" | "rounded";
}) {
  const borderStyle = ring ? `${ring} ${ringWidth}px solid` : undefined;
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "16px" : "0";
  const initials = data.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  if (data.photo) return <img src={data.photo} alt={data.name} style={{ width: size, height: size, borderRadius, objectFit: "cover", border: borderStyle }} />;
  return <div style={{ width: size, height: size, borderRadius, background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, border: borderStyle }}>{initials}</div>;
}

function range(start: string, end: string) {
  const s = (start ?? "").trim(); const e = (end ?? "").trim();
  if (s && e) return `${s} — ${e}`; if (s) return `${s} — Present`; return e || "";
}

// Font stacks (module level)
const INTER = "'Inter', system-ui, sans-serif";
const SPACE_GROTESK = "'Space Grotesk', system-ui, sans-serif";
const SORA = "'Sora', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";
const CORMORANT = "'Cormorant Garamond', Georgia, serif";
const DM_SANS = "'DM Sans', system-ui, sans-serif";
const MANROPE = "'Manrope', system-ui, sans-serif";

// =====================================================================
// Shared line-style SVG icons (Apple / Linear / Vercel aesthetic)
// Used by AppleLinearTemplate + SiliconValleyPremiumTemplate
// =====================================================================
function LineIcon({ name, size = 14, color = "#64748b", strokeWidth = 1.5 }: { name: string; size?: number; color?: string; strokeWidth?: number }) {
  const common = { fill: "none" as const, stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let content: React.ReactNode = null;
  switch (name) {
    case "mail": content = <><rect x="3" y="5" width="18" height="14" rx="2.5" {...common} /><path d="M4 7l8 6 8-6" {...common} /></>; break;
    case "phone": content = <path d="M5 4h3l2 5-2 1c1 2.5 3 4.5 5.5 5.5l1-2 5 2v3c0 1-1 2-2 2C13 20.5 3.5 11 3.5 6c0-1 1-2 1.5-2z" {...common} />; break;
    case "location": content = <><circle cx="12" cy="10" r="3" {...common} /><path d="M12 21.5s7-6 7-11.5a7 7 0 10-14 0c0 5.5 7 11.5 7 11.5z" {...common} /></>; break;
    case "briefcase": content = <><rect x="3" y="7.5" width="18" height="12.5" rx="2" {...common} /><path d="M8 7.5V6a2 2 0 012-2h4a2 2 0 012 2v1.5" {...common} /><path d="M3 12.5h18" {...common} /></>; break;
    case "code": content = <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" {...common} />; break;
    case "cap": content = <><path d="M2 9l10-4 10 4-10 4-10-4z" {...common} /><path d="M6 11v4.5c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5V11" {...common} /><path d="M22 9v5" {...common} /></>; break;
    case "award": content = <><circle cx="12" cy="9" r="5" {...common} /><path d="M9 13.5L7.5 21l4.5-2.5L16.5 21 15 13.5" {...common} /></>; break;
    case "globe": content = <><circle cx="12" cy="12" r="9" {...common} /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" {...common} /></>; break;
    case "heart": content = <path d="M12 20.5s-7-4.5-9-9.5C2 7.5 4.5 4.5 7.5 4.5c2 0 3.5 1.5 4.5 3 1-1.5 2.5-3 4.5-3 3 0 5.5 3 4.5 6.5-2 5-9 9.5-9 9.5z" {...common} />; break;
    case "link": content = <path d="M10 13.5a3.5 3.5 0 005 0l3-3a3.5 3.5 0 00-5-5l-1 1M14 10.5a3.5 3.5 0 00-5 0l-3 3a3.5 3.5 0 005 5l1-1" {...common} />; break;
    case "user": content = <><circle cx="12" cy="8" r="4" {...common} /><path d="M4 20.5c0-4 4-6 8-6s8 2 8 6" {...common} /></>; break;
    case "star": content = <path d="M12 3.5l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 20l1-6L3.3 9.9l6-.9L12 3.5z" {...common} />; break;
    case "book": content = <><path d="M5 4.5C5 3.7 5.7 3 6.5 3H18a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V4.5z" {...common} /><path d="M5 17.5h15" {...common} /></>; break;
    case "sparkles": content = <path d="M11 3l1.5 4.5L17 9l-4.5 1.5L11 15l-1.5-4.5L5 9l4.5-1.5L11 3zM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z" fill={color} stroke="none" />; break;
    case "grid": content = <><rect x="3" y="3" width="7" height="7" rx="1.5" {...common} /><rect x="14" y="3" width="7" height="7" rx="1.5" {...common} /><rect x="3" y="14" width="7" height="7" rx="1.5" {...common} /><rect x="14" y="14" width="7" height="7" rx="1.5" {...common} /></>; break;
    case "zap": content = <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" {...common} />; break;
    case "layers": content = <><path d="M12 2L2 8l10 6 10-6-10-6z" {...common} /><path d="M2 14l10 6 10-6M2 11l10 6 10-6" {...common} /></>; break;
    case "trending": content = <><path d="M3 17l6-6 4 4 8-8" {...common} /><path d="M15 7h6v6" {...common} /></>; break;
    case "check": content = <path d="M4 12l5 5L20 6" {...common} />; break;
    case "arrow-up-right": content = <><path d="M7 17L17 7" {...common} /><path d="M8 7h9v9" {...common} /></>; break;
    default: content = <circle cx="12" cy="12" r="3" fill={color} />;
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>{content}</svg>;
}

// =====================================================================
// 1. APPLE LINEAR — World-class premium inspired by Apple, Linear,
//    Vercel, Stripe, Notion, Raycast. Elegant whitespace, soft ambient
//    shadows (0 4px 24px rgba(0,0,0,0.06)), premium cards (white bg,
//    1px border rgba(0,0,0,0.06), 16px radius), subtle gradients,
//    refined Inter typography, clean inline SVG iconography, glass
//    effects (blur 12px), smooth visual hierarchy. SINGLE COLUMN layout.
// =====================================================================

const AL_BG = "#ffffff";
const AL_INK = "#0a0a0a";
const AL_MUTED = "#6b7280";
const AL_SUBTLE = "#9ca3af";
const AL_BORDER = "rgba(0,0,0,0.06)";
const AL_BORDER_SOFT = "rgba(0,0,0,0.04)";
const AL_ACCENT = "#18181b";
const AL_TINT = "#fafafa";
const AL_SHADOW = "0 4px 24px rgba(0,0,0,0.06)";
const AL_SHADOW_SM = "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)";

const ALCard: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${AL_BORDER}`,
  borderRadius: 16,
  boxShadow: AL_SHADOW,
};

const ALAmbientBlob = () => (
  <>
    <div style={{ position: "absolute", top: -120, right: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)", filter: "blur(50px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", top: 60, left: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)", filter: "blur(50px)", pointerEvents: "none", zIndex: 0 }} />
  </>
);

function ALSectionHeader({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: AL_TINT, border: `1px solid ${AL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LineIcon name={icon} size={15} color={AL_INK} strokeWidth={1.6} />
      </div>
      <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: AL_INK, letterSpacing: 0.3 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${AL_BORDER}, transparent)` }} />
    </div>
  );
}

export function AppleLinearTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const contacts = [
    { icon: "mail", value: data.email },
    { icon: "phone", value: data.phone },
    { icon: "location", value: data.location },
    { icon: "link", value: data.linkedin },
    { icon: "code", value: data.github },
    { icon: "globe", value: data.website },
  ].filter(c => c.value);

  return (
    <div className={PAPER} style={{ fontFamily: INTER, background: AL_BG, color: AL_INK, position: "relative", overflow: "hidden" }}>
      <ALAmbientBlob />

      {/* Hero — glass header panel */}
      <div style={{ position: "relative", padding: "40px 44px 28px", zIndex: 1 }}>
        <div style={{ ...ALCard, padding: "28px 32px", display: "flex", alignItems: "center", gap: 28, borderRadius: 20, position: "relative", overflow: "hidden" }}>
          {/* subtle top gradient line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 20%, rgba(0,0,0,0.06) 80%, transparent)" }} />
          {/* glass overlay */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 240, height: "100%", background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(16,185,129,0.03))", pointerEvents: "none" }} />
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -6, borderRadius: 20, background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.12))", filter: "blur(12px)", opacity: 0.7 }} />
            <Avatar data={data} size={96} shape="rounded" ring="#ffffff" ringWidth={2} />
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }} />
              <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 500, color: AL_SUBTLE, letterSpacing: 1.5, textTransform: "uppercase" }}>Available for opportunities</span>
            </div>
            <h1 style={{ fontFamily: INTER, fontSize: 36, fontWeight: 700, color: AL_INK, margin: 0, lineHeight: 1.05, letterSpacing: -0.8 }}>{data.name}</h1>
            <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 400, color: AL_MUTED, margin: "6px 0 0", letterSpacing: -0.1 }}>{data.title}</p>
          </div>
        </div>

        {/* Contact bar — glass pill */}
        <div style={{ marginTop: 14, ...ALCard, padding: "12px 20px", borderRadius: 14, display: "flex", flexWrap: "wrap", gap: "8px 22px", alignItems: "center" }}>
          {contacts.map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: INTER, fontSize: 10.5, color: AL_MUTED, fontWeight: 450 }}>
              <LineIcon name={c.icon} size={13} color={AL_SUBTLE} />
              {c.value}
            </span>
          ))}
        </div>
      </div>

      {/* Body — single column of premium cards */}
      <div style={{ position: "relative", padding: "0 44px 40px", display: "flex", flexDirection: "column", gap: 16, zIndex: 1 }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ ...ALCard, padding: "22px 26px", borderRadius: 16 }}>
            <ALSectionHeader label="Summary" icon="sparkles" />
            <p style={{ fontSize: 12, lineHeight: 1.7, color: "#374151", margin: 0, fontWeight: 400 }}>{data.summary}</p>
          </div>
        )}

        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ ...ALCard, padding: "24px 26px", borderRadius: 16 }}>
            <ALSectionHeader label="Experience" icon="briefcase" />
            {data.experience.map((e, i) => (
              <div key={e.id} style={{ marginBottom: i < data.experience.length - 1 ? 18 : 0, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: i < data.experience.length - 1 ? 18 : 0, borderBottom: i < data.experience.length - 1 ? `1px solid ${AL_BORDER_SOFT}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: AL_INK, letterSpacing: -0.2 }}>{e.role}</span>
                    <span style={{ fontSize: 11, color: AL_MUTED, marginLeft: 8, fontWeight: 450 }}>· {e.company}{e.location ? `, ${e.location}` : ""}</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, color: AL_INK, padding: "4px 10px", borderRadius: 999, background: AL_TINT, border: `1px solid ${AL_BORDER}`, whiteSpace: "nowrap", letterSpacing: 0.2 }}>{range(e.start, e.end)}</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  {e.bullets.filter(b => b?.trim()).map((b, j) => (
                    <div key={j} style={{ fontSize: 11, lineHeight: 1.65, color: "#4b5563", marginBottom: 4, paddingLeft: 18, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: 7, width: 12, height: 1.5, borderRadius: 1, background: AL_INK, opacity: 0.25 }} />{b}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {visible(sections, "projects") && data.projects.length > 0 && (
          <div style={{ ...ALCard, padding: "24px 26px", borderRadius: 16 }}>
            <ALSectionHeader label="Projects" icon="layers" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {data.projects.map(p => (
                <div key={p.id} style={{ padding: 16, borderRadius: 12, background: AL_TINT, border: `1px solid ${AL_BORDER}`, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: AL_INK, letterSpacing: -0.1 }}>{p.name}</span>
                    {p.link && <LineIcon name="arrow-up-right" size={13} color={AL_SUBTLE} />}
                  </div>
                  {p.description && <div style={{ fontSize: 10.5, lineHeight: 1.6, color: AL_MUTED, marginTop: 6 }}>{p.description}</div>}
                  {p.tech.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                      {p.tech.map((t, k) => (
                        <span key={k} style={{ fontSize: 8.5, fontWeight: 500, padding: "3px 8px", borderRadius: 6, background: "#ffffff", border: `1px solid ${AL_BORDER}`, color: AL_INK }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {p.link && <div style={{ fontSize: 9, color: AL_SUBTLE, marginTop: 8, fontWeight: 450 }}>{p.link}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {visible(sections, "skills") && data.skills.length > 0 && (
          <div style={{ ...ALCard, padding: "22px 26px", borderRadius: 16 }}>
            <ALSectionHeader label="Skills" icon="zap" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.skills.map((s, i) => {
                const level = data.skillLevels[s];
                return (
                  <div key={i} style={{ padding: "8px 14px", borderRadius: 10, background: AL_TINT, border: `1px solid ${AL_BORDER}`, position: "relative", overflow: "hidden" }}>
                    {level !== undefined && <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${level}%`, background: "linear-gradient(90deg, #6366f1, #10b981)" }} />}
                    <div style={{ fontSize: 11, fontWeight: 500, color: AL_INK, letterSpacing: -0.1 }}>{s}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Two-column lower section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...ALCard, padding: "22px 24px", borderRadius: 16 }}>
              <ALSectionHeader label="Education" icon="cap" />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: AL_INK, letterSpacing: -0.1 }}>{ed.degree}</div>
                  <div style={{ fontSize: 11, color: AL_MUTED, marginTop: 2, fontWeight: 450 }}>{ed.school}{ed.location ? `, ${ed.location}` : ""}</div>
                  <div style={{ fontSize: 10, color: AL_SUBTLE, marginTop: 2 }}>{range(ed.start, ed.end)}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...ALCard, padding: "22px 24px", borderRadius: 16 }}>
              <ALSectionHeader label="Certifications" icon="award" />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ marginTop: 4, width: 14, height: 14, borderRadius: 4, background: AL_TINT, border: `1px solid ${AL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <LineIcon name="check" size={10} color={AL_INK} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: AL_INK, letterSpacing: -0.1 }}>{c.title}</div>
                    <div style={{ fontSize: 10, color: AL_MUTED, marginTop: 1 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...ALCard, padding: "20px 22px", borderRadius: 16 }}>
              <ALSectionHeader label="Languages" icon="globe" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.languages.map((l, i) => (
                  <span key={i} style={{ fontSize: 10.5, fontWeight: 500, padding: "5px 11px", borderRadius: 8, background: AL_TINT, border: `1px solid ${AL_BORDER}`, color: AL_INK }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...ALCard, padding: "20px 22px", borderRadius: 16 }}>
              <ALSectionHeader label="Awards" icon="star" />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: AL_INK }}>{aw.title}</div>
                  <div style={{ fontSize: 9.5, color: AL_MUTED, marginTop: 1 }}>{aw.subtitle}{aw.date ? ` · ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...ALCard, padding: "20px 22px", borderRadius: 16 }}>
              <ALSectionHeader label="Interests" icon="heart" />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 10.5, color: AL_MUTED, fontWeight: 450 }}>· {it}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
          <div key={cs.id} style={{ ...ALCard, padding: "22px 26px", borderRadius: 16 }}>
            <ALSectionHeader label={cs.title} icon="grid" />
            {cs.items.map(item => (
              <div key={item.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: AL_INK }}>{item.title}</span>
                  {item.date && <span style={{ fontSize: 9.5, color: AL_SUBTLE, fontWeight: 500 }}>{item.date}</span>}
                </div>
                {item.subtitle && <div style={{ fontSize: 10.5, color: AL_MUTED, marginTop: 1 }}>{item.subtitle}</div>}
                {item.description && <div style={{ fontSize: 10.5, color: "#4b5563", marginTop: 3, lineHeight: 1.6 }}>{item.description}</div>}
              </div>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 8, paddingBottom: 4 }}>
          <div style={{ height: 1, width: 60, background: AL_BORDER }} />
          <span style={{ fontFamily: INTER, fontSize: 8.5, color: AL_SUBTLE, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500 }}>{"//"} Crafted with care</span>
          <div style={{ height: 1, width: 60, background: AL_BORDER }} />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 2. PREMIUM 2026 — Next-generation 2026 resume with AI-inspired
//    aesthetics. Floating cards, liquid aurora/mesh gradients, frosted
//    glass, premium mesh, subtle 3D depth (layered shadows), glowing
//    neon accents, modern infographic components (skill rings, timeline
//    with glowing dots), Space Grotesk + Sora. Light theme.
// =====================================================================

const P26_BG = "#fafbfc";
const P26_INK = "#0f172a";
const P26_MUTED = "#64748b";
const P26_VIOLET = "#8b5cf6";
const P26_CYAN = "#06b6d4";
const P26_PINK = "#ec4899";
const P26_EMERALD = "#10b981";
const P26_BORDER = "#e8ecf2";

const P26Aurora = () => (
  <>
    <div style={{ position: "absolute", top: -120, right: -100, width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, ${P26_VIOLET}40, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", top: 80, left: -120, width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, ${P26_CYAN}38, transparent 70%)`, filter: "blur(55px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", bottom: -80, right: 120, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${P26_PINK}30, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none", zIndex: 0 }} />
  </>
);

const P26Card: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.9)",
  borderRadius: 20,
  boxShadow: "0 4px 12px rgba(15,23,42,0.04), 0 12px 40px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
};

function P26SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}, 0 0 20px ${color}60` }} />
      <span style={{ fontFamily: SPACE_GROTESK, fontSize: 11, fontWeight: 700, color: P26_INK, letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${P26_BORDER}, transparent)` }} />
    </div>
  );
}

function P26SkillRing({ label, level, color }: { label: string; level: number; color: string }) {
  const size = 68;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (level / 100) * c;
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <svg width={size} height={size} style={{ display: "block", margin: "0 auto", filter: `drop-shadow(0 2px 6px ${color}50)` }}>
        <defs>
          <linearGradient id={`p26g-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={P26_VIOLET} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={P26_BORDER} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#p26g-${label})`} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={P26_INK} fontFamily={SPACE_GROTESK}>{level}</text>
      </svg>
      <div style={{ fontSize: 9, color: P26_MUTED, marginTop: 5, fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
}

export function Premium2026Template({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const topSkills = data.skills.slice(0, 3);
  const ringColors = [P26_VIOLET, P26_CYAN, P26_PINK];

  return (
    <div className={PAPER} style={{ fontFamily: SPACE_GROTESK, background: P26_BG, color: P26_INK, position: "relative", overflow: "hidden" }}>
      <P26Aurora />

      {/* Hero — floating glass panel with neon glow ring */}
      <div style={{ position: "relative", padding: "36px 40px 24px", zIndex: 1 }}>
        <div style={{ ...P26Card, padding: "26px 30px", borderRadius: 24, position: "relative", overflow: "hidden" }}>
          {/* glow border top */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${P26_VIOLET}, ${P26_CYAN}, ${P26_PINK}, ${P26_VIOLET})` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: -8, borderRadius: 22, background: `conic-gradient(from 0deg, ${P26_VIOLET}, ${P26_CYAN}, ${P26_PINK}, ${P26_VIOLET})`, filter: "blur(14px)", opacity: 0.5 }} />
              <Avatar data={data} size={100} shape="rounded" ring="rgba(255,255,255,0.95)" ringWidth={3} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: SPACE_GROTESK, fontSize: 9.5, fontWeight: 600, color: P26_VIOLET, letterSpacing: 2.5, textTransform: "uppercase" }}>{"//"} Resume · 2026</span>
              </div>
              <h1 style={{ fontFamily: SORA, fontSize: 38, fontWeight: 800, color: P26_INK, margin: 0, lineHeight: 1.0, letterSpacing: -1 }}>
                <span style={{ background: `linear-gradient(135deg, ${P26_INK} 0%, ${P26_VIOLET} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" as React.CSSProperties["color"] }}>{data.name}</span>
              </h1>
              <p style={{ fontFamily: SPACE_GROTESK, fontSize: 14, fontWeight: 500, color: P26_MUTED, margin: "6px 0 0", letterSpacing: 0.1 }}>{data.title}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", marginTop: 14, fontSize: 9.5, color: P26_MUTED, fontWeight: 500 }}>
                {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: `linear-gradient(135deg, ${P26_VIOLET}, ${P26_CYAN})`, boxShadow: `0 0 4px ${P26_VIOLET}80` }} />{c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body — 2-col floating layout */}
      <div style={{ position: "relative", padding: "0 40px 36px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, zIndex: 1 }}>
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...P26Card, padding: "20px 24px", marginBottom: 14, borderRadius: 18 }}>
              <P26SectionHeader label="Profile" color={P26_VIOLET} />
              <p style={{ fontSize: 11.5, lineHeight: 1.7, color: "#334155", margin: 0, fontWeight: 450 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...P26Card, padding: "22px 24px", marginBottom: 14, borderRadius: 18 }}>
              <P26SectionHeader label="Experience" color={P26_CYAN} />
              <div style={{ position: "relative", paddingLeft: 22 }}>
                {/* vertical glowing connector */}
                <div style={{ position: "absolute", left: 5, top: 8, bottom: 8, width: 2, background: `linear-gradient(180deg, ${P26_VIOLET}, ${P26_CYAN}, ${P26_PINK})`, borderRadius: 2, opacity: 0.4 }} />
                {data.experience.map((e, i) => (
                  <div key={e.id} style={{ marginBottom: i < data.experience.length - 1 ? 18 : 0, breakInside: "avoid" as React.CSSProperties["breakInside"], position: "relative" }}>
                    {/* glowing dot */}
                    <div style={{ position: "absolute", left: -22, top: 4, width: 12, height: 12, borderRadius: "50%", background: "#ffffff", border: `2px solid ${[P26_VIOLET, P26_CYAN, P26_PINK][i % 3]}`, boxShadow: `0 0 10px ${[P26_VIOLET, P26_CYAN, P26_PINK][i % 3]}80` }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: P26_INK, letterSpacing: -0.2 }}>{e.role}</span>
                      <span style={{ fontFamily: SPACE_GROTESK, fontSize: 9, fontWeight: 600, color: P26_VIOLET, padding: "3px 10px", borderRadius: 999, background: `linear-gradient(135deg, ${P26_VIOLET}18, ${P26_CYAN}18)`, whiteSpace: "nowrap", letterSpacing: 0.3 }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: P26_CYAN, marginTop: 2 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                    <div style={{ marginTop: 8 }}>
                      {e.bullets.filter(b => b?.trim()).map((b, j) => (
                        <div key={j} style={{ fontSize: 10.5, lineHeight: 1.65, color: "#475569", marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, top: 6, width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg, ${P26_VIOLET}, ${P26_CYAN})` }} />{b}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...P26Card, padding: "22px 24px", borderRadius: 18 }}>
              <P26SectionHeader label="Projects" color={P26_PINK} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.projects.map((p, i) => (
                  <div key={p.id} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.7)", border: `1px solid ${P26_BORDER}`, breakInside: "avoid" as React.CSSProperties["breakInside"], position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: [P26_VIOLET, P26_CYAN, P26_PINK, P26_EMERALD][i % 4] }} />
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: P26_INK, letterSpacing: -0.1 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 10, lineHeight: 1.55, color: "#475569", marginTop: 5 }}>{p.description}</div>}
                    {p.tech.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                        {p.tech.map((t, k) => (
                          <span key={k} style={{ fontSize: 8, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: `${P26_VIOLET}12`, color: P26_VIOLET }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {p.link && <div style={{ fontSize: 8.5, color: P26_CYAN, marginTop: 6, fontWeight: 600 }}>↗ {p.link}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {visible(sections, "skills") && topSkills.length > 0 && (
            <div style={{ ...P26Card, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <P26SectionHeader label="Skill Rings" color={P26_VIOLET} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                {topSkills.map((s, i) => <P26SkillRing key={i} label={s} level={data.skillLevels[s] ?? 80} color={ringColors[i % 3]} />)}
              </div>
            </div>
          )}

          {visible(sections, "skills") && data.skills.length > 3 && (
            <div style={{ ...P26Card, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <P26SectionHeader label="More Skills" color={P26_CYAN} />
              {data.skills.slice(3).map((s, i) => {
                const level = data.skillLevels[s] ?? 60;
                return (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: P26_INK, fontWeight: 600, marginBottom: 3 }}>
                      <span>{s}</span><span style={{ fontFamily: SPACE_GROTESK, color: P26_MUTED }}>{level}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 999, background: P26_BORDER, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${level}%`, background: `linear-gradient(90deg, ${P26_VIOLET}, ${P26_CYAN})`, borderRadius: 999, boxShadow: `0 0 6px ${P26_VIOLET}60` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...P26Card, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <P26SectionHeader label="Education" color={P26_EMERALD} />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: P26_INK }}>{ed.degree}</div>
                  <div style={{ fontSize: 10, color: P26_VIOLET, marginTop: 1, fontWeight: 600 }}>{ed.school}</div>
                  <div style={{ fontFamily: SPACE_GROTESK, fontSize: 8.5, color: P26_MUTED, marginTop: 1 }}>{range(ed.start, ed.end)}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...P26Card, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <P26SectionHeader label="Certifications" color={P26_PINK} />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: P26_INK }}>{c.title}</div>
                  <div style={{ fontSize: 9, color: P26_MUTED, marginTop: 1 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...P26Card, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <P26SectionHeader label="Languages" color={P26_VIOLET} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.languages.map((l, i) => (
                  <span key={i} style={{ fontSize: 9.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: `linear-gradient(135deg, ${P26_VIOLET}12, ${P26_CYAN}12)`, color: P26_INK }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...P26Card, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <P26SectionHeader label="Awards" color={P26_EMERALD} />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: P26_INK }}>{aw.title}</div>
                  <div style={{ fontSize: 9, color: P26_VIOLET, marginTop: 1 }}>{aw.subtitle}{aw.date ? ` · ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...P26Card, padding: "18px 20px", borderRadius: 18 }}>
              <P26SectionHeader label="Interests" color={P26_CYAN} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 9, fontWeight: 500, color: P26_MUTED }}>· {it}</span>
                ))}
              </div>
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...P26Card, padding: "18px 20px", marginTop: 14, borderRadius: 18 }}>
              <P26SectionHeader label={cs.title} color={P26_VIOLET} />
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: P26_INK }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontSize: 9, color: P26_VIOLET, marginTop: 1 }}>{item.subtitle}</div>}
                  {item.description && <div style={{ fontSize: 9.5, color: "#475569", marginTop: 2, lineHeight: 1.5 }}>{item.description}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 3. ULTRA PREMIUM LUXURY — Ultra-premium luxury editorial. Playfair
//    Display + Cormorant Garamond, generous whitespace, soft shadows,
//    premium gradients, glassmorphism accents, subtle gold (#c5a572)
//    details, abstract geometric graphics, curved shapes, layered
//    cards. Palette: ivory (#faf8f3), charcoal (#1a1a1a), navy
//    (#1e3a5f), emerald (#10b981), champagne gold (#c5a572).
// =====================================================================

const UL_IVORY = "#faf8f3";
const UL_CHARCOAL = "#1a1a1a";
const UL_NAVY = "#1e3a5f";
const UL_EMERALD = "#10b981";
const UL_GOLD = "#c5a572";
const UL_MUTED = "#8a8278";
const UL_INK = "#2b2620";
const UL_BORDER = "rgba(26,26,26,0.08)";

const ULGeometric = () => (
  <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: "absolute", top: 30, right: 30, opacity: 0.5, pointerEvents: "none", zIndex: 0 }}>
    {/* concentric arcs */}
    <circle cx="110" cy="110" r="90" fill="none" stroke={UL_GOLD} strokeWidth="0.5" opacity="0.6" />
    <circle cx="110" cy="110" r="70" fill="none" stroke={UL_GOLD} strokeWidth="0.4" opacity="0.4" strokeDasharray="2 4" />
    <circle cx="110" cy="110" r="50" fill="none" stroke={UL_EMERALD} strokeWidth="0.4" opacity="0.3" />
    {/* curved arcs */}
    <path d="M 30 110 A 80 80 0 0 1 190 110" fill="none" stroke={UL_NAVY} strokeWidth="0.4" opacity="0.3" />
    <path d="M 50 110 A 60 60 0 0 1 170 110" fill="none" stroke={UL_GOLD} strokeWidth="0.5" opacity="0.4" />
    {/* center diamond */}
    <rect x="100" y="100" width="20" height="20" fill="none" stroke={UL_GOLD} strokeWidth="0.6" transform="rotate(45 110 110)" />
    <circle cx="110" cy="110" r="3" fill={UL_GOLD} />
    {/* corner dots */}
    <circle cx="30" cy="30" r="1.5" fill={UL_GOLD} opacity="0.5" />
    <circle cx="190" cy="30" r="1.5" fill={UL_GOLD} opacity="0.5" />
    <circle cx="30" cy="190" r="1.5" fill={UL_GOLD} opacity="0.5" />
    <circle cx="190" cy="190" r="1.5" fill={UL_GOLD} opacity="0.5" />
  </svg>
);

const ULCard: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${UL_BORDER}`,
  borderRadius: "4px 20px 4px 20px",
  boxShadow: "0 2px 12px rgba(26,26,26,0.04), 0 8px 32px rgba(26,26,26,0.03)",
};

function ULSectionHeader({ label, num }: { label: string; num: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
      <span style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 14, color: UL_GOLD, letterSpacing: 1 }}>{num}</span>
      <span style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: UL_CHARCOAL, letterSpacing: 3, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 0.5, background: `linear-gradient(90deg, ${UL_GOLD}, transparent)` }} />
    </div>
  );
}

export function UltraPremiumLuxuryTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  return (
    <div className={PAPER} style={{ fontFamily: PLAYFAIR, background: UL_IVORY, color: UL_INK, position: "relative", overflow: "hidden" }}>
      <ULGeometric />

      {/* Header — layered luxury */}
      <div style={{ position: "relative", padding: "52px 56px 36px", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 0.5, background: UL_GOLD }} />
          <span style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 13, color: UL_GOLD, letterSpacing: 4, textTransform: "uppercase" }}>Curriculum Vitae</span>
          <div style={{ flex: 1, height: 0.5, background: `linear-gradient(90deg, ${UL_GOLD}, transparent)` }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 36 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 20, color: UL_NAVY, margin: 0, letterSpacing: 0.5, fontWeight: 500 }}>{data.title}</p>
            <h1 style={{ fontFamily: PLAYFAIR, fontSize: 44, fontWeight: 700, color: UL_CHARCOAL, margin: "8px 0 0", lineHeight: 1.0, letterSpacing: -0.5 }}>{data.name}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 22px", marginTop: 22, fontFamily: DM_SANS, fontSize: 9.5, color: UL_MUTED, letterSpacing: 0.3, fontWeight: 500 }}>
              {[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ color: UL_GOLD, fontSize: 7 }}>◆</span>{c}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: `0.5px solid ${UL_GOLD}`, opacity: 0.7 }} />
            <div style={{ position: "absolute", inset: -24, borderRadius: "50%", border: `0.5px solid ${UL_GOLD}`, opacity: 0.35 }} />
            <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: `radial-gradient(circle, ${UL_GOLD}20, transparent 70%)`, filter: "blur(8px)" }} />
            <Avatar data={data} size={100} ring={UL_GOLD} ringWidth={0.8} shape="circle" />
          </div>
        </div>
      </div>

      {/* Body — generous whitespace */}
      <div style={{ position: "relative", padding: "0 56px 48px", zIndex: 1 }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 28 }}>
            <ULSectionHeader label="Manifesto" num="I." />
            {/* glassmorphism accent quote card */}
            <div style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${UL_GOLD}30`, borderRadius: "4px 24px 4px 24px", padding: "24px 28px", boxShadow: "0 4px 24px rgba(197,165,114,0.08)", position: "relative" }}>
              <span style={{ position: "absolute", top: 8, left: 16, fontFamily: PLAYFAIR, fontSize: 48, color: UL_GOLD, opacity: 0.25, lineHeight: 1 }}>"</span>
              <p style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 15, lineHeight: 1.8, color: UL_CHARCOAL, margin: 0, paddingLeft: 28 }}>{data.summary}</p>
            </div>
          </div>
        )}

        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <ULSectionHeader label="Parcours" num="II." />
            {data.experience.map((e, i) => (
              <div key={e.id} style={{ ...ULCard, padding: "20px 24px", marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"], position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: `linear-gradient(180deg, ${UL_GOLD}, ${UL_EMERALD})`, borderRadius: "4px 0 0 4px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <div>
                    <span style={{ fontFamily: PLAYFAIR, fontSize: 16, fontWeight: 700, color: UL_CHARCOAL }}>{e.role}</span>
                    <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 13, color: UL_NAVY, marginLeft: 8 }}>· {e.company}{e.location ? `, ${e.location}` : ""}</span>
                  </div>
                  <span style={{ fontFamily: DM_SANS, fontSize: 8.5, color: UL_GOLD, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap" }}>{range(e.start, e.end)}</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  {e.bullets.filter(b => b?.trim()).map((b, j) => (
                    <div key={j} style={{ fontFamily: PLAYFAIR, fontSize: 11.5, lineHeight: 1.75, color: "#3d3833", marginBottom: 3, paddingLeft: 16, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: 8, color: UL_GOLD, fontSize: 7 }}>◆</span>{b}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Two-column lower */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
          <div>
            {visible(sections, "skills") && data.skills.length > 0 && (
              <div>
                <ULSectionHeader label="Savoir-Faire" num="III." />
                {data.skills.map((s, i) => {
                  const level = data.skillLevels[s];
                  return (
                    <div key={i} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: PLAYFAIR, fontSize: 12, color: UL_CHARCOAL }}>
                        <span>{s}</span>
                        {level !== undefined && <span style={{ fontFamily: DM_SANS, fontSize: 8, color: UL_MUTED, letterSpacing: 1 }}>{level}%</span>}
                      </div>
                      {level !== undefined && (
                        <div style={{ marginTop: 4, height: 2, borderRadius: 999, background: UL_BORDER, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${level}%`, background: `linear-gradient(90deg, ${UL_GOLD}, ${UL_EMERALD})` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            {visible(sections, "education") && data.education.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <ULSectionHeader label="Formation" num="IV." />
                {data.education.map(ed => (
                  <div key={ed.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: UL_CHARCOAL }}>{ed.degree}</div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: UL_NAVY, marginTop: 2 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                    <div style={{ fontFamily: DM_SANS, fontSize: 8.5, color: UL_MUTED, marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>{range(ed.start, ed.end)}</div>
                  </div>
                ))}
              </div>
            )}
            {visible(sections, "languages") && data.languages.length > 0 && (
              <div>
                <ULSectionHeader label="Langues" num="V." />
                <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 13, color: UL_CHARCOAL, lineHeight: 2 }}>{data.languages.join("   ·   ")}</div>
              </div>
            )}
          </div>
        </div>

        {visible(sections, "projects") && data.projects.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <ULSectionHeader label="Œuvres" num="VI." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {data.projects.map(p => (
                <div key={p.id} style={{ ...ULCard, padding: "16px 20px", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: UL_CHARCOAL }}>{p.name}</div>
                  {p.description && <div style={{ fontFamily: CORMORANT, fontSize: 11.5, color: "#3d3833", lineHeight: 1.6, marginTop: 3, fontStyle: "italic" }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontFamily: DM_SANS, fontSize: 8, color: UL_GOLD, marginTop: 6, letterSpacing: 0.5 }}>{p.tech.join("  ·  ")}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div>
              <ULSectionHeader label="Certifications" num="VII." />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"], fontFamily: PLAYFAIR, fontSize: 12, color: UL_CHARCOAL }}>
                  <span style={{ color: UL_GOLD, marginRight: 6, fontSize: 7 }}>◆</span>{c.title}{c.date ? <span style={{ color: UL_MUTED, fontStyle: "italic", marginLeft: 6 }}>, {c.date}</span> : null}
                </div>
              ))}
            </div>
          )}
          {visible(sections, "awards") && data.awards.length > 0 && (
            <div>
              <ULSectionHeader label="Distinctions" num="VIII." />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: PLAYFAIR, fontSize: 12, fontWeight: 700, color: UL_CHARCOAL }}>{aw.title}</div>
                  <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: UL_GOLD, marginTop: 1 }}>{aw.subtitle}{aw.date ? ` · ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {visible(sections, "interests") && data.interests.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <ULSectionHeader label="Intérêts" num="IX." />
            <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 12.5, color: UL_CHARCOAL }}>{data.interests.join("   ·   ")}</div>
          </div>
        )}

        {data.customSections.filter(cs => cs.items.length > 0).map((cs, idx) => (
          <div key={cs.id} style={{ marginTop: 28 }}>
            <ULSectionHeader label={cs.title} num={`X${idx + 1}.`} />
            {cs.items.map(item => (
              <div key={item.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: UL_CHARCOAL }}>{item.title}{item.date ? <span style={{ color: UL_MUTED, fontStyle: "italic", fontWeight: 400, marginLeft: 8 }}>{item.date}</span> : null}</div>
                {item.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: UL_GOLD, marginTop: 1 }}>{item.subtitle}</div>}
                {item.description && <div style={{ fontFamily: PLAYFAIR, fontSize: 11, color: "#3d3833", lineHeight: 1.6, marginTop: 2 }}>{item.description}</div>}
              </div>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `0.5px solid ${UL_GOLD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: UL_MUTED, letterSpacing: 1 }}>— Fin —</span>
          <span style={{ fontFamily: DM_SANS, fontSize: 8, color: UL_GOLD, letterSpacing: 4, textTransform: "uppercase", fontWeight: 600 }}>Ultra Premium</span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 4. SILICON VALLEY PREMIUM — Premium inspired by Apple, Stripe,
//    Linear, Vercel, Notion, Raycast. SIDEBAR layout (different from
//    AppleLinear single column). Minimal luxurious UI, smooth rounded
//    cards (16px radius), soft ambient shadows, elegant gradients,
//    premium inline SVG iconography, refined Inter typography, subtle
//    abstract mesh gradient blobs. Communicates innovation, executive
//    professionalism.
// =====================================================================

const SV_BG = "#ffffff";
const SV_INK = "#0a0a0a";
const SV_MUTED = "#6b7280";
const SV_SUBTLE = "#9ca3af";
const SV_BORDER = "rgba(0,0,0,0.06)";
const SV_BORDER_SOFT = "rgba(0,0,0,0.04)";
const SV_TINT = "#fafafa";
const SV_SIDEBAR = "linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)";
const SV_SHADOW = "0 4px 24px rgba(0,0,0,0.06)";
const SV_ACCENT = "#6366f1";

const SVMeshBlobs = () => (
  <>
    <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)", filter: "blur(50px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", bottom: -60, left: 200, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)", filter: "blur(45px)", pointerEvents: "none", zIndex: 0 }} />
  </>
);

const SVCard: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${SV_BORDER}`,
  borderRadius: 16,
  boxShadow: SV_SHADOW,
};

function SVSectionHeader({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
      <LineIcon name={icon} size={15} color={SV_INK} strokeWidth={1.6} />
      <span style={{ fontFamily: INTER, fontSize: 11.5, fontWeight: 600, color: SV_INK, letterSpacing: 0.3 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${SV_BORDER}, transparent)` }} />
    </div>
  );
}

function SVSidebarHeader({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <LineIcon name={icon} size={13} color={SV_ACCENT} strokeWidth={1.7} />
      <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 600, color: SV_INK, letterSpacing: 1.8, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: SV_BORDER }} />
    </div>
  );
}

export function SiliconValleyPremiumTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const contacts = [
    { icon: "mail", value: data.email },
    { icon: "phone", value: data.phone },
    { icon: "location", value: data.location },
    { icon: "link", value: data.linkedin },
    { icon: "code", value: data.github },
    { icon: "globe", value: data.website },
  ].filter(c => c.value);

  return (
    <div className={PAPER} style={{ fontFamily: INTER, background: SV_BG, color: SV_INK, position: "relative", overflow: "hidden" }}>
      <SVMeshBlobs />

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "248px 1fr", zIndex: 1 }}>
        {/* SIDEBAR */}
        <aside style={{ background: SV_SIDEBAR, borderRight: `1px solid ${SV_BORDER}`, padding: "36px 24px 32px", minHeight: "100%" }}>
          {/* Avatar + name */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 24 }}>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <div style={{ position: "absolute", inset: -5, borderRadius: 18, background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.15))", filter: "blur(10px)", opacity: 0.8 }} />
              <Avatar data={data} size={96} shape="rounded" ring="#ffffff" ringWidth={2} />
            </div>
            <h1 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: SV_INK, margin: 0, lineHeight: 1.15, letterSpacing: -0.4 }}>{data.name}</h1>
            <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 400, color: SV_MUTED, margin: "4px 0 0", letterSpacing: -0.05 }}>{data.title}</p>
            <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "#ffffff", border: `1px solid ${SV_BORDER}` }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.5)" }} />
              <span style={{ fontSize: 8.5, color: SV_MUTED, fontWeight: 500, letterSpacing: 0.3 }}>Open to work</span>
            </div>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: 22 }}>
            <SVSidebarHeader label="Contact" icon="user" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {contacts.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9.5, color: SV_MUTED, fontWeight: 450, lineHeight: 1.3 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "#ffffff", border: `1px solid ${SV_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <LineIcon name={c.icon} size={11} color={SV_SUBTLE} />
                  </div>
                  <span style={{ wordBreak: "break-word" }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <SVSidebarHeader label="Skills" icon="zap" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.skills.map((s, i) => {
                  const level = data.skillLevels[s];
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: SV_INK, fontWeight: 500, marginBottom: 3 }}>
                        <span>{s}</span>
                        {level !== undefined && <span style={{ color: SV_SUBTLE, fontSize: 8.5 }}>{level}%</span>}
                      </div>
                      {level !== undefined ? (
                        <div style={{ height: 3, borderRadius: 999, background: SV_BORDER, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${level}%`, background: "linear-gradient(90deg, #6366f1, #10b981)", borderRadius: 999 }} />
                        </div>
                      ) : (
                        <div style={{ height: 3, borderRadius: 999, background: SV_BORDER }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Languages */}
          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <SVSidebarHeader label="Languages" icon="globe" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.languages.map((l, i) => (
                  <span key={i} style={{ fontSize: 9.5, fontWeight: 500, padding: "4px 10px", borderRadius: 8, background: "#ffffff", border: `1px solid ${SV_BORDER}`, color: SV_INK }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <SVSidebarHeader label="Certs" icon="award" />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: SV_INK, lineHeight: 1.3 }}>{c.title}</div>
                  <div style={{ fontSize: 8.5, color: SV_MUTED, marginTop: 1 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {/* Interests */}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div>
              <SVSidebarHeader label="Interests" icon="heart" />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 9.5, color: SV_MUTED, fontWeight: 450 }}>· {it}</span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main style={{ padding: "36px 36px 32px" }}>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...SVCard, padding: "20px 24px", marginBottom: 14, borderRadius: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "linear-gradient(180deg, #6366f1, #10b981)" }} />
              <SVSectionHeader label="Summary" icon="sparkles" />
              <p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151", margin: 0, fontWeight: 400 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...SVCard, padding: "22px 24px", marginBottom: 14, borderRadius: 14 }}>
              <SVSectionHeader label="Experience" icon="briefcase" />
              {data.experience.map((e, i) => (
                <div key={e.id} style={{ marginBottom: i < data.experience.length - 1 ? 16 : 0, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: i < data.experience.length - 1 ? 16 : 0, borderBottom: i < data.experience.length - 1 ? `1px solid ${SV_BORDER_SOFT}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: SV_INK, letterSpacing: -0.2 }}>{e.role}</span>
                      <span style={{ fontSize: 10.5, color: SV_MUTED, marginLeft: 6, fontWeight: 450 }}>· {e.company}{e.location ? `, ${e.location}` : ""}</span>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 500, color: SV_INK, padding: "3px 9px", borderRadius: 999, background: SV_TINT, border: `1px solid ${SV_BORDER}`, whiteSpace: "nowrap" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {e.bullets.filter(b => b?.trim()).map((b, j) => (
                      <div key={j} style={{ fontSize: 10.5, lineHeight: 1.65, color: "#4b5563", marginBottom: 3, paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, top: 6, width: 10, height: 1.5, borderRadius: 1, background: SV_ACCENT, opacity: 0.5 }} />{b}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...SVCard, padding: "22px 24px", marginBottom: 14, borderRadius: 14 }}>
              <SVSectionHeader label="Projects" icon="layers" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.projects.map(p => (
                  <div key={p.id} style={{ padding: 14, borderRadius: 10, background: SV_TINT, border: `1px solid ${SV_BORDER}`, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: SV_INK, letterSpacing: -0.1 }}>{p.name}</span>
                      {p.link && <LineIcon name="arrow-up-right" size={12} color={SV_SUBTLE} />}
                    </div>
                    {p.description && <div style={{ fontSize: 10, lineHeight: 1.55, color: SV_MUTED, marginTop: 5 }}>{p.description}</div>}
                    {p.tech.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 8 }}>
                        {p.tech.map((t, k) => (
                          <span key={k} style={{ fontSize: 8, fontWeight: 500, padding: "2px 7px", borderRadius: 5, background: "#ffffff", border: `1px solid ${SV_BORDER}`, color: SV_INK }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {p.link && <div style={{ fontSize: 8.5, color: SV_SUBTLE, marginTop: 6, fontWeight: 450 }}>{p.link}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...SVCard, padding: "22px 24px", marginBottom: 14, borderRadius: 14 }}>
              <SVSectionHeader label="Education" icon="cap" />
              {data.education.map((ed, i) => (
                <div key={ed.id} style={{ marginBottom: i < data.education.length - 1 ? 12 : 0, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: SV_INK, letterSpacing: -0.1 }}>{ed.degree}</span>
                      <span style={{ fontSize: 10.5, color: SV_MUTED, marginLeft: 6, fontWeight: 450 }}>· {ed.school}{ed.location ? `, ${ed.location}` : ""}</span>
                    </div>
                    <span style={{ fontSize: 9, color: SV_SUBTLE, fontWeight: 500, whiteSpace: "nowrap" }}>{range(ed.start, ed.end)}</span>
                  </div>
                  {ed.grade && <div style={{ fontSize: 9.5, color: SV_MUTED, marginTop: 2 }}>{ed.grade}</div>}
                </div>
              ))}
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...SVCard, padding: "20px 24px", borderRadius: 14 }}>
              <SVSectionHeader label="Awards" icon="star" />
              {data.awards.map((aw, i) => (
                <div key={aw.id} style={{ marginBottom: i < data.awards.length - 1 ? 8 : 0, breakInside: "avoid" as React.CSSProperties["breakInside"], display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ marginTop: 3, width: 16, height: 16, borderRadius: 5, background: SV_TINT, border: `1px solid ${SV_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <LineIcon name="star" size={10} color={SV_ACCENT} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: SV_INK }}>{aw.title}</div>
                    <div style={{ fontSize: 9.5, color: SV_MUTED, marginTop: 1 }}>{aw.subtitle}{aw.date ? ` · ${aw.date}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...SVCard, padding: "20px 24px", marginTop: 14, borderRadius: 14 }}>
              <SVSectionHeader label={cs.title} icon="grid" />
              {cs.items.map((item, i) => (
                <div key={item.id} style={{ marginBottom: i < cs.items.length - 1 ? 10 : 0, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: SV_INK }}>{item.title}</span>
                    {item.date && <span style={{ fontSize: 9, color: SV_SUBTLE, fontWeight: 500 }}>{item.date}</span>}
                  </div>
                  {item.subtitle && <div style={{ fontSize: 10, color: SV_MUTED, marginTop: 1 }}>{item.subtitle}</div>}
                  {item.description && <div style={{ fontSize: 10, color: "#4b5563", marginTop: 3, lineHeight: 1.55 }}>{item.description}</div>}
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
// 5. EXECUTIVE ELITE — World-class executive resume. Cormorant Garamond
//    + DM Sans, premium divider lines (thin gold 0.5px), metallic
//    accents, elegant vertical timelines (gold dots), achievement cards
//    with metric highlights, clean infographics. Navy (#1e3a5f) + gold
//    color scheme. For CEOs, Architects, CTOs, senior executives.
// =====================================================================

const EE_NAVY = "#1e3a5f";
const EE_NAVY_DARK = "#15293f";
const EE_GOLD = "#c5a572";
const EE_GOLD_LIGHT = "#d4b88a";
const EE_CREAM = "#faf8f3";
const EE_INK = "#1a1a1a";
const EE_MUTED = "#6b7280";
const EE_BORDER = "rgba(30,58,95,0.12)";
const EE_BORDER_GOLD = "rgba(197,165,114,0.3)";

const EEHeaderBand = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none" }}>
    <defs>
      <linearGradient id="ee-navy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={EE_NAVY} />
        <stop offset="100%" stopColor={EE_NAVY_DARK} />
      </linearGradient>
    </defs>
    <rect width="800" height="200" fill="url(#ee-navy-grad)" />
    {/* subtle gold geometric lines */}
    <line x1="0" y1="40" x2="800" y2="40" stroke={EE_GOLD} strokeWidth="0.3" opacity="0.3" />
    <line x1="0" y1="160" x2="800" y2="160" stroke={EE_GOLD} strokeWidth="0.3" opacity="0.3" />
    <circle cx="700" cy="100" r="60" fill="none" stroke={EE_GOLD} strokeWidth="0.4" opacity="0.25" />
    <circle cx="700" cy="100" r="40" fill="none" stroke={EE_GOLD} strokeWidth="0.3" opacity="0.15" strokeDasharray="2 4" />
    <circle cx="700" cy="100" r="3" fill={EE_GOLD} opacity="0.4" />
  </svg>
);

function EESectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ width: 24, height: 1, background: EE_GOLD }} />
      <span style={{ fontFamily: DM_SANS, fontSize: 11, fontWeight: 700, color: EE_NAVY, letterSpacing: 3, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 0.5, background: `linear-gradient(90deg, ${EE_GOLD}, transparent)` }} />
    </div>
  );
}

export function ExecutiveEliteTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  return (
    <div className={PAPER} style={{ fontFamily: CORMORANT, background: "#ffffff", color: EE_INK, position: "relative", overflow: "hidden" }}>
      {/* Navy header band */}
      <div style={{ position: "relative", padding: "40px 48px 36px", background: EE_NAVY, color: "#ffffff", overflow: "hidden" }}>
        <EEHeaderBand />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 28, zIndex: 1 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `0.5px solid ${EE_GOLD}`, opacity: 0.6 }} />
            <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: `0.5px solid ${EE_GOLD}`, opacity: 0.3 }} />
            <Avatar data={data} size={96} ring={EE_GOLD} ringWidth={1} shape="circle" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 0.5, background: EE_GOLD }} />
              <span style={{ fontFamily: DM_SANS, fontSize: 9, color: EE_GOLD, letterSpacing: 4, textTransform: "uppercase", fontWeight: 600 }}>Executive Profile</span>
            </div>
            <h1 style={{ fontFamily: CORMORANT, fontSize: 40, fontWeight: 600, color: "#ffffff", margin: 0, lineHeight: 1.0, letterSpacing: 0.5 }}>{data.name}</h1>
            <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 18, color: EE_GOLD_LIGHT, margin: "6px 0 0", letterSpacing: 0.3 }}>{data.title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginTop: 14, fontFamily: DM_SANS, fontSize: 9.5, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
              {[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: EE_GOLD, fontSize: 6 }}>◆</span>{c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "32px 48px 40px", background: "#ffffff" }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 24, padding: "18px 22px", background: EE_CREAM, border: `0.5px solid ${EE_BORDER_GOLD}`, borderRadius: 2, position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: EE_GOLD }} />
            <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 14, lineHeight: 1.75, color: EE_NAVY, margin: 0, paddingLeft: 8 }}>{data.summary}</p>
          </div>
        )}

        {/* Experience — vertical gold-dot timeline */}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <EESectionHeader label="Career Highlights" />
            <div style={{ position: "relative", paddingLeft: 24 }}>
              <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: 0.5, background: EE_GOLD, opacity: 0.6 }} />
              {data.experience.map((e, i) => (
                <div key={e.id} style={{ marginBottom: i < data.experience.length - 1 ? 18 : 0, breakInside: "avoid" as React.CSSProperties["breakInside"], position: "relative" }}>
                  <div style={{ position: "absolute", left: -24, top: 4, width: 13, height: 13, borderRadius: "50%", background: "#ffffff", border: `1px solid ${EE_GOLD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: EE_GOLD }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontFamily: CORMORANT, fontSize: 17, fontWeight: 600, color: EE_NAVY }}>{e.role}</span>
                      <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 13, color: EE_GOLD, marginLeft: 8 }}>· {e.company}{e.location ? `, ${e.location}` : ""}</span>
                    </div>
                    <span style={{ fontFamily: DM_SANS, fontSize: 9, color: EE_MUTED, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {e.bullets.filter(b => b?.trim()).map((b, j) => (
                      <div key={j} style={{ fontFamily: DM_SANS, fontSize: 10.5, lineHeight: 1.7, color: "#374151", marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, top: 7, color: EE_GOLD, fontSize: 7 }}>◆</span>{b}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievement cards with metric highlights — for awards */}
        {visible(sections, "awards") && data.awards.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <EESectionHeader label="Achievements" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {data.awards.map(aw => (
                <div key={aw.id} style={{ padding: "16px 18px", background: "#ffffff", border: `0.5px solid ${EE_BORDER}`, borderRadius: 2, position: "relative", overflow: "hidden", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${EE_GOLD}, ${EE_NAVY})` }} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: EE_CREAM, border: `0.5px solid ${EE_BORDER_GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: CORMORANT, fontSize: 16, color: EE_GOLD, fontWeight: 600 }}>★</div>
                    <div>
                      <div style={{ fontFamily: CORMORANT, fontSize: 14, fontWeight: 600, color: EE_NAVY, lineHeight: 1.2 }}>{aw.title}</div>
                      <div style={{ fontFamily: DM_SANS, fontSize: 9.5, color: EE_MUTED, marginTop: 2 }}>{aw.subtitle}{aw.date ? ` · ${aw.date}` : ""}</div>
                      {aw.description && <div style={{ fontFamily: DM_SANS, fontSize: 9.5, color: "#4b5563", marginTop: 4, lineHeight: 1.55 }}>{aw.description}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-column lower */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div>
            {visible(sections, "skills") && data.skills.length > 0 && (
              <div>
                <EESectionHeader label="Core Competencies" />
                {data.skills.map((s, i) => {
                  const level = data.skillLevels[s];
                  return (
                    <div key={i} style={{ marginBottom: 9, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontFamily: DM_SANS, fontSize: 10.5, fontWeight: 600, color: EE_NAVY }}>{s}</span>
                        {level !== undefined && (
                          <div style={{ display: "flex", gap: 3 }}>
                            {[0, 1, 2, 3, 4].map(d => (
                              <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: d < Math.round((level / 100) * 5) ? EE_GOLD : EE_BORDER }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            {visible(sections, "education") && data.education.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <EESectionHeader label="Education" />
                {data.education.map(ed => (
                  <div key={ed.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: CORMORANT, fontSize: 14, fontWeight: 600, color: EE_NAVY }}>{ed.degree}</div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: EE_GOLD, marginTop: 2 }}>{ed.school}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                    <div style={{ fontFamily: DM_SANS, fontSize: 9, color: EE_MUTED, marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>{range(ed.start, ed.end)}{ed.location ? ` · ${ed.location}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
            {visible(sections, "languages") && data.languages.length > 0 && (
              <div>
                <EESectionHeader label="Languages" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {data.languages.map((l, i) => (
                    <span key={i} style={{ fontFamily: DM_SANS, fontSize: 10, fontWeight: 600, padding: "5px 12px", borderRadius: 2, background: EE_CREAM, border: `0.5px solid ${EE_BORDER_GOLD}`, color: EE_NAVY }}>{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects */}
        {visible(sections, "projects") && data.projects.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <EESectionHeader label="Selected Projects" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {data.projects.map(p => (
                <div key={p.id} style={{ padding: "14px 18px", background: "#ffffff", border: `0.5px solid ${EE_BORDER}`, borderRadius: 2, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 13, fontWeight: 600, color: EE_NAVY }}>{p.name}</div>
                  {p.description && <div style={{ fontFamily: DM_SANS, fontSize: 9.5, color: "#4b5563", lineHeight: 1.6, marginTop: 4 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontFamily: DM_SANS, fontSize: 8, color: EE_GOLD, marginTop: 6, letterSpacing: 0.5, fontWeight: 600 }}>{p.tech.join("  ·  ")}</div>}
                  {p.link && <div style={{ fontFamily: DM_SANS, fontSize: 8.5, color: EE_MUTED, marginTop: 4 }}>↗ {p.link}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div>
              <EESectionHeader label="Certifications" />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"], display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: EE_GOLD, fontSize: 7, marginTop: 4 }}>◆</span>
                  <div>
                    <span style={{ fontFamily: CORMORANT, fontSize: 12, fontWeight: 600, color: EE_NAVY }}>{c.title}</span>
                    <span style={{ fontFamily: DM_SANS, fontSize: 9, color: EE_MUTED, marginLeft: 6 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {visible(sections, "interests") && data.interests.length > 0 && (
            <div>
              <EESectionHeader label="Interests" />
              <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12.5, color: EE_NAVY, lineHeight: 1.8 }}>{data.interests.join("   ·   ")}</div>
            </div>
          )}
        </div>

        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
          <div key={cs.id} style={{ marginTop: 24 }}>
            <EESectionHeader label={cs.title} />
            {cs.items.map(item => (
              <div key={item.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: CORMORANT, fontSize: 14, fontWeight: 600, color: EE_NAVY }}>{item.title}</span>
                  {item.date && <span style={{ fontFamily: DM_SANS, fontSize: 9, color: EE_MUTED, letterSpacing: 1, textTransform: "uppercase" }}>{item.date}</span>}
                </div>
                {item.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: EE_GOLD, marginTop: 1 }}>{item.subtitle}</div>}
                {item.description && <div style={{ fontFamily: DM_SANS, fontSize: 10, color: "#4b5563", marginTop: 3, lineHeight: 1.6 }}>{item.description}</div>}
              </div>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: `0.5px solid ${EE_GOLD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: EE_MUTED, letterSpacing: 1 }}>— Executive Elite —</span>
          <span style={{ fontFamily: DM_SANS, fontSize: 8, color: EE_GOLD, letterSpacing: 4, textTransform: "uppercase", fontWeight: 600 }}>Navy {"&"} Gold</span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 6. PREMIUM CREATIVE — Premium creative resume with layered cards,
//    organic abstract illustrations (SVG blobs), mesh gradients, elegant
//    geometric graphics, floating UI components, stylish timelines,
//    premium skill visualization (progress rings + gradient bars),
//    Playfair Display + DM Sans. Coral/teal/violet on white.
// =====================================================================

const PC_BG = "#ffffff";
const PC_INK = "#1a1a2e";
const PC_MUTED = "#6b7280";
const PC_CORAL = "#ff6b6b";
const PC_TEAL = "#14b8a6";
const PC_VIOLET = "#8b5cf6";
const PC_AMBER = "#f59e0b";
const PC_BORDER = "rgba(26,26,46,0.08)";

const PCBlobs = () => (
  <>
    <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: "absolute", top: -60, right: -60, opacity: 0.25, pointerEvents: "none", zIndex: 0 }}>
      <defs>
        <linearGradient id="pc-blob1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={PC_CORAL} />
          <stop offset="100%" stopColor={PC_VIOLET} />
        </linearGradient>
      </defs>
      <path d="M 140 30 C 200 30 250 70 250 140 C 250 200 200 250 140 250 C 80 250 30 200 30 140 C 30 70 80 30 140 30 Z" fill="url(#pc-blob1)" opacity="0.5" transform="rotate(15 140 140)" />
    </svg>
    <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: "absolute", bottom: -50, left: -50, opacity: 0.2, pointerEvents: "none", zIndex: 0 }}>
      <defs>
        <linearGradient id="pc-blob2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={PC_TEAL} />
          <stop offset="100%" stopColor={PC_VIOLET} />
        </linearGradient>
      </defs>
      <path d="M 120 20 C 170 20 220 60 220 120 C 220 170 170 220 120 220 C 70 220 20 170 20 120 C 20 60 70 20 120 20 Z" fill="url(#pc-blob2)" opacity="0.6" transform="rotate(-20 120 120)" />
    </svg>
    <div style={{ position: "absolute", top: 200, right: 100, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${PC_AMBER}20, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />
  </>
);

const PCCard: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${PC_BORDER}`,
  borderRadius: 18,
  boxShadow: "0 2px 8px rgba(26,26,46,0.04), 0 8px 24px rgba(26,26,46,0.05)",
};

function PCSectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 24, height: 24, borderRadius: 8, background: `linear-gradient(135deg, ${color}, ${PC_VIOLET})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} />
      </div>
      <span style={{ fontFamily: PLAYFAIR, fontSize: 14, fontWeight: 700, color: PC_INK, letterSpacing: 0.5 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${PC_BORDER}, transparent)` }} />
    </div>
  );
}

function PCProgressRing({ label, level, color }: { label: string; level: number; color: string }) {
  const size = 70;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (level / 100) * c;
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
        <defs>
          <linearGradient id={`pcg-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={PC_VIOLET} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PC_BORDER} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#pcg-${label})`} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={PC_INK} fontFamily={DM_SANS}>{level}</text>
      </svg>
      <div style={{ fontFamily: DM_SANS, fontSize: 9, color: PC_MUTED, marginTop: 4, fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
}

export function PremiumCreativeTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const topSkills = data.skills.slice(0, 3);
  const ringColors = [PC_CORAL, PC_TEAL, PC_VIOLET];

  return (
    <div className={PAPER} style={{ fontFamily: DM_SANS, background: PC_BG, color: PC_INK, position: "relative", overflow: "hidden" }}>
      <PCBlobs />

      {/* Header — layered floating cards */}
      <div style={{ position: "relative", padding: "40px 40px 24px", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Avatar card — slightly rotated */}
          <div style={{ transform: "rotate(-3deg)", flexShrink: 0, padding: 8, background: "#ffffff", borderRadius: 20, border: `1px solid ${PC_BORDER}`, boxShadow: "0 8px 24px rgba(26,26,46,0.1)" }}>
            <Avatar data={data} size={96} shape="rounded" ring={`linear-gradient(135deg, ${PC_CORAL}, ${PC_VIOLET})`} ringWidth={2} />
          </div>
          {/* Name card — overlapping */}
          <div style={{ flex: 1, transform: "rotate(0.5deg)", padding: "18px 24px", background: "#ffffff", borderRadius: 16, border: `1px solid ${PC_BORDER}`, boxShadow: "0 6px 20px rgba(26,26,46,0.06)", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 16, right: 16, height: 3, borderRadius: 999, background: `linear-gradient(90deg, ${PC_CORAL}, ${PC_TEAL}, ${PC_VIOLET})` }} />
            <div style={{ fontFamily: DM_SANS, fontSize: 9, fontWeight: 600, color: PC_CORAL, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 4, marginTop: 4 }}>Creative Portfolio</div>
            <h1 style={{ fontFamily: PLAYFAIR, fontSize: 38, fontWeight: 700, color: PC_INK, margin: 0, lineHeight: 1.0, letterSpacing: -0.5 }}>
              <span style={{ background: `linear-gradient(135deg, ${PC_CORAL} 0%, ${PC_VIOLET} 50%, ${PC_TEAL} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" as React.CSSProperties["color"] }}>{data.name}</span>
            </h1>
            <p style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 15, color: PC_MUTED, margin: "4px 0 0", letterSpacing: 0.2 }}>{data.title}</p>
          </div>
        </div>
        {/* Contact row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 16, padding: "10px 18px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: 12, border: `1px solid ${PC_BORDER}` }}>
          {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: DM_SANS, fontSize: 9.5, color: PC_MUTED, fontWeight: 500 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: [PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4] }} />{c}
            </span>
          ))}
        </div>
      </div>

      {/* Body — 2-col */}
      <div style={{ position: "relative", padding: "0 40px 36px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, zIndex: 1 }}>
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...PCCard, padding: "20px 24px", marginBottom: 14, borderRadius: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: `linear-gradient(180deg, ${PC_CORAL}, ${PC_VIOLET})` }} />
              <PCSectionHeader label="About" color={PC_CORAL} />
              <p style={{ fontSize: 11.5, lineHeight: 1.7, color: "#374151", margin: 0, fontWeight: 400 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...PCCard, padding: "22px 24px", marginBottom: 14, borderRadius: 16 }}>
              <PCSectionHeader label="Experience" color={PC_TEAL} />
              {data.experience.map((e, i) => (
                <div key={e.id} style={{ marginBottom: i < data.experience.length - 1 ? 16 : 0, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: i < data.experience.length - 1 ? 16 : 0, borderBottom: i < data.experience.length - 1 ? `1px solid ${PC_BORDER}` : "none", display: "flex", gap: 14 }}>
                  {/* offset colored dot */}
                  <div style={{ flexShrink: 0, marginTop: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${[PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4]}20, ${[PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4]}10)`, border: `1px solid ${[PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4]}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: [PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4] }}>{i + 1}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontFamily: PLAYFAIR, fontSize: 14, fontWeight: 700, color: PC_INK }}>{e.role}</span>
                      <span style={{ fontFamily: DM_SANS, fontSize: 9, fontWeight: 600, color: "#ffffff", padding: "3px 10px", borderRadius: 999, background: `linear-gradient(135deg, ${[PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4]}, ${PC_VIOLET})`, whiteSpace: "nowrap" }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontFamily: DM_SANS, fontSize: 11, color: [PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4], fontWeight: 600, marginTop: 2 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                    <div style={{ marginTop: 7 }}>
                      {e.bullets.filter(b => b?.trim()).map((b, j) => (
                        <div key={j} style={{ fontSize: 10.5, lineHeight: 1.65, color: "#4b5563", marginBottom: 3, paddingLeft: 12, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", background: [PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4] }} />{b}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...PCCard, padding: "22px 24px", borderRadius: 16 }}>
              <PCSectionHeader label="Projects" color={PC_VIOLET} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.projects.map((p, i) => (
                  <div key={p.id} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.6)", border: `1px solid ${PC_BORDER}`, breakInside: "avoid" as React.CSSProperties["breakInside"], position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${[PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4]}, ${PC_VIOLET})` }} />
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: PC_INK }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 10, lineHeight: 1.55, color: "#4b5563", marginTop: 5 }}>{p.description}</div>}
                    {p.tech.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                        {p.tech.map((t, k) => (
                          <span key={k} style={{ fontSize: 8, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: `${[PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4]}15`, color: [PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4] }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {p.link && <div style={{ fontSize: 8.5, color: PC_MUTED, marginTop: 6, fontWeight: 500 }}>↗ {p.link}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {visible(sections, "skills") && topSkills.length > 0 && (
            <div style={{ ...PCCard, padding: "18px 20px", marginBottom: 14, borderRadius: 16 }}>
              <PCSectionHeader label="Top Skills" color={PC_CORAL} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                {topSkills.map((s, i) => <PCProgressRing key={i} label={s} level={data.skillLevels[s] ?? 80} color={ringColors[i % 3]} />)}
              </div>
            </div>
          )}

          {visible(sections, "skills") && data.skills.length > 3 && (
            <div style={{ ...PCCard, padding: "18px 20px", marginBottom: 14, borderRadius: 16 }}>
              <PCSectionHeader label="More Skills" color={PC_TEAL} />
              {data.skills.slice(3).map((s, i) => {
                const level = data.skillLevels[s] ?? 60;
                return (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: PC_INK, fontWeight: 600, marginBottom: 3 }}>
                      <span>{s}</span><span style={{ color: PC_MUTED }}>{level}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 999, background: PC_BORDER, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${level}%`, background: `linear-gradient(90deg, ${[PC_CORAL, PC_TEAL, PC_VIOLET, PC_AMBER][i % 4]}, ${PC_VIOLET})`, borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...PCCard, padding: "18px 20px", marginBottom: 14, borderRadius: 16 }}>
              <PCSectionHeader label="Education" color={PC_VIOLET} />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: PC_INK }}>{ed.degree}</div>
                  <div style={{ fontSize: 10.5, color: PC_CORAL, marginTop: 1, fontWeight: 600 }}>{ed.school}</div>
                  <div style={{ fontSize: 9, color: PC_MUTED, marginTop: 1 }}>{range(ed.start, ed.end)}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...PCCard, padding: "18px 20px", marginBottom: 14, borderRadius: 16 }}>
              <PCSectionHeader label="Certs" color={PC_AMBER} />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: PC_INK }}>{c.title}</div>
                  <div style={{ fontSize: 9, color: PC_MUTED, marginTop: 1 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...PCCard, padding: "18px 20px", marginBottom: 14, borderRadius: 16 }}>
              <PCSectionHeader label="Languages" color={PC_CORAL} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.languages.map((l, i) => (
                  <span key={i} style={{ fontSize: 9.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: `linear-gradient(135deg, ${PC_CORAL}15, ${PC_TEAL}15)`, color: PC_INK }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...PCCard, padding: "18px 20px", marginBottom: 14, borderRadius: 16 }}>
              <PCSectionHeader label="Awards" color={PC_TEAL} />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: PC_INK }}>{aw.title}</div>
                  <div style={{ fontSize: 9, color: PC_VIOLET, marginTop: 1 }}>{aw.subtitle}{aw.date ? ` · ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...PCCard, padding: "18px 20px", borderRadius: 16 }}>
              <PCSectionHeader label="Interests" color={PC_VIOLET} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 9.5, fontWeight: 500, color: PC_MUTED }}>· {it}</span>
                ))}
              </div>
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...PCCard, padding: "18px 20px", marginTop: 14, borderRadius: 16 }}>
              <PCSectionHeader label={cs.title} color={PC_CORAL} />
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: PLAYFAIR, fontSize: 12, fontWeight: 700, color: PC_INK }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontSize: 9.5, color: PC_CORAL, marginTop: 1 }}>{item.subtitle}</div>}
                  {item.description && <div style={{ fontSize: 9.5, color: "#4b5563", marginTop: 2, lineHeight: 1.5 }}>{item.description}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 7. PREMIUM 2026 GLASS — Futuristic premium using frosted glass panels,
//    translucent cards (rgba(255,255,255,0.7) + blur(16px)), aurora
//    gradients (animated-looking mesh), soft glowing borders, floating
//    layouts, subtle depth. Light theme with pastel aurora — cyan/pink/
//    violet gradients on white.
// =====================================================================

const PG_BG = "#ffffff";
const PG_INK = "#0f172a";
const PG_MUTED = "#64748b";
const PG_CYAN = "#06b6d4";
const PG_PINK = "#ec4899";
const PG_VIOLET = "#8b5cf6";
const PG_BLUE = "#3b82f6";
const PG_BORDER = "rgba(255,255,255,0.9)";

const PGAurora = () => (
  <>
    <div style={{ position: "absolute", top: -100, right: -80, width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, ${PG_CYAN}30, transparent 70%)`, filter: "blur(55px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", top: 120, left: -100, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle, ${PG_PINK}28, transparent 70%)`, filter: "blur(55px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", bottom: -80, right: 200, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${PG_VIOLET}25, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", top: 300, right: 80, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${PG_BLUE}20, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />
  </>
);

const PGGlass: React.CSSProperties = {
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.9)",
  borderRadius: 20,
  boxShadow: "0 4px 16px rgba(15,23,42,0.04), 0 12px 40px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
};

function PGSectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${PG_VIOLET})`, boxShadow: `0 0 8px ${color}80, 0 0 16px ${color}40` }} />
      <span style={{ fontFamily: MANROPE, fontSize: 11, fontWeight: 700, color: PG_INK, letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(15,23,42,0.12), transparent)` }} />
    </div>
  );
}

export function Premium2026GlassTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  return (
    <div className={PAPER} style={{ fontFamily: MANROPE, background: PG_BG, color: PG_INK, position: "relative", overflow: "hidden" }}>
      <PGAurora />

      {/* Hero — floating glass panel */}
      <div style={{ position: "relative", padding: "40px 40px 24px", zIndex: 1 }}>
        <div style={{ ...PGGlass, padding: "26px 30px", borderRadius: 24, position: "relative", overflow: "hidden" }}>
          {/* glowing top border */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent, ${PG_CYAN}, ${PG_PINK}, ${PG_VIOLET}, transparent)` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: -8, borderRadius: 22, background: `conic-gradient(from 0deg, ${PG_CYAN}, ${PG_PINK}, ${PG_VIOLET}, ${PG_BLUE}, ${PG_CYAN})`, filter: "blur(12px)", opacity: 0.4 }} />
              <Avatar data={data} size={100} shape="rounded" ring="rgba(255,255,255,0.95)" ringWidth={3} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: MANROPE, fontSize: 9.5, fontWeight: 700, color: PG_VIOLET, letterSpacing: 2.5, textTransform: "uppercase" }}>{"//"} Glass · 2026</span>
              </div>
              <h1 style={{ fontFamily: MANROPE, fontSize: 38, fontWeight: 800, color: PG_INK, margin: 0, lineHeight: 1.0, letterSpacing: -0.8 }}>
                <span style={{ background: `linear-gradient(135deg, ${PG_INK} 0%, ${PG_VIOLET} 60%, ${PG_PINK} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" as React.CSSProperties["color"] }}>{data.name}</span>
              </h1>
              <p style={{ fontFamily: MANROPE, fontSize: 14, fontWeight: 500, color: PG_MUTED, margin: "6px 0 0", letterSpacing: 0.1 }}>{data.title}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", marginTop: 14, fontSize: 9.5, color: PG_MUTED, fontWeight: 500 }}>
                {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: `linear-gradient(135deg, ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}, ${PG_VIOLET})`, boxShadow: `0 0 5px ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}80` }} />{c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body — 2-col floating glass */}
      <div style={{ position: "relative", padding: "0 40px 36px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, zIndex: 1 }}>
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...PGGlass, padding: "20px 24px", marginBottom: 14, borderRadius: 18 }}>
              <PGSectionHeader label="Profile" color={PG_CYAN} />
              <p style={{ fontSize: 11.5, lineHeight: 1.7, color: "#334155", margin: 0, fontWeight: 450 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...PGGlass, padding: "22px 24px", marginBottom: 14, borderRadius: 18 }}>
              <PGSectionHeader label="Experience" color={PG_PINK} />
              {data.experience.map((e, i) => (
                <div key={e.id} style={{ marginBottom: i < data.experience.length - 1 ? 16 : 0, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: i < data.experience.length - 1 ? 16 : 0, borderBottom: i < data.experience.length - 1 ? "1px solid rgba(15,23,42,0.06)" : "none", display: "flex", gap: 14 }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 10, background: `linear-gradient(135deg, ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}25, ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}10)`, border: `1px solid ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}40`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 10px ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}30` }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: [PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4] }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: PG_INK, letterSpacing: -0.2 }}>{e.role}</span>
                      <span style={{ fontFamily: MANROPE, fontSize: 9, fontWeight: 600, color: PG_VIOLET, padding: "3px 10px", borderRadius: 999, background: `linear-gradient(135deg, ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}18, ${PG_VIOLET}18)`, whiteSpace: "nowrap", letterSpacing: 0.3 }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: [PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4], marginTop: 2 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                    <div style={{ marginTop: 7 }}>
                      {e.bullets.filter(b => b?.trim()).map((b, j) => (
                        <div key={j} style={{ fontSize: 10.5, lineHeight: 1.65, color: "#475569", marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, top: 6, width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg, ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}, ${PG_VIOLET})` }} />{b}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...PGGlass, padding: "22px 24px", borderRadius: 18 }}>
              <PGSectionHeader label="Projects" color={PG_VIOLET} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.projects.map((p, i) => (
                  <div key={p.id} style={{ padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.5)", border: `1px solid rgba(255,255,255,0.8)`, boxShadow: "0 2px 8px rgba(15,23,42,0.03)", breakInside: "avoid" as React.CSSProperties["breakInside"], position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}, ${PG_VIOLET})` }} />
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: PG_INK, letterSpacing: -0.1 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 10, lineHeight: 1.55, color: "#475569", marginTop: 5 }}>{p.description}</div>}
                    {p.tech.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                        {p.tech.map((t, k) => (
                          <span key={k} style={{ fontSize: 8, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: `${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}12`, color: [PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4] }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {p.link && <div style={{ fontSize: 8.5, color: PG_CYAN, marginTop: 6, fontWeight: 600 }}>↗ {p.link}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...PGGlass, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <PGSectionHeader label="Skills" color={PG_CYAN} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {data.skills.map((s, i) => {
                  const level = data.skillLevels[s];
                  return (
                    <div key={i} style={{ padding: "7px 12px", borderRadius: 10, background: "rgba(255,255,255,0.6)", border: `1px solid ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}30`, position: "relative", overflow: "hidden", boxShadow: `0 0 8px ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}10` }}>
                      {level !== undefined && <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${level}%`, background: `linear-gradient(90deg, ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}, ${PG_VIOLET})` }} />}
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: PG_INK, letterSpacing: -0.1 }}>{s}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...PGGlass, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <PGSectionHeader label="Education" color={PG_PINK} />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: PG_INK }}>{ed.degree}</div>
                  <div style={{ fontSize: 10, color: PG_VIOLET, marginTop: 1, fontWeight: 600 }}>{ed.school}</div>
                  <div style={{ fontFamily: MANROPE, fontSize: 8.5, color: PG_MUTED, marginTop: 1 }}>{range(ed.start, ed.end)}{ed.grade ? ` · ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...PGGlass, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <PGSectionHeader label="Certifications" color={PG_BLUE} />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: PG_INK }}>{c.title}</div>
                  <div style={{ fontSize: 9, color: PG_MUTED, marginTop: 1 }}>{c.subtitle}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...PGGlass, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <PGSectionHeader label="Languages" color={PG_VIOLET} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.languages.map((l, i) => (
                  <span key={i} style={{ fontSize: 9.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: `linear-gradient(135deg, ${[PG_CYAN, PG_PINK, PG_VIOLET, PG_BLUE][i % 4]}15, ${PG_VIOLET}15)`, color: PG_INK }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...PGGlass, padding: "18px 20px", marginBottom: 14, borderRadius: 18 }}>
              <PGSectionHeader label="Awards" color={PG_PINK} />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: PG_INK }}>{aw.title}</div>
                  <div style={{ fontSize: 9, color: PG_VIOLET, marginTop: 1 }}>{aw.subtitle}{aw.date ? ` · ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...PGGlass, padding: "18px 20px", borderRadius: 18 }}>
              <PGSectionHeader label="Interests" color={PG_CYAN} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 9.5, fontWeight: 500, color: PG_MUTED }}>· {it}</span>
                ))}
              </div>
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...PGGlass, padding: "18px 20px", marginTop: 14, borderRadius: 18 }}>
              <PGSectionHeader label={cs.title} color={PG_VIOLET} />
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: PG_INK }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontSize: 9, color: PG_VIOLET, marginTop: 1 }}>{item.subtitle}</div>}
                  {item.description && <div style={{ fontSize: 9.5, color: "#475569", marginTop: 2, lineHeight: 1.5 }}>{item.description}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
