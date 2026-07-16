"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";

/* ============================================================
 * JSON Template Renderer — Canva-style absolute-positioned layout
 *
 * Each template is a JSON document describing positioned elements.
 * The renderer reads the JSON + resume data and renders pixel-accurate layouts.
 *
 * Element types:
 *   - rect: colored rectangle (sidebar bg, header band, decorative bar)
 *   - arc: decorative arc/circle outline
 *   - photo: candidate photo (circle/diamond/square, with optional border)
 *   - text: static or data-bound text ({{name}}, {{title}}, etc.)
 *   - section: a content section (experience, education, etc.) with header + items
 *   - skills: skills list (chips/bars/list)
 *   - contact: contact info with icons
 *   - pattern: decorative pattern (hexagons, dots, stripes)
 * ========================================================== */

const PAPER_W = 794;
const PAPER_H = 1123;

export type ElementType = "rect" | "arc" | "photo" | "text" | "section" | "skills" | "contact" | "pattern" | "timeline";

export interface TemplateElement {
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  // rect
  fill?: string;
  radius?: number;
  // arc
  stroke?: string;
  strokeWidth?: number;
  // photo
  shape?: "circle" | "diamond" | "square";
  border?: string;
  borderWidth?: number;
  // text
  content?: string; // can use {{name}}, {{title}}, {{email}}, etc.
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  fontFamily?: string;
  italic?: boolean;
  // section
  sectionType?: "experience" | "projects" | "education" | "certifications" | "awards" | "languages" | "interests" | "references" | "custom";
  headerText?: string;
  headerStyle?: "bar" | "pill" | "underline" | "plain" | "icon";
  headerColor?: string;
  bulletChar?: string;
  bulletColor?: string;
  maxItems?: number;
  // skills
  skillStyle?: "chips" | "bars" | "list" | "dots";
  // contact
  showIcons?: boolean;
  // pattern
  patternType?: "hexagons" | "dots" | "stripes" | "crosses";
  patternColor?: string;
  patternOpacity?: number;
  // timeline
  timelineColor?: string;
  // visibility
  visibleIf?: string; // section id to check visibility
}

export interface JsonTemplate {
  id: string;
  name: string;
  elements: TemplateElement[];
}

const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

function bindText(content: string, data: ResumeData): string {
  return content
    .replace(/\{\{name\}\}/g, data.name || "")
    .replace(/\{\{title\}\}/g, data.title || "")
    .replace(/\{\{email\}\}/g, data.email || "")
    .replace(/\{\{phone\}\}/g, data.phone || "")
    .replace(/\{\{location\}\}/g, data.location || "")
    .replace(/\{\{linkedin\}\}/g, data.linkedin || "")
    .replace(/\{\{github\}\}/g, data.github || "")
    .replace(/\{\{website\}\}/g, data.website || "")
    .replace(/\{\{summary\}\}/g, data.summary || "");
}

function Avatar({ data, size, shape, border, borderWidth }: { data: ResumeData; size: number; shape?: string; border?: string; borderWidth?: number }) {
  const borderStyle = border ? `${border} ${borderWidth || 3}px solid` : undefined;
  const initials = data.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  if (shape === "diamond") {
    const s: React.CSSProperties = { width: size, height: size, transform: "rotate(45deg)", overflow: "hidden", border: borderStyle };
    if (data.photo) return <div style={s}><img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "rotate(-45deg) scale(1.42)" }} /></div>;
    return <div style={{ ...s, background: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ transform: "rotate(-45deg)", fontSize: size * 0.35, fontWeight: 700, color: "#475569" }}>{initials}</span></div>;
  }
  const br = shape === "square" ? 8 : "50%";
  if (data.photo) return <img src={data.photo} alt={data.name} style={{ width: size, height: size, borderRadius: br, objectFit: "cover", border: borderStyle }} />;
  return <div style={{ width: size, height: size, borderRadius: br, background: "#cbd5e1", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, border: borderStyle }}>{initials}</div>;
}

function renderSection(el: TemplateElement, data: ResumeData): React.ReactNode {
  const font = el.fontFamily || "sans-serif";
  const headerColor = el.headerColor || "#333";
  const bulletColor = el.bulletColor || headerColor;
  const bulletChar = el.bulletChar || "\u2022";
  const maxItems = el.maxItems || 99;

  const renderHeader = () => {
    if (!el.headerText) return null;
    switch (el.headerStyle) {
      case "bar":
        return <div style={{ background: headerColor, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 8, display: "inline-block", textTransform: "uppercase", fontFamily: font }}>{el.headerText}</div>;
      case "pill":
        return <div style={{ background: headerColor, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 12px", marginBottom: 8, display: "inline-block", borderRadius: 10, textTransform: "uppercase", fontFamily: font }}>{el.headerText}</div>;
      case "underline":
        return <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: headerColor, borderBottom: `2px solid ${headerColor}`, paddingBottom: 4, marginBottom: 8, fontFamily: font }}>{el.headerText}</div>;
      default:
        return <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: headerColor, marginBottom: 8, fontFamily: font }}>{el.headerText}</div>;
    }
  };

  switch (el.sectionType) {
    case "experience": {
      const items = data.experience.slice(0, maxItems);
      if (!items.length) return null;
      return (
        <div>
          {renderHeader()}
          {items.map(e => (
            <div key={e.id} style={{ marginBottom: 10, breakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: font }}>
                <span style={{ fontWeight: 700 }}>{e.role}{e.company ? ` · ${e.company}` : ""}</span>
                <span style={{ fontSize: 8, color: "#64748b" }}>{[e.start, e.end].filter(Boolean).join(" – ")}</span>
              </div>
              {e.location && <div style={{ fontSize: 8, color: "#64748b", fontStyle: "italic", fontFamily: font }}>{e.location}</div>}
              {(e.bullets || []).filter(b => b?.trim()).slice(0, 4).map((b, i) => (
                <div key={i} style={{ fontSize: 9, lineHeight: 1.5, paddingLeft: 10, position: "relative", fontFamily: font }}>
                  <span style={{ position: "absolute", left: 0, color: bulletColor }}>{bulletChar}</span>{b}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    case "projects": {
      const items = data.projects.slice(0, maxItems);
      if (!items.length) return null;
      return (
        <div>
          {renderHeader()}
          {items.map(p => (
            <div key={p.id} style={{ marginBottom: 6, fontSize: 9, fontFamily: font, breakInside: "avoid" }}>
              <span style={{ fontWeight: 700 }}>{p.name}</span>
              {p.link && <span style={{ color: "#64748b" }}> — {p.link}</span>}
              {p.description && <div style={{ lineHeight: 1.5 }}>{p.description}</div>}
              {p.tech?.length > 0 && <div style={{ fontSize: 8, color: "#64748b", fontStyle: "italic" }}>Tech: {p.tech.join(", ")}</div>}
            </div>
          ))}
        </div>
      );
    }
    case "education": {
      if (!data.education.length) return null;
      return (
        <div>
          {renderHeader()}
          {data.education.map(ed => (
            <div key={ed.id} style={{ marginBottom: 6, fontSize: 9, fontFamily: font, breakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>{ed.degree}</span>
                <span style={{ fontSize: 8, color: "#64748b" }}>{[ed.start, ed.end].filter(Boolean).join(" – ")}</span>
              </div>
              <div style={{ fontSize: 8, color: "#64748b" }}>{[ed.school, ed.grade].filter(Boolean).join(" | ")}</div>
            </div>
          ))}
        </div>
      );
    }
    case "certifications": {
      if (!data.certifications.length) return null;
      return (
        <div>
          {renderHeader()}
          {data.certifications.map(c => (
            <div key={c.id} style={{ marginBottom: 4, fontSize: 9, fontFamily: font }}>
              <span style={{ fontWeight: 700 }}>{c.title}</span>
              {c.subtitle && <span style={{ color: "#64748b" }}> — {c.subtitle}</span>}
              {c.date && <span style={{ color: "#64748b" }}> ({c.date})</span>}
            </div>
          ))}
        </div>
      );
    }
    case "awards": {
      if (!data.awards.length) return null;
      return (
        <div>
          {renderHeader()}
          {data.awards.map(a => (
            <div key={a.id} style={{ marginBottom: 4, fontSize: 9, fontFamily: font }}>
              <span style={{ fontWeight: 700 }}>{a.title}</span>
              {a.date && <span style={{ color: "#64748b" }}> ({a.date})</span>}
              {a.subtitle && <div style={{ fontSize: 8, color: "#64748b" }}>{a.subtitle}</div>}
            </div>
          ))}
        </div>
      );
    }
    case "languages": {
      if (!data.languages.length) return null;
      return (
        <div>
          {renderHeader()}
          <div style={{ fontSize: 9, fontFamily: font }}>{data.languages.join(", ")}</div>
        </div>
      );
    }
    case "interests": {
      if (!data.interests.length) return null;
      return (
        <div>
          {renderHeader()}
          <div style={{ fontSize: 9, fontFamily: font }}>{data.interests.join(", ")}</div>
        </div>
      );
    }
    case "references": {
      if (!data.references.length) return null;
      return (
        <div>
          {renderHeader()}
          {data.references.map(r => (
            <div key={r.id} style={{ marginBottom: 4, fontSize: 9, fontFamily: font }}>
              <span style={{ fontWeight: 700 }}>{r.name}</span>
              {r.role && <span> {r.role}</span>}
              {r.company && <span> @ {r.company}</span>}
              {r.contact && <div style={{ fontSize: 8, color: "#64748b" }}>{r.contact}</div>}
            </div>
          ))}
        </div>
      );
    }
    case "custom": {
      const sections = data.customSections.filter(cs => cs.items.length > 0);
      if (!sections.length) return null;
      return (
        <>
          {sections.map(cs => (
            <div key={cs.id} style={{ marginBottom: 12 }}>
              {el.headerStyle === "bar" || el.headerStyle === "pill" ? (
                <div style={{ background: headerColor, color: "white", fontSize: 9, fontWeight: 700, padding: "3px 10px", marginBottom: 6, display: "inline-block", borderRadius: el.headerStyle === "pill" ? 10 : 0, textTransform: "uppercase", fontFamily: font }}>{cs.title}</div>
              ) : (
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: headerColor, borderBottom: el.headerStyle === "underline" ? `2px solid ${headerColor}` : "none", marginBottom: 6, fontFamily: font }}>{cs.title}</div>
              )}
              {cs.items.map(item => (
                <div key={item.id} style={{ marginBottom: 4, fontSize: 9, fontFamily: font }}>
                  <span style={{ fontWeight: 700 }}>{item.title}</span>
                  {item.subtitle && <span style={{ color: "#64748b" }}> — {item.subtitle}</span>}
                </div>
              ))}
            </div>
          ))}
        </>
      );
    }
    default:
      return null;
  }
}

function renderSkills(el: TemplateElement, data: ResumeData): React.ReactNode {
  if (!data.skills.length) return null;
  const font = el.fontFamily || "sans-serif";
  const color = el.headerColor || "#333";

  switch (el.skillStyle) {
    case "chips":
      return (
        <div>
          {el.headerText && <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color, marginBottom: 6, fontFamily: font }}>{el.headerText}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {data.skills.map((s, i) => <span key={i} style={{ fontSize: 8, background: `${color}20`, color, padding: "2px 7px", borderRadius: 8, fontFamily: font }}>{s}</span>)}
          </div>
        </div>
      );
    case "bars":
      return (
        <div>
          {el.headerText && <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color, marginBottom: 6, fontFamily: font }}>{el.headerText}</div>}
          {data.skills.map((s, i) => {
            const lvl = data.skillLevels[s] ?? 80;
            return (
              <div key={i} style={{ marginBottom: 5 }}>
                <div style={{ fontSize: 8, marginBottom: 2, fontFamily: font }}>{s}</div>
                <div style={{ height: 3, background: "#e2e8f0", borderRadius: 2 }}><div style={{ width: `${lvl}%`, height: "100%", background: color, borderRadius: 2 }} /></div>
              </div>
            );
          })}
        </div>
      );
    case "dots":
      return (
        <div>
          {el.headerText && <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color, marginBottom: 6, fontFamily: font }}>{el.headerText}</div>}
          {data.skills.map((s, i) => {
            const lvl = data.skillLevels[s] ?? 80; const filled = Math.round(lvl / 20);
            return (
              <div key={i} style={{ display: "flex", gap: 2, marginBottom: 4, alignItems: "center" }}>
                <span style={{ fontSize: 8, width: 50, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: font }}>{s}</span>
                {[1,2,3,4,5].map(d => <div key={d} style={{ width: 4, height: 4, borderRadius: "50%", background: d <= filled ? color : "#e2e8f0" }} />)}
              </div>
            );
          })}
        </div>
      );
    default: // list
      return (
        <div>
          {el.headerText && <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color, marginBottom: 6, fontFamily: font }}>{el.headerText}</div>}
          {data.skills.map((s, i) => <div key={i} style={{ fontSize: 9, marginBottom: 2, fontFamily: font }}>{s}</div>)}
        </div>
      );
  }
}

function renderContact(el: TemplateElement, data: ResumeData): React.ReactNode {
  const entries: { value: string }[] = [];
  if (data.email) entries.push({ value: data.email });
  if (data.phone) entries.push({ value: data.phone });
  if (data.location) entries.push({ value: data.location });
  if (data.linkedin) entries.push({ value: data.linkedin });
  if (data.github) entries.push({ value: data.github });
  if (data.website) entries.push({ value: data.website });
  if (!entries.length) return null;
  const font = el.fontFamily || "sans-serif";
  const color = el.color || "#333";
  return (
    <div>
      {el.headerText && <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color, marginBottom: 6, fontFamily: font }}>{el.headerText}</div>}
      {entries.map((e, i) => <div key={i} style={{ fontSize: 8, color, marginBottom: 3, fontFamily: font }}>{e.value}</div>)}
    </div>
  );
}

function renderPattern(el: TemplateElement): React.ReactNode {
  const color = el.patternColor || "#6d28d9";
  const opacity = el.patternOpacity ?? 0.05;
  switch (el.patternType) {
    case "hexagons":
      return <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='46' viewBox='0 0 40 46'%3E%3Cpath fill='${encodeURIComponent(color)}' d='M20 0L40 11.5v23L20 46 0 34.5v-23z'/%3E%3C/svg%3E")`, pointerEvents: "none" }} />;
    case "dots":
      return <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity, backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: "12px 12px", pointerEvents: "none" }} />;
    case "stripes":
      return <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity, backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 2px, transparent 2px, transparent 8px)`, pointerEvents: "none" }} />;
    default:
      return null;
  }
}

export function JsonTemplateRenderer({
  template,
  data,
  sections,
  accent,
}: {
  template: JsonTemplate;
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  return (
    <div
      className="resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl"
      style={{ position: "relative", width: PAPER_W, minHeight: PAPER_H, fontFamily: "sans-serif" }}
    >
      {template.elements.map((el, idx) => {
        // Check visibility
        if (el.visibleIf && !visible(sections, el.visibleIf)) return null;

        const style: React.CSSProperties = {
          position: "absolute",
          left: el.x,
          top: el.y,
          width: el.w,
          height: el.h,
          overflow: "hidden",
        };

        switch (el.type) {
          case "rect":
            return <div key={idx} style={{ ...style, background: el.fill, borderRadius: el.radius || 0 }} />;

          case "arc":
            return <div key={idx} style={{ ...style, borderRadius: "50%", border: `${el.strokeWidth || 2}px solid ${el.stroke || "#ccc"}`, background: "transparent" }} />;

          case "photo":
            return (
              <div key={idx} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Avatar data={data} size={Math.min(el.w, el.h)} shape={el.shape} border={el.border} borderWidth={el.borderWidth} />
              </div>
            );

          case "text": {
            const text = bindText(el.content || "", data);
            return (
              <div key={idx} style={{
                ...style,
                fontSize: el.fontSize || 10,
                fontWeight: el.fontWeight || 400,
                color: el.color || "#333",
                textAlign: el.align || "left",
                fontFamily: el.fontFamily || "sans-serif",
                fontStyle: el.italic ? "italic" : "normal",
                display: "flex",
                alignItems: "center",
                lineHeight: 1.3,
              }}>
                {text}
              </div>
            );
          }

          case "section":
            return <div key={idx} style={style}>{renderSection(el, data)}</div>;

          case "skills":
            return <div key={idx} style={style}>{renderSkills(el, data)}</div>;

          case "contact":
            return <div key={idx} style={style}>{renderContact(el, data)}</div>;

          case "pattern":
            return <div key={idx} style={style}>{renderPattern(el)}</div>;

          default:
            return null;
        }
      })}
    </div>
  );
}
