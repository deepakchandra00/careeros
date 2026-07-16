"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";

const PAPER = "resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl";
const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

// Avatar helper — supports circle, square, and rounded shapes
function Avatar({ data, size, ring, ringWidth = 3, shape = "circle" }: { data: ResumeData; size: number; ring?: string; ringWidth?: number; shape?: "circle" | "square" | "rounded" }) {
  const borderStyle = ring ? `${ring} ${ringWidth}px solid` : undefined;
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "20px" : "0";
  const initials = data.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  if (data.photo) return <img src={data.photo} alt={data.name} style={{ width: size, height: size, borderRadius, objectFit: "cover", border: borderStyle }} />;
  return <div style={{ width: size, height: size, borderRadius, background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, border: borderStyle }}>{initials}</div>;
}

function range(start: string, end: string) {
  const s = (start ?? "").trim(); const e = (end ?? "").trim();
  if (s && e) return `${s} — ${e}`; if (s) return `${s} — Present`; return e || "";
}

// Font stacks (module level)
const PLAYFAIR = "'Playfair Display', Georgia, serif";
const CORMORANT = "'Cormorant Garamond', Georgia, serif";
const INTER = "'Inter', system-ui, sans-serif";
const DM_SANS = "'DM Sans', system-ui, sans-serif";
const SPACE_GROTESK = "'Space Grotesk', system-ui, sans-serif";
const MANROPE = "'Manrope', system-ui, sans-serif";
const JETBRAINS = "'JetBrains Mono', monospace";

// =====================================================================
// 1. GLASSMORPHISM — Ultra-modern translucent cards with frosted glass
//    panels, vibrant blue/purple/cyan mesh gradient blobs, layered
//    backgrounds, 20-28px rounded corners, soft layered shadows.
//    Apple VisionOS + Linear + Framer + Arc Browser aesthetic.
//    Font: Manrope. White background with vibrant gradient accents.
// =====================================================================

// Glassmorphism palette
const GLASS_BG = "#ffffff";
const GLASS_INK = "#0f172a";
const GLASS_MUTED = "#64748b";
const GLASS_CYAN = "#06b6d4";
const GLASS_VIOLET = "#8b5cf6";
const GLASS_BLUE = "#3b82f6";

// Decorative mesh gradient blobs (positioned absolute behind content)
const GlassBlobs = () => (
  <>
    <div style={{ position: "absolute", top: -100, right: -80, width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, ${GLASS_VIOLET}55, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", top: 200, left: -120, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${GLASS_CYAN}55, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", bottom: -100, right: 100, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${GLASS_BLUE}40, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
    {/* abstract floating circles */}
    <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: "absolute", top: 80, left: 60, opacity: 0.5, pointerEvents: "none", zIndex: 0 }}>
      <circle cx="40" cy="40" r="36" fill="none" stroke={GLASS_VIOLET} strokeWidth="1" strokeDasharray="3 4" />
      <circle cx="40" cy="40" r="6" fill={GLASS_VIOLET} opacity="0.4" />
    </svg>
  </>
);

const GlassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.8)",
  borderRadius: 24,
  boxShadow: "0 8px 32px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
};

const GlassSectionTitle = ({ label, accent }: { label: string; accent: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
    <div style={{ width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, ${GLASS_VIOLET})`, boxShadow: `0 0 8px ${accent}80` }} />
    <span style={{ fontFamily: MANROPE, fontSize: 11, fontWeight: 700, color: GLASS_INK, letterSpacing: 2.5, textTransform: "uppercase" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(15,23,42,0.15), transparent)" }} />
  </div>
);

export function GlassmorphismTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const accent = GLASS_VIOLET;
  return (
    <div className={PAPER} style={{ fontFamily: MANROPE, background: GLASS_BG, color: GLASS_INK, position: "relative", overflow: "hidden" }}>
      <GlassBlobs />

      {/* Hero glass panel */}
      <div style={{ position: "relative", padding: "44px 44px 36px", zIndex: 1 }}>
        <div style={{ ...GlassCard, padding: "28px 32px", display: "flex", alignItems: "center", gap: 28, borderRadius: 28 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: 24, background: `linear-gradient(135deg, ${GLASS_VIOLET}, ${GLASS_CYAN})`, filter: "blur(14px)", opacity: 0.5 }} />
            <Avatar data={data} size={104} shape="rounded" ring="rgba(255,255,255,0.9)" ringWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: MANROPE, fontSize: 9.5, fontWeight: 700, color: GLASS_VIOLET, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Portfolio · 2025</div>
            <h1 style={{ fontFamily: MANROPE, fontSize: 40, fontWeight: 800, color: GLASS_INK, margin: 0, lineHeight: 1.05, letterSpacing: -1 }}>
              <span style={{ background: `linear-gradient(135deg, ${GLASS_INK} 0%, ${GLASS_VIOLET} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" as React.CSSProperties["color"] }}>{data.name}</span>
            </h1>
            <p style={{ fontFamily: MANROPE, fontSize: 14, fontWeight: 500, color: GLASS_MUTED, margin: "6px 0 0", letterSpacing: 0.2 }}>{data.title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: 14, fontSize: 9.5, color: GLASS_MUTED, fontWeight: 500 }}>
              {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: `linear-gradient(135deg, ${GLASS_VIOLET}, ${GLASS_CYAN})` }} />{c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body: 2-column with floating glass panels */}
      <div style={{ position: "relative", padding: "0 44px 44px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22, zIndex: 1 }}>
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...GlassCard, padding: "20px 24px", marginBottom: 18, borderRadius: 22 }}>
              <GlassSectionTitle label="Profile" accent={GLASS_CYAN} />
              <p style={{ fontSize: 11.5, lineHeight: 1.7, color: GLASS_INK, margin: 0, fontWeight: 450 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...GlassCard, padding: "22px 24px", marginBottom: 18, borderRadius: 22 }}>
              <GlassSectionTitle label="Experience" accent={GLASS_VIOLET} />
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 16, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: 16, borderBottom: `1px solid rgba(15,23,42,0.06)` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: GLASS_INK }}>{e.role}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: GLASS_VIOLET, padding: "3px 10px", borderRadius: 999, background: `linear-gradient(135deg, ${GLASS_VIOLET}20, ${GLASS_CYAN}20)`, whiteSpace: "nowrap", letterSpacing: 0.4 }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: GLASS_CYAN, marginTop: 2 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                  <div style={{ marginTop: 8 }}>
                    {e.bullets.filter(b => b?.trim()).map((b, i) => (
                      <div key={i} style={{ fontSize: 10.5, lineHeight: 1.6, color: "#334155", marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, top: 6, width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg, ${GLASS_VIOLET}, ${GLASS_CYAN})` }} />{b}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...GlassCard, padding: "22px 24px", borderRadius: 22 }}>
              <GlassSectionTitle label="Projects" accent={GLASS_BLUE} />
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: 14, borderBottom: `1px solid rgba(15,23,42,0.06)` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GLASS_INK }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 10.5, lineHeight: 1.6, color: "#334155", marginTop: 3 }}>{p.description}</div>}
                  {p.tech.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                      {p.tech.map((t, i) => (
                        <span key={i} style={{ fontSize: 8.5, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: "rgba(139,92,246,0.1)", color: GLASS_VIOLET }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {p.link && <div style={{ fontSize: 9, color: GLASS_CYAN, marginTop: 5, fontWeight: 600 }}>↗ {p.link}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...GlassCard, padding: "20px 22px", marginBottom: 18, borderRadius: 22 }}>
              <GlassSectionTitle label="Skills" accent={GLASS_VIOLET} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.skills.map((s, i) => {
                  const level = data.skillLevels[s];
                  return (
                    <div key={i} style={{ padding: "6px 11px", borderRadius: 12, background: "rgba(255,255,255,0.7)", border: "1px solid rgba(139,92,246,0.25)", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: GLASS_INK }}>{s}</div>
                      {level !== undefined && (
                        <div style={{ marginTop: 4, height: 3, width: "100%", borderRadius: 999, background: "rgba(15,23,42,0.08)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${level}%`, borderRadius: 999, background: `linear-gradient(90deg, ${GLASS_VIOLET}, ${GLASS_CYAN})` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...GlassCard, padding: "20px 22px", marginBottom: 18, borderRadius: 22 }}>
              <GlassSectionTitle label="Education" accent={GLASS_CYAN} />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: GLASS_INK }}>{ed.degree}</div>
                  <div style={{ fontSize: 10.5, color: GLASS_VIOLET, marginTop: 2, fontWeight: 600 }}>{ed.school}</div>
                  <div style={{ fontSize: 9, color: GLASS_MUTED, marginTop: 2 }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...GlassCard, padding: "20px 22px", marginBottom: 18, borderRadius: 22 }}>
              <GlassSectionTitle label="Certifications" accent={GLASS_BLUE} />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GLASS_INK }}>{c.title}</div>
                  <div style={{ fontSize: 9.5, color: GLASS_MUTED, marginTop: 1 }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...GlassCard, padding: "20px 22px", marginBottom: 18, borderRadius: 22 }}>
              <GlassSectionTitle label="Languages" accent={GLASS_VIOLET} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.languages.map((l, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: `linear-gradient(135deg, ${GLASS_VIOLET}15, ${GLASS_CYAN}15)`, color: GLASS_INK }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...GlassCard, padding: "20px 22px", marginBottom: 18, borderRadius: 22 }}>
              <GlassSectionTitle label="Awards" accent={GLASS_CYAN} />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GLASS_INK }}>{aw.title}</div>
                  <div style={{ fontSize: 9.5, color: GLASS_VIOLET, marginTop: 1 }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...GlassCard, padding: "20px 22px", borderRadius: 22 }}>
              <GlassSectionTitle label="Interests" accent={GLASS_BLUE} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 500, color: GLASS_MUTED }}>· {it}</span>
                ))}
              </div>
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...GlassCard, padding: "20px 22px", marginTop: 18, borderRadius: 22 }}>
              <GlassSectionTitle label={cs.title} accent={GLASS_VIOLET} />
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GLASS_INK }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontSize: 9.5, color: GLASS_VIOLET, marginTop: 1 }}>{item.subtitle}</div>}
                  {item.description && <div style={{ fontSize: 10, color: "#334155", marginTop: 2, lineHeight: 1.55 }}>{item.description}</div>}
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
// 2. EDITORIAL MAGAZINE — Vogue / Monocle inspired editorial spread.
//    Oversized Playfair Display name (44-48px), thin 0.5px dividers,
//    ivory/charcoal/dusty-rose palette, vertical text rail, abstract
//    minimal illustrations, magazine-spread layout. Every section feels
//    like a magazine page.
// =====================================================================

const ED_IVORY = "#faf7f1";
const ED_CHARCOAL = "#2b2620";
const ED_ROSE = "#c08a8a";
const ED_MUTED = "#8a8278";
const ED_INK = "#1a1612";

const EditorialOrnament = () => (
  <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: "absolute", top: 36, right: 36, opacity: 0.4, pointerEvents: "none" }}>
    <circle cx="90" cy="90" r="60" fill="none" stroke={ED_ROSE} strokeWidth="0.5" />
    <circle cx="90" cy="90" r="44" fill="none" stroke={ED_ROSE} strokeWidth="0.5" strokeDasharray="2 3" />
    <line x1="90" y1="20" x2="90" y2="160" stroke={ED_ROSE} strokeWidth="0.3" />
    <line x1="20" y1="90" x2="160" y2="90" stroke={ED_ROSE} strokeWidth="0.3" />
    <circle cx="90" cy="90" r="2.5" fill={ED_ROSE} />
  </svg>
);

const EditorialSectionMark = ({ n, label }: { n: string; label: string }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18, marginTop: 6 }}>
    <span style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 13, color: ED_ROSE, letterSpacing: 1 }}>{n}</span>
    <span style={{ fontFamily: PLAYFAIR, fontSize: 14, fontWeight: 700, color: ED_CHARCOAL, letterSpacing: 4, textTransform: "uppercase" }}>{label}</span>
    <div style={{ flex: 1, height: 0.5, background: ED_ROSE, opacity: 0.5 }} />
  </div>
);

export function EditorialMagazineTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  return (
    <div className={PAPER} style={{ fontFamily: PLAYFAIR, background: ED_IVORY, color: ED_INK, position: "relative", overflow: "hidden" }}>
      <EditorialOrnament />

      {/* Vertical "PORTFOLIO N° 01" rail on right */}
      <div style={{ position: "absolute", right: 18, top: 60, bottom: 60, width: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
        <div style={{ writingMode: "vertical-rl" as React.CSSProperties["writingMode"], transform: "rotate(180deg)", fontFamily: DM_SANS, fontSize: 9, color: ED_ROSE, letterSpacing: 8, fontWeight: 600, textTransform: "uppercase" }}>Portfolio N° 01</div>
        <div style={{ writingMode: "vertical-rl" as React.CSSProperties["writingMode"], transform: "rotate(180deg)", fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 11, color: ED_MUTED, letterSpacing: 2 }}>Volume I · MMXXV</div>
      </div>

      {/* Magazine cover header */}
      <div style={{ padding: "56px 56px 40px 64px", borderBottom: `0.5px solid ${ED_ROSE}`, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 36 }}>
          <div style={{ flex: 1, paddingTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 32, height: 0.5, background: ED_ROSE }} />
              <span style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 12, color: ED_ROSE, letterSpacing: 4, textTransform: "uppercase" }}>The Profile</span>
            </div>
            <h1 style={{ fontFamily: PLAYFAIR, fontSize: 46, fontWeight: 700, color: ED_CHARCOAL, margin: 0, lineHeight: 1.0, letterSpacing: -1 }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
              <div style={{ width: 24, height: 0.5, background: ED_ROSE }} />
              <p style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 17, color: ED_MUTED, margin: 0, letterSpacing: 0.5 }}>{data.title}</p>
            </div>
            {/* contact as editorial caption */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginTop: 22, fontFamily: DM_SANS, fontSize: 9, color: ED_MUTED, letterSpacing: 0.5, fontWeight: 500 }}>
              {[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: ED_ROSE, fontSize: 8 }}>—</span>{c}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: `0.5px solid ${ED_ROSE}`, opacity: 0.7 }} />
            <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: `0.5px solid ${ED_ROSE}`, opacity: 0.3, strokeDasharray: "2 3" }} />
            <Avatar data={data} size={104} ring={ED_ROSE} ringWidth={0.5} shape="circle" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "40px 56px 44px 64px" }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 36 }}>
            <EditorialSectionMark n="I." label="Profile" />
            <p style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 16, lineHeight: 1.8, color: ED_CHARCOAL, margin: 0, maxWidth: 600 }}>{data.summary}</p>
          </div>
        )}

        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <EditorialSectionMark n="II." label="Experience" />
            <div>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 22, breakInside: "avoid" as React.CSSProperties["breakInside"], display: "grid", gridTemplateColumns: "100px 1fr", gap: 22 }}>
                  <div style={{ textAlign: "right", paddingTop: 2 }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 11, color: ED_ROSE, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>{range(e.start, e.end)}</div>
                  </div>
                  <div style={{ borderLeft: `0.5px solid ${ED_ROSE}`, paddingLeft: 22 }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 17, fontWeight: 700, color: ED_CHARCOAL, lineHeight: 1.2 }}>{e.role}</div>
                    <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 13, color: ED_ROSE, marginTop: 2 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                    <div style={{ marginTop: 10 }}>
                      {e.bullets.filter(b => b?.trim()).map((b, i) => (
                        <div key={i} style={{ fontFamily: PLAYFAIR, fontSize: 11.5, lineHeight: 1.75, color: "#3d3833", marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: ED_ROSE, fontSize: 8, top: 8 }}>—</span>{b}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* two-column lower spread */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            {visible(sections, "education") && data.education.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <EditorialSectionMark n="III." label="Education" />
                {data.education.map(ed => (
                  <div key={ed.id} style={{ marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 14, fontWeight: 700, color: ED_CHARCOAL }}>{ed.degree}</div>
                    <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 12, color: ED_ROSE, marginTop: 2 }}>{ed.school}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                    <div style={{ fontFamily: DM_SANS, fontSize: 9, color: ED_MUTED, marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>{range(ed.start, ed.end)}</div>
                  </div>
                ))}
              </div>
            )}
            {visible(sections, "skills") && data.skills.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <EditorialSectionMark n="IV." label="Expertise" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.skills.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, fontFamily: PLAYFAIR, fontSize: 12.5, color: ED_CHARCOAL }}>
                      <span style={{ color: ED_ROSE, fontSize: 9 }}>—</span>
                      <span style={{ flex: 1 }}>{s}</span>
                      {data.skillLevels[s] !== undefined && (
                        <span style={{ fontFamily: DM_SANS, fontSize: 8, color: ED_MUTED, letterSpacing: 1 }}>{data.skillLevels[s]}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            {visible(sections, "projects") && data.projects.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <EditorialSectionMark n="V." label="Selected Works" />
                {data.projects.map(p => (
                  <div key={p.id} style={{ marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: ED_CHARCOAL }}>{p.name}</div>
                    {p.description && <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 11, color: "#3d3833", lineHeight: 1.6, marginTop: 2 }}>{p.description}</div>}
                    {p.tech.length > 0 && <div style={{ fontFamily: DM_SANS, fontSize: 8, color: ED_ROSE, marginTop: 4, letterSpacing: 0.5 }}>{p.tech.join("  ·  ")}</div>}
                  </div>
                ))}
              </div>
            )}
            {visible(sections, "languages") && data.languages.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <EditorialSectionMark n="VI." label="Languages" />
                <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 13, color: ED_CHARCOAL, lineHeight: 1.9 }}>{data.languages.join("   ·   ")}</div>
              </div>
            )}
            {visible(sections, "awards") && data.awards.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <EditorialSectionMark n="VII." label="Distinctions" />
                {data.awards.map(aw => (
                  <div key={aw.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: ED_CHARCOAL }}>{aw.title}</div>
                    <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 11, color: ED_ROSE, marginTop: 1 }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {visible(sections, "certifications") && data.certifications.length > 0 && (
          <div style={{ marginBottom: 28, marginTop: 12 }}>
            <EditorialSectionMark n="VIII." label="Certifications" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px" }}>
              {data.certifications.map(c => (
                <div key={c.id} style={{ fontFamily: PLAYFAIR, fontSize: 12, color: ED_CHARCOAL }}>
                  <span style={{ color: ED_ROSE, marginRight: 6, fontSize: 8 }}>—</span>{c.title}{c.date ? <span style={{ color: ED_MUTED, fontStyle: "italic", marginLeft: 6 }}>, {c.date}</span> : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {visible(sections, "interests") && data.interests.length > 0 && (
          <div>
            <EditorialSectionMark n="IX." label="Interests" />
            <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 12.5, color: ED_CHARCOAL }}>{data.interests.join("   ·   ")}</div>
          </div>
        )}

        {data.customSections.filter(cs => cs.items.length > 0).map((cs, idx) => (
          <div key={cs.id} style={{ marginBottom: 28, marginTop: 12 }}>
            <EditorialSectionMark n={`X${idx + 1}.`} label={cs.title} />
            {cs.items.map(item => (
              <div key={item.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: ED_CHARCOAL }}>{item.title}{item.date ? <span style={{ color: ED_MUTED, fontStyle: "italic", fontWeight: 400, marginLeft: 8 }}>{item.date}</span> : null}</div>
                {item.subtitle && <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 11, color: ED_ROSE, marginTop: 1 }}>{item.subtitle}</div>}
                {item.description && <div style={{ fontFamily: PLAYFAIR, fontSize: 11, color: "#3d3833", lineHeight: 1.6, marginTop: 2 }}>{item.description}</div>}
              </div>
            ))}
          </div>
        ))}

        {/* Colophon footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `0.5px solid ${ED_ROSE}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 11, color: ED_MUTED, letterSpacing: 1 }}>— Fin —</span>
          <span style={{ fontFamily: DM_SANS, fontSize: 8, color: ED_ROSE, letterSpacing: 4, textTransform: "uppercase", fontWeight: 600 }}>Editorial</span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 3. AI DASHBOARD — Futuristic AI dashboard with floating widget cards,
//    gradient borders, glass panels, skill rings, progress bars with
//    gradients, dotted grid background, mesh gradients.
//    Stripe Dashboard + Vercel + Framer + Notion AI aesthetic.
//    Font: Space Grotesk. Light theme.
// =====================================================================

const AI_BG = "#fafbfc";
const AI_INK = "#0f172a";
const AI_MUTED = "#64748b";
const AI_VIOLET = "#8b5cf6";
const AI_CYAN = "#06b6d4";
const AI_EMERALD = "#10b981";
const AI_AMBER = "#f59e0b";
const AI_BORDER = "#e2e8f0";

const AIDottedGrid = () => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #cbd5e1 0.8px, transparent 0.8px)", backgroundSize: "20px 20px", opacity: 0.45, pointerEvents: "none", zIndex: 0 }} />
);

const AIMeshGradient = () => (
  <>
    <div style={{ position: "absolute", top: -100, right: -60, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle, ${AI_VIOLET}30, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "absolute", top: 100, right: 100, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${AI_CYAN}30, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />
  </>
);

// Gradient border card using mask trick
const AIGradientBorderCard: React.CSSProperties = {
  position: "relative",
  background: "white",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)",
};

const AIWidgetTitle = ({ label, dot }: { label: string; dot: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
    <span style={{ width: 6, height: 6, borderRadius: 2, background: dot, boxShadow: `0 0 6px ${dot}80` }} />
    <span style={{ fontFamily: SPACE_GROTESK, fontSize: 10, fontWeight: 700, color: AI_INK, letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: AI_BORDER }} />
    <span style={{ fontFamily: JETBRAINS, fontSize: 8, color: AI_MUTED, letterSpacing: 0.5 }}>↗</span>
  </div>
);

const AISkillRing = ({ label, level, color }: { label: string; level: number; color: string }) => {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (level / 100) * c;
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
        <defs>
          <linearGradient id={`g-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={AI_VIOLET} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={AI_BORDER} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#g-${label})`} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={AI_INK} fontFamily={SPACE_GROTESK}>{level}</text>
      </svg>
      <div style={{ fontSize: 9, color: AI_MUTED, marginTop: 4, fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
};

export function AIDashboardTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const yearsExp = data.experience.reduce((acc, e) => {
    const sy = parseInt(e.start, 10); const ey = e.end?.toLowerCase().includes("present") ? new Date().getFullYear() : parseInt(e.end, 10);
    if (!isNaN(sy) && !isNaN(ey) && ey >= sy) return acc + (ey - sy);
    return acc;
  }, 0) || data.experience.length;
  const stats = [
    { label: "Years Exp", value: String(yearsExp), color: AI_VIOLET },
    { label: "Projects", value: String(data.projects.length), color: AI_CYAN },
    { label: "Skills", value: String(data.skills.length), color: AI_EMERALD },
    { label: "Certs", value: String(data.certifications.length), color: AI_AMBER },
  ];
  const topSkills = data.skills.slice(0, 3);
  const ringColors = [AI_VIOLET, AI_CYAN, AI_EMERALD];

  return (
    <div className={PAPER} style={{ fontFamily: SPACE_GROTESK, background: AI_BG, color: AI_INK, position: "relative", overflow: "hidden" }}>
      <AIDottedGrid />
      <AIMeshGradient />

      {/* Header widget */}
      <div style={{ position: "relative", padding: "32px 36px 24px", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: 22, background: "white", borderRadius: 20, border: `1px solid ${AI_BORDER}`, boxShadow: "0 4px 20px rgba(15,23,42,0.04)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${AI_VIOLET}, ${AI_CYAN}, ${AI_EMERALD})` }} />
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -4, borderRadius: 18, background: `linear-gradient(135deg, ${AI_VIOLET}, ${AI_CYAN})`, filter: "blur(10px)", opacity: 0.4 }} />
            <Avatar data={data} size={96} shape="rounded" ring={`linear-gradient(135deg, ${AI_VIOLET}, ${AI_CYAN})`} ringWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: AI_EMERALD, boxShadow: `0 0 8px ${AI_EMERALD}` }} />
              <span style={{ fontFamily: JETBRAINS, fontSize: 9, color: AI_MUTED, letterSpacing: 1, fontWeight: 500 }}>PROFILE.active</span>
            </div>
            <h1 style={{ fontFamily: SPACE_GROTESK, fontSize: 34, fontWeight: 700, color: AI_INK, margin: 0, lineHeight: 1.05, letterSpacing: -0.5 }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div style={{ height: 2, width: 24, background: `linear-gradient(90deg, ${AI_VIOLET}, ${AI_CYAN})` }} />
              <p style={{ fontSize: 13, color: AI_VIOLET, margin: 0, fontWeight: 600, letterSpacing: 0.2 }}>{data.title}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 10, fontSize: 9, color: AI_MUTED, fontFamily: JETBRAINS }}>
              {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ color: AI_CYAN }}>▸</span>{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 12 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ ...AIGradientBorderCard, padding: "14px 14px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: s.color, borderRadius: 2 }} />
              <div style={{ fontSize: 22, fontWeight: 700, color: AI_INK, lineHeight: 1, letterSpacing: -0.5 }}>{s.value}</div>
              <div style={{ fontSize: 8.5, color: AI_MUTED, marginTop: 4, letterSpacing: 1, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ position: "relative", padding: "0 36px 32px", display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18, zIndex: 1 }}>
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...AIGradientBorderCard, padding: "16px 18px", marginBottom: 14, border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="Summary" dot={AI_VIOLET} />
              <p style={{ fontSize: 11, lineHeight: 1.7, color: "#334155", margin: 0 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...AIGradientBorderCard, padding: "18px 18px", marginBottom: 14, border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="Experience" dot={AI_CYAN} />
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: 14, borderBottom: `1px solid ${AI_BORDER}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: AI_INK }}>{e.role}</span>
                    <span style={{ fontFamily: JETBRAINS, fontSize: 8.5, color: AI_VIOLET, padding: "2px 8px", borderRadius: 6, background: `${AI_VIOLET}12`, whiteSpace: "nowrap" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: AI_CYAN, fontWeight: 600, marginTop: 2 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                  <div style={{ marginTop: 6 }}>
                    {e.bullets.filter(b => b?.trim()).map((b, i) => (
                      <div key={i} style={{ fontSize: 10, lineHeight: 1.6, color: "#475569", marginBottom: 2, paddingLeft: 14, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, top: 6, width: 5, height: 5, borderRadius: "50%", background: `linear-gradient(135deg, ${AI_VIOLET}, ${AI_CYAN})` }} />{b}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...AIGradientBorderCard, padding: "18px 18px", border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="Projects" dot={AI_EMERALD} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.projects.map(p => (
                  <div key={p.id} style={{ padding: 12, borderRadius: 10, background: AI_BG, border: `1px solid ${AI_BORDER}`, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: AI_INK }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 9.5, lineHeight: 1.5, color: "#475569", marginTop: 4 }}>{p.description}</div>}
                    {p.tech.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                        {p.tech.map((t, i) => (
                          <span key={i} style={{ fontSize: 7.5, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: `${AI_VIOLET}12`, color: AI_VIOLET }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {visible(sections, "skills") && topSkills.length > 0 && (
            <div style={{ ...AIGradientBorderCard, padding: "16px 18px", marginBottom: 14, border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="Skill Rings" dot={AI_VIOLET} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                {topSkills.map((s, i) => <AISkillRing key={i} label={s} level={data.skillLevels[s] ?? 80} color={ringColors[i % 3]} />)}
              </div>
            </div>
          )}

          {visible(sections, "skills") && data.skills.length > 3 && (
            <div style={{ ...AIGradientBorderCard, padding: "16px 18px", marginBottom: 14, border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="More Skills" dot={AI_CYAN} />
              {data.skills.slice(3).map((s, i) => {
                const level = data.skillLevels[s] ?? 60;
                return (
                  <div key={i} style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: AI_INK, fontWeight: 600, marginBottom: 3 }}>
                      <span>{s}</span><span style={{ fontFamily: JETBRAINS, color: AI_MUTED }}>{level}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 999, background: AI_BORDER, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${level}%`, background: `linear-gradient(90deg, ${AI_VIOLET}, ${AI_CYAN})`, borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...AIGradientBorderCard, padding: "16px 18px", marginBottom: 14, border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="Education" dot={AI_EMERALD} />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: AI_INK }}>{ed.degree}</div>
                  <div style={{ fontSize: 9.5, color: AI_VIOLET, marginTop: 1, fontWeight: 600 }}>{ed.school}</div>
                  <div style={{ fontFamily: JETBRAINS, fontSize: 8, color: AI_MUTED, marginTop: 1 }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...AIGradientBorderCard, padding: "16px 18px", marginBottom: 14, border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="Certs" dot={AI_AMBER} />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"], display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 2, background: AI_AMBER }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: AI_INK }}>{c.title}</div>
                    <div style={{ fontSize: 8.5, color: AI_MUTED }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...AIGradientBorderCard, padding: "16px 18px", marginBottom: 14, border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="Languages" dot={AI_VIOLET} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.languages.map((l, i) => (
                  <span key={i} style={{ fontSize: 9.5, fontWeight: 600, padding: "4px 9px", borderRadius: 999, background: `${AI_VIOLET}10`, color: AI_VIOLET, border: `1px solid ${AI_VIOLET}25` }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...AIGradientBorderCard, padding: "16px 18px", marginBottom: 14, border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="Awards" dot={AI_AMBER} />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: AI_INK }}>{aw.title}</div>
                  <div style={{ fontSize: 8.5, color: AI_MUTED }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...AIGradientBorderCard, padding: "16px 18px", border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label="Interests" dot={AI_CYAN} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 9, fontWeight: 500, color: AI_MUTED }}>· {it}</span>
                ))}
              </div>
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...AIGradientBorderCard, padding: "16px 18px", marginTop: 14, border: `1px solid ${AI_BORDER}` }}>
              <AIWidgetTitle label={cs.title} dot={AI_VIOLET} />
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: AI_INK }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontSize: 8.5, color: AI_VIOLET, marginTop: 1 }}>{item.subtitle}</div>}
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
// 4. LUXURY EXECUTIVE — Premium black + gold styling (#0a0a0a + #c5a572).
//    Cormorant Garamond, fine 0.5px gold dividers, marble-inspired
//    background texture, embossed inset-shadow section cards, vertical
//    EXECUTIVE rail. CEO/CTO level. Luxury brand identity manual feel.
// =====================================================================

const LUX_BLACK = "#0a0a0a";
const LUX_GOLD = "#c5a572";
const LUX_CREAM = "#f5f0e8";
const LUX_PLATINUM = "#e5e4e2";
const LUX_MUTED = "rgba(229,228,226,0.55)";

// Subtle marble texture overlay (using layered radial gradients + thin SVG veins)
const LuxuryMarbleVeins = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 1100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none", zIndex: 0 }}>
    <defs>
      <radialGradient id="lux-grad-1" cx="20%" cy="10%" r="60%">
        <stop offset="0%" stopColor={LUX_GOLD} stopOpacity="0.4" />
        <stop offset="100%" stopColor={LUX_GOLD} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="lux-grad-2" cx="85%" cy="60%" r="55%">
        <stop offset="0%" stopColor={LUX_GOLD} stopOpacity="0.25" />
        <stop offset="100%" stopColor={LUX_GOLD} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="800" height="1100" fill="url(#lux-grad-1)" />
    <rect width="800" height="1100" fill="url(#lux-grad-2)" />
    {/* marble veins */}
    <path d="M 0 200 Q 200 180 400 250 T 800 220" fill="none" stroke={LUX_GOLD} strokeWidth="0.4" opacity="0.6" />
    <path d="M 0 350 Q 250 380 500 320 T 800 380" fill="none" stroke={LUX_GOLD} strokeWidth="0.3" opacity="0.5" />
    <path d="M 0 600 Q 300 580 600 640 T 800 620" fill="none" stroke={LUX_GOLD} strokeWidth="0.35" opacity="0.4" />
    <path d="M 0 800 Q 200 830 500 790 T 800 830" fill="none" stroke={LUX_GOLD} strokeWidth="0.3" opacity="0.5" />
    <path d="M 100 0 Q 130 300 80 600 T 150 1100" fill="none" stroke={LUX_GOLD} strokeWidth="0.25" opacity="0.35" />
    <path d="M 500 0 Q 480 400 530 700 T 480 1100" fill="none" stroke={LUX_GOLD} strokeWidth="0.25" opacity="0.3" />
  </svg>
);

const LuxuryHeader = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
    <span style={{ fontFamily: DM_SANS, fontSize: 9, color: LUX_GOLD, letterSpacing: 5, fontWeight: 600 }}>{label.toUpperCase()}</span>
    <div style={{ flex: 1, height: 0.5, background: `linear-gradient(90deg, ${LUX_GOLD}, transparent)` }} />
  </div>
);

export function LuxuryExecutiveTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const Embossed: React.CSSProperties = {
    background: "linear-gradient(180deg, #161616 0%, #0f0f0f 100%)",
    border: `0.5px solid ${LUX_GOLD}55`,
    borderRadius: 4,
    boxShadow: "0 1px 0 rgba(197,165,114,0.08), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  return (
    <div className={PAPER} style={{ fontFamily: CORMORANT, background: LUX_BLACK, color: LUX_CREAM, position: "relative", overflow: "hidden" }}>
      <LuxuryMarbleVeins />

      {/* Vertical EXECUTIVE rail */}
      <div style={{ position: "absolute", left: 16, top: 80, bottom: 80, width: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", pointerEvents: "none", zIndex: 1 }}>
        <div style={{ writingMode: "vertical-rl" as React.CSSProperties["writingMode"], transform: "rotate(180deg)", fontFamily: CORMORANT, fontSize: 18, color: LUX_GOLD, letterSpacing: 14, fontWeight: 600 }}>EXECUTIVE</div>
        <div style={{ writingMode: "vertical-rl" as React.CSSProperties["writingMode"], transform: "rotate(180deg)", fontFamily: DM_SANS, fontSize: 8, color: LUX_MUTED, letterSpacing: 4 }}>MMXXV</div>
      </div>

      {/* Header */}
      <div style={{ position: "relative", padding: "50px 56px 36px 70px", borderBottom: `0.5px solid ${LUX_PLATINUM}30`, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1px solid ${LUX_GOLD}` }} />
            <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `0.5px solid ${LUX_GOLD}80` }} />
            <div style={{ position: "absolute", inset: -24, borderRadius: "50%", border: `0.5px solid ${LUX_GOLD}40` }} />
            <Avatar data={data} size={100} ring={LUX_GOLD} ringWidth={1} shape="circle" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DM_SANS, fontSize: 9, color: LUX_GOLD, letterSpacing: 5, marginBottom: 10, textTransform: "uppercase" }}>The Executive Profile</div>
            <h1 style={{ fontFamily: CORMORANT, fontSize: 44, fontWeight: 600, color: LUX_CREAM, margin: 0, lineHeight: 1.0, letterSpacing: 0.5 }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
              <div style={{ width: 32, height: 1, background: LUX_GOLD }} />
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 17, color: LUX_GOLD, margin: 0 }}>{data.title}</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", marginTop: 22, fontFamily: DM_SANS, fontSize: 9, color: LUX_MUTED, letterSpacing: 0.4, paddingLeft: 132 }}>
          {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: LUX_GOLD, fontSize: 7 }}>◆</span>{c}
            </span>
          ))}
        </div>
      </div>

      {/* Body 2-column */}
      <div style={{ position: "relative", padding: "34px 56px 40px 70px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 28, zIndex: 1 }}>
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 26 }}>
              <LuxuryHeader label="Manifesto" />
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 15, lineHeight: 1.8, color: "rgba(245,240,232,0.85)", margin: 0, borderLeft: `0.5px solid ${LUX_GOLD}80`, paddingLeft: 22 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 26 }}>
              <LuxuryHeader label="Parcours" />
              <div>
                {data.experience.map(e => (
                  <div key={e.id} style={{ ...Embossed, padding: "18px 22px", marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontFamily: CORMORANT, fontSize: 18, fontWeight: 600, color: LUX_CREAM }}>{e.role}</span>
                      <span style={{ fontFamily: DM_SANS, fontSize: 8.5, color: LUX_GOLD, letterSpacing: 1.5, textTransform: "uppercase" }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 13, color: LUX_GOLD, marginBottom: 10 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                    <div style={{ width: 28, height: 0.5, background: `${LUX_GOLD}80`, marginBottom: 10 }} />
                    {e.bullets.filter(b => b?.trim()).map((b, i) => (
                      <div key={i} style={{ fontFamily: CORMORANT, fontSize: 12, lineHeight: 1.7, color: "rgba(245,240,232,0.82)", marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: LUX_GOLD, fontSize: 7, top: 8 }}>◆</span>{b}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div>
              <LuxuryHeader label="Œuvres" />
              {data.projects.map(p => (
                <div key={p.id} style={{ ...Embossed, padding: "16px 22px", marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 15, fontWeight: 600, color: LUX_CREAM }}>{p.name}</div>
                  {p.description && <div style={{ fontFamily: CORMORANT, fontSize: 11.5, color: "rgba(245,240,232,0.75)", lineHeight: 1.6, marginTop: 3 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontFamily: DM_SANS, fontSize: 8, color: LUX_GOLD, marginTop: 6, letterSpacing: 0.5 }}>{p.tech.join("   ·   ")}</div>}
                  {p.link && <div style={{ fontFamily: DM_SANS, fontSize: 8, color: LUX_PLATINUM, marginTop: 3, opacity: 0.7 }}>{p.link}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...Embossed, padding: "20px", marginBottom: 16 }}>
              <LuxuryHeader label="Savoir-Faire" />
              {data.skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7, paddingBottom: 7, borderBottom: `0.5px solid ${LUX_PLATINUM}15` }}>
                  <span style={{ color: LUX_GOLD, fontSize: 8 }}>◆</span>
                  <span style={{ fontFamily: CORMORANT, fontSize: 12.5, color: LUX_CREAM, flex: 1 }}>{s}</span>
                  {data.skillLevels[s] !== undefined && (
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} style={{ width: 4, height: 4, borderRadius: "50%", background: n <= Math.round((data.skillLevels[s] ?? 0) / 20) ? LUX_GOLD : `${LUX_PLATINUM}30` }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...Embossed, padding: "20px", marginBottom: 16 }}>
              <LuxuryHeader label="Formation" />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 13.5, fontWeight: 600, color: LUX_CREAM }}>{ed.degree}</div>
                  <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: LUX_GOLD }}>{ed.school}</div>
                  <div style={{ fontFamily: DM_SANS, fontSize: 8, color: LUX_MUTED, marginTop: 2, letterSpacing: 1 }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...Embossed, padding: "20px", marginBottom: 16 }}>
              <LuxuryHeader label="Langues" />
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontFamily: CORMORANT, fontSize: 12.5, color: LUX_CREAM, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: LUX_GOLD, fontSize: 7 }}>●</span>{l}
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...Embossed, padding: "20px", marginBottom: 16 }}>
              <LuxuryHeader label="Certifications" />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 12.5, fontWeight: 600, color: LUX_CREAM }}>{c.title}</div>
                  <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: LUX_GOLD }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...Embossed, padding: "20px", marginBottom: 16 }}>
              <LuxuryHeader label="Distinctions" />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 12.5, fontWeight: 600, color: LUX_CREAM }}>{aw.title}</div>
                  <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: LUX_GOLD }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...Embossed, padding: "20px" }}>
              <LuxuryHeader label="Intérêts" />
              <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: LUX_CREAM, lineHeight: 1.8 }}>{data.interests.join("   ·   ")}</div>
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...Embossed, padding: "20px", marginBottom: 16 }}>
              <LuxuryHeader label={cs.title} />
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 12.5, fontWeight: 600, color: LUX_CREAM }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: LUX_GOLD }}>{item.subtitle}</div>}
                  {item.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: "rgba(245,240,232,0.8)", lineHeight: 1.55, marginTop: 2 }}>{item.description}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "relative", padding: "16px 70px 28px", borderTop: `0.5px solid ${LUX_PLATINUM}30`, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
        <span style={{ fontFamily: DM_SANS, fontSize: 8, color: LUX_MUTED, letterSpacing: 3 }}>EST. MMXXV</span>
        <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: LUX_GOLD }}>— Executive —</span>
        <span style={{ fontFamily: DM_SANS, fontSize: 8, color: LUX_MUTED, letterSpacing: 3 }}>{data.name.toUpperCase()}</span>
      </div>
    </div>
  );
}

// =====================================================================
// 5. CREATIVE PORTFOLIO — Highly creative with bold asymmetric layouts,
//    overlapping rotated cards, large typography, colorful gradients
//    (coral, teal, amber), abstract organic blob shapes, wave patterns,
//    modern timelines, clip-path masks. Behance/Dribbble/Awwwards.
//    Font: DM Sans.
// =====================================================================

const CRE_WHITE = "#ffffff";
const CRE_INK = "#1a1a2e";
const CRE_MUTED = "#64748b";
const CRE_CORAL = "#ff6b6b";
const CRE_TEAL = "#4ecdc4";
const CRE_AMBER = "#ffd93d";
const CRE_VIOLET = "#a78bfa";

const CreativeBlob = ({ color, style }: { color: string; style?: React.CSSProperties }) => (
  <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: "absolute", ...style, pointerEvents: "none", zIndex: 0 }}>
    <defs>
      <linearGradient id={`blob-${color.replace("#", "")}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <path d="M 120 30 C 180 30 220 80 220 130 C 220 180 180 220 120 220 C 60 220 20 180 20 130 C 20 80 60 30 120 30 Z" fill={`url(#blob-${color.replace("#", "")})`} transform="translate(0 -10)" />
  </svg>
);

const CreativeWave = () => (
  <svg width="100%" height="40" viewBox="0 0 800 40" preserveAspectRatio="none" style={{ display: "block", opacity: 0.6 }}>
    <path d="M 0 20 Q 100 5 200 20 T 400 20 T 600 20 T 800 20" fill="none" stroke={CRE_TEAL} strokeWidth="2" />
    <path d="M 0 25 Q 100 15 200 25 T 400 25 T 600 25 T 800 25" fill="none" stroke={CRE_CORAL} strokeWidth="1.5" opacity="0.7" />
  </svg>
);

const CreativeSectionBar = ({ label, color }: { label: string; color: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
    <div style={{ width: 24, height: 24, borderRadius: 8, background: `linear-gradient(135deg, ${color}, ${CRE_VIOLET})`, transform: "rotate(-8deg)", boxShadow: `0 4px 12px ${color}50` }} />
    <span style={{ fontFamily: DM_SANS, fontSize: 14, fontWeight: 700, color: CRE_INK, letterSpacing: -0.3, textTransform: "uppercase" }}>{label}</span>
    <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 999 }} />
  </div>
);

export function CreativePortfolioTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  return (
    <div className={PAPER} style={{ fontFamily: DM_SANS, background: CRE_WHITE, color: CRE_INK, position: "relative", overflow: "hidden" }}>
      <CreativeBlob color={CRE_CORAL} style={{ top: -60, right: -40, opacity: 0.6 }} />
      <CreativeBlob color={CRE_TEAL} style={{ top: 280, left: -80, opacity: 0.5 }} />
      <CreativeBlob color={CRE_AMBER} style={{ bottom: -80, right: 100, opacity: 0.4 }} />

      {/* Header — overlapping rotated cards */}
      <div style={{ position: "relative", padding: "44px 40px 28px", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, position: "relative" }}>
          {/* Avatar with clip-path hexagonal-ish shape */}
          <div style={{ position: "relative", flexShrink: 0, transform: "rotate(-3deg)" }}>
            <div style={{ position: "absolute", inset: -8, background: `linear-gradient(135deg, ${CRE_CORAL}, ${CRE_AMBER})`, borderRadius: 24, transform: "rotate(6deg)", filter: "blur(8px)", opacity: 0.5 }} />
            <div style={{ position: "relative", clipPath: "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)" }}>
              <Avatar data={data} size={110} shape="square" ring="transparent" ringWidth={0} />
            </div>
          </div>
          <div style={{ flex: 1, transform: "rotate(0.5deg)" }}>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, background: `linear-gradient(90deg, ${CRE_CORAL}, ${CRE_AMBER})`, color: "white", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, boxShadow: `0 4px 12px ${CRE_CORAL}40` }}>Creative Portfolio</div>
            <h1 style={{ fontFamily: DM_SANS, fontSize: 42, fontWeight: 800, color: CRE_INK, margin: 0, lineHeight: 1.0, letterSpacing: -1.5 }}>
              <span style={{ background: `linear-gradient(135deg, ${CRE_CORAL} 0%, ${CRE_VIOLET} 50%, ${CRE_TEAL} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" as React.CSSProperties["color"] }}>{data.name}</span>
            </h1>
            <p style={{ fontSize: 14, fontWeight: 500, color: CRE_MUTED, margin: "4px 0 0", letterSpacing: 0.2 }}>{data.title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", marginTop: 12, fontSize: 9.5, color: CRE_MUTED, fontWeight: 500 }}>
              {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: "#f1f5f9" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: [CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4] }} />{c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", padding: "0 40px 36px", zIndex: 1 }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 22, padding: "18px 22px", borderRadius: 16, background: `linear-gradient(135deg, ${CRE_AMBER}15, ${CRE_CORAL}10)`, border: `1px solid ${CRE_AMBER}30`, transform: "rotate(-0.3deg)", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
            <CreativeSectionBar label="Profile" color={CRE_CORAL} />
            <p style={{ fontSize: 12, lineHeight: 1.7, color: CRE_INK, margin: 0, fontWeight: 500 }}>{data.summary}</p>
          </div>
        )}

        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <CreativeSectionBar label="Experience" color={CRE_TEAL} />
            <div style={{ position: "relative", paddingLeft: 26 }}>
              {/* Timeline vertical gradient line */}
              <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 3, borderRadius: 999, background: `linear-gradient(180deg, ${CRE_CORAL}, ${CRE_TEAL}, ${CRE_AMBER})` }} />
              {data.experience.map((e, i) => (
                <div key={e.id} style={{ marginBottom: 16, breakInside: "avoid" as React.CSSProperties["breakInside"], position: "relative", padding: "14px 18px", borderRadius: 14, background: "white", border: `1px solid #e2e8f0`, boxShadow: "0 4px 14px rgba(15,23,42,0.06)", transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)` }}>
                  <div style={{ position: "absolute", left: -23, top: 18, width: 14, height: 14, borderRadius: "50%", background: `linear-gradient(135deg, ${[CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4]}, white)`, border: `3px solid ${[CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4]}`, boxShadow: `0 0 0 3px white` }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: CRE_INK }}>{e.role}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "white", padding: "3px 10px", borderRadius: 999, background: `linear-gradient(135deg, ${[CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4]}, ${CRE_VIOLET})`, whiteSpace: "nowrap" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: [CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4], marginTop: 2 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                  <div style={{ marginTop: 6 }}>
                    {e.bullets.filter(b => b?.trim()).map((b, j) => (
                      <div key={j} style={{ fontSize: 10.5, lineHeight: 1.6, color: "#475569", marginBottom: 2, paddingLeft: 14, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, top: 5, color: [CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4], fontWeight: 700 }}>▸</span>{b}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22 }}>
          <div>
            {visible(sections, "projects") && data.projects.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <CreativeSectionBar label="Projects" color={CRE_VIOLET} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {data.projects.map((p, i) => (
                    <div key={p.id} style={{ padding: 14, borderRadius: 14, background: "white", border: `1px solid #e2e8f0`, boxShadow: "0 4px 12px rgba(15,23,42,0.05)", breakInside: "avoid" as React.CSSProperties["breakInside"], position: "relative", overflow: "hidden", transform: `rotate(${i % 2 === 0 ? 0.5 : -0.5}deg)` }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${[CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4]}, ${CRE_VIOLET})` }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: CRE_INK, marginTop: 4 }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: 10, lineHeight: 1.5, color: "#475569", marginTop: 3 }}>{p.description}</div>}
                      {p.tech.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                          {p.tech.map((t, j) => (
                            <span key={j} style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: `${[CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4]}20`, color: [CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4] }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visible(sections, "education") && data.education.length > 0 && (
              <div>
                <CreativeSectionBar label="Education" color={CRE_AMBER} />
                {data.education.map(ed => (
                  <div key={ed.id} style={{ padding: 14, borderRadius: 14, background: `linear-gradient(135deg, ${CRE_AMBER}15, white)`, border: `1px solid ${CRE_AMBER}30`, marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: CRE_INK }}>{ed.degree}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: CRE_CORAL, marginTop: 2 }}>{ed.school}</div>
                    <div style={{ fontSize: 9.5, color: CRE_MUTED, marginTop: 2 }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {visible(sections, "skills") && data.skills.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <CreativeSectionBar label="Skills" color={CRE_CORAL} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {data.skills.map((s, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: "5px 11px", borderRadius: 10, color: "white", background: `linear-gradient(135deg, ${[CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4]}, ${CRE_VIOLET})`, boxShadow: `0 4px 10px ${[CRE_CORAL, CRE_TEAL, CRE_AMBER, CRE_VIOLET][i % 4]}40` }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {visible(sections, "languages") && data.languages.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <CreativeSectionBar label="Languages" color={CRE_TEAL} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {data.languages.map((l, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: `${CRE_TEAL}15`, color: CRE_INK, border: `1px solid ${CRE_TEAL}40` }}>{l}</span>
                  ))}
                </div>
              </div>
            )}

            {visible(sections, "certifications") && data.certifications.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <CreativeSectionBar label="Certs" color={CRE_AMBER} />
                {data.certifications.map(c => (
                  <div key={c.id} style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 10, background: `${CRE_AMBER}12`, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: CRE_INK }}>{c.title}</div>
                    <div style={{ fontSize: 9, color: CRE_MUTED, marginTop: 1 }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "awards") && data.awards.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <CreativeSectionBar label="Awards" color={CRE_VIOLET} />
                {data.awards.map(aw => (
                  <div key={aw.id} style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 10, background: `${CRE_VIOLET}12`, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: CRE_INK }}>{aw.title}</div>
                    <div style={{ fontSize: 9, color: CRE_MUTED, marginTop: 1 }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "interests") && data.interests.length > 0 && (
              <div>
                <CreativeSectionBar label="Interests" color={CRE_CORAL} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {data.interests.map((it, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "4px 9px", borderRadius: 8, background: "#f1f5f9", color: CRE_INK }}>· {it}</span>
                  ))}
                </div>
              </div>
            )}

            {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
              <div key={cs.id} style={{ marginTop: 22 }}>
                <CreativeSectionBar label={cs.title} color={CRE_TEAL} />
                {cs.items.map(item => (
                  <div key={item.id} style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 10, background: `${CRE_TEAL}12`, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: CRE_INK }}>{item.title}</div>
                    {item.subtitle && <div style={{ fontSize: 9, color: CRE_TEAL, marginTop: 1, fontWeight: 600 }}>{item.subtitle}</div>}
                    {item.description && <div style={{ fontSize: 9.5, color: "#475569", marginTop: 2, lineHeight: 1.5 }}>{item.description}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider footer */}
        <div style={{ marginTop: 24 }}>
          <CreativeWave />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px" }}>
            <span style={{ fontSize: 9, color: CRE_MUTED, fontWeight: 600 }}>© {data.name}</span>
            <span style={{ fontSize: 9, color: CRE_CORAL, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Creative Portfolio</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 6. NEO-BRUTALISM — Bold Neo-Brutalist with oversized typography
//    (name 36-44px, bold 900), thick 3-4px black borders, vibrant color
//    blocks (yellow, pink, blue, green), playful geometric shapes,
//    sharp 8px 8px 0 #000 box-shadow, contrasting layouts.
//    Figma + Gumroad + contemporary startup branding.
//    Font: Space Grotesk.
// =====================================================================

const NEO_WHITE = "#fefefe";
const NEO_INK = "#0a0a0a";
const NEO_YELLOW = "#ffe600";
const NEO_PINK = "#ff80ab";
const NEO_BLUE = "#82b1ff";
const NEO_GREEN = "#b2ff59";

const NeoBrutalCard: React.CSSProperties = {
  background: NEO_WHITE,
  border: `3px solid ${NEO_INK}`,
  borderRadius: 4,
  boxShadow: `6px 6px 0 ${NEO_INK}`,
};

const NeoBrutalHeader = ({ label, bg }: { label: string; bg: string }) => (
  <div style={{ display: "inline-block", padding: "6px 14px", background: bg, border: `3px solid ${NEO_INK}`, boxShadow: `4px 4px 0 ${NEO_INK}`, marginBottom: 14, transform: "rotate(-1deg)" }}>
    <span style={{ fontFamily: SPACE_GROTESK, fontSize: 13, fontWeight: 900, color: NEO_INK, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</span>
  </div>
);

export function NeoBrutalismTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  return (
    <div className={PAPER} style={{ fontFamily: SPACE_GROTESK, background: NEO_WHITE, color: NEO_INK, position: "relative", overflow: "hidden" }}>
      {/* Decorative geometric shapes */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: NEO_YELLOW, border: `3px solid ${NEO_INK}`, transform: "rotate(15deg)", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 200, right: 30, width: 24, height: 24, background: NEO_PINK, border: `3px solid ${NEO_INK}`, borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: 100, left: -10, width: 50, height: 50, background: NEO_GREEN, border: `3px solid ${NEO_INK}`, transform: "rotate(45deg)", zIndex: 0 }} />

      {/* Header — bold blocky layout */}
      <div style={{ position: "relative", padding: "36px 40px 26px", borderBottom: `4px solid ${NEO_INK}`, background: `${NEO_YELLOW}40`, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
          <div style={{ flexShrink: 0, padding: 4, background: NEO_WHITE, border: `3px solid ${NEO_INK}`, boxShadow: `6px 6px 0 ${NEO_INK}` }}>
            <Avatar data={data} size={96} shape="square" ring="transparent" ringWidth={0} />
          </div>
          <div style={{ flex: 1, paddingTop: 6 }}>
            <div style={{ display: "inline-block", padding: "3px 10px", background: NEO_PINK, border: `3px solid ${NEO_INK}`, marginBottom: 8, transform: "rotate(-2deg)" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: NEO_INK, letterSpacing: 2, textTransform: "uppercase" }}>Portfolio · 2025</span>
            </div>
            <h1 style={{ fontFamily: SPACE_GROTESK, fontSize: 42, fontWeight: 900, color: NEO_INK, margin: 0, lineHeight: 0.95, letterSpacing: -2 }}>{data.name}</h1>
            <p style={{ fontSize: 16, fontWeight: 700, color: NEO_INK, margin: "6px 0 0", padding: "3px 10px", display: "inline-block", background: NEO_BLUE, border: `3px solid ${NEO_INK}`, transform: "rotate(0.5deg)" }}>{data.title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", marginTop: 14, fontSize: 9.5, fontWeight: 700, color: NEO_INK }}>
              {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => {
                const colors = [NEO_YELLOW, NEO_PINK, NEO_BLUE, NEO_GREEN];
                return (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", background: colors[i % 4], border: `2px solid ${NEO_INK}` }}>{c}</span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Body 2-column */}
      <div style={{ position: "relative", padding: "26px 40px 32px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22, zIndex: 1 }}>
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...NeoBrutalCard, padding: "18px 20px", marginBottom: 16, background: NEO_WHITE }}>
              <NeoBrutalHeader label="Profile" bg={NEO_GREEN} />
              <p style={{ fontSize: 12, lineHeight: 1.65, color: NEO_INK, margin: 0, fontWeight: 500 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...NeoBrutalCard, padding: "18px 20px", marginBottom: 16 }}>
              <NeoBrutalHeader label="Experience" bg={NEO_YELLOW} />
              {data.experience.map((e, i) => (
                <div key={e.id} style={{ marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: 14, borderBottom: i < data.experience.length - 1 ? `2px solid ${NEO_INK}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: NEO_INK }}>{e.role}</span>
                    <span style={{ fontSize: 9, fontWeight: 900, padding: "3px 8px", background: i % 2 === 0 ? NEO_PINK : NEO_BLUE, border: `2px solid ${NEO_INK}`, whiteSpace: "nowrap" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: NEO_INK, marginTop: 3 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                  <div style={{ marginTop: 6 }}>
                    {e.bullets.filter(b => b?.trim()).map((b, j) => (
                      <div key={j} style={{ fontSize: 10.5, lineHeight: 1.6, color: NEO_INK, marginBottom: 3, paddingLeft: 18, position: "relative", fontWeight: 500 }}>
                        <span style={{ position: "absolute", left: 0, top: 1, display: "inline-block", width: 12, height: 12, background: [NEO_YELLOW, NEO_PINK, NEO_BLUE, NEO_GREEN][j % 4], border: `2px solid ${NEO_INK}` }} />{b}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...NeoBrutalCard, padding: "18px 20px" }}>
              <NeoBrutalHeader label="Projects" bg={NEO_BLUE} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.projects.map((p, i) => (
                  <div key={p.id} style={{ padding: 12, border: `2px solid ${NEO_INK}`, background: i % 2 === 0 ? `${NEO_GREEN}30` : `${NEO_PINK}30`, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: NEO_INK }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 9.5, lineHeight: 1.5, color: NEO_INK, marginTop: 4, fontWeight: 500 }}>{p.description}</div>}
                    {p.tech.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                        {p.tech.map((t, j) => (
                          <span key={j} style={{ fontSize: 8, fontWeight: 900, padding: "2px 5px", background: NEO_WHITE, border: `1.5px solid ${NEO_INK}`, color: NEO_INK }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...NeoBrutalCard, padding: "16px 18px", marginBottom: 16, background: NEO_YELLOW }}>
              <NeoBrutalHeader label="Skills" bg={NEO_WHITE} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {data.skills.map((s, i) => {
                  const colors = [NEO_PINK, NEO_BLUE, NEO_GREEN, NEO_WHITE];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 9px", background: colors[i % 4], border: `2px solid ${NEO_INK}` }}>
                      <span style={{ width: 12, height: 12, background: NEO_INK }} />
                      <span style={{ fontSize: 11, fontWeight: 900, color: NEO_INK, flex: 1 }}>{s}</span>
                      {data.skillLevels[s] !== undefined && (
                        <div style={{ display: "flex", gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <span key={n} style={{ width: 8, height: 8, background: n <= Math.round((data.skillLevels[s] ?? 0) / 20) ? NEO_INK : "transparent", border: `1.5px solid ${NEO_INK}` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...NeoBrutalCard, padding: "16px 18px", marginBottom: 16 }}>
              <NeoBrutalHeader label="Education" bg={NEO_PINK} />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"], padding: 8, border: `2px solid ${NEO_INK}`, background: `${NEO_BLUE}30` }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: NEO_INK }}>{ed.degree}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: NEO_INK, marginTop: 2 }}>{ed.school}</div>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: NEO_INK, marginTop: 2, padding: "2px 6px", background: NEO_YELLOW, display: "inline-block", border: `1.5px solid ${NEO_INK}` }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...NeoBrutalCard, padding: "16px 18px", marginBottom: 16, background: NEO_GREEN }}>
              <NeoBrutalHeader label="Certs" bg={NEO_WHITE} />
              {data.certifications.map((c, i) => (
                <div key={c.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"], padding: "5px 8px", border: `2px solid ${NEO_INK}`, background: NEO_WHITE }}>
                  <div style={{ fontSize: 10.5, fontWeight: 900, color: NEO_INK }}>{c.title}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: NEO_INK, marginTop: 1 }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...NeoBrutalCard, padding: "16px 18px", marginBottom: 16 }}>
              <NeoBrutalHeader label="Languages" bg={NEO_BLUE} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.languages.map((l, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 900, padding: "3px 8px", background: [NEO_YELLOW, NEO_PINK, NEO_BLUE, NEO_GREEN][i % 4], border: `2px solid ${NEO_INK}`, color: NEO_INK }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...NeoBrutalCard, padding: "16px 18px", marginBottom: 16, background: NEO_PINK }}>
              <NeoBrutalHeader label="Awards" bg={NEO_WHITE} />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"], padding: "5px 8px", border: `2px solid ${NEO_INK}`, background: NEO_WHITE }}>
                  <div style={{ fontSize: 10.5, fontWeight: 900, color: NEO_INK }}>{aw.title}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: NEO_INK, marginTop: 1 }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...NeoBrutalCard, padding: "16px 18px" }}>
              <NeoBrutalHeader label="Interests" bg={NEO_GREEN} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontSize: 9.5, fontWeight: 700, padding: "3px 7px", background: NEO_WHITE, border: `2px solid ${NEO_INK}`, color: NEO_INK }}>· {it}</span>
                ))}
              </div>
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...NeoBrutalCard, padding: "16px 18px", marginTop: 16, background: NEO_YELLOW }}>
              <NeoBrutalHeader label={cs.title} bg={NEO_WHITE} />
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"], padding: 8, border: `2px solid ${NEO_INK}`, background: NEO_WHITE }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: NEO_INK }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontSize: 9.5, fontWeight: 700, color: NEO_INK, marginTop: 1 }}>{item.subtitle}</div>}
                  {item.description && <div style={{ fontSize: 9.5, color: NEO_INK, marginTop: 2, lineHeight: 1.5, fontWeight: 500 }}>{item.description}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer bar */}
      <div style={{ position: "relative", padding: "12px 40px", background: NEO_INK, color: NEO_WHITE, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
        <span style={{ fontFamily: SPACE_GROTESK, fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>{data.name}</span>
        <span style={{ fontFamily: SPACE_GROTESK, fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", color: NEO_YELLOW }}>{"// Neo Brutalist"}</span>
      </div>
    </div>
  );
}

// =====================================================================
// 7. SWISS MINIMALISM — Strict grid system, exceptional typography
//    (Inter), monochrome palette (black/white/gray only), generous
//    whitespace, thin 0.5px rules, precise alignment. Every element
//    communicates clarity. Müller-Brockmann + contemporary Apple.
// =====================================================================

const SWISS_WHITE = "#ffffff";
const SWISS_INK = "#0a0a0a";
const SWISS_GRAY = "#6b6b6b";
const SWISS_LIGHT = "#e5e5e5";
const SWISS_FAINT = "#f5f5f5";

const SwissSectionLabel = ({ n, label }: { n: string; label: string }) => (
  <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px", alignItems: "center", gap: 16, marginBottom: 18, paddingBottom: 8, borderBottom: `0.5px solid ${SWISS_INK}` }}>
    <span style={{ fontFamily: JETBRAINS, fontSize: 10, color: SWISS_GRAY, letterSpacing: 1 }}>{n}</span>
    <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: SWISS_INK, letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>
    <span style={{ fontFamily: JETBRAINS, fontSize: 8, color: SWISS_LIGHT, textAlign: "right", letterSpacing: 1 }}>—</span>
  </div>
);

export function SwissMinimalismTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  return (
    <div className={PAPER} style={{ fontFamily: INTER, background: SWISS_WHITE, color: SWISS_INK, position: "relative", overflow: "hidden" }}>
      {/* Grid overlay (very subtle) */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(90deg, ${SWISS_FAINT} 1px, transparent 1px)`, backgroundSize: "794px 100%", opacity: 0.5, pointerEvents: "none", zIndex: 0 }} />

      {/* Header — strict grid alignment */}
      <div style={{ position: "relative", padding: "56px 56px 36px", borderBottom: `0.5px solid ${SWISS_INK}`, zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ fontFamily: JETBRAINS, fontSize: 9, color: SWISS_GRAY, letterSpacing: 1 }}>01 /</span>
              <div style={{ width: 30, height: 0.5, background: SWISS_INK }} />
              <span style={{ fontFamily: JETBRAINS, fontSize: 9, color: SWISS_GRAY, letterSpacing: 2, textTransform: "uppercase" }}>Profile</span>
            </div>
            <h1 style={{ fontFamily: INTER, fontSize: 48, fontWeight: 800, color: SWISS_INK, margin: 0, lineHeight: 0.95, letterSpacing: -2 }}>{data.name}</h1>
            <p style={{ fontFamily: INTER, fontSize: 14, fontWeight: 400, color: SWISS_GRAY, margin: "8px 0 0", letterSpacing: 0.2 }}>{data.title}</p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Avatar data={data} size={88} shape="square" ring={SWISS_INK} ringWidth={1} />
          </div>
        </div>
        {/* Contact in strict grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 24px", marginTop: 26, fontFamily: JETBRAINS, fontSize: 9, color: SWISS_INK, letterSpacing: 0.5 }}>
          {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: JETBRAINS, fontSize: 8, color: SWISS_LIGHT, width: 14 }}>0{i + 1}</span>
              <span>{c}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ position: "relative", padding: "36px 56px 44px", zIndex: 1 }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 32 }}>
            <SwissSectionLabel n="02" label="Summary" />
            <p style={{ fontSize: 12, lineHeight: 1.75, color: SWISS_INK, margin: 0, maxWidth: 620, fontWeight: 400 }}>{data.summary}</p>
          </div>
        )}

        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SwissSectionLabel n="03" label="Experience" />
            {data.experience.map((e, i) => (
              <div key={e.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 28, marginBottom: 18, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: 18, borderBottom: i < data.experience.length - 1 ? `0.5px solid ${SWISS_LIGHT}` : "none" }}>
                <div style={{ fontFamily: JETBRAINS, fontSize: 10, color: SWISS_GRAY, letterSpacing: 0.5, paddingTop: 2 }}>{range(e.start, e.end)}</div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: SWISS_INK, letterSpacing: -0.3 }}>{e.role}</span>
                    <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 400, color: SWISS_GRAY }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {e.bullets.filter(b => b?.trim()).map((b, j) => (
                      <div key={j} style={{ fontSize: 11, lineHeight: 1.7, color: SWISS_INK, marginBottom: 2, paddingLeft: 16, position: "relative", fontWeight: 400 }}>
                        <span style={{ position: "absolute", left: 0, top: 8, width: 8, height: 0.5, background: SWISS_INK }} />{b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Strict 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          <div>
            {visible(sections, "education") && data.education.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <SwissSectionLabel n="04" label="Education" />
                {data.education.map(ed => (
                  <div key={ed.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: SWISS_INK }}>{ed.degree}</div>
                    <div style={{ fontFamily: INTER, fontSize: 11, color: SWISS_GRAY, marginTop: 2 }}>{ed.school}</div>
                    <div style={{ fontFamily: JETBRAINS, fontSize: 9, color: SWISS_GRAY, marginTop: 2, letterSpacing: 0.5 }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "skills") && data.skills.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <SwissSectionLabel n="05" label="Skills" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {data.skills.map((s, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12, padding: "6px 0", borderBottom: `0.5px solid ${SWISS_FAINT}` }}>
                      <span style={{ fontFamily: INTER, fontSize: 11.5, fontWeight: 500, color: SWISS_INK }}>{s}</span>
                      {data.skillLevels[s] !== undefined && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 60, height: 2, background: SWISS_LIGHT }}>
                            <div style={{ height: "100%", width: `${data.skillLevels[s]}%`, background: SWISS_INK }} />
                          </div>
                          <span style={{ fontFamily: JETBRAINS, fontSize: 8, color: SWISS_GRAY, width: 24, textAlign: "right" }}>{data.skillLevels[s]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {visible(sections, "projects") && data.projects.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <SwissSectionLabel n="06" label="Projects" />
                {data.projects.map(p => (
                  <div key={p.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: SWISS_INK }}>{p.name}</div>
                    {p.description && <div style={{ fontFamily: INTER, fontSize: 10.5, color: SWISS_GRAY, lineHeight: 1.6, marginTop: 2, fontWeight: 400 }}>{p.description}</div>}
                    {p.tech.length > 0 && <div style={{ fontFamily: JETBRAINS, fontSize: 8, color: SWISS_INK, marginTop: 4, letterSpacing: 0.5 }}>{p.tech.join("  ·  ")}</div>}
                    {p.link && <div style={{ fontFamily: JETBRAINS, fontSize: 8, color: SWISS_GRAY, marginTop: 2 }}>{p.link}</div>}
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "languages") && data.languages.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <SwissSectionLabel n="07" label="Languages" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {data.languages.map((l, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 8, padding: "5px 0", borderBottom: `0.5px solid ${SWISS_FAINT}`, fontFamily: INTER, fontSize: 11.5, color: SWISS_INK, fontWeight: 500 }}>
                      <span style={{ fontFamily: JETBRAINS, fontSize: 8, color: SWISS_GRAY }}>0{i + 1}</span>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visible(sections, "certifications") && data.certifications.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <SwissSectionLabel n="08" label="Certifications" />
                {data.certifications.map(c => (
                  <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: SWISS_INK }}>{c.title}</div>
                    <div style={{ fontFamily: INTER, fontSize: 10.5, color: SWISS_GRAY, marginTop: 1 }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "awards") && data.awards.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <SwissSectionLabel n="09" label="Awards" />
                {data.awards.map(aw => (
                  <div key={aw.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: SWISS_INK }}>{aw.title}</div>
                    <div style={{ fontFamily: INTER, fontSize: 10.5, color: SWISS_GRAY, marginTop: 1 }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {visible(sections, "interests") && data.interests.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <SwissSectionLabel n="10" label="Interests" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", fontFamily: INTER, fontSize: 11, color: SWISS_INK, fontWeight: 500 }}>
              {data.interests.map((it, i) => (
                <span key={i}>— {it}</span>
              ))}
            </div>
          </div>
        )}

        {data.customSections.filter(cs => cs.items.length > 0).map((cs, idx) => (
          <div key={cs.id} style={{ marginBottom: 28 }}>
            <SwissSectionLabel n={`1${idx + 1}`} label={cs.title} />
            {cs.items.map(item => (
              <div key={item.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: SWISS_INK }}>{item.title}{item.date ? <span style={{ color: SWISS_GRAY, fontWeight: 400, marginLeft: 8, fontFamily: JETBRAINS, fontSize: 9 }}>{item.date}</span> : null}</div>
                {item.subtitle && <div style={{ fontFamily: INTER, fontSize: 10.5, color: SWISS_GRAY, marginTop: 1 }}>{item.subtitle}</div>}
                {item.description && <div style={{ fontFamily: INTER, fontSize: 10.5, color: SWISS_INK, lineHeight: 1.6, marginTop: 2, fontWeight: 400 }}>{item.description}</div>}
              </div>
            ))}
          </div>
        ))}

        {/* Minimalist footer */}
        <div style={{ marginTop: 32, paddingTop: 14, borderTop: `0.5px solid ${SWISS_INK}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", fontFamily: JETBRAINS, fontSize: 8, color: SWISS_GRAY, letterSpacing: 1 }}>
          <span>{data.name.toUpperCase()}</span>
          <span style={{ textAlign: "center" }}>—</span>
          <span style={{ textAlign: "right" }}>SWISS / MINIMAL</span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 8. CYBER PREMIUM — Futuristic cyber-inspired with holographic
//    conic gradients, neon lighting (box-shadow glow), translucent UI
//    layers, digital circuit-inspired SVG patterns, glowing typography
//    (text-shadow), animated-style gradient borders, floating info cards.
//    Cyberpunk + premium enterprise. Dark background with neon accents.
// =====================================================================

const CYBER_BG = "#0a0a14";
const CYBER_INK = "#e2e8f0";
const CYBER_MUTED = "#64748b";
const CYBER_CYAN = "#00f0ff";
const CYBER_MAGENTA = "#ff00aa";
const CYBER_GREEN = "#00ff88";

const CyberCircuitPattern = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 1100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none", zIndex: 0 }}>
    <defs>
      <pattern id="circuit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 20 L 40 20 M 20 0 L 20 40" fill="none" stroke={CYBER_CYAN} strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="800" height="1100" fill="url(#circuit-grid)" />
    {/* Circuit traces with nodes */}
    <g stroke={CYBER_CYAN} strokeWidth="0.6" fill="none" opacity="0.6">
      <path d="M 60 80 L 200 80 L 200 140 L 360 140" />
      <path d="M 60 320 L 140 320 L 140 380 L 280 380" />
      <path d="M 700 180 L 600 180 L 600 240 L 480 240" />
      <path d="M 700 540 L 580 540 L 580 600 L 420 600" />
      <path d="M 60 720 L 180 720 L 180 800 L 320 800" />
      <path d="M 700 920 L 560 920 L 560 860 L 400 860" />
    </g>
    <g fill={CYBER_CYAN}>
      <circle cx="200" cy="80" r="2.5" />
      <circle cx="200" cy="140" r="2.5" />
      <circle cx="140" cy="320" r="2.5" />
      <circle cx="140" cy="380" r="2.5" />
      <circle cx="600" cy="180" r="2.5" />
      <circle cx="600" cy="240" r="2.5" />
      <circle cx="580" cy="540" r="2.5" />
      <circle cx="580" cy="600" r="2.5" />
    </g>
    <g stroke={CYBER_MAGENTA} strokeWidth="0.5" fill="none" opacity="0.5">
      <path d="M 40 200 L 160 200 L 160 280 L 320 280" />
      <path d="M 760 420 L 620 420 L 620 500 L 460 500" />
    </g>
    {/* Holographic conic gradient orb */}
    <defs>
      <radialGradient id="cyber-orb-1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={CYBER_CYAN} stopOpacity="0.35" />
        <stop offset="50%" stopColor={CYBER_MAGENTA} stopOpacity="0.15" />
        <stop offset="100%" stopColor={CYBER_CYAN} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cyber-orb-2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={CYBER_MAGENTA} stopOpacity="0.3" />
        <stop offset="100%" stopColor={CYBER_MAGENTA} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="700" cy="180" r="180" fill="url(#cyber-orb-1)" />
    <circle cx="100" cy="700" r="200" fill="url(#cyber-orb-2)" />
  </svg>
);

const CyberGlowCard: React.CSSProperties = {
  position: "relative",
  background: "rgba(15,15,30,0.6)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(0,240,255,0.3)",
  borderRadius: 12,
  boxShadow: "0 0 20px rgba(0,240,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
};

const CyberSectionHeader = ({ label, color }: { label: string; color: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
    <span style={{ width: 8, height: 8, background: color, boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`, transform: "rotate(45deg)" }} />
    <span style={{ fontFamily: JETBRAINS, fontSize: 10, fontWeight: 700, color, letterSpacing: 2.5, textTransform: "uppercase", textShadow: `0 0 8px ${color}80` }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}80, transparent)` }} />
    <span style={{ fontFamily: JETBRAINS, fontSize: 8, color: CYBER_MUTED }}>{"///"}</span>
  </div>
);

export function CyberPremiumTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  return (
    <div className={PAPER} style={{ fontFamily: SPACE_GROTESK, background: CYBER_BG, color: CYBER_INK, position: "relative", overflow: "hidden" }}>
      <CyberCircuitPattern />

      {/* Header */}
      <div style={{ position: "relative", padding: "32px 36px 26px", borderBottom: `1px solid ${CYBER_CYAN}30`, zIndex: 1, background: "linear-gradient(180deg, rgba(0,240,255,0.04), transparent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Avatar with conic-gradient glowing ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -6, borderRadius: 18, background: "conic-gradient(from 0deg, #00f0ff, #ff00aa, #00ff88, #00f0ff)", filter: "blur(8px)", opacity: 0.7, animation: "spin 4s linear infinite" }} />
            <div style={{ position: "absolute", inset: -3, borderRadius: 16, background: "conic-gradient(from 0deg, #00f0ff, #ff00aa, #00ff88, #00f0ff)" }} />
            <Avatar data={data} size={96} shape="rounded" ring={CYBER_BG} ringWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: CYBER_GREEN, boxShadow: `0 0 8px ${CYBER_GREEN}` }} />
              <span style={{ fontFamily: JETBRAINS, fontSize: 9, color: CYBER_GREEN, letterSpacing: 2, fontWeight: 600 }}>SYSTEM_ONLINE</span>
              <span style={{ fontFamily: JETBRAINS, fontSize: 8, color: CYBER_MUTED, marginLeft: 6 }}>v2.0.25</span>
            </div>
            <h1 style={{ fontFamily: SPACE_GROTESK, fontSize: 36, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.05, letterSpacing: -1, textShadow: `0 0 20px ${CYBER_CYAN}80, 0 0 40px ${CYBER_CYAN}40` }}>
              <span style={{ background: `linear-gradient(135deg, #ffffff 0%, ${CYBER_CYAN} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" as React.CSSProperties["color"] }}>{data.name}</span>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div style={{ height: 2, width: 28, background: `linear-gradient(90deg, ${CYBER_CYAN}, ${CYBER_MAGENTA})` }} />
              <p style={{ fontFamily: SPACE_GROTESK, fontSize: 13, color: CYBER_CYAN, margin: 0, fontWeight: 500, letterSpacing: 0.5, textShadow: `0 0 6px ${CYBER_CYAN}80` }}>{data.title}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 10, fontFamily: JETBRAINS, fontSize: 9, color: "rgba(226,232,240,0.7)" }}>
              {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ color: CYBER_MAGENTA }}>▸</span>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body 2-column */}
      <div style={{ position: "relative", padding: "24px 36px 32px", display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18, zIndex: 1 }}>
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ ...CyberGlowCard, padding: "16px 18px", marginBottom: 14 }}>
              <CyberSectionHeader label="Profile" color={CYBER_CYAN} />
              <p style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(226,232,240,0.85)", margin: 0 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ ...CyberGlowCard, padding: "18px 18px", marginBottom: 14 }}>
              <CyberSectionHeader label="Experience" color={CYBER_MAGENTA} />
              {data.experience.map((e, i) => (
                <div key={e.id} style={{ marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingBottom: 14, borderBottom: `1px solid ${CYBER_CYAN}20`, position: "relative" }}>
                  <div style={{ position: "absolute", left: -10, top: 4, width: 4, height: 4, borderRadius: "50%", background: CYBER_MAGENTA, boxShadow: `0 0 8px ${CYBER_MAGENTA}` }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "white", textShadow: `0 0 8px ${CYBER_CYAN}50` }}>{e.role}</span>
                    <span style={{ fontFamily: JETBRAINS, fontSize: 8.5, color: CYBER_CYAN, padding: "3px 8px", borderRadius: 4, background: `${CYBER_CYAN}12`, border: `1px solid ${CYBER_CYAN}30`, whiteSpace: "nowrap" }}>{range(e.start, e.end)}</span>
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: CYBER_MAGENTA, marginTop: 2, textShadow: `0 0 6px ${CYBER_MAGENTA}60` }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                  <div style={{ marginTop: 8 }}>
                    {e.bullets.filter(b => b?.trim()).map((b, j) => (
                      <div key={j} style={{ fontSize: 10.5, lineHeight: 1.6, color: "rgba(226,232,240,0.8)", marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, top: 6, color: CYBER_GREEN, fontSize: 8, textShadow: `0 0 4px ${CYBER_GREEN}` }}>▸</span>{b}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div style={{ ...CyberGlowCard, padding: "18px 18px" }}>
              <CyberSectionHeader label="Projects" color={CYBER_GREEN} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.projects.map((p, i) => (
                  <div key={p.id} style={{ padding: 12, borderRadius: 8, background: "rgba(0,240,255,0.04)", border: `1px solid ${CYBER_CYAN}25`, breakInside: "avoid" as React.CSSProperties["breakInside"], position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, borderTop: `1px solid ${CYBER_GREEN}`, borderLeft: `1px solid ${CYBER_GREEN}` }} />
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderBottom: `1px solid ${CYBER_GREEN}`, borderRight: `1px solid ${CYBER_GREEN}` }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginTop: 4 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 9.5, lineHeight: 1.5, color: "rgba(226,232,240,0.7)", marginTop: 4 }}>{p.description}</div>}
                    {p.tech.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                        {p.tech.map((t, j) => (
                          <span key={j} style={{ fontFamily: JETBRAINS, fontSize: 7.5, fontWeight: 600, padding: "2px 5px", borderRadius: 3, background: `${CYBER_GREEN}12`, color: CYBER_GREEN, border: `1px solid ${CYBER_GREEN}30` }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {p.link && <div style={{ fontFamily: JETBRAINS, fontSize: 8, color: CYBER_CYAN, marginTop: 4 }}>↗ {p.link}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...CyberGlowCard, padding: "16px 18px", marginBottom: 14 }}>
              <CyberSectionHeader label="Skills" color={CYBER_CYAN} />
              {data.skills.map((s, i) => {
                const level = data.skillLevels[s] ?? 60;
                const color = i % 3 === 0 ? CYBER_CYAN : i % 3 === 1 ? CYBER_MAGENTA : CYBER_GREEN;
                return (
                  <div key={i} style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                      <span style={{ color: "rgba(226,232,240,0.9)", fontWeight: 600 }}>{s}</span>
                      <span style={{ fontFamily: JETBRAINS, fontSize: 8.5, color }}>{level}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(0,240,255,0.08)", overflow: "hidden", position: "relative" }}>
                      <div style={{ height: "100%", width: `${level}%`, background: `linear-gradient(90deg, ${color}, ${CYBER_CYAN})`, borderRadius: 2, boxShadow: `0 0 6px ${color}80` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...CyberGlowCard, padding: "16px 18px", marginBottom: 14 }}>
              <CyberSectionHeader label="Education" color={CYBER_MAGENTA} />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"], paddingLeft: 12, borderLeft: `2px solid ${CYBER_MAGENTA}60` }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "white" }}>{ed.degree}</div>
                  <div style={{ fontSize: 10, color: CYBER_MAGENTA, marginTop: 1, fontWeight: 600 }}>{ed.school}</div>
                  <div style={{ fontFamily: JETBRAINS, fontSize: 8, color: "rgba(226,232,240,0.6)", marginTop: 1 }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...CyberGlowCard, padding: "16px 18px", marginBottom: 14 }}>
              <CyberSectionHeader label="Certs" color={CYBER_GREEN} />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"], display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ fontFamily: JETBRAINS, fontSize: 9, color: CYBER_GREEN, marginTop: 1 }}>[✓]</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "white" }}>{c.title}</div>
                    <div style={{ fontFamily: JETBRAINS, fontSize: 8, color: "rgba(226,232,240,0.6)", marginTop: 1 }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...CyberGlowCard, padding: "16px 18px", marginBottom: 14 }}>
              <CyberSectionHeader label="Languages" color={CYBER_CYAN} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.languages.map((l, i) => (
                  <span key={i} style={{ fontFamily: JETBRAINS, fontSize: 9, fontWeight: 600, padding: "4px 9px", borderRadius: 4, background: `${CYBER_CYAN}10`, color: CYBER_CYAN, border: `1px solid ${CYBER_CYAN}30` }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...CyberGlowCard, padding: "16px 18px", marginBottom: 14 }}>
              <CyberSectionHeader label="Awards" color={CYBER_MAGENTA} />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "white" }}>{aw.title}</div>
                  <div style={{ fontFamily: JETBRAINS, fontSize: 8, color: CYBER_MAGENTA, marginTop: 1 }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...CyberGlowCard, padding: "16px 18px" }}>
              <CyberSectionHeader label="Interests" color={CYBER_GREEN} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.interests.map((it, i) => (
                  <span key={i} style={{ fontFamily: JETBRAINS, fontSize: 8.5, fontWeight: 500, color: "rgba(226,232,240,0.7)" }}>{`// ${it}`}</span>
                ))}
              </div>
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...CyberGlowCard, padding: "16px 18px", marginTop: 14 }}>
              <CyberSectionHeader label={cs.title} color={CYBER_CYAN} />
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 7, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "white" }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontFamily: JETBRAINS, fontSize: 8.5, color: CYBER_CYAN, marginTop: 1 }}>{item.subtitle}</div>}
                  {item.description && <div style={{ fontSize: 9.5, color: "rgba(226,232,240,0.75)", marginTop: 2, lineHeight: 1.5 }}>{item.description}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer with status bar */}
      <div style={{ position: "relative", padding: "10px 36px", borderTop: `1px solid ${CYBER_CYAN}30`, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: JETBRAINS, fontSize: 8, color: CYBER_MUTED, letterSpacing: 1, zIndex: 1 }}>
        <span style={{ color: CYBER_GREEN }}>● CONN_SECURE</span>
        <span style={{ color: CYBER_CYAN }}>{`${data.name.toUpperCase()} // CYBER_PREMIUM`}</span>
        <span>{new Date().getFullYear()}.MMXXV</span>
      </div>
    </div>
  );
}
