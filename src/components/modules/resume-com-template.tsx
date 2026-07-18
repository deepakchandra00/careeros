"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";

const PAPER = "resume-paper mx-auto w-[794px] max-w-full bg-white text-slate-900 shadow-xl";
const visible = (s: Record<string, boolean>, id: string) => s[id] !== false;

function range(start: string, end: string) {
  const s = (start ?? "").trim(); const e = (end ?? "").trim();
  if (s && e) return `${s} — ${e}`; if (s) return `${s} — Present`; return e || "";
}

/**
 * Resume.com Style Template — Clean two-column with purple sidebar.
 *
 * Left sidebar: Photo, Contact, Skills, Languages, Certifications
 * Right main: Name, Title, Summary, Experience, Projects, Education
 *
 * Purple accent (#6c5ce7), clean sans-serif, generous spacing.
 */
export function ResumeComTemplate({ data, sections, accent: _accent }: {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}) {
  const a = "#6c5ce7";
  const initials = data.name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className={PAPER} style={{ fontFamily: "'Inter', system-ui, sans-serif", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: a, color: "white", padding: "32px 20px", minHeight: 1123 }}>
        {/* Photo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {data.photo ? (
            <img src={data.photo} alt={data.name} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", margin: "0 auto", border: "3px solid rgba(255,255,255,0.3)" }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.15)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, border: "3px solid rgba(255,255,255,0.3)" }}>{initials}</div>
          )}
        </div>

        {/* Contact */}
        {visible(sections, "personal") && (data.email || data.phone || data.location) && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, color: "rgba(255,255,255,0.6)" }}>Contact</h3>
            {data.email && <div style={{ fontSize: 10, marginBottom: 4, color: "rgba(255,255,255,0.9)", wordBreak: "break-word" }}>{data.email}</div>}
            {data.phone && <div style={{ fontSize: 10, marginBottom: 4, color: "rgba(255,255,255,0.9)" }}>{data.phone}</div>}
            {data.location && <div style={{ fontSize: 10, marginBottom: 4, color: "rgba(255,255,255,0.9)" }}>{data.location}</div>}
            {data.linkedin && <div style={{ fontSize: 10, marginBottom: 4, color: "rgba(255,255,255,0.9)", wordBreak: "break-word" }}>{data.linkedin}</div>}
            {data.github && <div style={{ fontSize: 10, marginBottom: 4, color: "rgba(255,255,255,0.9)", wordBreak: "break-word" }}>{data.github}</div>}
            {data.website && <div style={{ fontSize: 10, marginBottom: 4, color: "rgba(255,255,255,0.9)", wordBreak: "break-word" }}>{data.website}</div>}
          </div>
        )}

        {/* Skills */}
        {visible(sections, "skills") && data.skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, color: "rgba(255,255,255,0.6)" }}>Skills</h3>
            {data.skills.map((s, i) => (
              <div key={i} style={{ fontSize: 10, marginBottom: 6, color: "rgba(255,255,255,0.9)" }}>
                <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: 12, fontWeight: 500 }}>{s}</div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {visible(sections, "languages") && data.languages.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, color: "rgba(255,255,255,0.6)" }}>Languages</h3>
            {data.languages.map((l, i) => (
              <div key={i} style={{ fontSize: 10, marginBottom: 4, color: "rgba(255,255,255,0.9)" }}>{l}</div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {visible(sections, "certifications") && data.certifications.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, color: "rgba(255,255,255,0.6)" }}>Certifications</h3>
            {data.certifications.map((c, i) => (
              <div key={c.id} style={{ fontSize: 10, marginBottom: 6, color: "rgba(255,255,255,0.9)" }}>
                <div style={{ fontWeight: 600 }}>{c.title}</div>
                {c.subtitle && <div style={{ fontSize: 9, opacity: 0.7 }}>{c.subtitle}</div>}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "32px 36px" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", margin: 0, letterSpacing: -0.5 }}>{data.name}</h1>
          <p style={{ fontSize: 13, color: a, fontWeight: 600, margin: "4px 0 0" }}>{data.title}</p>
        </div>

        {/* Summary */}
        {visible(sections, "summary") && data.summary && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: a, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, paddingBottom: 4, borderBottom: `2px solid ${a}20` }}>Profile</h3>
            <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#444" }}>{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {visible(sections, "experience") && data.experience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: a, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${a}20` }}>Work Experience</h3>
            {data.experience.map((e) => (
              <div key={e.id} style={{ marginBottom: 14, breakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{e.role}</span>
                  <span style={{ fontSize: 9, color: "#888", fontStyle: "italic" }}>{range(e.start, e.end)}</span>
                </div>
                <div style={{ fontSize: 11, color: a, fontWeight: 600, marginBottom: 4 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                {e.bullets.filter(b => b?.trim()).map((b, i) => (
                  <div key={i} style={{ fontSize: 10, lineHeight: 1.6, color: "#555", paddingLeft: 12, position: "relative", marginBottom: 2 }}>
                    <span style={{ position: "absolute", left: 0, color: a }}>•</span>{b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {visible(sections, "projects") && data.projects.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: a, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${a}20` }}>Projects</h3>
            {data.projects.map((p) => (
              <div key={p.id} style={{ marginBottom: 10, breakInside: "avoid" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e" }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginBottom: 2 }}>{p.description}</div>}
                {p.tech.length > 0 && <div style={{ fontSize: 9, color: a, fontWeight: 500 }}>{p.tech.join(" · ")}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {visible(sections, "education") && data.education.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: a, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${a}20` }}>Education</h3>
            {data.education.map((ed) => (
              <div key={ed.id} style={{ marginBottom: 8, breakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e" }}>{ed.degree}</span>
                  <span style={{ fontSize: 9, color: "#888" }}>{range(ed.start, ed.end)}</span>
                </div>
                <div style={{ fontSize: 10, color: a }}>{ed.school}{ed.location ? ` · ${ed.location}` : ""}</div>
                {ed.grade && <div style={{ fontSize: 9, color: "#888" }}>{ed.grade}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Awards */}
        {visible(sections, "awards") && data.awards.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: a, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${a}20` }}>Achievements</h3>
            {data.awards.map((aw) => (
              <div key={aw.id} style={{ fontSize: 10, marginBottom: 4, color: "#555", breakInside: "avoid" }}>
                <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{aw.title}</span>
                {aw.subtitle && <span> — {aw.subtitle}</span>}
                {aw.date && <span style={{ color: "#888", fontStyle: "italic" }}> ({aw.date})</span>}
              </div>
            ))}
          </div>
        )}

        {/* Custom Sections */}
        {data.customSections.filter(cs => cs.items.length > 0).map((cs) => (
          <div key={cs.id} style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: a, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${a}20` }}>{cs.title}</h3>
            {cs.items.map((item) => (
              <div key={item.id} style={{ fontSize: 10, marginBottom: 4, color: "#555", breakInside: "avoid" }}>
                <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{item.title}</span>
                {item.subtitle && <span> — {item.subtitle}</span>}
                {item.description && <div style={{ fontSize: 9.5, color: "#666", marginTop: 1 }}>{item.description}</div>}
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
