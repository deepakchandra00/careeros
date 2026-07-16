"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";

const PAPER = "resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl";
const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

// Avatar helper — supports circle, square, and rounded shapes for luxury layouts
function Avatar({ data, size, ring, ringWidth = 2, shape = "circle" }: { data: ResumeData; size: number; ring?: string; ringWidth?: number; shape?: "circle" | "square" | "rounded" }) {
  const borderStyle = ring ? `${ring} ${ringWidth}px solid` : undefined;
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "12px" : "0";
  const initials = data.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  if (data.photo) return <img src={data.photo} alt={data.name} style={{ width: size, height: size, borderRadius, objectFit: "cover", border: borderStyle }} />;
  return <div style={{ width: size, height: size, borderRadius, background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, border: borderStyle, fontFamily: "Georgia, serif" }}>{initials}</div>;
}

function range(start: string, end: string) {
  const s = (start ?? "").trim(); const e = (end ?? "").trim();
  if (s && e) return `${s} — ${e}`; if (s) return `${s} — Present`; return e || "";
}

const PLAYFAIR = "'Playfair Display', Georgia, serif";
const CORMORANT = "'Cormorant Garamond', Georgia, serif";
const DM_SANS = "'DM Sans', system-ui, sans-serif";
const MANROPE = "'Manrope', system-ui, sans-serif";

// --- Vogue palette & helpers (module-level) ---
const VOGUE_CREAM = "#faf8f3";
const VOGUE_GOLD = "#c5a572";
const VOGUE_INK = "#1a1714";
const VOGUE_MUTED = "#7c736a";

const VogueSectionLabel = ({ n, label }: { n: string; label: string }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14, marginTop: 4 }}>
    <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: VOGUE_GOLD, letterSpacing: 1 }}>{n}</span>
    <span style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 600, color: VOGUE_INK, letterSpacing: 3, textTransform: "uppercase" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: VOGUE_GOLD, opacity: 0.5 }} />
  </div>
);

// =====================================================================
// 1. VOGUE — Cream/ivory editorial. Oversized Playfair serif name,
//    champagne gold (#c5a572) thin dividers, vertical "PORTFOLIO" rail
//    on left edge, circular photo with thin gold ring, vast whitespace.
//    Font: Playfair Display + Cormorant Garamond.
// =====================================================================
export function VogueTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const cream = VOGUE_CREAM;
  const gold = VOGUE_GOLD;
  const ink = VOGUE_INK;
  const muted = VOGUE_MUTED;

  return (
    <div className={PAPER} style={{ fontFamily: CORMORANT, background: cream, color: ink, position: "relative", overflow: "hidden" }}>
      {/* Vertical PORTFOLIO rail on left edge */}
      <div style={{ position: "absolute", left: 18, top: 60, bottom: 60, width: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
        <div style={{ writingMode: "vertical-rl" as React.CSSProperties["writingMode"], transform: "rotate(180deg)", fontFamily: DM_SANS, fontSize: 9, letterSpacing: 8, color: gold, fontWeight: 600, textTransform: "uppercase" }}>Portfolio</div>
        <div style={{ writingMode: "vertical-rl" as React.CSSProperties["writingMode"], transform: "rotate(180deg)", fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10, color: muted, letterSpacing: 2 }}>Est. MMXXV</div>
      </div>

      {/* Decorative gold ornament top-right */}
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", top: 24, right: 24, opacity: 0.35, pointerEvents: "none" }}>
        <circle cx="60" cy="60" r="50" fill="none" stroke={gold} strokeWidth="0.5" />
        <circle cx="60" cy="60" r="38" fill="none" stroke={gold} strokeWidth="0.5" />
        <circle cx="60" cy="60" r="3" fill={gold} />
        <line x1="60" y1="6" x2="60" y2="20" stroke={gold} strokeWidth="0.5" />
        <line x1="60" y1="100" x2="60" y2="114" stroke={gold} strokeWidth="0.5" />
        <line x1="6" y1="60" x2="20" y2="60" stroke={gold} strokeWidth="0.5" />
        <line x1="100" y1="60" x2="114" y2="60" stroke={gold} strokeWidth="0.5" />
      </svg>

      {/* Header — editorial cover */}
      <div style={{ padding: "60px 56px 36px 70px", borderBottom: `1px solid ${gold}`, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 36 }}>
          <div style={{ flex: 1, paddingTop: 6 }}>
            <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 14, color: gold, letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>The Profile of</div>
            <h1 style={{ fontFamily: PLAYFAIR, fontSize: 44, fontWeight: 700, color: ink, margin: 0, lineHeight: 1.05, letterSpacing: -0.5 }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
              <div style={{ width: 36, height: 1, background: gold }} />
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 18, color: muted, margin: 0, letterSpacing: 1 }}>{data.title}</p>
            </div>
            {/* Contact as elegant editorial caption */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 22, fontFamily: DM_SANS, fontSize: 9.5, color: muted, letterSpacing: 0.4 }}>
              {[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: gold, fontSize: 8 }}>◆</span>{c}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* Outer decorative ring */}
            <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `0.5px solid ${gold}`, opacity: 0.7 }} />
            <div style={{ position: "absolute", inset: -18, borderRadius: "50%", border: `0.5px solid ${gold}`, opacity: 0.3 }} />
            <Avatar data={data} size={108} ring={gold} ringWidth={1} shape="circle" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "36px 56px 44px 70px" }}>
        {/* Summary — editorial pull quote style */}
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 32 }}>
            <VogueSectionLabel n="I." label="Profile" />
            <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 15, lineHeight: 1.75, color: ink, margin: 0, maxWidth: 580 }}>{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <VogueSectionLabel n="II." label="Experience" />
            <div>
              {data.experience.map((e, i) => (
                <div key={e.id} style={{ marginBottom: 22, breakInside: "avoid" as React.CSSProperties["breakInside"], display: "flex", gap: 22 }}>
                  <div style={{ width: 84, flexShrink: 0, textAlign: "right", paddingTop: 2 }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 11, color: gold, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{range(e.start, e.end)}</div>
                  </div>
                  <div style={{ width: 1, background: gold, opacity: 0.4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 16, fontWeight: 700, color: ink, lineHeight: 1.2 }}>{e.role}</div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 13, color: gold, marginTop: 2 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                    <div style={{ marginTop: 8 }}>
                      {e.bullets.filter(b => b?.trim()).map((b, j) => (
                        <div key={j} style={{ fontFamily: CORMORANT, fontSize: 11.5, lineHeight: 1.7, color: "#3d3833", marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: gold, fontSize: 8, top: 7 }}>◆</span>{b}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-column lower section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          <div>
            {visible(sections, "education") && data.education.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <VogueSectionLabel n="III." label="Education" />
                {data.education.map(ed => (
                  <div key={ed.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: ink }}>{ed.degree}</div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: gold, marginTop: 2 }}>{ed.school}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                    <div style={{ fontFamily: DM_SANS, fontSize: 9, color: muted, marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>{range(ed.start, ed.end)}</div>
                  </div>
                ))}
              </div>
            )}
            {visible(sections, "skills") && data.skills.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <VogueSectionLabel n="IV." label="Expertise" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 0" }}>
                  {data.skills.map((s, i) => (
                    <div key={i} style={{ width: "50%", fontFamily: CORMORANT, fontSize: 12, color: ink, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: gold, fontSize: 7 }}>◆</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            {visible(sections, "projects") && data.projects.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <VogueSectionLabel n="V." label="Selected Works" />
                {data.projects.map(p => (
                  <div key={p.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 12.5, fontWeight: 700, color: ink }}>{p.name}</div>
                    {p.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: "#3d3833", lineHeight: 1.55, marginTop: 2 }}>{p.description}</div>}
                    {p.tech.length > 0 && <div style={{ fontFamily: DM_SANS, fontSize: 8.5, color: gold, marginTop: 3, letterSpacing: 0.5 }}>{p.tech.join("  ·  ")}</div>}
                  </div>
                ))}
              </div>
            )}
            {visible(sections, "languages") && data.languages.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <VogueSectionLabel n="VI." label="Languages" />
                <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: ink, lineHeight: 1.8 }}>{data.languages.join("   ·   ")}</div>
              </div>
            )}
            {visible(sections, "awards") && data.awards.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <VogueSectionLabel n="VII." label="Distinctions" />
                {data.awards.map(aw => (
                  <div key={aw.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 12, fontWeight: 700, color: ink }}>{aw.title}</div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: gold }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {visible(sections, "certifications") && data.certifications.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <VogueSectionLabel n="VIII." label="Certifications" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px" }}>
              {data.certifications.map(c => (
                <div key={c.id} style={{ fontFamily: CORMORANT, fontSize: 12, color: ink }}>
                  <span style={{ color: gold, marginRight: 6, fontSize: 8 }}>◆</span>{c.title}{c.date ? <span style={{ color: muted, fontStyle: "italic", marginLeft: 6 }}>, {c.date}</span> : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {visible(sections, "interests") && data.interests.length > 0 && (
          <div>
            <VogueSectionLabel n="IX." label="Interests" />
            <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: ink }}>{data.interests.join("   ·   ")}</div>
          </div>
        )}

        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
          <div key={cs.id} style={{ marginBottom: 28, marginTop: 12 }}>
            <VogueSectionLabel n="·" label={cs.title} />
            {cs.items.map(item => (
              <div key={item.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ fontFamily: PLAYFAIR, fontSize: 12, fontWeight: 700, color: ink }}>{item.title}{item.date ? <span style={{ color: muted, fontStyle: "italic", fontWeight: 400, marginLeft: 8 }}>{item.date}</span> : null}</div>
                {item.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: gold, marginTop: 1 }}>{item.subtitle}</div>}
                {item.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: "#3d3833", lineHeight: 1.55, marginTop: 2 }}>{item.description}</div>}
              </div>
            ))}
          </div>
        ))}

        {/* Editorial colophon footer */}
        <div style={{ marginTop: 36, paddingTop: 18, borderTop: `1px solid ${gold}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10, color: muted, letterSpacing: 1 }}>— Fin —</span>
          <span style={{ fontFamily: DM_SANS, fontSize: 8, color: gold, letterSpacing: 4, textTransform: "uppercase" }}>Vogue Editorial</span>
        </div>
      </div>
    </div>
  );
}

// --- Maison palette & helpers (module-level) ---
const MAISON_BLACK = "#0a0a0a";
const MAISON_GOLD = "#c5a572";
const MAISON_PLATINUM = "#e5e4e2";
const MAISON_CREAM = "#f5f0e8";
const MAISON_MUTED = "rgba(229,228,226,0.55)";

const MaisonArchLines = () => (
  <svg width="220" height="320" viewBox="0 0 220 320" style={{ position: "absolute", top: 60, right: -40, opacity: 0.25, pointerEvents: "none" }}>
    <line x1="0" y1="0" x2="220" y2="320" stroke={MAISON_GOLD} strokeWidth="0.5" />
    <line x1="220" y1="0" x2="0" y2="320" stroke={MAISON_GOLD} strokeWidth="0.5" />
    <line x1="110" y1="0" x2="110" y2="320" stroke={MAISON_GOLD} strokeWidth="0.5" />
    <line x1="0" y1="160" x2="220" y2="160" stroke={MAISON_GOLD} strokeWidth="0.5" />
    <circle cx="110" cy="160" r="80" fill="none" stroke={MAISON_GOLD} strokeWidth="0.5" />
    <circle cx="110" cy="160" r="40" fill="none" stroke={MAISON_GOLD} strokeWidth="0.5" />
    <rect x="60" y="110" width="100" height="100" fill="none" stroke={MAISON_GOLD} strokeWidth="0.5" transform="rotate(45 110 160)" />
    <circle cx="110" cy="160" r="3" fill={MAISON_GOLD} />
  </svg>
);

const MaisonHeader = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
    <span style={{ fontFamily: DM_SANS, fontSize: 9, color: MAISON_GOLD, letterSpacing: 4, fontWeight: 600 }}>{label.toUpperCase()}</span>
    <div style={{ flex: 1, height: 0.5, background: `linear-gradient(90deg, ${MAISON_GOLD}, transparent)` }} />
  </div>
);

// =====================================================================
// 2. MAISON — Matte black (#0a0a0a) with gold (#c5a572) accents.
//    Architectural line art (thin SVG geometric lines), circular photo
//    with double gold ring, thin platinum dividers, layered paper cards,
//    vertical "MAISON" text. Font: Cormorant Garamond + DM Sans.
// =====================================================================
export function MaisonTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const black = MAISON_BLACK;
  const gold = MAISON_GOLD;
  const platinum = MAISON_PLATINUM;
  const cream = MAISON_CREAM;
  const muted = MAISON_MUTED;

  const LayeredCard: React.CSSProperties = {
    background: "linear-gradient(180deg, #161616 0%, #0f0f0f 100%)",
    border: `0.5px solid ${gold}55`,
    borderRadius: 2,
    boxShadow: "0 1px 0 rgba(197,165,114,0.08), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
  };

  return (
    <div className={PAPER} style={{ fontFamily: CORMORANT, background: black, color: cream, position: "relative", overflow: "hidden" }}>
      <MaisonArchLines />

      {/* Vertical MAISON rail */}
      <div style={{ position: "absolute", left: 16, top: 80, bottom: 80, width: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
        <div style={{ writingMode: "vertical-rl" as React.CSSProperties["writingMode"], transform: "rotate(180deg)", fontFamily: PLAYFAIR, fontSize: 16, color: gold, letterSpacing: 12, fontWeight: 700 }}>MAISON</div>
        <div style={{ writingMode: "vertical-rl" as React.CSSProperties["writingMode"], transform: "rotate(180deg)", fontFamily: DM_SANS, fontSize: 8, color: muted, letterSpacing: 4 }}>ATELIER · MMXXV</div>
      </div>

      {/* Header with double-ring circular photo */}
      <div style={{ padding: "48px 56px 36px 70px", borderBottom: `0.5px solid ${platinum}30`, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1px solid ${gold}` }} />
            <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `0.5px solid ${gold}80` }} />
            <Avatar data={data} size={100} ring={gold} ringWidth={1} shape="circle" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DM_SANS, fontSize: 9, color: gold, letterSpacing: 5, marginBottom: 8, textTransform: "uppercase" }}>Maison Professionnelle</div>
            <h1 style={{ fontFamily: CORMORANT, fontSize: 42, fontWeight: 600, color: cream, margin: 0, lineHeight: 1.05, letterSpacing: 0.5 }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <div style={{ width: 28, height: 1, background: gold }} />
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 16, color: gold, margin: 0 }}>{data.title}</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", marginTop: 22, fontFamily: DM_SANS, fontSize: 9, color: muted, letterSpacing: 0.4, paddingLeft: 130 }}>
          {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: gold, fontSize: 7 }}>●</span>{c}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "32px 56px 40px 70px", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 28 }}>
        {/* Left column */}
        <div>
          {visible(sections, "summary") && data.summary && (
            <div style={{ marginBottom: 24 }}>
              <MaisonHeader label="Manifesto" />
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 14, lineHeight: 1.75, color: "rgba(245,240,232,0.85)", margin: 0 }}>{data.summary}</p>
            </div>
          )}

          {visible(sections, "experience") && data.experience.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <MaisonHeader label="Parcours" />
              <div>
                {data.experience.map(e => (
                  <div key={e.id} style={{ ...LayeredCard, padding: "16px 18px", marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontFamily: CORMORANT, fontSize: 17, fontWeight: 600, color: cream }}>{e.role}</span>
                      <span style={{ fontFamily: DM_SANS, fontSize: 8.5, color: gold, letterSpacing: 1.5, textTransform: "uppercase" }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12.5, color: gold, marginBottom: 10 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                    <div style={{ width: 24, height: 0.5, background: `${gold}80`, marginBottom: 10 }} />
                    {e.bullets.filter(b => b?.trim()).map((b, i) => (
                      <div key={i} style={{ fontFamily: CORMORANT, fontSize: 11.5, lineHeight: 1.65, color: "rgba(245,240,232,0.8)", marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: gold, fontSize: 7, top: 7 }}>●</span>{b}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {visible(sections, "projects") && data.projects.length > 0 && (
            <div>
              <MaisonHeader label="Œuvres" />
              {data.projects.map(p => (
                <div key={p.id} style={{ ...LayeredCard, padding: "14px 18px", marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 14, fontWeight: 600, color: cream }}>{p.name}</div>
                  {p.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: "rgba(245,240,232,0.75)", lineHeight: 1.55, marginTop: 3 }}>{p.description}</div>}
                  {p.tech.length > 0 && <div style={{ fontFamily: DM_SANS, fontSize: 8, color: gold, marginTop: 5, letterSpacing: 0.5 }}>{p.tech.join("   ·   ")}</div>}
                  {p.link && <div style={{ fontFamily: DM_SANS, fontSize: 8, color: platinum, marginTop: 3, opacity: 0.7 }}>{p.link}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div style={{ ...LayeredCard, padding: "18px", marginBottom: 16 }}>
              <MaisonHeader label="Savoir-Faire" />
              {data.skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, paddingBottom: 6, borderBottom: `0.5px solid ${platinum}15` }}>
                  <span style={{ color: gold, fontSize: 8 }}>◆</span>
                  <span style={{ fontFamily: CORMORANT, fontSize: 12, color: cream, flex: 1 }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "education") && data.education.length > 0 && (
            <div style={{ ...LayeredCard, padding: "18px", marginBottom: 16 }}>
              <MaisonHeader label="Formation" />
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 13, fontWeight: 600, color: cream }}>{ed.degree}</div>
                  <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11.5, color: gold }}>{ed.school}</div>
                  <div style={{ fontFamily: DM_SANS, fontSize: 8, color: muted, marginTop: 2, letterSpacing: 1 }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "languages") && data.languages.length > 0 && (
            <div style={{ ...LayeredCard, padding: "18px", marginBottom: 16 }}>
              <MaisonHeader label="Langues" />
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontFamily: CORMORANT, fontSize: 12, color: cream, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: gold, fontSize: 7 }}>●</span>{l}
                </div>
              ))}
            </div>
          )}

          {visible(sections, "certifications") && data.certifications.length > 0 && (
            <div style={{ ...LayeredCard, padding: "18px", marginBottom: 16 }}>
              <MaisonHeader label="Certifications" />
              {data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 12, fontWeight: 600, color: cream }}>{c.title}</div>
                  <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10.5, color: gold }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "awards") && data.awards.length > 0 && (
            <div style={{ ...LayeredCard, padding: "18px", marginBottom: 16 }}>
              <MaisonHeader label="Distinctions" />
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 12, fontWeight: 600, color: cream }}>{aw.title}</div>
                  <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10.5, color: gold }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {visible(sections, "interests") && data.interests.length > 0 && (
            <div style={{ ...LayeredCard, padding: "18px" }}>
              <MaisonHeader label="Intérêts" />
              <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11.5, color: cream, lineHeight: 1.7 }}>{data.interests.join("   ·   ")}</div>
            </div>
          )}

          {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
            <div key={cs.id} style={{ ...LayeredCard, padding: "18px", marginBottom: 16 }}>
              <MaisonHeader label={cs.title} />
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: CORMORANT, fontSize: 12, fontWeight: 600, color: cream }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10.5, color: gold }}>{item.subtitle}</div>}
                  {item.description && <div style={{ fontFamily: CORMORANT, fontSize: 10.5, color: "rgba(245,240,232,0.8)", lineHeight: 1.5, marginTop: 2 }}>{item.description}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 70px 28px", borderTop: `0.5px solid ${platinum}30`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: DM_SANS, fontSize: 8, color: muted, letterSpacing: 3 }}>EST. MMXXV</span>
        <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10, color: gold }}>— Maison —</span>
        <span style={{ fontFamily: DM_SANS, fontSize: 8, color: muted, letterSpacing: 3 }}>{data.name.toUpperCase()}</span>
      </div>
    </div>
  );
}

// --- Atelier palette & helpers (module-level) ---
const ATELIER_BURGUNDY = "#5b1a1a";
const ATELIER_CREAM = "#faf6ef";
const ATELIER_GOLD = "#c5a572";
const ATELIER_INK = "#2b1a1a";
const ATELIER_MUTED = "#7a6a6a";

const AtelierBotanical = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="180" height="240" viewBox="0 0 180 240" style={{ position: "absolute", ...style, opacity: 0.18, pointerEvents: "none" }}>
    <g stroke={ATELIER_BURGUNDY} strokeWidth="0.8" fill="none">
      {/* central branch */}
      <path d="M 90 230 Q 88 180 92 120 Q 95 80 90 30" />
      {/* leaves left */}
      <path d="M 90 200 Q 60 195 50 175 Q 70 175 90 200" fill={ATELIER_BURGUNDY} fillOpacity="0.15" />
      <path d="M 91 160 Q 65 150 58 128 Q 78 132 91 160" fill={ATELIER_BURGUNDY} fillOpacity="0.15" />
      <path d="M 92 120 Q 70 108 65 88 Q 84 96 92 120" fill={ATELIER_BURGUNDY} fillOpacity="0.15" />
      <path d="M 92 80 Q 76 66 74 48 Q 88 56 92 80" fill={ATELIER_BURGUNDY} fillOpacity="0.15" />
      {/* leaves right */}
      <path d="M 90 180 Q 120 178 130 158 Q 110 158 90 180" fill={ATELIER_BURGUNDY} fillOpacity="0.15" />
      <path d="M 91 140 Q 118 132 124 110 Q 104 114 91 140" fill={ATELIER_BURGUNDY} fillOpacity="0.15" />
      <path d="M 92 100 Q 114 90 118 70 Q 100 76 92 100" fill={ATELIER_BURGUNDY} fillOpacity="0.15" />
      <path d="M 92 60 Q 108 50 110 32 Q 96 40 92 60" fill={ATELIER_BURGUNDY} fillOpacity="0.15" />
    </g>
  </svg>
);

const AtelierRibbonBadge = ({ title, sub }: { title: string; sub?: string }) => (
  <div style={{ display: "inline-flex", alignItems: "stretch", marginBottom: 8 }}>
    <div style={{ width: 8, background: ATELIER_BURGUNDY, clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%, 0 0)" }} />
    <div style={{ background: ATELIER_BURGUNDY, color: ATELIER_CREAM, padding: "5px 14px", fontFamily: PLAYFAIR, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", position: "relative" }}>
      {title}{sub ? <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontWeight: 400, marginLeft: 8, opacity: 0.85 }}>{sub}</span> : null}
    </div>
    <div style={{ width: 8, background: ATELIER_BURGUNDY, clipPath: "polygon(0 0, 100% 0, 0 50%, 100% 50%)" }} />
  </div>
);

const AtelierSectionLabel = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, marginTop: 2 }}>
    <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1 L9 5 L13 5 L10 8 L11 13 L7 10 L3 13 L4 8 L1 5 L5 5 Z" fill={ATELIER_GOLD} /></svg>
    <span style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: ATELIER_BURGUNDY, letterSpacing: 3, textTransform: "uppercase" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${ATELIER_GOLD}, transparent)` }} />
  </div>
);

// =====================================================================
// 3. ATELIER — Burgundy (#5b1a1a) + cream (#faf6ef) + gold (#c5a572).
//    Botanical SVG accents (leaves, branches), embossed inset-shadow cards,
//    ribbon-style achievement badges, elegant quote highlight block.
//    Font: Playfair Display + Cormorant Garamond.
// =====================================================================
export function AtelierTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const burgundy = ATELIER_BURGUNDY;
  const cream = ATELIER_CREAM;
  const gold = ATELIER_GOLD;
  const ink = ATELIER_INK;
  const muted = ATELIER_MUTED;

  const Embossed: React.CSSProperties = {
    background: "rgba(255,255,255,0.6)",
    borderRadius: 4,
    boxShadow: `inset 0 1px 2px rgba(91,26,26,0.12), inset 0 0 0 0.5px ${gold}55`,
    border: `0.5px solid ${gold}40`,
  };

  return (
    <div className={PAPER} style={{ fontFamily: CORMORANT, background: cream, color: ink, position: "relative", overflow: "hidden" }}>
      <AtelierBotanical style={{ top: -30, right: -30 }} />
      <AtelierBotanical style={{ bottom: -40, left: -40, transform: "rotate(180deg)" }} />

      {/* Top burgundy bar with gold trim */}
      <div style={{ background: burgundy, padding: "36px 48px 32px", position: "relative", borderBottom: `2px solid ${gold}` }}>
        <div style={{ position: "absolute", top: 8, left: 48, right: 48, height: 1, background: `${gold}40` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1px solid ${gold}` }} />
            <Avatar data={data} size={96} ring={gold} ringWidth={1} shape="circle" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: gold, letterSpacing: 4, marginBottom: 6 }}>Atelier Professionnelle</div>
            <h1 style={{ fontFamily: PLAYFAIR, fontSize: 40, fontWeight: 700, color: cream, margin: 0, lineHeight: 1.05, letterSpacing: 0.5 }}>{data.name}</h1>
            <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 16, color: gold, margin: "8px 0 0" }}>{data.title}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 48px 36px" }}>
        {/* Contact strip */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", paddingBottom: 20, marginBottom: 24, borderBottom: `1px solid ${gold}50`, fontFamily: CORMORANT, fontSize: 11, color: muted, fontStyle: "italic" }}>
          {[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: gold, fontSize: 7 }}>❦</span>{c}
            </span>
          ))}
        </div>

        {/* Quote-style summary */}
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 28, position: "relative", padding: "16px 24px 16px 40px" }}>
            <span style={{ position: "absolute", left: 8, top: -10, fontFamily: PLAYFAIR, fontSize: 56, color: gold, opacity: 0.5, lineHeight: 1 }}>"</span>
            <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 15, lineHeight: 1.7, color: ink, margin: 0 }}>{data.summary}</p>
            <div style={{ marginTop: 8, height: 1, background: `${gold}80`, width: 60 }} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 28 }}>
          <div>
            {visible(sections, "experience") && data.experience.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <AtelierSectionLabel label="Experience" />
                {data.experience.map(e => (
                  <div key={e.id} style={{ ...Embossed, padding: "14px 18px", marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontFamily: PLAYFAIR, fontSize: 14, fontWeight: 700, color: burgundy }}>{e.role}</span>
                      <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: gold }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: muted, marginBottom: 8 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                    {e.bullets.filter(b => b?.trim()).map((b, i) => (
                      <div key={i} style={{ fontFamily: CORMORANT, fontSize: 11, lineHeight: 1.6, color: ink, marginBottom: 2, paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: gold, fontSize: 9, top: 4 }}>❦</span>{b}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "projects") && data.projects.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <AtelierSectionLabel label="Selected Works" />
                {data.projects.map(p => (
                  <div key={p.id} style={{ ...Embossed, padding: "12px 18px", marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: burgundy }}>{p.name}</div>
                    {p.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: ink, lineHeight: 1.55, marginTop: 3 }}>{p.description}</div>}
                    {p.tech.length > 0 && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 9.5, color: gold, marginTop: 4 }}>{p.tech.join("   ·   ")}</div>}
                    {p.link && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 9.5, color: muted, marginTop: 2 }}>{p.link}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {visible(sections, "awards") && data.awards.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <AtelierSectionLabel label="Honors" />
                <div>
                  {data.awards.map(aw => (
                    <div key={aw.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                      <AtelierRibbonBadge title={aw.title} sub={aw.date} />
                      {aw.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: muted, marginTop: 2 }}>{aw.subtitle}</div>}
                      {aw.description && <div style={{ fontFamily: CORMORANT, fontSize: 10.5, color: ink, lineHeight: 1.55, marginTop: 2 }}>{aw.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visible(sections, "skills") && data.skills.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <AtelierSectionLabel label="Artistry" />
                <div style={{ ...Embossed, padding: "12px 16px" }}>
                  {data.skills.map((s, i) => (
                    <div key={i} style={{ fontFamily: CORMORANT, fontSize: 12, color: ink, marginBottom: 5, display: "flex", alignItems: "center", gap: 8, paddingBottom: 5, borderBottom: i < data.skills.length - 1 ? `0.5px solid ${gold}30` : "none" }}>
                      <span style={{ color: gold, fontSize: 7 }}>❦</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visible(sections, "education") && data.education.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <AtelierSectionLabel label="Education" />
                <div style={{ ...Embossed, padding: "12px 16px" }}>
                  {data.education.map(ed => (
                    <div key={ed.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                      <div style={{ fontFamily: PLAYFAIR, fontSize: 12, fontWeight: 700, color: burgundy }}>{ed.degree}</div>
                      <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: muted }}>{ed.school}</div>
                      <div style={{ fontFamily: CORMORANT, fontSize: 10, color: gold }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visible(sections, "certifications") && data.certifications.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <AtelierSectionLabel label="Certifications" />
                <div style={{ ...Embossed, padding: "12px 16px" }}>
                  {data.certifications.map(c => (
                    <div key={c.id} style={{ marginBottom: 6, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                      <div style={{ fontFamily: PLAYFAIR, fontSize: 11.5, fontWeight: 700, color: burgundy }}>{c.title}</div>
                      <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10.5, color: muted }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visible(sections, "languages") && data.languages.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <AtelierSectionLabel label="Languages" />
                <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: ink, lineHeight: 1.7 }}>{data.languages.join("   ·   ")}</div>
              </div>
            )}

            {visible(sections, "interests") && data.interests.length > 0 && (
              <div>
                <AtelierSectionLabel label="Interests" />
                <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: ink, lineHeight: 1.7 }}>{data.interests.join("   ·   ")}</div>
              </div>
            )}

            {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
              <div key={cs.id} style={{ marginBottom: 24 }}>
                <AtelierSectionLabel label={cs.title} />
                <div style={{ ...Embossed, padding: "12px 16px" }}>
                  {cs.items.map(item => (
                    <div key={item.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                      <div style={{ fontFamily: PLAYFAIR, fontSize: 12, fontWeight: 700, color: burgundy }}>{item.title}</div>
                      {item.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: muted }}>{item.subtitle}</div>}
                      {item.description && <div style={{ fontFamily: CORMORANT, fontSize: 10.5, color: ink, lineHeight: 1.55, marginTop: 2 }}>{item.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: burgundy, padding: "12px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${gold}` }}>
        <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10, color: gold }}>— Atelier —</span>
        <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10, color: `${cream}80` }}>{data.name} · {data.title}</span>
        <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10, color: gold }}>MMXXV</span>
      </div>
    </div>
  );
}

// --- Riviera palette & helpers (module-level) ---
const RIVIERA_SAPPHIRE = "#0f3460";
const RIVIERA_SAPPHIRE_DARK = "#0a2647";
const RIVIERA_PLATINUM = "#e5e4e2";
const RIVIERA_WHITE = "#ffffff";

const RivieraWaves = ({ style, color = RIVIERA_PLATINUM }: { style?: React.CSSProperties; color?: string }) => (
  <svg width="794" height="200" viewBox="0 0 794 200" preserveAspectRatio="none" style={{ position: "absolute", ...style, pointerEvents: "none" }}>
    <path d="M0 100 C 150 50, 300 150, 450 100 S 750 50, 794 100 L 794 200 L 0 200 Z" fill={color} fillOpacity="0.06" />
    <path d="M0 130 C 200 90, 350 170, 500 130 S 750 90, 794 130 L 794 200 L 0 200 Z" fill={color} fillOpacity="0.04" />
    <path d="M0 160 C 180 130, 360 180, 540 160 S 740 130, 794 160 L 794 200 L 0 200 Z" fill={color} fillOpacity="0.03" />
  </svg>
);

const RivieraHeader = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
    <svg width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" fill="none" stroke={RIVIERA_PLATINUM} strokeWidth="0.5" opacity="0.6" />
      <circle cx="10" cy="10" r="5" fill="none" stroke={RIVIERA_PLATINUM} strokeWidth="0.5" opacity="0.6" />
      <circle cx="10" cy="10" r="1.5" fill={RIVIERA_PLATINUM} />
    </svg>
    <span style={{ fontFamily: CORMORANT, fontSize: 14, fontWeight: 600, color: RIVIERA_WHITE, letterSpacing: 3, textTransform: "uppercase" }}>{label}</span>
    <div style={{ flex: 1, height: 0.5, background: `linear-gradient(90deg, ${RIVIERA_PLATINUM}60, transparent)` }} />
  </div>
);

// =====================================================================
// 4. RIVIERA — Sapphire blue (#0f3460) + platinum (#e5e4e2) + white.
//    Flowing organic wave SVG shapes, frosted-glass panels (backdrop blur),
//    circular photo, soft gradients. Font: Cormorant Garamond + DM Sans.
// =====================================================================
export function RivieraTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const sapphire = RIVIERA_SAPPHIRE;
  const sapphireDark = RIVIERA_SAPPHIRE_DARK;
  const platinum = RIVIERA_PLATINUM;
  const white = RIVIERA_WHITE;

  // Frosted glass panel — backdrop-filter with rgba fallback so it still reads well in PDF.
  const Glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.10)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: `0.5px solid ${platinum}40`,
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)",
  };

  return (
    <div className={PAPER} style={{ fontFamily: CORMORANT, background: `linear-gradient(160deg, ${sapphireDark} 0%, ${sapphire} 50%, ${sapphireDark} 100%)`, color: white, position: "relative", overflow: "hidden" }}>
      {/* Ambient orbs */}
      <div style={{ position: "absolute", top: -80, left: -80, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${platinum}15, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 100, right: -100, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${platinum}10, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
      <RivieraWaves style={{ top: 0, left: 0, opacity: 0.5 }} />
      <RivieraWaves style={{ bottom: 0, left: 0, transform: "rotate(180deg)", opacity: 0.4 }} />

      {/* Header */}
      <div style={{ padding: "44px 48px 32px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `0.5px solid ${platinum}60` }} />
            <div style={{ position: "absolute", inset: -18, borderRadius: "50%", border: `0.5px solid ${platinum}30` }} />
            <Avatar data={data} size={100} ring={platinum} ringWidth={1} shape="circle" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DM_SANS, fontSize: 9, color: platinum, letterSpacing: 5, marginBottom: 8, textTransform: "uppercase", opacity: 0.8 }}>Riviera Collection</div>
            <h1 style={{ fontFamily: CORMORANT, fontSize: 42, fontWeight: 600, color: white, margin: 0, lineHeight: 1.05, letterSpacing: 0.5 }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
              <div style={{ width: 32, height: 0.5, background: platinum, opacity: 0.7 }} />
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 17, color: platinum, margin: 0 }}>{data.title}</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", marginTop: 20, fontFamily: DM_SANS, fontSize: 9, color: "rgba(229,228,226,0.75)", letterSpacing: 0.4 }}>
          {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: platinum, fontSize: 7 }}>○</span>{c}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "8px 48px 40px" }}>
        {visible(sections, "summary") && data.summary && (
          <div style={{ ...Glass, padding: "18px 22px", marginBottom: 16 }}>
            <RivieraHeader label="Profile" />
            <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.9)", margin: 0 }}>{data.summary}</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
          <div>
            {visible(sections, "experience") && data.experience.length > 0 && (
              <div style={{ ...Glass, padding: "20px 22px", marginBottom: 16 }}>
                <RivieraHeader label="Experience" />
                {data.experience.map(e => (
                  <div key={e.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `0.5px solid ${platinum}25`, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: CORMORANT, fontSize: 17, fontWeight: 600, color: white }}>{e.role}</span>
                      <span style={{ fontFamily: DM_SANS, fontSize: 8.5, color: platinum, letterSpacing: 1.5, textTransform: "uppercase" }}>{range(e.start, e.end)}</span>
                    </div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 13, color: platinum, marginBottom: 8 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                    {e.bullets.filter(b => b?.trim()).map((b, i) => (
                      <div key={i} style={{ fontFamily: CORMORANT, fontSize: 11.5, lineHeight: 1.65, color: "rgba(255,255,255,0.85)", marginBottom: 2, paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: platinum, fontSize: 7, top: 7 }}>○</span>{b}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "projects") && data.projects.length > 0 && (
              <div style={{ ...Glass, padding: "20px 22px" }}>
                <RivieraHeader label="Projects" />
                {data.projects.map(p => (
                  <div key={p.id} style={{ marginBottom: 12, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: CORMORANT, fontSize: 14, fontWeight: 600, color: white }}>{p.name}{p.link ? <span style={{ fontFamily: DM_SANS, fontSize: 8.5, color: platinum, fontStyle: "normal", marginLeft: 8, opacity: 0.8 }}>· {p.link}</span> : null}</div>
                    {p.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: "rgba(255,255,255,0.8)", lineHeight: 1.55, marginTop: 3 }}>{p.description}</div>}
                    {p.tech.length > 0 && <div style={{ fontFamily: DM_SANS, fontSize: 8.5, color: platinum, marginTop: 4, letterSpacing: 0.5 }}>{p.tech.join("   ·   ")}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {visible(sections, "skills") && data.skills.length > 0 && (
              <div style={{ ...Glass, padding: "18px 20px", marginBottom: 16 }}>
                <RivieraHeader label="Skills" />
                {data.skills.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7, paddingBottom: 7, borderBottom: `0.5px solid ${platinum}20` }}>
                    <span style={{ color: platinum, fontSize: 7 }}>○</span>
                    <span style={{ fontFamily: CORMORANT, fontSize: 12.5, color: white, flex: 1 }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "education") && data.education.length > 0 && (
              <div style={{ ...Glass, padding: "18px 20px", marginBottom: 16 }}>
                <RivieraHeader label="Education" />
                {data.education.map(ed => (
                  <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: CORMORANT, fontSize: 13, fontWeight: 600, color: white }}>{ed.degree}</div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11.5, color: platinum }}>{ed.school}</div>
                    <div style={{ fontFamily: DM_SANS, fontSize: 8, color: "rgba(229,228,226,0.7)", marginTop: 2, letterSpacing: 1 }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "certifications") && data.certifications.length > 0 && (
              <div style={{ ...Glass, padding: "18px 20px", marginBottom: 16 }}>
                <RivieraHeader label="Certifications" />
                {data.certifications.map(c => (
                  <div key={c.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: CORMORANT, fontSize: 12.5, fontWeight: 600, color: white }}>{c.title}</div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: platinum }}>{c.subtitle}{c.date ? `  ·  ${c.date}` : ""}</div>
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "languages") && data.languages.length > 0 && (
              <div style={{ ...Glass, padding: "18px 20px", marginBottom: 16 }}>
                <RivieraHeader label="Languages" />
                {data.languages.map((l, i) => (
                  <div key={i} style={{ fontFamily: CORMORANT, fontSize: 12, color: white, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: platinum, fontSize: 7 }}>○</span>{l}
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "awards") && data.awards.length > 0 && (
              <div style={{ ...Glass, padding: "18px 20px", marginBottom: 16 }}>
                <RivieraHeader label="Awards" />
                {data.awards.map(aw => (
                  <div key={aw.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: CORMORANT, fontSize: 12.5, fontWeight: 600, color: white }}>{aw.title}</div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: platinum }}>{aw.subtitle}{aw.date ? `  ·  ${aw.date}` : ""}</div>
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "interests") && data.interests.length > 0 && (
              <div style={{ ...Glass, padding: "18px 20px", marginBottom: 16 }}>
                <RivieraHeader label="Interests" />
                <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }}>{data.interests.join("   ·   ")}</div>
              </div>
            )}

            {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
              <div key={cs.id} style={{ ...Glass, padding: "18px 20px", marginBottom: 16 }}>
                <RivieraHeader label={cs.title} />
                {cs.items.map(item => (
                  <div key={item.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: CORMORANT, fontSize: 12.5, fontWeight: 600, color: white }}>{item.title}</div>
                    {item.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: platinum }}>{item.subtitle}</div>}
                    {item.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, marginTop: 2 }}>{item.description}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 48px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: DM_SANS, fontSize: 8, color: "rgba(229,228,226,0.6)", letterSpacing: 3 }}>EST. MMXXV</span>
        <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: platinum }}>— Riviera —</span>
        <span style={{ fontFamily: DM_SANS, fontSize: 8, color: "rgba(229,228,226,0.6)", letterSpacing: 3 }}>{data.name.toUpperCase()}</span>
      </div>
    </div>
  );
}

// --- Noir palette & helpers (module-level) ---
const NOIR_BLACK = "#000000";
const NOIR_WHITE = "#ffffff";
const NOIR_EMERALD = "#10b981";
const NOIR_MUTED = "rgba(255,255,255,0.55)";

const NoirThinLine = () => <div style={{ height: 0.5, background: `linear-gradient(90deg, transparent, ${NOIR_EMERALD}, transparent)`, margin: "16px 0" }} />;

const NoirLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 4 }}>
    <span style={{ fontFamily: PLAYFAIR, fontSize: 11, color: NOIR_EMERALD, letterSpacing: 5, fontWeight: 600, textTransform: "uppercase" }}>{children}</span>
    <div style={{ flex: 1, height: 0.5, background: NOIR_EMERALD, opacity: 0.4 }} />
  </div>
);

// =====================================================================
// 5. NOIR — Pure black (#000) + white + single emerald (#10b981) accent.
//    Ultra-minimalist. Oversized typography (name 44-48px), thin 0.5px
//    lines, vast whitespace, elegant quote highlight. Font: Playfair Display.
// =====================================================================
export function NoirTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const black = NOIR_BLACK;
  const white = NOIR_WHITE;
  const emerald = NOIR_EMERALD;
  const muted = NOIR_MUTED;

  return (
    <div className={PAPER} style={{ fontFamily: PLAYFAIR, background: black, color: white, padding: "56px 64px 56px", position: "relative" }}>
      {/* Subtle emerald corner accent */}
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: "absolute", top: 28, right: 28, pointerEvents: "none" }}>
        <line x1="0" y1="80" x2="80" y2="0" stroke={emerald} strokeWidth="0.5" opacity="0.5" />
        <circle cx="40" cy="40" r="3" fill={emerald} />
      </svg>

      {/* Hero name — vast whitespace, oversized */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 12, color: emerald, letterSpacing: 8, marginBottom: 18, textTransform: "uppercase" }}>— Curriculum Vitae —</div>
        <h1 style={{ fontFamily: PLAYFAIR, fontSize: 48, fontWeight: 700, color: white, margin: 0, lineHeight: 1, letterSpacing: -1 }}>{data.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
          <div style={{ width: 40, height: 0.5, background: emerald }} />
          <p style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 18, color: emerald, margin: 0, letterSpacing: 1 }}>{data.title}</p>
        </div>
      </div>

      {/* Contact as elegant minimal caption */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 28px", fontFamily: PLAYFAIR, fontSize: 10.5, color: muted, fontStyle: "italic", marginBottom: 24, paddingBottom: 24, borderBottom: `0.5px solid ${white}20` }}>
        {[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map((c, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: emerald, fontSize: 7 }}>·</span>{c}
          </span>
        ))}
      </div>

      {/* Quote-style summary */}
      {visible(sections, "summary") && data.summary && (
        <div style={{ marginBottom: 36, maxWidth: 620 }}>
          <NoirLabel>Manifesto</NoirLabel>
          <p style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.88)", margin: 0 }}>{data.summary}</p>
        </div>
      )}

      {/* Experience — minimalist editorial timeline */}
      {visible(sections, "experience") && data.experience.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <NoirLabel>Experience</NoirLabel>
          <div>
            {data.experience.map((e, i) => (
              <div key={e.id} style={{ marginBottom: 22, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: PLAYFAIR, fontSize: 22, fontWeight: 700, color: white, lineHeight: 1.15 }}>{e.role}</div>
                    <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 13, color: emerald, marginTop: 4 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                  </div>
                  <div style={{ fontFamily: PLAYFAIR, fontSize: 11, color: muted, fontStyle: "italic", whiteSpace: "nowrap", letterSpacing: 1 }}>{range(e.start, e.end)}</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  {e.bullets.filter(b => b?.trim()).map((b, j) => (
                    <div key={j} style={{ fontFamily: PLAYFAIR, fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", marginBottom: 2, paddingLeft: 16, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: emerald, fontSize: 9, top: 6 }}>—</span>{b}
                    </div>
                  ))}
                </div>
                {i < data.experience.length - 1 && <NoirThinLine />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lower two-column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 36 }}>
        <div>
          {visible(sections, "skills") && data.skills.length > 0 && (
            <div>
              <NoirLabel>Skills</NoirLabel>
              {data.skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, fontFamily: PLAYFAIR, fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}>
                  <span style={{ color: emerald, fontSize: 8 }}>·</span>{s}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {visible(sections, "education") && data.education.length > 0 && (
            <div>
              <NoirLabel>Education</NoirLabel>
              {data.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ fontFamily: PLAYFAIR, fontSize: 14, fontWeight: 700, color: white }}>{ed.degree}</div>
                  <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 12, color: emerald, marginTop: 2 }}>{ed.school}</div>
                  <div style={{ fontFamily: PLAYFAIR, fontSize: 10.5, color: muted, fontStyle: "italic", marginTop: 2 }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      {visible(sections, "projects") && data.projects.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <NoirLabel>Selected Works</NoirLabel>
          {data.projects.map((p, i) => (
            <div key={p.id} style={{ marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
              <div style={{ fontFamily: PLAYFAIR, fontSize: 15, fontWeight: 700, color: white }}>{p.name}{p.link ? <span style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 10.5, color: emerald, fontWeight: 400, marginLeft: 10 }}>· {p.link}</span> : null}</div>
              {p.description && <div style={{ fontFamily: PLAYFAIR, fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginTop: 3 }}>{p.description}</div>}
              {p.tech.length > 0 && <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 10, color: muted, marginTop: 4 }}>{p.tech.join("   ·   ")}</div>}
              {i < data.projects.length - 1 && <div style={{ height: 0.5, background: `${white}15`, marginTop: 14 }} />}
            </div>
          ))}
        </div>
      )}

      {/* Bottom strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, paddingTop: 24, borderTop: `0.5px solid ${white}20` }}>
        {visible(sections, "languages") && data.languages.length > 0 && (
          <div>
            <NoirLabel>Languages</NoirLabel>
            <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>{data.languages.join("   ·   ")}</div>
          </div>
        )}
        {visible(sections, "certifications") && data.certifications.length > 0 && (
          <div>
            <NoirLabel>Certifications</NoirLabel>
            {data.certifications.map(c => (
              <div key={c.id} style={{ fontFamily: PLAYFAIR, fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>
                <span style={{ color: emerald, marginRight: 6, fontSize: 8 }}>·</span>{c.title}
              </div>
            ))}
          </div>
        )}
        {visible(sections, "awards") && data.awards.length > 0 && (
          <div>
            <NoirLabel>Distinctions</NoirLabel>
            {data.awards.map(aw => (
              <div key={aw.id} style={{ fontFamily: PLAYFAIR, fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>
                <span style={{ color: emerald, marginRight: 6, fontSize: 8 }}>·</span>{aw.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {visible(sections, "interests") && data.interests.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <NoirLabel>Interests</NoirLabel>
          <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{data.interests.join("   ·   ")}</div>
        </div>
      )}

      {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
        <div key={cs.id} style={{ marginTop: 24 }}>
          <NoirLabel>{cs.title}</NoirLabel>
          {cs.items.map(item => (
            <div key={item.id} style={{ marginBottom: 8, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
              <div style={{ fontFamily: PLAYFAIR, fontSize: 13, fontWeight: 700, color: white }}>{item.title}{item.date ? <span style={{ color: muted, fontStyle: "italic", fontWeight: 400, marginLeft: 8 }}>{item.date}</span> : null}</div>
              {item.subtitle && <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 11.5, color: emerald, marginTop: 1 }}>{item.subtitle}</div>}
              {item.description && <div style={{ fontFamily: PLAYFAIR, fontSize: 11.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, marginTop: 2 }}>{item.description}</div>}
            </div>
          ))}
        </div>
      ))}

      {/* Footer */}
      <div style={{ marginTop: 36, paddingTop: 18, borderTop: `0.5px solid ${emerald}30`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 10, color: muted, letterSpacing: 2 }}>— Fin —</span>
        <span style={{ fontFamily: PLAYFAIR, fontSize: 9, color: emerald, letterSpacing: 6, textTransform: "uppercase" }}>Noir</span>
      </div>
    </div>
  );
}

// --- Heritage palette & helpers (module-level) ---
const HERITAGE_BURGUNDY = "#4a0e0e";
const HERITAGE_GOLD = "#c5a572";
const HERITAGE_CREAM = "#f5f0e8";
const HERITAGE_INK = "#2b1a1a";
const HERITAGE_MUTED = "#7a6a5a";

// Gold rule with center diamond ornament
const HeritageGoldRule = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${HERITAGE_GOLD})` }} />
    <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 0 L12 6 L6 12 L0 6 Z" fill={HERITAGE_GOLD} /></svg>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${HERITAGE_GOLD}, transparent)` }} />
  </div>
);

const HeritageSectionTitle = ({ label }: { label: string }) => (
  <div style={{ textAlign: "center", marginBottom: 16, marginTop: 8 }}>
    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: HERITAGE_GOLD, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>— Anno —</div>
    <h2 style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 600, color: HERITAGE_BURGUNDY, margin: 0, letterSpacing: 4, textTransform: "uppercase" }}>{label}</h2>
  </div>
);

// Gold ribbon badge
const HeritageRibbon = ({ title, sub }: { title: string; sub?: string }) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "stretch", marginBottom: 10, boxShadow: "0 4px 8px rgba(74,14,14,0.15)" }}>
    <div style={{ width: 10, background: HERITAGE_BURGUNDY, clipPath: "polygon(0 0, 100% 0, 100% 50%, 50% 100%, 0 50%)" }} />
    <div style={{ background: `linear-gradient(180deg, ${HERITAGE_GOLD}, #b8954f)`, color: HERITAGE_BURGUNDY, padding: "6px 16px", fontFamily: CORMORANT, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
      {title}{sub ? <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontWeight: 400, marginLeft: 8, opacity: 0.85, fontSize: 11 }}>{sub}</span> : null}
    </div>
    <div style={{ width: 10, background: HERITAGE_BURGUNDY, clipPath: "polygon(0 0, 100% 0, 100% 50%, 50% 100%, 0 50%)", transform: "scaleX(-1)" }} />
  </div>
);

// =====================================================================
// 6. HERITAGE — Deep burgundy (#4a0e0e) + gold (#c5a572) + cream (#f5f0e8).
//    Layered paper effects (multiple subtle shadows), italic serif quote
//    highlights, gold ribbon badges for achievements, gold horizontal rules
//    with center diamond ornament. Font: Cormorant Garamond + DM Sans.
// =====================================================================
export function HeritageTemplate({ data, sections, accent: _accent }: { data: ResumeData; sections: Record<string, boolean>; accent: string }) {
  const burgundy = HERITAGE_BURGUNDY;
  const gold = HERITAGE_GOLD;
  const cream = HERITAGE_CREAM;
  const ink = HERITAGE_INK;
  const muted = HERITAGE_MUTED;

  // Layered paper effect — multiple soft shadows on cream card
  const Paper: React.CSSProperties = {
    background: "#fdfaf3",
    borderRadius: 4,
    boxShadow: "0 1px 0 rgba(74,14,14,0.06), 0 2px 4px rgba(74,14,14,0.06), 0 8px 18px rgba(74,14,14,0.08), inset 0 0 0 0.5px rgba(197,165,114,0.4)",
    border: `0.5px solid ${gold}60`,
  };

  return (
    <div className={PAPER} style={{ fontFamily: CORMORANT, background: cream, color: ink, position: "relative", overflow: "hidden" }}>
      {/* Subtle burgundy texture corners */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: burgundy }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: burgundy }} />

      {/* Centered editorial header */}
      <div style={{ padding: "44px 48px 28px", textAlign: "center", borderBottom: `1px solid ${gold}60` }}>
        <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: gold, letterSpacing: 6, marginBottom: 14, textTransform: "uppercase" }}>The Heritage Collection</div>
        <h1 style={{ fontFamily: CORMORANT, fontSize: 46, fontWeight: 600, color: burgundy, margin: 0, lineHeight: 1.05, letterSpacing: 1 }}>{data.name}</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 12 }}>
          <div style={{ width: 30, height: 1, background: gold }} />
          <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 17, color: gold, margin: 0 }}>{data.title}</p>
          <div style={{ width: 30, height: 1, background: gold }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", justifyContent: "center", marginTop: 18, fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: muted }}>
          {[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: gold, fontSize: 7 }}>◆</span>{c}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 44px 36px" }}>
        {/* Italic serif quote summary */}
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 24, textAlign: "center", maxWidth: 580, margin: "0 auto 32px" }}>
            <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 16, lineHeight: 1.75, color: ink }}>
              <span style={{ color: gold, fontSize: 28, lineHeight: 0, position: "relative", top: 8 }}>"</span>
              {data.summary}
              <span style={{ color: gold, fontSize: 28, lineHeight: 0, position: "relative", top: 8 }}>"</span>
            </div>
            <HeritageGoldRule />
          </div>
        )}

        {/* Experience — two-up elegant */}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <HeritageSectionTitle label="Experience" />
            {data.experience.map(e => (
              <div key={e.id} style={{ ...Paper, padding: "18px 22px", marginBottom: 14, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontFamily: CORMORANT, fontSize: 18, fontWeight: 700, color: burgundy }}>{e.role}</span>
                  <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: gold }}>{range(e.start, e.end)}</span>
                </div>
                <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 13, color: muted, marginBottom: 8 }}>{e.company}{e.location ? `  ·  ${e.location}` : ""}</div>
                <div style={{ height: 0.5, background: `${gold}60`, marginBottom: 8 }} />
                {e.bullets.filter(b => b?.trim()).map((b, i) => (
                  <div key={i} style={{ fontFamily: CORMORANT, fontSize: 11.5, lineHeight: 1.65, color: ink, marginBottom: 2, paddingLeft: 18, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: gold, fontSize: 9, top: 5 }}>◆</span>{b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <HeritageGoldRule />

        {/* Two-column lower */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
          <div>
            {visible(sections, "education") && data.education.length > 0 && (
              <div style={{ ...Paper, padding: "18px 20px", marginBottom: 14 }}>
                <h3 style={{ fontFamily: CORMORANT, fontSize: 16, fontWeight: 700, color: burgundy, margin: "0 0 10px", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Education</h3>
                <div style={{ height: 0.5, background: `${gold}60`, marginBottom: 10 }} />
                {data.education.map(ed => (
                  <div key={ed.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: CORMORANT, fontSize: 13, fontWeight: 700, color: ink }}>{ed.degree}</div>
                    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: burgundy }}>{ed.school}</div>
                    <div style={{ fontFamily: CORMORANT, fontSize: 11, color: gold }}>{range(ed.start, ed.end)}{ed.grade ? `  ·  ${ed.grade}` : ""}</div>
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "skills") && data.skills.length > 0 && (
              <div style={{ ...Paper, padding: "18px 20px" }}>
                <h3 style={{ fontFamily: CORMORANT, fontSize: 16, fontWeight: 700, color: burgundy, margin: "0 0 10px", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Expertise</h3>
                <div style={{ height: 0.5, background: `${gold}60`, marginBottom: 10 }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
                  {data.skills.map((s, i) => (
                    <span key={i} style={{ fontFamily: CORMORANT, fontSize: 12, color: ink, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: gold, fontSize: 7 }}>◆</span>{s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {visible(sections, "projects") && data.projects.length > 0 && (
              <div style={{ ...Paper, padding: "18px 20px", marginBottom: 14 }}>
                <h3 style={{ fontFamily: CORMORANT, fontSize: 16, fontWeight: 700, color: burgundy, margin: "0 0 10px", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Notable Works</h3>
                <div style={{ height: 0.5, background: `${gold}60`, marginBottom: 10 }} />
                {data.projects.map(p => (
                  <div key={p.id} style={{ marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <div style={{ fontFamily: CORMORANT, fontSize: 13, fontWeight: 700, color: ink }}>{p.name}{p.link ? <span style={{ fontFamily: CORMORANT, fontStyle: "italic", fontWeight: 400, color: gold, marginLeft: 6 }}>· {p.link}</span> : null}</div>
                    {p.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: ink, lineHeight: 1.55, marginTop: 2 }}>{p.description}</div>}
                    {p.tech.length > 0 && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 10, color: gold, marginTop: 3 }}>{p.tech.join("   ·   ")}</div>}
                  </div>
                ))}
              </div>
            )}

            {visible(sections, "languages") && data.languages.length > 0 && (
              <div style={{ ...Paper, padding: "16px 20px", marginBottom: 14 }}>
                <h3 style={{ fontFamily: CORMORANT, fontSize: 16, fontWeight: 700, color: burgundy, margin: "0 0 8px", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Languages</h3>
                <div style={{ height: 0.5, background: `${gold}60`, marginBottom: 8 }} />
                <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: ink, textAlign: "center", lineHeight: 1.7 }}>{data.languages.join("   ·   ")}</div>
              </div>
            )}

            {visible(sections, "certifications") && data.certifications.length > 0 && (
              <div style={{ ...Paper, padding: "16px 20px" }}>
                <h3 style={{ fontFamily: CORMORANT, fontSize: 16, fontWeight: 700, color: burgundy, margin: "0 0 8px", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Certifications</h3>
                <div style={{ height: 0.5, background: `${gold}60`, marginBottom: 8 }} />
                {data.certifications.map(c => (
                  <div key={c.id} style={{ marginBottom: 5, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                    <span style={{ fontFamily: CORMORANT, fontSize: 11.5, color: ink }}>
                      <span style={{ color: gold, marginRight: 6, fontSize: 7 }}>◆</span>{c.title}
                      {c.date ? <span style={{ color: muted, fontStyle: "italic", marginLeft: 6 }}>{c.date}</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Awards with gold ribbon badges */}
        {visible(sections, "awards") && data.awards.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <HeritageSectionTitle label="Distinctions" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {data.awards.map(aw => (
                <div key={aw.id} style={{ marginBottom: 12, maxWidth: 560, width: "100%", breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <HeritageRibbon title={aw.title} sub={aw.date} />
                  </div>
                  {aw.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: burgundy, marginTop: 2 }}>{aw.subtitle}</div>}
                  {aw.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: ink, lineHeight: 1.55, marginTop: 2, maxWidth: 480, margin: "2px auto 0" }}>{aw.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {visible(sections, "interests") && data.interests.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: CORMORANT, fontSize: 14, fontWeight: 700, color: burgundy, margin: "0 0 6px", letterSpacing: 3, textTransform: "uppercase" }}>Interests</h3>
            <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: muted }}>{data.interests.join("   ·   ")}</div>
          </div>
        )}

        {data.customSections.filter(cs => cs.items.length > 0).map(cs => (
          <div key={cs.id} style={{ marginBottom: 28 }}>
            <HeritageSectionTitle label={cs.title} />
            {cs.items.map(item => (
              <div key={item.id} style={{ ...Paper, padding: "14px 20px", marginBottom: 10, breakInside: "avoid" as React.CSSProperties["breakInside"] }}>
                <div style={{ fontFamily: CORMORANT, fontSize: 13, fontWeight: 700, color: burgundy, textAlign: "center" }}>{item.title}{item.date ? <span style={{ color: gold, fontStyle: "italic", fontWeight: 400, marginLeft: 8 }}>{item.date}</span> : null}</div>
                {item.subtitle && <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 12, color: muted, textAlign: "center", marginTop: 2 }}>{item.subtitle}</div>}
                {item.description && <div style={{ fontFamily: CORMORANT, fontSize: 11, color: ink, lineHeight: 1.55, marginTop: 4 }}>{item.description}</div>}
              </div>
            ))}
          </div>
        ))}

        <HeritageGoldRule />

        {/* Colophon */}
        <div style={{ textAlign: "center", paddingTop: 6 }}>
          <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 11, color: muted }}>— Finis —</div>
          <div style={{ fontFamily: CORMORANT, fontSize: 9, color: gold, letterSpacing: 4, textTransform: "uppercase", marginTop: 6 }}>Heritage · MMXXV · {data.name}</div>
        </div>
      </div>
    </div>
  );
}
