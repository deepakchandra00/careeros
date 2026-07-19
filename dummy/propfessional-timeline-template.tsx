import type { CSSProperties, ReactNode } from "react";
import type { Resume } from "@/engine/document/types";
import { timelineLayout as L } from "./layout";

/**
 * Professional Timeline template.
 *
 * Flow-based layout (no absolute positioning per block). The single vertical
 * timeline line is the ONLY absolutely-positioned element — content grows
 * naturally so nothing overlaps and browser/print pagination behave the same.
 * Print pagination is handled by CSS `break-inside: avoid` on section rows.
 */
export function ProfessionalTimelineTemplate({ resume }: { resume: Resume }) {
  const initial = resume.header.name.trim().charAt(0).toUpperCase();

  return (
    <article
      className="resume-doc timeline-doc"
      style={{
        width: L.pageWidth,
        minHeight: L.pageHeight,
        background: "white",
        color: L.colors.primaryText,
        fontFamily: L.fontFamily,
        fontSize: L.bodySize,
        lineHeight: L.lineHeight,
        paddingTop: L.paddingTop,
        paddingBottom: L.paddingBottom,
        paddingLeft: L.paddingLeft,
        paddingRight: L.paddingRight,
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* Header ─────────────────────────────────────────────────── */}
      <header
        style={{
          height: L.headerHeight,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "center",
          borderBottom: `1px solid ${L.colors.divider}`,
          paddingBottom: L.headerBottomMargin,
          marginBottom: L.sectionGap + 6,
        }}
      >
        <div
          aria-hidden
          style={{
            width: L.avatarSize,
            height: L.avatarSize,
            borderRadius: L.avatarRadius,
            background: L.colors.accent,
            color: "white",
            fontSize: L.avatarFontSize,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            lineHeight: 1,
          }}
        >
          {initial}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: L.nameFontSize,
            fontWeight: 700,
            color: L.colors.nameText,
            letterSpacing: -0.5,
            lineHeight: 1.1,
          }}
        >
          {resume.header.name}
        </h1>
        {resume.header.contact?.email && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              fontSize: L.emailFontSize,
              fontWeight: 500,
              color: L.colors.emailText,
            }}
          >
            <MailIcon size={14} />
            <span>{resume.header.contact.email}</span>
          </div>
        )}
      </header>

      {/* Body ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: `${L.timelineWidth}px 1fr`,
          columnGap: L.timelineGap,
          alignItems: "start",
        }}
      >
        {/* The ONLY absolutely-positioned element */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: L.timelineWidth - L.timelineDot / 2,
            width: L.timelineLine,
            background: L.colors.timelineLine,
          }}
        />

        {resume.summary && (
          <TimelineRow label="Profile">
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: L.colors.profileText }}>
              {resume.summary}
            </p>
          </TimelineRow>
        )}

        {resume.experience?.length ? (
          <TimelineRow label="Work Experience">
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {resume.experience.map((job, i) => (
                <div key={i} style={{ breakInside: "avoid" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#222222", lineHeight: 1.25 }}>
                    {job.position}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: L.colors.secondaryText, marginTop: 2 }}>
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </div>
                  <div style={{ fontSize: 13, color: L.colors.secondaryText, marginTop: 2 }}>
                    {job.startDate} — {job.endDate ?? "Present"}
                  </div>
                  <ul
                    style={{
                      margin: "8px 0 0",
                      paddingLeft: 18,
                      fontSize: 14,
                      lineHeight: 1.55,
                    }}
                  >
                    {job.bullets.map((b, j) => (
                      <li key={j} style={{ marginBottom: L.bulletGap }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TimelineRow>
        ) : null}

        {resume.education?.length ? (
          <TimelineRow label="Education">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {resume.education.map((e, i) => (
                <div key={i} style={{ breakInside: "avoid" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#222222" }}>{e.degree}</div>
                  <div style={{ fontSize: 15, color: L.colors.secondaryText, marginTop: 2 }}>
                    {e.school}
                    {e.location ? ` · ${e.location}` : ""}
                  </div>
                  <div style={{ fontSize: 13, color: L.colors.secondaryText, marginTop: 2 }}>
                    {[e.startDate, e.endDate].filter(Boolean).join(" — ")}
                  </div>
                  {e.details && (
                    <div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>{e.details}</div>
                  )}
                </div>
              ))}
            </div>
          </TimelineRow>
        ) : null}

        {resume.projects?.length ? (
          <TimelineRow label="Projects">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {resume.projects.map((p, i) => (
                <div key={i} style={{ breakInside: "avoid" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#222222" }}>{p.name}</div>
                  {p.tech?.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      {p.tech.map((t) => (
                        <Chip key={t}>{t}</Chip>
                      ))}
                    </div>
                  ) : null}
                  <div style={{ fontSize: 14, color: "#444", marginTop: 6, lineHeight: 1.55 }}>
                    {p.description}
                  </div>
                </div>
              ))}
            </div>
          </TimelineRow>
        ) : null}

        {resume.skills?.length ? (
          <TimelineRow label="Skills">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {resume.skills.map((g) => (
                <div key={g.category}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: L.colors.secondaryText, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>
                    {g.category}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {g.items.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TimelineRow>
        ) : null}

        {resume.certifications?.length ? (
          <TimelineRow label="Certifications">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {resume.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 14, breakInside: "avoid" }}>
                  <span style={{ fontWeight: 700, color: "#222222" }}>{c.name}</span>
                  {c.issuer && <span style={{ color: L.colors.secondaryText }}> · {c.issuer}</span>}
                  {c.date && <span style={{ fontSize: 13, color: L.colors.secondaryText }}> · {c.date}</span>}
                </div>
              ))}
            </div>
          </TimelineRow>
        ) : null}

        {resume.languages?.length ? (
          <TimelineRow label="Languages">
            <div style={{ fontSize: 14 }}>
              {resume.languages.map((l) => l.name).join(", ")}
            </div>
          </TimelineRow>
        ) : null}

        {resume.interests?.length ? (
          <TimelineRow label="Interests">
            <div style={{ fontSize: 14 }}>{resume.interests.join(", ")}</div>
          </TimelineRow>
        ) : null}
      </div>
    </article>
  );
}

/**
 * A single row: section label on the left column, dot on the timeline,
 * content on the right. Grid keeps label + content aligned to the same
 * baseline; the dot is placed at the label baseline.
 */
function TimelineRow({ label, children }: { label: string; children: ReactNode }) {
  const rowStyle: CSSProperties = {
    display: "contents",
  };
  return (
    <div style={rowStyle}>
      <div
        style={{
          position: "relative",
          paddingRight: L.timelineDot + 6,
          paddingBottom: L.sectionGap,
          textAlign: "right",
          breakInside: "avoid",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -L.timelineDot / 2,
            top: 4,
            width: L.timelineDot,
            height: L.timelineDot,
            borderRadius: "50%",
            background: L.colors.timelineDot,
            boxShadow: "0 0 0 3px white",
          }}
        />
        <div
          style={{
            fontSize: L.sectionLabelSize,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            color: "#222222",
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
      </div>
      <div style={{ paddingBottom: L.sectionGap, breakInside: "avoid" }}>{children}</div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "8px 12px",
        borderRadius: 999,
        background: L.colors.chipBg,
        color: L.colors.chipText,
        fontSize: 13,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

function MailIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  );
}
