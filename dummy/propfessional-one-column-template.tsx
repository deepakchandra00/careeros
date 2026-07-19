import type { ReactNode } from "react";
import type { Resume } from "@/engine/document/types";
import { oneColLayout as L } from "./layout";

/**
 * Professional One Column template.
 *
 * Single flow-based column with a 3-column header (name+summary | photo | contact).
 * Sections grow naturally. Only the profile image uses controlled positioning
 * (via CSS Grid alignment — no absolute positioning). Print pagination via
 * `break-inside: avoid` on each entry.
 */
export function ProfessionalOneColumnTemplate({ resume }: { resume: Resume }) {
  const initial = resume.header.name.trim().charAt(0).toUpperCase();
  const c = resume.header.contact;

  return (
    <article
      className="resume-doc onecol-doc"
      style={{
        width: L.pageWidth,
        minHeight: L.pageHeight,
        background: "white",
        color: L.colors.text,
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
          display: "grid",
          gridTemplateColumns: "55% 15% 30%",
          alignItems: "center",
          minHeight: L.headerHeight,
          borderBottom: `1px solid ${L.colors.border}`,
          paddingBottom: L.headerBottomGap,
          marginBottom: L.headerBottomGap,
          gap: 16,
        }}
      >
        {/* Left */}
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: L.nameFontSize,
              fontWeight: 700,
              color: L.colors.primary,
              letterSpacing: -0.4,
              lineHeight: 1.15,
            }}
          >
            {resume.header.name}
          </h1>
          {resume.header.title && (
            <div
              style={{
                marginTop: 6,
                fontSize: L.jobTitleFontSize,
                fontWeight: 500,
                color: L.colors.accent,
              }}
            >
              {resume.header.title}
            </div>
          )}
          {resume.summary && (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: L.bodySize,
                lineHeight: 1.55,
                color: L.colors.text,
                width: "95%",
                display: "-webkit-box",
                WebkitLineClamp: 7,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {resume.summary}
            </p>
          )}
        </div>

        {/* Center — avatar circle */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            aria-hidden
            style={{
              width: L.photoSize,
              height: L.photoSize,
              borderRadius: "50%",
              border: `1px solid ${L.colors.border}`,
              background: L.colors.chipBg,
              color: L.colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {initial}
          </div>
        </div>

        {/* Right — contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: L.contactRowGap }}>
          {c?.email && <ContactRow icon={<MailIcon />} text={c.email} />}
          {c?.phone && <ContactRow icon={<PhoneIcon />} text={c.phone} />}
          {c?.location && <ContactRow icon={<PinIcon />} text={c.location} />}
          {c?.linkedin && <ContactRow icon={<LinkIcon />} text={c.linkedin} />}
          {c?.github && <ContactRow icon={<CodeIcon />} text={c.github} />}
        </div>
      </header>

      {/* Body ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: L.sectionGap }}>
        {resume.experience?.length ? (
          <Section title="Work Experience">
            <div style={{ display: "flex", flexDirection: "column", gap: L.projectGap }}>
              {resume.experience.map((job, i) => (
                <div key={i} style={{ breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: L.colors.primary, lineHeight: 1.25 }}>
                        {job.position}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: L.colors.muted, marginTop: 2 }}>
                        {job.company}
                        {job.location ? ` · ${job.location}` : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: L.smallSize, color: L.colors.muted, whiteSpace: "nowrap" }}>
                      {job.startDate} — {job.endDate ?? "Present"}
                    </div>
                  </div>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: L.bodySize, lineHeight: 1.5 }}>
                    {job.bullets.map((b, j) => (
                      <li key={j} style={{ marginBottom: L.bulletGap }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {resume.projects?.length ? (
          <Section title="Projects">
            <div style={{ display: "flex", flexDirection: "column", gap: L.projectGap }}>
              {resume.projects.map((p, i) => (
                <div key={i} style={{ breakInside: "avoid" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: L.colors.primary }}>{p.name}</div>
                  <div style={{ fontStyle: "italic", color: L.colors.muted, fontSize: L.bodySize, marginTop: 4 }}>
                    {p.description}
                  </div>
                  {p.tech?.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {p.tech.map((t) => (
                        <Chip key={t}>{t}</Chip>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {resume.education?.length ? (
          <Section title="Education">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {resume.education.map((e, i) => (
                <div key={i} style={{ breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: L.colors.primary }}>{e.degree}</div>
                      <div style={{ fontSize: L.bodySize, color: L.colors.muted, marginTop: 2 }}>
                        {e.school}
                        {e.location ? ` · ${e.location}` : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: L.smallSize, color: L.colors.muted, whiteSpace: "nowrap" }}>
                      {[e.startDate, e.endDate].filter(Boolean).join(" — ")}
                    </div>
                  </div>
                  {e.details && (
                    <div style={{ fontSize: L.bodySize, color: L.colors.text, marginTop: 4 }}>{e.details}</div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {resume.skills?.length ? (
          <Section title="Skills">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {resume.skills.map((g) => (
                <div key={g.category}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: L.colors.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>
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
          </Section>
        ) : null}

        {resume.certifications?.length ? (
          <Section title="Certifications">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {resume.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: L.bodySize, breakInside: "avoid" }}>
                  <span style={{ fontWeight: 700, color: L.colors.primary }}>{c.name}</span>
                  {c.issuer && <span style={{ color: L.colors.muted }}> · {c.issuer}</span>}
                  {c.date && <span style={{ color: L.colors.muted, fontSize: L.smallSize }}> · {c.date}</span>}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {resume.languages?.length ? (
          <Section title="Languages">
            <div>{resume.languages.map((l) => `${l.name} (${l.level})`).join(", ")}</div>
          </Section>
        ) : null}

        {resume.interests?.length ? (
          <Section title="Interests">
            <div>{resume.interests.join(", ")}</div>
          </Section>
        ) : null}
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ breakInside: "auto" }}>
      <h2
        style={{
          margin: 0,
          fontSize: L.sectionHeadingSize,
          fontWeight: 700,
          color: L.colors.primary,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          borderBottom: `1px solid ${L.colors.border}`,
          paddingBottom: 8,
          marginBottom: L.titleGap,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function ContactRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: L.colors.text }}>
      <span style={{ color: L.colors.accent, display: "inline-flex" }}>{icon}</span>
      <span style={{ wordBreak: "break-word" }}>{text}</span>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "8px 12px",
        borderRadius: 6,
        background: L.colors.chipBg,
        color: L.colors.text,
        fontSize: 13,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

const iconProps = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10 14a5 5 0 007 0l3-3a5 5 0 10-7-7l-1 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 107 7l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 6l-4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
