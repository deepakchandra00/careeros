"use client";

import * as React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Font,
  Link,
} from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import type { ResumeData, TemplateStyle } from "@/store/resume-store";

const ACCENT = (hex: string) => hex;
const MUTED = "#64748b";
const DARK = "#0f172a";

// ============ MODERN (two-column sidebar) ============
function ModernPdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = ACCENT(style.accent);
  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10 },
    sidebar: {
      width: "34%",
      backgroundColor: accent,
      padding: 28,
      color: "#ffffff",
    },
    main: { width: "66%", padding: 28 },
    sbTitle: { fontSize: 8, fontWeight: "bold", color: "#ffffff", marginBottom: 6, letterSpacing: 1 },
    sbText: { fontSize: 8.5, color: "#ffffff", marginBottom: 3 },
    name: { fontSize: 20, fontWeight: "bold", color: DARK, marginBottom: 2 },
    jobTitle: { fontSize: 11, fontWeight: "bold", color: accent, marginBottom: 12 },
    sectionHead: { fontSize: 8, fontWeight: "bold", color: accent, marginBottom: 5, letterSpacing: 1, textTransform: "uppercase" },
    body: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.4 },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 8, lineHeight: 1.4 },
    expRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    expMeta: { fontSize: 8.5, color: MUTED, fontStyle: "italic", marginBottom: 4 },
    projName: { fontSize: 10, fontWeight: "bold", color: DARK, marginBottom: 2 },
    projTech: { fontSize: 8.5, color: MUTED, fontStyle: "italic" },
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Sidebar */}
        <View style={s.sidebar}>
          <Text style={s.sbTitle}>CONTACT</Text>
          {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((c, i) => (
            <Text key={i} style={s.sbText}>{c}</Text>
          ))}

          {data.skills.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={s.sbTitle}>SKILLS</Text>
              {data.skills.map((sk, i) => (
                <Text key={i} style={s.sbText}>{sk}</Text>
              ))}
            </View>
          )}

          {data.languages.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={s.sbTitle}>LANGUAGES</Text>
              <Text style={s.sbText}>{data.languages.join(", ")}</Text>
            </View>
          )}

          {data.certifications.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={s.sbTitle}>CERTIFICATIONS</Text>
              {data.certifications.map((c) => (
                <View key={c.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 8.5, fontWeight: "bold", color: "#ffffff" }}>{c.title}</Text>
                  {c.subtitle ? <Text style={{ fontSize: 8, color: "#ffffffcc" }}>{c.subtitle}</Text> : null}
                </View>
              ))}
            </View>
          )}

          {data.interests.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={s.sbTitle}>INTERESTS</Text>
              <Text style={s.sbText}>{data.interests.join(", ")}</Text>
            </View>
          )}
        </View>

        {/* Main */}
        <View style={s.main}>
          <Text style={s.name}>{data.name}</Text>
          <Text style={s.jobTitle}>{data.title}</Text>

          {data.summary ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={s.sectionHead}>Summary</Text>
              <Text style={s.body}>{data.summary}</Text>
            </View>
          ) : null}

          {data.experience.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={s.sectionHead}>Experience</Text>
              {data.experience.map((e) => (
                <View key={e.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{e.role}{e.company ? `  ·  ${e.company}` : ""}</Text>
                    <Text style={{ fontSize: 8.5, color: MUTED }}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  {e.location ? <Text style={s.expMeta}>{e.location}</Text> : null}
                  {e.bullets.filter((b) => b.trim()).map((b, i) => (
                    <Text key={i} style={s.bullet}>• {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {data.projects.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={s.sectionHead}>Projects</Text>
              {data.projects.map((p) => (
                <View key={p.id} style={{ marginBottom: 6 }}>
                  <Text style={s.projName}>{p.name}{p.link ? `  —  ${p.link}` : ""}</Text>
                  {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                  {p.tech.length > 0 ? <Text style={s.projTech}>Tech: {p.tech.join(", ")}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.education.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={s.sectionHead}>Education</Text>
              {data.education.map((ed) => (
                <View key={ed.id} style={{ marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{ed.degree}</Text>
                    <Text style={{ fontSize: 8.5, color: MUTED }}>{[ed.start, ed.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  <Text style={s.expMeta}>{[ed.school, ed.location, ed.grade].filter(Boolean).join("  |  ")}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {data.awards.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={s.sectionHead}>Awards</Text>
              {data.awards.map((a) => (
                <View key={a.id} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: "bold", color: DARK }}>{a.title}{a.date ? `  (${a.date})` : ""}</Text>
                  {a.subtitle ? <Text style={{ fontSize: 9, color: MUTED }}>{a.subtitle}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.references.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>References</Text>
              {data.references.map((r) => (
                <View key={r.id} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: "bold", color: DARK }}>{r.name}{r.role ? `, ${r.role}` : ""}{r.company ? ` @ ${r.company}` : ""}</Text>
                  {r.contact ? <Text style={{ fontSize: 9, color: MUTED }}>{r.contact}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ============ ATS (single-column, plain) ============
 function AtsPdf({ data }: { data: ResumeData }) {
  const s = StyleSheet.create({
    page: { padding: 36, fontFamily: "Times-Roman", fontSize: 10 },
    name: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 2 },
    title: { fontSize: 11, textAlign: "center", color: MUTED, marginBottom: 4 },
    contact: { fontSize: 9, textAlign: "center", color: MUTED, marginBottom: 12 },
    sectionHead: { fontSize: 10, fontWeight: "bold", marginBottom: 4, marginTop: 10, textTransform: "uppercase" },
    body: { fontSize: 10, marginBottom: 3 },
    bullet: { fontSize: 10, marginBottom: 2, marginLeft: 12 },
    role: { fontSize: 11, fontWeight: "bold" },
    meta: { fontSize: 9.5, color: MUTED, marginBottom: 3 },
    line: { borderBottomWidth: 0.5, borderBottomColor: "#94a3b8", marginBottom: 4 },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).join("  |  ");
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{data.name}</Text>
        {data.title ? <Text style={s.title}>{data.title}</Text> : null}
        {contact ? <Text style={s.contact}>{contact}</Text> : null}

        {data.summary ? (
          <View>
            <Text style={s.sectionHead}>Summary</Text>
            <View style={s.line} />
            <Text style={s.body}>{data.summary}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Experience</Text>
            <View style={s.line} />
            {data.experience.map((e) => (
              <View key={e.id} style={{ marginBottom: 6 }}>
                <Text style={s.role}>{e.role}</Text>
                <Text style={s.meta}>{[e.company, e.location, [e.start, e.end].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}</Text>
                {e.bullets.filter((b) => b.trim()).map((b, i) => (
                  <Text key={i} style={s.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {data.education.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Education</Text>
            <View style={s.line} />
            {data.education.map((ed) => (
              <View key={ed.id} style={{ marginBottom: 4 }}>
                <Text style={s.role}>{ed.degree}</Text>
                <Text style={s.meta}>{[ed.school, ed.location, [ed.start, ed.end].filter(Boolean).join(" – "), ed.grade].filter(Boolean).join("  |  ")}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.skills.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Skills</Text>
            <View style={s.line} />
            <Text style={s.body}>{data.skills.join(", ")}</Text>
          </View>
        ) : null}

        {data.projects.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Projects</Text>
            <View style={s.line} />
            {data.projects.map((p) => (
              <View key={p.id} style={{ marginBottom: 4 }}>
                <Text style={s.role}>{p.name}{p.link ? ` — ${p.link}` : ""}</Text>
                {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                {p.tech.length > 0 ? <Text style={s.meta}>Tech: {p.tech.join(", ")}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.certifications.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Certifications</Text>
            <View style={s.line} />
            {data.certifications.map((c) => (
              <Text key={c.id} style={s.body}>{c.title}{c.subtitle ? ` — ${c.subtitle}` : ""}{c.date ? ` (${c.date})` : ""}</Text>
            ))}
          </View>
        ) : null}

        {data.awards.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Awards</Text>
            <View style={s.line} />
            {data.awards.map((a) => (
              <Text key={a.id} style={s.body}>{a.title}{a.subtitle ? ` — ${a.subtitle}` : ""}{a.date ? ` (${a.date})` : ""}</Text>
            ))}
          </View>
        ) : null}

        {data.languages.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Languages</Text>
            <View style={s.line} />
            <Text style={s.body}>{data.languages.join(", ")}</Text>
          </View>
        ) : null}

        {data.interests.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Interests</Text>
            <View style={s.line} />
            <Text style={s.body}>{data.interests.join(", ")}</Text>
          </View>
        ) : null}

        {data.references.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>References</Text>
            <View style={s.line} />
            {data.references.map((r) => (
              <View key={r.id}>
                <Text style={s.body}>{r.name}{r.role ? `, ${r.role}` : ""}{r.company ? ` @ ${r.company}` : ""}</Text>
                {r.contact ? <Text style={s.meta}>{r.contact}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

// ============ EXECUTIVE (centered serif, bordered) ============
 function ExecutivePdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = ACCENT(style.accent);
  const s = StyleSheet.create({
    page: { padding: 40, fontFamily: "Times-Roman", fontSize: 10 },
    name: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: DARK, marginBottom: 2 },
    title: { fontSize: 12, fontStyle: "italic", textAlign: "center", color: accent, marginBottom: 4 },
    contact: { fontSize: 9, textAlign: "center", color: MUTED, marginBottom: 6 },
    border: { borderBottomWidth: 2, borderBottomColor: accent, marginBottom: 2 },
    borderThin: { borderBottomWidth: 0.5, borderBottomColor: accent, marginBottom: 12 },
    sectionHead: { fontSize: 10, fontWeight: "bold", textAlign: "center", color: accent, marginTop: 12, marginBottom: 6, textTransform: "uppercase" },
    body: { fontSize: 10, textAlign: "center", marginBottom: 4, lineHeight: 1.4 },
    bullet: { fontSize: 10, marginBottom: 3, marginLeft: 12, lineHeight: 1.4 },
    role: { fontSize: 11, fontWeight: "bold", color: DARK },
    meta: { fontSize: 9, color: MUTED, fontStyle: "italic", marginBottom: 3 },
    row: { flexDirection: "row", gap: 20 },
    col: { flex: 1 },
    colHead: { fontSize: 9, fontWeight: "bold", color: accent, marginBottom: 4, textTransform: "uppercase" },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).join("  •  ");
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{data.name}</Text>
        {data.title ? <Text style={s.title}>{data.title}</Text> : null}
        {contact ? <Text style={s.contact}>{contact}</Text> : null}
        <View style={s.border} />
        <View style={s.borderThin} />

        {data.summary ? (
          <View>
            <Text style={s.sectionHead}>Summary</Text>
            <Text style={s.body}>{data.summary}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Experience</Text>
            {data.experience.map((e) => (
              <View key={e.id} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={s.role}>{e.role}{e.company ? `  ·  ${e.company}` : ""}</Text>
                  <Text style={{ fontSize: 9, fontStyle: "italic", color: MUTED }}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                </View>
                {e.location ? <Text style={s.meta}>{e.location}</Text> : null}
                {e.bullets.filter((b) => b.trim()).map((b, i) => (
                  <Text key={i} style={s.bullet}>◆ {b}</Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {(data.education.length > 0 || data.certifications.length > 0) ? (
          <View style={s.row}>
            {data.education.length > 0 ? (
              <View style={s.col}>
                <Text style={s.colHead}>Education</Text>
                {data.education.map((ed) => (
                  <View key={ed.id} style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: "bold" }}>{ed.degree}</Text>
                    <Text style={s.meta}>{[ed.school, [ed.start, ed.end].filter(Boolean).join(" – "), ed.grade].filter(Boolean).join("  |  ")}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {data.certifications.length > 0 ? (
              <View style={s.col}>
                <Text style={s.colHead}>Certifications</Text>
                {data.certifications.map((c) => (
                  <View key={c.id} style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: "bold" }}>{c.title}</Text>
                    {c.subtitle ? <Text style={s.meta}>{c.subtitle}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {data.skills.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Skills</Text>
            <Text style={s.body}>{data.skills.join("  ·  ")}</Text>
          </View>
        ) : null}

        {data.awards.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Awards</Text>
            {data.awards.map((a) => (
              <View key={a.id} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: "bold", textAlign: "center" }}>{a.title}{a.date ? `  (${a.date})` : ""}</Text>
                {a.subtitle ? <Text style={{ fontSize: 9.5, color: accent, textAlign: "center" }}>{a.subtitle}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.languages.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Languages</Text>
            <Text style={s.body}>{data.languages.join("  ·  ")}</Text>
          </View>
        ) : null}

        {data.references.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>References</Text>
            {data.references.map((r) => (
              <View key={r.id} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: "bold", textAlign: "center" }}>{r.name}{r.role ? `, ${r.role}` : ""}{r.company ? ` @ ${r.company}` : ""}</Text>
                {r.contact ? <Text style={s.meta}>{r.contact}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

// ============ MINIMAL (airy, light) ============
 function MinimalPdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = ACCENT(style.accent);
  const s = StyleSheet.create({
    page: { padding: 48, fontFamily: "Helvetica", fontSize: 10 },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    name: { fontSize: 22, fontWeight: "thin", color: DARK },
    contact: { fontSize: 8.5, color: MUTED, textAlign: "right" },
    title: { fontSize: 11, color: MUTED, marginBottom: 20 },
    sectionHead: { fontSize: 8, color: "#94a3b8", marginBottom: 6, marginTop: 16, letterSpacing: 2, textTransform: "uppercase" },
    body: { fontSize: 10, color: DARK, marginBottom: 4, lineHeight: 1.5 },
    bullet: { fontSize: 10, color: DARK, marginBottom: 3, marginLeft: 8, lineHeight: 1.5 },
    role: { fontSize: 11, color: DARK },
    meta: { fontSize: 9, color: MUTED, marginBottom: 3 },
    company: { fontSize: 10, color: MUTED, marginBottom: 2 },
    projName: { fontSize: 10.5, color: DARK, marginBottom: 2 },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).join("  ");
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{data.name}</Text>
          <Text style={s.contact}>{contact}</Text>
        </View>
        {data.title ? <Text style={s.title}>{data.title}</Text> : null}

        {data.summary ? (
          <View>
            <Text style={s.sectionHead}>Summary</Text>
            <Text style={s.body}>{data.summary}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Experience</Text>
            {data.experience.map((e) => (
              <View key={e.id} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={s.role}>{e.role}</Text>
                  <Text style={{ fontSize: 9, color: MUTED }}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                </View>
                {e.company ? <Text style={s.company}>{e.company}</Text> : null}
                {e.bullets.filter((b) => b.trim()).map((b, i) => (
                  <Text key={i} style={s.bullet}>— {b}</Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {data.projects.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Projects</Text>
            {data.projects.map((p) => (
              <View key={p.id} style={{ marginBottom: 6 }}>
                <Text style={s.projName}>{p.name}{p.link ? `  ${p.link}` : ""}</Text>
                {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                {p.tech.length > 0 ? <Text style={s.meta}>{p.tech.join(", ")}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.education.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Education</Text>
            {data.education.map((ed) => (
              <View key={ed.id} style={{ marginBottom: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={s.role}>{ed.degree}</Text>
                  <Text style={{ fontSize: 9, color: MUTED }}>{[ed.start, ed.end].filter(Boolean).join(" – ")}</Text>
                </View>
                <Text style={s.meta}>{[ed.school, ed.grade].filter(Boolean).join("  |  ")}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.skills.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Skills</Text>
            <Text style={s.body}>{data.skills.join("   ")}</Text>
          </View>
        ) : null}

        {data.certifications.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Certifications</Text>
            {data.certifications.map((c) => (
              <View key={c.id} style={{ marginBottom: 3 }}>
                <Text style={{ fontSize: 10, color: DARK }}>{c.title}{c.date ? `  ${c.date}` : ""}</Text>
                {c.subtitle ? <Text style={s.meta}>{c.subtitle}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.awards.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Awards</Text>
            {data.awards.map((a) => (
              <View key={a.id} style={{ marginBottom: 3 }}>
                <Text style={{ fontSize: 10, color: DARK }}>{a.title}{a.date ? `  ${a.date}` : ""}</Text>
                {a.subtitle ? <Text style={s.meta}>{a.subtitle}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.languages.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Languages</Text>
            <Text style={s.body}>{data.languages.join(", ")}</Text>
          </View>
        ) : null}

        {data.interests.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>Interests</Text>
            <Text style={s.body}>{data.interests.join(", ")}</Text>
          </View>
        ) : null}

        {data.references.length > 0 ? (
          <View>
            <Text style={s.sectionHead}>References</Text>
            {data.references.map((r) => (
              <View key={r.id} style={{ marginBottom: 3 }}>
                <Text style={{ fontSize: 10, color: DARK }}>{r.name}{r.role ? `, ${r.role}` : ""}</Text>
                {r.contact ? <Text style={s.meta}>{r.contact}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

// ============ SOFTWARE ENGINEER (two-col navy sidebar, accent underline headers) ============
function SoftwareEngineerPdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = ACCENT(style.accent);
  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10 },
    sidebar: { width: "32%", backgroundColor: "#1e293b", padding: 22, color: "#ffffff" },
    main: { width: "68%", padding: 28 },
    photo: { width: 90, height: 90, borderRadius: 45, marginBottom: 14 },
    sbName: { fontSize: 16, fontWeight: "bold", color: "#ffffff", marginBottom: 3 },
    sbJob: { fontSize: 9, color: "#cbd5e1", marginBottom: 14 },
    sbHead: { fontSize: 8, fontWeight: "bold", color: "#ffffff", marginBottom: 6, marginTop: 12, letterSpacing: 1, textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: accent, paddingBottom: 3 },
    sbText: { fontSize: 9, color: "#e2e8f0", marginBottom: 3 },
    name: { fontSize: 22, fontWeight: "bold", color: DARK, marginBottom: 2 },
    jobTitle: { fontSize: 11, color: accent, fontWeight: "bold", marginBottom: 12 },
    sectionHead: { fontSize: 9, fontWeight: "bold", color: accent, marginBottom: 6, marginTop: 14, letterSpacing: 1, textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: accent, paddingBottom: 3 },
    body: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.4 },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 8, lineHeight: 1.4 },
    expRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    expMeta: { fontSize: 8.5, color: MUTED, fontStyle: "italic", marginBottom: 3 },
    projName: { fontSize: 10, fontWeight: "bold", color: DARK, marginBottom: 2 },
    projTech: { fontSize: 8.5, color: MUTED, fontStyle: "italic" },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {data.photo ? <Image src={data.photo} style={s.photo} /> : null}
          <Text style={s.sbName}>{data.name}</Text>
          {data.title ? <Text style={s.sbJob}>{data.title}</Text> : null}

          {contact.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Contact</Text>
              {contact.map((c, i) => <Text key={i} style={s.sbText}>{c}</Text>)}
            </View>
          ) : null}

          {data.skills.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Skills</Text>
              {data.skills.map((sk, i) => <Text key={i} style={s.sbText}>{sk}</Text>)}
            </View>
          ) : null}

          {data.languages.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Languages</Text>
              <Text style={s.sbText}>{data.languages.join(", ")}</Text>
            </View>
          ) : null}

          {data.certifications.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Certifications</Text>
              {data.certifications.map((c) => (
                <View key={c.id} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold", color: "#ffffff" }}>{c.title}</Text>
                  {c.subtitle ? <Text style={{ fontSize: 8, color: "#cbd5e1" }}>{c.subtitle}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={s.main}>
          {data.summary ? (
            <View>
              <Text style={s.sectionHead}>Summary</Text>
              <Text style={s.body}>{data.summary}</Text>
            </View>
          ) : null}

          {data.experience.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Experience</Text>
              {data.experience.map((e) => (
                <View key={e.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{e.role}{e.company ? ` · ${e.company}` : ""}</Text>
                    <Text style={{ fontSize: 8.5, color: MUTED }}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  {e.location ? <Text style={s.expMeta}>{e.location}</Text> : null}
                  {e.bullets.filter((b) => b.trim()).map((b, i) => (
                    <Text key={i} style={s.bullet}>• {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {data.projects.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Projects</Text>
              {data.projects.map((p) => (
                <View key={p.id} style={{ marginBottom: 6 }}>
                  <Text style={s.projName}>{p.name}{p.link ? ` — ${p.link}` : ""}</Text>
                  {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                  {p.tech.length > 0 ? <Text style={s.projTech}>Tech: {p.tech.join(", ")}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.education.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Education</Text>
              {data.education.map((ed) => (
                <View key={ed.id} style={{ marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{ed.degree}</Text>
                    <Text style={{ fontSize: 8.5, color: MUTED }}>{[ed.start, ed.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  <Text style={s.expMeta}>{[ed.school, ed.location, ed.grade].filter(Boolean).join(" | ")}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {data.awards.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Awards</Text>
              {data.awards.map((a) => (
                <View key={a.id} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: "bold", color: DARK }}>{a.title}{a.date ? ` (${a.date})` : ""}</Text>
                  {a.subtitle ? <Text style={{ fontSize: 9, color: MUTED }}>{a.subtitle}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ============ ACADEMIC (two-col gray sidebar, Times-Roman, scholarly) ============
function AcademicPdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = ACCENT(style.accent);
  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily: "Times-Roman", fontSize: 10 },
    sidebar: { width: "35%", backgroundColor: "#374151", padding: 24, color: "#ffffff" },
    main: { width: "65%", padding: 28 },
    photo: { width: 100, height: 100, marginBottom: 14 },
    sbHead: { fontSize: 9, fontWeight: "bold", color: "#ffffff", marginBottom: 5, marginTop: 14, letterSpacing: 1, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#9ca3af", paddingBottom: 3 },
    sbText: { fontSize: 9, color: "#e5e7eb", marginBottom: 4, lineHeight: 1.4 },
    sbItemTitle: { fontSize: 9.5, fontWeight: "bold", color: "#ffffff" },
    sbItemMeta: { fontSize: 8.5, color: "#d1d5db", fontStyle: "italic", marginBottom: 4 },
    name: { fontSize: 20, fontWeight: "bold", color: DARK, marginBottom: 2 },
    jobTitle: { fontSize: 11, color: accent, fontStyle: "italic", marginBottom: 14 },
    sectionHead: { fontSize: 10, fontWeight: "bold", color: accent, marginBottom: 6, marginTop: 14, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: accent, paddingBottom: 3 },
    body: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.5, textAlign: "justify" },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 12, lineHeight: 1.5 },
    expRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    expMeta: { fontSize: 9, color: MUTED, fontStyle: "italic", marginBottom: 3 },
    pubTitle: { fontSize: 10, fontWeight: "bold", color: DARK },
    pubMeta: { fontSize: 9, color: MUTED, fontStyle: "italic", marginBottom: 4 },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {data.photo ? <Image src={data.photo} style={s.photo} /> : null}

          {contact.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Contact</Text>
              {contact.map((c, i) => <Text key={i} style={s.sbText}>{c}</Text>)}
            </View>
          ) : null}

          {data.education.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Education</Text>
              {data.education.map((ed) => (
                <View key={ed.id} style={{ marginBottom: 6 }}>
                  <Text style={s.sbItemTitle}>{ed.degree}</Text>
                  <Text style={s.sbItemMeta}>{[ed.school, ed.location, [ed.start, ed.end].filter(Boolean).join(" – "), ed.grade].filter(Boolean).join(" | ")}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {data.skills.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Skills</Text>
              {data.skills.map((sk, i) => <Text key={i} style={s.sbText}>{sk}</Text>)}
            </View>
          ) : null}

          {data.languages.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Languages</Text>
              <Text style={s.sbText}>{data.languages.join(", ")}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.main}>
          <Text style={s.name}>{data.name}</Text>
          {data.title ? <Text style={s.jobTitle}>{data.title}</Text> : null}

          {data.summary ? (
            <View>
              <Text style={s.sectionHead}>Profile</Text>
              <Text style={s.body}>{data.summary}</Text>
            </View>
          ) : null}

          {data.experience.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Experience</Text>
              {data.experience.map((e) => (
                <View key={e.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{e.role}{e.company ? ` · ${e.company}` : ""}</Text>
                    <Text style={{ fontSize: 9, color: MUTED, fontStyle: "italic" }}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  {e.location ? <Text style={s.expMeta}>{e.location}</Text> : null}
                  {e.bullets.filter((b) => b.trim()).map((b, i) => (
                    <Text key={i} style={s.bullet}>— {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {data.publications.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Publications</Text>
              {data.publications.map((p) => (
                <View key={p.id} style={{ marginBottom: 6 }}>
                  <Text style={s.pubTitle}>{p.title}</Text>
                  {(p.subtitle || p.date) ? <Text style={s.pubMeta}>{[p.subtitle, p.date].filter(Boolean).join(" | ")}</Text> : null}
                  {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.awards.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Awards</Text>
              {data.awards.map((a) => (
                <View key={a.id} style={{ marginBottom: 4 }}>
                  <Text style={s.pubTitle}>{a.title}{a.date ? ` (${a.date})` : ""}</Text>
                  {a.subtitle ? <Text style={s.pubMeta}>{a.subtitle}</Text> : null}
                  {a.description ? <Text style={s.body}>{a.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.references.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>References</Text>
              {data.references.map((r) => (
                <View key={r.id} style={{ marginBottom: 4 }}>
                  <Text style={s.pubTitle}>{r.name}{r.role ? `, ${r.role}` : ""}{r.company ? ` @ ${r.company}` : ""}</Text>
                  {r.contact ? <Text style={s.pubMeta}>{r.contact}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ============ CREATIVE (two-col orange sidebar, pill section headers) ============
function CreativePdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = "#ea580c";
  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10 },
    sidebar: { width: "35%", backgroundColor: "#ea580c", padding: 24, color: "#ffffff" },
    main: { width: "65%", padding: 28 },
    photo: { width: 110, height: 110, borderRadius: 55, marginBottom: 14, borderWidth: 3, borderColor: "#ffffff" },
    sbHead: { fontSize: 9, fontWeight: "bold", color: "#ffffff", marginBottom: 8, marginTop: 16, letterSpacing: 1, textTransform: "uppercase" },
    sbText: { fontSize: 9, color: "#ffffff", marginBottom: 4 },
    sbSkillRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
    sbSkillName: { fontSize: 9, color: "#ffffff", fontWeight: "bold" },
    sbSkillPct: { fontSize: 8, color: "#ffffff" },
    sbBarTrack: { height: 5, backgroundColor: "#ffffff66", borderRadius: 3, marginBottom: 8 },
    sbBarFill: { height: 5, backgroundColor: "#ffffff", borderRadius: 3 },
    name: { fontSize: 26, fontWeight: "bold", color: DARK, marginBottom: 2, lineHeight: 1.1 },
    jobTitle: { fontSize: 13, color: accent, fontWeight: "bold", marginBottom: 16 },
    sectionHead: { fontSize: 9, fontWeight: "bold", color: "#ffffff", backgroundColor: accent, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, alignSelf: "flex-start", marginBottom: 8, marginTop: 16, letterSpacing: 1, textTransform: "uppercase" },
    body: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.4 },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 8, lineHeight: 1.4 },
    expRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    expMeta: { fontSize: 8.5, color: MUTED, fontStyle: "italic", marginBottom: 3 },
    projName: { fontSize: 10, fontWeight: "bold", color: DARK, marginBottom: 2 },
    projTech: { fontSize: 8.5, color: MUTED, fontStyle: "italic" },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {data.photo ? <Image src={data.photo} style={s.photo} /> : null}

          {contact.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Contact</Text>
              {contact.map((c, i) => <Text key={i} style={s.sbText}>{c}</Text>)}
            </View>
          ) : null}

          {data.skills.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Pro Skills</Text>
              {data.skills.map((sk, i) => {
                const level = data.skillLevels[sk] ?? 70;
                return (
                  <View key={i}>
                    <View style={s.sbSkillRow}>
                      <Text style={s.sbSkillName}>{sk}</Text>
                      <Text style={s.sbSkillPct}>{level}%</Text>
                    </View>
                    <View style={s.sbBarTrack}>
                      <View style={[s.sbBarFill, { width: `${level}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {data.languages.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Languages</Text>
              <Text style={s.sbText}>{data.languages.join(", ")}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.main}>
          <Text style={s.name}>{data.name}</Text>
          {data.title ? <Text style={s.jobTitle}>{data.title}</Text> : null}

          {data.experience.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Experience</Text>
              {data.experience.map((e) => (
                <View key={e.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{e.role}{e.company ? ` · ${e.company}` : ""}</Text>
                    <Text style={{ fontSize: 8.5, color: MUTED }}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  {e.location ? <Text style={s.expMeta}>{e.location}</Text> : null}
                  {e.bullets.filter((b) => b.trim()).map((b, i) => (
                    <Text key={i} style={s.bullet}>• {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {data.projects.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Projects</Text>
              {data.projects.map((p) => (
                <View key={p.id} style={{ marginBottom: 6 }}>
                  <Text style={s.projName}>{p.name}{p.link ? ` — ${p.link}` : ""}</Text>
                  {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                  {p.tech.length > 0 ? <Text style={s.projTech}>Tech: {p.tech.join(", ")}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.education.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Education</Text>
              {data.education.map((ed) => (
                <View key={ed.id} style={{ marginBottom: 4 }}>
                  <Text style={s.expRole}>{ed.degree}</Text>
                  <Text style={s.expMeta}>{[ed.school, [ed.start, ed.end].filter(Boolean).join(" – "), ed.grade].filter(Boolean).join(" | ")}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {data.awards.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Awards</Text>
              {data.awards.map((a) => (
                <View key={a.id} style={{ marginBottom: 4 }}>
                  <Text style={s.expRole}>{a.title}{a.date ? ` (${a.date})` : ""}</Text>
                  {a.subtitle ? <Text style={s.expMeta}>{a.subtitle}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ============ WEB DEVELOPER (two-col dark gray sidebar, orange timeline) ============
function WebDeveloperPdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = "#f97316";
  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10 },
    sidebar: { width: "33%", backgroundColor: "#1f2937", padding: 22, color: "#ffffff" },
    main: { width: "67%", padding: 28 },
    photo: { width: 95, height: 95, borderRadius: 6, marginBottom: 14, borderWidth: 2, borderColor: accent },
    sbName: { fontSize: 18, fontWeight: "bold", color: "#ffffff", marginBottom: 2 },
    sbJob: { fontSize: 10, color: accent, fontWeight: "bold", marginBottom: 14 },
    sbHead: { fontSize: 8, fontWeight: "bold", color: accent, marginBottom: 6, marginTop: 14, letterSpacing: 1, textTransform: "uppercase" },
    sbText: { fontSize: 9, color: "#e5e7eb", marginBottom: 4 },
    sbSkillName: { fontSize: 9, color: "#ffffff", marginBottom: 3 },
    sbBarTrack: { height: 4, backgroundColor: "#374151", borderRadius: 2, marginBottom: 7 },
    sbBarFill: { height: 4, backgroundColor: accent, borderRadius: 2 },
    name: { fontSize: 20, fontWeight: "bold", color: DARK, marginBottom: 2 },
    jobTitle: { fontSize: 11, color: accent, fontWeight: "bold", marginBottom: 14 },
    sectionHead: { fontSize: 9, fontWeight: "bold", color: accent, marginBottom: 8, marginTop: 14, letterSpacing: 1, textTransform: "uppercase", borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 8 },
    body: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.4 },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 8, lineHeight: 1.4 },
    tlRow: { flexDirection: "row", marginBottom: 10 },
    tlYearCol: { width: 60, paddingTop: 1 },
    tlYear: { fontSize: 9, color: accent, fontWeight: "bold" },
    tlYearEnd: { fontSize: 8.5, color: MUTED },
    tlContent: { flex: 1, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: "#d1d5db" },
    tlRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    tlCompany: { fontSize: 9, color: MUTED, fontStyle: "italic", marginBottom: 3 },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {data.photo ? <Image src={data.photo} style={s.photo} /> : null}
          <Text style={s.sbName}>{data.name}</Text>
          {data.title ? <Text style={s.sbJob}>{data.title}</Text> : null}

          {contact.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Contact</Text>
              {contact.map((c, i) => <Text key={i} style={s.sbText}>{c}</Text>)}
            </View>
          ) : null}

          {data.skills.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Work Skills</Text>
              {data.skills.map((sk, i) => {
                const level = data.skillLevels[sk] ?? 70;
                return (
                  <View key={i}>
                    <Text style={s.sbSkillName}>{sk}</Text>
                    <View style={s.sbBarTrack}>
                      <View style={[s.sbBarFill, { width: `${level}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {data.languages.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Languages</Text>
              <Text style={s.sbText}>{data.languages.join(", ")}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.main}>
          <Text style={s.name}>{data.name}</Text>
          {data.title ? <Text style={s.jobTitle}>{data.title}</Text> : null}

          {data.summary ? (
            <View>
              <Text style={s.sectionHead}>About Me</Text>
              <Text style={s.body}>{data.summary}</Text>
            </View>
          ) : null}

          {data.experience.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Work Experience</Text>
              {data.experience.map((e) => (
                <View key={e.id} style={s.tlRow}>
                  <View style={s.tlYearCol}>
                    {e.start ? <Text style={s.tlYear}>{e.start}</Text> : null}
                    {e.end ? <Text style={s.tlYearEnd}>{e.end}</Text> : null}
                  </View>
                  <View style={s.tlContent}>
                    <Text style={s.tlRole}>{e.role}</Text>
                    <Text style={s.tlCompany}>{[e.company, e.location].filter(Boolean).join(" · ")}</Text>
                    {e.bullets.filter((b) => b.trim()).map((b, i) => (
                      <Text key={i} style={s.bullet}>• {b}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {data.education.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Education</Text>
              {data.education.map((ed) => (
                <View key={ed.id} style={s.tlRow}>
                  <View style={s.tlYearCol}>
                    {ed.start ? <Text style={s.tlYear}>{ed.start}</Text> : null}
                    {ed.end ? <Text style={s.tlYearEnd}>{ed.end}</Text> : null}
                  </View>
                  <View style={s.tlContent}>
                    <Text style={s.tlRole}>{ed.degree}</Text>
                    <Text style={s.tlCompany}>{[ed.school, ed.location, ed.grade].filter(Boolean).join(" | ")}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {data.projects.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Projects</Text>
              {data.projects.map((p) => (
                <View key={p.id} style={{ marginBottom: 6 }}>
                  <Text style={s.tlRole}>{p.name}{p.link ? ` — ${p.link}` : ""}</Text>
                  {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                  {p.tech.length > 0 ? <Text style={s.tlCompany}>Tech: {p.tech.join(", ")}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ============ UX DESIGNER (two-col dark blue sidebar, dot timelines) ============
function UxDesignerPdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = "#1e3a5f";
  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10 },
    sidebar: { width: "32%", backgroundColor: "#1e3a5f", padding: 22, color: "#ffffff" },
    main: { width: "70%", padding: 28 },
    photo: { width: 100, height: 100, borderRadius: 50, marginBottom: 14, borderWidth: 2, borderColor: "#ffffff" },
    sbHead: { fontSize: 8, fontWeight: "bold", color: "#ffffff", marginBottom: 6, marginTop: 14, letterSpacing: 1, textTransform: "uppercase" },
    sbText: { fontSize: 9, color: "#e2e8f0", marginBottom: 3 },
    skillsRow: { flexDirection: "row", flexWrap: "wrap" },
    skillChip: { fontSize: 8.5, color: "#ffffff", backgroundColor: "#ffffff22", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 4, marginBottom: 4 },
    hello: { fontSize: 11, color: MUTED, marginBottom: 2, fontStyle: "italic" },
    name: { fontSize: 24, fontWeight: "bold", color: DARK, marginBottom: 4 },
    jobTitle: { fontSize: 12, color: accent, fontWeight: "bold", marginBottom: 14 },
    sectionHead: { fontSize: 9, fontWeight: "bold", color: accent, marginBottom: 8, marginTop: 14, letterSpacing: 1, textTransform: "uppercase" },
    body: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.5 },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 12, lineHeight: 1.5 },
    tlRow: { flexDirection: "row", marginBottom: 10 },
    tlRail: { width: 14, alignItems: "center" },
    tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: accent, marginTop: 4 },
    tlContent: { flex: 1, marginLeft: 6 },
    tlDate: { fontSize: 8.5, color: accent, fontWeight: "bold", marginBottom: 2 },
    tlRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    tlCompany: { fontSize: 9.5, color: MUTED, fontStyle: "italic", marginBottom: 3 },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
  const half = Math.ceil(data.skills.length / 2);
  const skillsCol1 = data.skills.slice(0, half);
  const skillsCol2 = data.skills.slice(half);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {data.photo ? <Image src={data.photo} style={s.photo} /> : null}

          {contact.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Contact</Text>
              {contact.map((c, i) => <Text key={i} style={s.sbText}>{c}</Text>)}
            </View>
          ) : null}

          {data.skills.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Skills</Text>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  {skillsCol1.map((sk, i) => <Text key={i} style={s.sbText}>{sk}</Text>)}
                </View>
                <View style={{ flex: 1 }}>
                  {skillsCol2.map((sk, i) => <Text key={i} style={s.sbText}>{sk}</Text>)}
                </View>
              </View>
            </View>
          ) : null}

          {data.languages.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Languages</Text>
              <View style={s.skillsRow}>
                {data.languages.map((l, i) => <Text key={i} style={s.skillChip}>{l}</Text>)}
              </View>
            </View>
          ) : null}
        </View>

        <View style={s.main}>
          <Text style={s.hello}>Hello, I&apos;m</Text>
          <Text style={s.name}>{data.name}</Text>
          {data.title ? <Text style={s.jobTitle}>{data.title}</Text> : null}

          {data.summary ? (
            <View>
              <Text style={s.sectionHead}>About</Text>
              <Text style={s.body}>{data.summary}</Text>
            </View>
          ) : null}

          {data.experience.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Experience</Text>
              {data.experience.map((e) => (
                <View key={e.id} style={s.tlRow}>
                  <View style={s.tlRail}>
                    <View style={s.tlDot} />
                  </View>
                  <View style={s.tlContent}>
                    <Text style={s.tlDate}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                    <Text style={s.tlRole}>{e.role}</Text>
                    <Text style={s.tlCompany}>{[e.company, e.location].filter(Boolean).join(" · ")}</Text>
                    {e.bullets.filter((b) => b.trim()).map((b, i) => (
                      <Text key={i} style={s.bullet}>• {b}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {data.education.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Education</Text>
              {data.education.map((ed) => (
                <View key={ed.id} style={s.tlRow}>
                  <View style={s.tlRail}>
                    <View style={s.tlDot} />
                  </View>
                  <View style={s.tlContent}>
                    <Text style={s.tlDate}>{[ed.start, ed.end].filter(Boolean).join(" – ")}</Text>
                    <Text style={s.tlRole}>{ed.degree}</Text>
                    <Text style={s.tlCompany}>{[ed.school, ed.location, ed.grade].filter(Boolean).join(" | ")}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {data.projects.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Projects</Text>
              {data.projects.map((p) => (
                <View key={p.id} style={{ marginBottom: 6 }}>
                  <Text style={s.tlRole}>{p.name}{p.link ? ` — ${p.link}` : ""}</Text>
                  {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                  {p.tech.length > 0 ? <Text style={s.tlCompany}>Tech: {p.tech.join(", ")}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ============ TEACHER (two-col gray sidebar, yellow accents, light gray main) ============
function TeacherPdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = "#eab308";
  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10 },
    sidebar: { width: "33%", backgroundColor: "#374151", padding: 22, color: "#ffffff" },
    main: { width: "67%", padding: 26, backgroundColor: "#f3f4f6" },
    photo: { width: 95, height: 95, borderRadius: 6, marginBottom: 12 },
    sbName: { fontSize: 18, fontWeight: "bold", color: "#ffffff", marginBottom: 2 },
    sbJob: { fontSize: 10, color: accent, fontWeight: "bold", marginBottom: 14 },
    sbHead: { fontSize: 8, fontWeight: "bold", color: accent, marginBottom: 6, marginTop: 14, letterSpacing: 1, textTransform: "uppercase" },
    sbText: { fontSize: 9, color: "#e5e7eb", marginBottom: 4 },
    sbSkillName: { fontSize: 9, color: "#ffffff", marginBottom: 2 },
    sbBarTrack: { height: 3, backgroundColor: "#4b5563", borderRadius: 2, marginBottom: 6 },
    sbBarFill: { height: 3, backgroundColor: accent, borderRadius: 2 },
    name: { fontSize: 22, fontWeight: "bold", color: DARK, marginBottom: 2 },
    jobTitle: { fontSize: 11, color: accent, fontWeight: "bold", marginBottom: 14 },
    sectionHead: { fontSize: 9, fontWeight: "bold", color: accent, marginBottom: 6, marginTop: 14, letterSpacing: 1, textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: accent, paddingBottom: 3 },
    body: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.5 },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 8, lineHeight: 1.5 },
    expRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    expMeta: { fontSize: 8.5, color: MUTED, fontStyle: "italic", marginBottom: 3 },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {data.photo ? <Image src={data.photo} style={s.photo} /> : null}
          <Text style={s.sbName}>{data.name}</Text>
          {data.title ? <Text style={s.sbJob}>{data.title}</Text> : null}

          {contact.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Contact</Text>
              {contact.map((c, i) => <Text key={i} style={s.sbText}>{c}</Text>)}
            </View>
          ) : null}

          {data.skills.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Skills</Text>
              {data.skills.map((sk, i) => {
                const level = data.skillLevels[sk] ?? 70;
                return (
                  <View key={i}>
                    <Text style={s.sbSkillName}>{sk}</Text>
                    <View style={s.sbBarTrack}>
                      <View style={[s.sbBarFill, { width: `${level}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {data.languages.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Languages</Text>
              <Text style={s.sbText}>{data.languages.join(", ")}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.main}>
          <Text style={s.name}>{data.name}</Text>
          {data.title ? <Text style={s.jobTitle}>{data.title}</Text> : null}

          {data.summary ? (
            <View>
              <Text style={s.sectionHead}>Profile</Text>
              <Text style={s.body}>{data.summary}</Text>
            </View>
          ) : null}

          {data.experience.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Experience</Text>
              {data.experience.map((e) => (
                <View key={e.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{e.role}{e.company ? ` · ${e.company}` : ""}</Text>
                    <Text style={{ fontSize: 8.5, color: MUTED }}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  {e.location ? <Text style={s.expMeta}>{e.location}</Text> : null}
                  {e.bullets.filter((b) => b.trim()).map((b, i) => (
                    <Text key={i} style={s.bullet}>• {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {data.education.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Education</Text>
              {data.education.map((ed) => (
                <View key={ed.id} style={{ marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{ed.degree}</Text>
                    <Text style={{ fontSize: 8.5, color: MUTED }}>{[ed.start, ed.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  <Text style={s.expMeta}>{[ed.school, ed.location, ed.grade].filter(Boolean).join(" | ")}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {data.awards.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Achievements</Text>
              {data.awards.map((a) => (
                <View key={a.id} style={{ marginBottom: 4 }}>
                  <Text style={s.expRole}>{a.title}{a.date ? ` (${a.date})` : ""}</Text>
                  {a.subtitle ? <Text style={s.expMeta}>{a.subtitle}</Text> : null}
                  {a.description ? <Text style={s.body}>{a.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.certifications.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Certifications</Text>
              {data.certifications.map((c) => (
                <View key={c.id} style={{ marginBottom: 4 }}>
                  <Text style={s.expRole}>{c.title}{c.date ? ` (${c.date})` : ""}</Text>
                  {c.subtitle ? <Text style={s.expMeta}>{c.subtitle}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ============ PRODUCT MANAGER (two-col teal sidebar, full-width teal header bars) ============
function ProductManagerPdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = "#059669";
  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10 },
    sidebar: { width: "35%", backgroundColor: "#059669", padding: 24, color: "#ffffff" },
    main: { width: "65%", padding: 28, backgroundColor: "#ffffff" },
    photo: { width: 100, height: 100, borderRadius: 50, marginBottom: 14, borderWidth: 3, borderColor: "#ffffff" },
    sbHead: { fontSize: 8, fontWeight: "bold", color: "#ffffff", marginBottom: 6, marginTop: 14, letterSpacing: 1, textTransform: "uppercase" },
    sbText: { fontSize: 9, color: "#ffffff", marginBottom: 4, lineHeight: 1.4 },
    sbSkillRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
    sbSkillName: { fontSize: 9, color: "#ffffff", fontWeight: "bold" },
    sbSkillPct: { fontSize: 8, color: "#ffffff" },
    sbBarTrack: { height: 4, backgroundColor: "#ffffff66", borderRadius: 2, marginBottom: 7 },
    sbBarFill: { height: 4, backgroundColor: "#ffffff", borderRadius: 2 },
    name: { fontSize: 22, fontWeight: "bold", color: DARK, marginBottom: 2, textTransform: "uppercase" },
    jobTitle: { fontSize: 11, color: accent, fontWeight: "bold", marginBottom: 16 },
    sectionHead: { fontSize: 9, fontWeight: "bold", color: "#ffffff", backgroundColor: accent, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8, marginTop: 14, letterSpacing: 1, textTransform: "uppercase" },
    body: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.4 },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 8, lineHeight: 1.4 },
    expRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    expMeta: { fontSize: 8.5, color: MUTED, fontStyle: "italic", marginBottom: 3 },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {data.photo ? <Image src={data.photo} style={s.photo} /> : null}

          {data.summary ? (
            <View>
              <Text style={s.sbHead}>About Me</Text>
              <Text style={s.sbText}>{data.summary}</Text>
            </View>
          ) : null}

          {contact.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Contact</Text>
              {contact.map((c, i) => <Text key={i} style={s.sbText}>{c}</Text>)}
            </View>
          ) : null}

          {data.skills.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Skills</Text>
              {data.skills.map((sk, i) => {
                const level = data.skillLevels[sk] ?? 70;
                return (
                  <View key={i}>
                    <View style={s.sbSkillRow}>
                      <Text style={s.sbSkillName}>{sk}</Text>
                      <Text style={s.sbSkillPct}>{level}%</Text>
                    </View>
                    <View style={s.sbBarTrack}>
                      <View style={[s.sbBarFill, { width: `${level}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {data.languages.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Languages</Text>
              <Text style={s.sbText}>{data.languages.join(", ")}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.main}>
          <Text style={s.name}>{data.name}</Text>
          {data.title ? <Text style={s.jobTitle}>{data.title}</Text> : null}

          {data.experience.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Experience</Text>
              {data.experience.map((e) => (
                <View key={e.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{e.role}{e.company ? ` · ${e.company}` : ""}</Text>
                    <Text style={{ fontSize: 8.5, color: MUTED }}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  {e.location ? <Text style={s.expMeta}>{e.location}</Text> : null}
                  {e.bullets.filter((b) => b.trim()).map((b, i) => (
                    <Text key={i} style={s.bullet}>• {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {data.education.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Education</Text>
              {data.education.map((ed) => (
                <View key={ed.id} style={{ marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.expRole}>{ed.degree}</Text>
                    <Text style={{ fontSize: 8.5, color: MUTED }}>{[ed.start, ed.end].filter(Boolean).join(" – ")}</Text>
                  </View>
                  <Text style={s.expMeta}>{[ed.school, ed.location, ed.grade].filter(Boolean).join(" | ")}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {data.projects.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Projects</Text>
              {data.projects.map((p) => (
                <View key={p.id} style={{ marginBottom: 6 }}>
                  <Text style={s.expRole}>{p.name}{p.link ? ` — ${p.link}` : ""}</Text>
                  {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                  {p.tech.length > 0 ? <Text style={s.expMeta}>Tech: {p.tech.join(", ")}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.awards.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Awards</Text>
              {data.awards.map((a) => (
                <View key={a.id} style={{ marginBottom: 4 }}>
                  <Text style={s.expRole}>{a.title}{a.date ? ` (${a.date})` : ""}</Text>
                  {a.subtitle ? <Text style={s.expMeta}>{a.subtitle}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ============ FINANCE (3-zone: gray header band + 2-col below) ============
function FinancePdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = ACCENT(style.accent);
  const s = StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: 10 },
    header: { backgroundColor: "#e5e7eb", padding: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerLeft: { flex: 1 },
    name: { fontSize: 22, fontWeight: "bold", color: DARK, marginBottom: 2, textAlign: "center" },
    jobTitle: { fontSize: 11, color: "#374151", textAlign: "center", marginBottom: 4 },
    contact: { fontSize: 9, color: MUTED, textAlign: "center" },
    photo: { width: 70, height: 70, borderRadius: 35, marginLeft: 14 },
    body: { flexDirection: "row" },
    main: { width: "68%", padding: 24 },
    side: { width: "32%", padding: 22, backgroundColor: "#f9fafb" },
    sectionHead: { fontSize: 9, fontWeight: "bold", color: DARK, marginBottom: 6, marginTop: 12, textTransform: "uppercase", letterSpacing: 1 },
    sideHead: { fontSize: 8, fontWeight: "bold", color: "#374151", marginBottom: 5, marginTop: 12, textTransform: "uppercase", letterSpacing: 1 },
    bodyText: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.4 },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 8, lineHeight: 1.4 },
    sideText: { fontSize: 9, color: "#374151", marginBottom: 3 },
    expRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    expMeta: { fontSize: 8.5, color: MUTED, fontStyle: "italic", marginBottom: 3 },
    projName: { fontSize: 10, fontWeight: "bold", color: DARK, marginBottom: 2 },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).join("  •  ");
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.name}>{data.name}</Text>
            {data.title ? <Text style={s.jobTitle}>{data.title}</Text> : null}
            {contact ? <Text style={s.contact}>{contact}</Text> : null}
          </View>
          {data.photo ? <Image src={data.photo} style={s.photo} /> : null}
        </View>

        <View style={s.body}>
          <View style={s.main}>
            {data.summary ? (
              <View>
                <Text style={s.sectionHead}>Profile</Text>
                <Text style={s.bodyText}>{data.summary}</Text>
              </View>
            ) : null}

            {data.experience.length > 0 ? (
              <View>
                <Text style={s.sectionHead}>Work Experience</Text>
                {data.experience.map((e) => (
                  <View key={e.id} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={s.expRole}>{e.role}{e.company ? ` · ${e.company}` : ""}</Text>
                      <Text style={{ fontSize: 8.5, color: MUTED }}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                    </View>
                    {e.location ? <Text style={s.expMeta}>{e.location}</Text> : null}
                    {e.bullets.filter((b) => b.trim()).map((b, i) => (
                      <Text key={i} style={s.bullet}>• {b}</Text>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            {data.education.length > 0 ? (
              <View>
                <Text style={s.sectionHead}>Education</Text>
                {data.education.map((ed) => (
                  <View key={ed.id} style={{ marginBottom: 6 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={s.expRole}>{ed.degree}</Text>
                      <Text style={{ fontSize: 8.5, color: MUTED }}>{[ed.start, ed.end].filter(Boolean).join(" – ")}</Text>
                    </View>
                    <Text style={s.expMeta}>{[ed.school, ed.location, ed.grade].filter(Boolean).join(" | ")}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {data.projects.length > 0 ? (
              <View>
                <Text style={s.sectionHead}>Projects</Text>
                {data.projects.map((p) => (
                  <View key={p.id} style={{ marginBottom: 6 }}>
                    <Text style={s.projName}>{p.name}{p.link ? ` — ${p.link}` : ""}</Text>
                    {p.description ? <Text style={s.bodyText}>{p.description}</Text> : null}
                    {p.tech.length > 0 ? <Text style={s.expMeta}>Tech: {p.tech.join(", ")}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={s.side}>
            {data.skills.length > 0 ? (
              <View>
                <Text style={s.sideHead}>Key Skills</Text>
                {data.skills.map((sk, i) => <Text key={i} style={s.sideText}>{sk}</Text>)}
              </View>
            ) : null}

            {data.certifications.length > 0 ? (
              <View>
                <Text style={s.sideHead}>Certifications</Text>
                {data.certifications.map((c) => (
                  <View key={c.id} style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 9, fontWeight: "bold", color: DARK }}>{c.title}</Text>
                    {c.subtitle ? <Text style={{ fontSize: 8.5, color: MUTED }}>{c.subtitle}</Text> : null}
                    {c.date ? <Text style={{ fontSize: 8.5, color: MUTED }}>{c.date}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {data.languages.length > 0 ? (
              <View>
                <Text style={s.sideHead}>Languages</Text>
                <Text style={s.sideText}>{data.languages.join(", ")}</Text>
              </View>
            ) : null}

            {data.interests.length > 0 ? (
              <View>
                <Text style={s.sideHead}>Interests</Text>
                <Text style={s.sideText}>{data.interests.join(", ")}</Text>
              </View>
            ) : null}

            {data.awards.length > 0 ? (
              <View>
                <Text style={s.sideHead}>Awards</Text>
                {data.awards.map((a) => (
                  <View key={a.id} style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 9, fontWeight: "bold", color: DARK }}>{a.title}</Text>
                    {a.date ? <Text style={{ fontSize: 8.5, color: MUTED }}>{a.date}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ============ BUSINESS ANALYST (two-col navy sidebar, yellow accents, timelines) ============
function BusinessAnalystPdf({ data, style }: { data: ResumeData; style: TemplateStyle }) {
  const accent = "#fbbf24";
  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10 },
    sidebar: { width: "30%", backgroundColor: "#1e3a5f", padding: 22, color: "#ffffff" },
    main: { width: "70%", padding: 28 },
    photo: { width: 100, height: 100, borderRadius: 50, marginBottom: 14, borderWidth: 3, borderColor: accent },
    sbHead: { fontSize: 8, fontWeight: "bold", color: accent, marginBottom: 6, marginTop: 14, letterSpacing: 1, textTransform: "uppercase" },
    sbText: { fontSize: 9, color: "#e2e8f0", marginBottom: 3 },
    sbItemTitle: { fontSize: 9.5, fontWeight: "bold", color: "#ffffff" },
    sbItemMeta: { fontSize: 8.5, color: "#cbd5e1", marginBottom: 4 },
    sbEduRow: { flexDirection: "row", marginBottom: 8 },
    sbDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: accent, marginTop: 3, marginRight: 8 },
    nameRow: { flexDirection: "row", justifyContent: "center", marginBottom: 4, alignItems: "center" },
    nameBar: { width: 4, height: 22, backgroundColor: accent, marginRight: 10 },
    name: { fontSize: 22, fontWeight: "bold", color: DARK },
    jobTitle: { fontSize: 11, color: MUTED, textAlign: "center", marginBottom: 16 },
    sectionHead: { fontSize: 9, fontWeight: "bold", color: DARK, backgroundColor: accent, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8, marginTop: 14, letterSpacing: 1, textTransform: "uppercase" },
    body: { fontSize: 9.5, color: DARK, marginBottom: 4, lineHeight: 1.4 },
    bullet: { fontSize: 9.5, color: DARK, marginBottom: 3, marginLeft: 8, lineHeight: 1.4 },
    tlRow: { flexDirection: "row", marginBottom: 10 },
    tlRail: { width: 14, alignItems: "center" },
    tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: accent, marginTop: 3 },
    tlContent: { flex: 1, marginLeft: 6, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: "#d1d5db" },
    tlRole: { fontSize: 10.5, fontWeight: "bold", color: DARK },
    tlCompany: { fontSize: 9, color: MUTED, fontStyle: "italic", marginBottom: 3 },
    tlDate: { fontSize: 8.5, color: accent, fontWeight: "bold", marginBottom: 2 },
  });
  const contact = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {data.photo ? <Image src={data.photo} style={s.photo} /> : null}

          {contact.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Contact</Text>
              {contact.map((c, i) => <Text key={i} style={s.sbText}>{c}</Text>)}
            </View>
          ) : null}

          {data.education.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Education</Text>
              {data.education.map((ed) => (
                <View key={ed.id} style={s.sbEduRow}>
                  <View style={s.sbDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.sbItemTitle}>{ed.degree}</Text>
                    <Text style={s.sbItemMeta}>{[ed.school, [ed.start, ed.end].filter(Boolean).join(" – "), ed.grade].filter(Boolean).join(" | ")}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {data.skills.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Key Skills</Text>
              {data.skills.map((sk, i) => <Text key={i} style={s.sbText}>{sk}</Text>)}
            </View>
          ) : null}

          {data.languages.length > 0 ? (
            <View>
              <Text style={s.sbHead}>Languages</Text>
              <Text style={s.sbText}>{data.languages.join(", ")}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.main}>
          <View style={s.nameRow}>
            <View style={s.nameBar} />
            <Text style={s.name}>{data.name}</Text>
          </View>
          {data.title ? <Text style={s.jobTitle}>{data.title}</Text> : null}

          {data.summary ? (
            <View>
              <Text style={s.sectionHead}>Profile Summary</Text>
              <Text style={s.body}>{data.summary}</Text>
            </View>
          ) : null}

          {data.experience.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Work Experience</Text>
              {data.experience.map((e) => (
                <View key={e.id} style={s.tlRow}>
                  <View style={s.tlRail}>
                    <View style={s.tlDot} />
                  </View>
                  <View style={s.tlContent}>
                    <Text style={s.tlDate}>{[e.start, e.end].filter(Boolean).join(" – ")}</Text>
                    <Text style={s.tlRole}>{e.role}</Text>
                    <Text style={s.tlCompany}>{[e.company, e.location].filter(Boolean).join(" · ")}</Text>
                    {e.bullets.filter((b) => b.trim()).map((b, i) => (
                      <Text key={i} style={s.bullet}>• {b}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {data.projects.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Projects</Text>
              {data.projects.map((p) => (
                <View key={p.id} style={{ marginBottom: 6 }}>
                  <Text style={s.tlRole}>{p.name}{p.link ? ` — ${p.link}` : ""}</Text>
                  {p.description ? <Text style={s.body}>{p.description}</Text> : null}
                  {p.tech.length > 0 ? <Text style={s.tlCompany}>Tech: {p.tech.join(", ")}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.awards.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Achievements</Text>
              {data.awards.map((a) => (
                <View key={a.id} style={{ marginBottom: 4 }}>
                  <Text style={s.tlRole}>{a.title}{a.date ? ` (${a.date})` : ""}</Text>
                  {a.subtitle ? <Text style={s.tlCompany}>{a.subtitle}</Text> : null}
                  {a.description ? <Text style={s.body}>{a.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {data.certifications.length > 0 ? (
            <View>
              <Text style={s.sectionHead}>Certifications</Text>
              {data.certifications.map((c) => (
                <View key={c.id} style={{ marginBottom: 4 }}>
                  <Text style={s.tlRole}>{c.title}{c.date ? ` (${c.date})` : ""}</Text>
                  {c.subtitle ? <Text style={s.tlCompany}>{c.subtitle}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ============ Dispatcher ============
export async function exportResumePdf(data: ResumeData, style: TemplateStyle): Promise<void> {
  let element: React.ReactElement;
  switch (style.template) {
    case "ats":
      element = React.createElement(AtsPdf, { data });
      break;
    case "executive":
      element = React.createElement(ExecutivePdf, { data, style });
      break;
    case "minimal":
      element = React.createElement(MinimalPdf, { data, style });
      break;
    case "software-engineer":
      element = React.createElement(SoftwareEngineerPdf, { data, style });
      break;
    case "academic":
      element = React.createElement(AcademicPdf, { data, style });
      break;
    case "creative":
      element = React.createElement(CreativePdf, { data, style });
      break;
    case "web-developer":
      element = React.createElement(WebDeveloperPdf, { data, style });
      break;
    case "ux-designer":
      element = React.createElement(UxDesignerPdf, { data, style });
      break;
    case "teacher":
      element = React.createElement(TeacherPdf, { data, style });
      break;
    case "product-manager":
      element = React.createElement(ProductManagerPdf, { data, style });
      break;
    case "finance":
      element = React.createElement(FinancePdf, { data, style });
      break;
    case "business-analyst":
      element = React.createElement(BusinessAnalystPdf, { data, style });
      break;
    default:
      element = React.createElement(ModernPdf, { data, style });
      break;
  }
  const blob = await pdf(element as unknown as Parameters<typeof pdf>[0]).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.name.replace(/\s+/g, "_")}_Resume.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
