"use client";

import type { ResumeData, TemplateStyle } from "@/store/resume-store";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  TabStopType,
  TabStopPosition,
  VerticalAlign,
} from "docx";
import {
  getDocxConfig,
  hex,
  contactLine,
  type DocxTemplateConfig,
  type SidebarSection,
} from "@/lib/resume/docx-config";

const PT = (n: number) => Math.round(n * 2);
const INCH = (n: number) => Math.round(n * 1440);
const CM = (n: number) => Math.round(n * 567);
const DARK = "0F172A";
const MUTED = "64748B";

// ── Helpers ──────────────────────────────────────────────

function run(text: string, opts: { bold?: boolean; italics?: boolean; size?: number; color?: string; font?: string } = {}) {
  return new TextRun({
    text,
    bold: opts.bold,
    italics: opts.italics,
    size: opts.size ?? PT(10),
    color: opts.color ?? DARK,
    font: opts.font,
  });
}

function para(children: TextRun[], opts: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacing?: { before?: number; after?: number }; bullet?: boolean } = {}) {
  return new Paragraph({
    alignment: opts.align,
    spacing: opts.spacing ?? { after: 40 },
    children,
    ...(opts.bullet ? { bullet: { level: 0 } } : {}),
  });
}

function bulletPara(text: string, opts: { size?: number; color?: string; font?: string } = {}) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 30 },
    children: [run(text, { size: opts.size ?? PT(10), color: opts.color, font: opts.font })],
  });
}

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = {
  top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
  insideHorizontal: noBorder, insideVertical: noBorder,
};

function sectionHeader(title: string, color: string, font?: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [run(title.toUpperCase(), { bold: true, size: PT(9), color, font })],
  });
}

// ── Sidebar section builders ─────────────────────────────

function buildSidebarSection(
  section: SidebarSection,
  data: ResumeData,
  cfg: DocxTemplateConfig
): Paragraph[] {
  const textColor = cfg.sidebarText;
  const font = cfg.fontFamily;
  const out: Paragraph[] = [];

  switch (section) {
    case "contact":
      out.push(para([run("CONTACT", { bold: true, size: PT(8), color: textColor, font })], { spacing: { after: 60 } }));
      for (const c of [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean)) {
        out.push(para([run(c, { size: PT(8.5), color: textColor, font })], { spacing: { after: 25 } }));
      }
      break;
    case "skills":
      if (!data.skills.length) break;
      out.push(para([run("SKILLS", { bold: true, size: PT(8), color: textColor, font })], { spacing: { before: 160, after: 60 } }));
      for (const s of data.skills) {
        out.push(para([run(s, { size: PT(8.5), color: textColor, font })], { spacing: { after: 25 } }));
      }
      break;
    case "skillBars":
      if (!data.skills.length) break;
      out.push(para([run("SKILLS", { bold: true, size: PT(8), color: textColor, font })], { spacing: { before: 160, after: 60 } }));
      for (const s of data.skills) {
        const level = data.skillLevels[s];
        const bar = level != null ? " — " + level + "%" : "";
        out.push(para([run(s + bar, { size: PT(8.5), color: textColor, font })], { spacing: { after: 25 } }));
      }
      break;
    case "languages":
      if (!data.languages.length) break;
      out.push(para([run("LANGUAGES", { bold: true, size: PT(8), color: textColor, font })], { spacing: { before: 160, after: 60 } }));
      out.push(para([run(data.languages.join(", "), { size: PT(8.5), color: textColor, font })]));
      break;
    case "certifications":
      if (!data.certifications.length) break;
      out.push(para([run("CERTIFICATIONS", { bold: true, size: PT(8), color: textColor, font })], { spacing: { before: 160, after: 60 } }));
      for (const c of data.certifications) {
        out.push(para([run(c.title, { bold: true, size: PT(8.5), color: textColor, font })], { spacing: { after: 20 } }));
        if (c.subtitle) out.push(para([run(c.subtitle, { size: PT(8), color: textColor, font })], { spacing: { after: 30 } }));
      }
      break;
    case "education":
      if (!data.education.length) break;
      out.push(para([run("EDUCATION", { bold: true, size: PT(8), color: textColor, font })], { spacing: { before: 160, after: 60 } }));
      for (const ed of data.education) {
        out.push(para([run(ed.degree, { bold: true, size: PT(8.5), color: textColor, font })], { spacing: { after: 20 } }));
        const meta = [ed.school, [ed.start, ed.end].filter(Boolean).join(" – "), ed.grade].filter(Boolean).join(" | ");
        if (meta) out.push(para([run(meta, { size: PT(8), color: textColor, font })], { spacing: { after: 30 } }));
      }
      break;
    case "interests":
      if (!data.interests.length) break;
      out.push(para([run("INTERESTS", { bold: true, size: PT(8), color: textColor, font })], { spacing: { before: 160, after: 60 } }));
      out.push(para([run(data.interests.join(", "), { size: PT(8.5), color: textColor, font })]));
      break;
    case "about":
      if (!data.summary) break;
      out.push(para([run("ABOUT", { bold: true, size: PT(8), color: textColor, font })], { spacing: { after: 60 } }));
      out.push(para([run(data.summary, { size: PT(8.5), color: textColor, font })], { spacing: { after: 30 } }));
      break;
  }
  return out;
}

// ── Main column section builders ─────────────────────────

function buildMainSections(data: ResumeData, cfg: DocxTemplateConfig): Paragraph[] {
  const out: Paragraph[] = [];
  const accent = cfg.headerColor;
  const font = cfg.fontFamily;

  if (data.summary) {
    out.push(sectionHeader("Summary", accent, font));
    out.push(para([run(data.summary, { size: PT(10), font })], { spacing: { after: 80 } }));
  }

  if (data.experience.length) {
    out.push(sectionHeader("Experience", accent, font));
    for (const e of data.experience) {
      out.push(new Paragraph({
        spacing: { before: 40, after: 10 },
        tabStops: [{ type: TabStopType.RIGHT, position: INCH(6.5) }],
        children: [
          run(e.role, { bold: true, size: PT(11), font }),
          ...(e.company ? [run(`  ·  ${e.company}`, { size: PT(11), color: accent, font })] : []),
          new TextRun({ text: `\t${[e.start, e.end].filter(Boolean).join(" – ")}`, size: PT(9), color: MUTED, font }),
        ],
      }));
      if (e.location) out.push(para([run(e.location, { italics: true, size: PT(9), color: MUTED, font })], { spacing: { after: 30 } }));
      for (const b of e.bullets.filter((x) => x.trim())) out.push(bulletPara(b, { font }));
    }
  }

  if (data.projects.length) {
    out.push(sectionHeader("Projects", accent, font));
    for (const p of data.projects) {
      out.push(para([run(p.name, { bold: true, size: PT(10.5), font }), ...(p.link ? [run(`  —  ${p.link}`, { size: PT(9), color: MUTED, font })] : [])], { spacing: { after: 20 } }));
      if (p.description) out.push(para([run(p.description, { size: PT(10), font })], { spacing: { after: 20 } }));
      if (p.tech.length) out.push(para([run(`Tech: ${p.tech.join(", ")}`, { italics: true, size: PT(9), color: MUTED, font })], { spacing: { after: 40 } }));
    }
  }

  // Education goes in main column for non-sidebar patterns, sidebar for sidebar patterns
  if (cfg.pattern === "single-column" || cfg.pattern === "header-band") {
    if (data.education.length) {
      out.push(sectionHeader("Education", accent, font));
      for (const ed of data.education) {
        out.push(new Paragraph({
          spacing: { after: 10 },
          tabStops: [{ type: TabStopType.RIGHT, position: INCH(6.5) }],
          children: [
            run(ed.degree, { bold: true, size: PT(11), font }),
            new TextRun({ text: `\t${[ed.start, ed.end].filter(Boolean).join(" – ")}`, size: PT(9), color: MUTED, font }),
          ],
        }));
        const meta = [ed.school, ed.location, ed.grade].filter(Boolean).join("  |  ");
        if (meta) out.push(para([run(meta, { size: PT(9.5), color: MUTED, font })], { spacing: { after: 40 } }));
      }
    }
    if (data.skills.length) {
      out.push(sectionHeader("Skills", accent, font));
      out.push(para([run(data.skills.join(", "), { size: PT(10), font })], { spacing: { after: 60 } }));
    }
    if (data.certifications.length) {
      out.push(sectionHeader("Certifications", accent, font));
      for (const c of data.certifications) {
        out.push(para([run(c.title, { bold: true, size: PT(10), font }), ...(c.subtitle ? [run(`  —  ${c.subtitle}`, { size: PT(10), color: MUTED, font })] : []), ...(c.date ? [run(`  (${c.date})`, { size: PT(9), color: MUTED, font })] : [])]));
      }
    }
    if (data.awards.length) {
      out.push(sectionHeader("Awards", accent, font));
      for (const a of data.awards) {
        out.push(para([run(a.title, { bold: true, size: PT(10), font }), ...(a.date ? [run(`  (${a.date})`, { size: PT(9), color: MUTED, font })] : [])], { spacing: { after: 20 } }));
        if (a.subtitle) out.push(para([run(a.subtitle, { size: PT(9.5), color: MUTED, font })], { spacing: { after: 30 } }));
      }
    }
    if (data.languages.length) {
      out.push(sectionHeader("Languages", accent, font));
      out.push(para([run(data.languages.join(", "), { size: PT(10), font })]));
    }
    if (data.interests.length) {
      out.push(sectionHeader("Interests", accent, font));
      out.push(para([run(data.interests.join(", "), { size: PT(10), font })]));
    }
    if (data.references.length) {
      out.push(sectionHeader("References", accent, font));
      for (const r of data.references) {
        out.push(para([run(r.name, { bold: true, size: PT(10), font }), ...(r.role ? [run(`, ${r.role}`, { size: PT(10), font })] : []), ...(r.company ? [run(` @ ${r.company}`, { size: PT(10), color: accent, font })] : [])], { spacing: { after: 20 } }));
        if (r.contact) out.push(para([run(r.contact, { size: PT(9), color: MUTED, font })], { spacing: { after: 30 } }));
      }
    }
  } else {
    // Sidebar pattern: education + awards in main if not in sidebar
    if (!cfg.sidebarSections.includes("education") && data.education.length) {
      out.push(sectionHeader("Education", accent, font));
      for (const ed of data.education) {
        out.push(new Paragraph({
          spacing: { after: 10 },
          tabStops: [{ type: TabStopType.RIGHT, position: INCH(6.5) }],
          children: [
            run(ed.degree, { bold: true, size: PT(11), font }),
            new TextRun({ text: `\t${[ed.start, ed.end].filter(Boolean).join(" – ")}`, size: PT(9), color: MUTED, font }),
          ],
        }));
        const meta = [ed.school, ed.location, ed.grade].filter(Boolean).join("  |  ");
        if (meta) out.push(para([run(meta, { size: PT(9.5), color: MUTED, font })], { spacing: { after: 40 } }));
      }
    }
    if (data.awards.length) {
      out.push(sectionHeader("Awards", accent, font));
      for (const a of data.awards) {
        out.push(para([run(a.title, { bold: true, size: PT(10), font }), ...(a.date ? [run(`  (${a.date})`, { size: PT(9), color: MUTED, font })] : [])], { spacing: { after: 20 } }));
        if (a.subtitle) out.push(para([run(a.subtitle, { size: PT(9.5), color: MUTED, font })], { spacing: { after: 30 } }));
      }
    }
    if (data.references.length) {
      out.push(sectionHeader("References", accent, font));
      for (const r of data.references) {
        out.push(para([run(r.name, { bold: true, size: PT(10), font }), ...(r.role ? [run(`, ${r.role}`, { size: PT(10), font })] : []), ...(r.company ? [run(` @ ${r.company}`, { size: PT(10), color: accent, font })] : [])], { spacing: { after: 20 } }));
        if (r.contact) out.push(para([run(r.contact, { size: PT(9), color: MUTED, font })], { spacing: { after: 30 } }));
      }
    }
  }

  // Custom sections (rendered for all patterns)
  for (const cs of data.customSections) {
    if (!cs.items.length) continue;
    out.push(sectionHeader(cs.title, accent, font));
    for (const item of cs.items) {
      out.push(para([run(item.title, { bold: true, size: PT(10), font }), ...(item.subtitle ? [run(`  —  ${item.subtitle}`, { size: PT(10), color: MUTED, font })] : []), ...(item.date ? [run(`  (${item.date})`, { size: PT(9), color: MUTED, font })] : [])], { spacing: { after: 20 } }));
      if (item.description) out.push(para([run(item.description, { size: PT(9.5) })], { spacing: { after: 30 } }));
    }
  }

  return out;
}

function buildSidebarLeft(data: ResumeData, cfg: DocxTemplateConfig): Paragraph[] {
  const sidebarChildren: Paragraph[] = [];
  for (const section of cfg.sidebarSections) {
    sidebarChildren.push(...buildSidebarSection(section, data, cfg));
  }

  const mainChildren: Paragraph[] = [];
  mainChildren.push(para([run(data.name, { bold: true, size: PT(22), font: cfg.fontFamily })], { spacing: { after: 20 } }));
  mainChildren.push(para([run(data.title, { bold: true, size: PT(12), color: cfg.headerColor, font: cfg.fontFamily })], { spacing: { after: 120 } }));
  mainChildren.push(...buildMainSections(data, cfg));

  const sidebarPct = cfg.sidebarWidthPct;
  const mainPct = 100 - sidebarPct;
  // A4 width = 8.27 inches; sidebar width in inches
  const sidebarInches = (8.27 * sidebarPct) / 100;
  const mainInches = 8.27 - sidebarInches;

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [INCH(sidebarInches), INCH(mainInches)],
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: sidebarPct, type: WidthType.PERCENTAGE },
            shading: { fill: cfg.sidebarBg, type: ShadingType.SOLID, color: cfg.sidebarBg },
            margins: { top: CM(0.8), bottom: CM(0.8), left: CM(0.6), right: CM(0.5) },
            verticalAlign: VerticalAlign.TOP,
            children: sidebarChildren,
          }),
          new TableCell({
            width: { size: mainPct, type: WidthType.PERCENTAGE },
            margins: { top: CM(0.8), bottom: CM(0.8), left: CM(0.6), right: CM(0.6) },
            verticalAlign: VerticalAlign.TOP,
            children: mainChildren,
          }),
        ],
      }),
    ],
  });
  return [table as unknown as Paragraph];
}

// ── Pattern 2: sidebar-right ─────────────────────────────

function buildSidebarRight(data: ResumeData, cfg: DocxTemplateConfig): Paragraph[] {
  // Header band first (full width)
  const headerChildren: Paragraph[] = [
    para([run(data.name, { bold: true, size: PT(22), font: cfg.fontFamily })], { align: AlignmentType.CENTER, spacing: { after: 20 } }),
  ];
  if (data.title) headerChildren.push(para([run(data.title, { size: PT(12), color: MUTED, font: cfg.fontFamily })], { align: AlignmentType.CENTER, spacing: { after: 30 } }));
  const cl = contactLine(data);
  if (cl) headerChildren.push(para([run(cl, { size: PT(9), color: MUTED, font: cfg.fontFamily })], { align: AlignmentType.CENTER, spacing: { after: 80 } }));

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { fill: cfg.sidebarBg, type: ShadingType.SOLID, color: cfg.sidebarBg },
        margins: { top: CM(0.8), bottom: CM(0.6), left: CM(1.2), right: CM(1.2) },
        children: headerChildren,
      })],
    })],
  });

  // Body: main left + sidebar right
  const sidebarChildren: Paragraph[] = [];
  for (const section of cfg.sidebarSections) {
    sidebarChildren.push(...buildSidebarSection(section, { ...data, summary: "" }, { ...cfg, sidebarText: DARK }));
  }
  const mainChildren = buildMainSections(data, cfg);

  const bodyTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [INCH(4.6), INCH(2.4)],
    borders: noBorders,
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 67, type: WidthType.PERCENTAGE },
          margins: { top: CM(0.6), bottom: CM(0.6), left: CM(0.6), right: CM(0.5) },
          verticalAlign: VerticalAlign.TOP,
          children: mainChildren,
        }),
        new TableCell({
          width: { size: 33, type: WidthType.PERCENTAGE },
          shading: { fill: "F3F4F6", type: ShadingType.SOLID, color: "F3F4F6" },
          margins: { top: CM(0.6), bottom: CM(0.6), left: CM(0.5), right: CM(0.6) },
          verticalAlign: VerticalAlign.TOP,
          children: sidebarChildren,
        }),
      ],
    })],
  });

  return [headerTable as unknown as Paragraph, bodyTable as unknown as Paragraph];
}

// ── Pattern 3: header-band ───────────────────────────────

function buildHeaderBand(data: ResumeData, cfg: DocxTemplateConfig): Paragraph[] {
  const out: Paragraph[] = [];
  // Full-width header band
  const headerChildren: Paragraph[] = [
    para([run(data.name, { bold: true, size: PT(22), font: cfg.fontFamily })], { align: AlignmentType.CENTER, spacing: { after: 20 } }),
  ];
  if (data.title) headerChildren.push(para([run(data.title, { size: PT(12), color: MUTED, font: cfg.fontFamily })], { align: AlignmentType.CENTER, spacing: { after: 30 } }));
  const cl = contactLine(data);
  if (cl) headerChildren.push(para([run(cl, { size: PT(9), color: MUTED, font: cfg.fontFamily })], { align: AlignmentType.CENTER }));

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { fill: cfg.sidebarBg, type: ShadingType.SOLID, color: cfg.sidebarBg },
        margins: { top: CM(1), bottom: CM(0.8), left: CM(1.2), right: CM(1.2) },
        children: headerChildren,
      })],
    })],
  });
  out.push(headerTable as unknown as Paragraph);
  out.push(para([run("", { size: PT(4) })], { spacing: { after: 0 } })); // spacer

  // Body: main left + sidebar right
  const sidebarChildren: Paragraph[] = [];
  for (const section of cfg.sidebarSections) {
    sidebarChildren.push(...buildSidebarSection(section, { ...data, summary: "" }, { ...cfg, sidebarText: DARK }));
  }
  const mainChildren = buildMainSections(data, cfg);

  const bodyTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [INCH(4.6), INCH(2.4)],
    borders: noBorders,
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 67, type: WidthType.PERCENTAGE },
          margins: { top: CM(0.4), bottom: CM(0.4), left: CM(0.2), right: CM(0.5) },
          verticalAlign: VerticalAlign.TOP,
          children: mainChildren,
        }),
        new TableCell({
          width: { size: 33, type: WidthType.PERCENTAGE },
          shading: { fill: "F9FAFB", type: ShadingType.SOLID, color: "F9FAFB" },
          margins: { top: CM(0.4), bottom: CM(0.4), left: CM(0.5), right: CM(0.2) },
          verticalAlign: VerticalAlign.TOP,
          children: sidebarChildren,
        }),
      ],
    })],
  });
  out.push(bodyTable as unknown as Paragraph);
  return out;
}

// ── Pattern 4: single-column ─────────────────────────────

function buildSingleColumn(data: ResumeData, cfg: DocxTemplateConfig): Paragraph[] {
  const out: Paragraph[] = [];
  const accent = cfg.headerColor;
  const font = cfg.fontFamily;

  // Header
  out.push(para([run(data.name, { bold: true, size: PT(20), font })], { align: AlignmentType.CENTER, spacing: { after: 30 } }));
  if (data.title) out.push(para([run(data.title, { size: PT(12), color: MUTED, font })], { align: AlignmentType.CENTER, spacing: { after: 30 } }));
  const cl = contactLine(data);
  if (cl) out.push(para([run(cl, { size: PT(9.5), color: MUTED, font })], { align: AlignmentType.CENTER, spacing: { after: 100 } }));

  // Executive gets a double border under header
  if (data.title) {
    out.push(new Paragraph({ border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: accent } }, spacing: { after: 100 } }));
  }

  out.push(...buildMainSections(data, cfg));
  return out;
}

// ── Dispatcher ───────────────────────────────────────────

export async function exportResumeDocx(data: ResumeData, style: TemplateStyle): Promise<void> {
  const cfg = getDocxConfig(style.template);
  let children: Paragraph[];

  switch (cfg.pattern) {
    case "sidebar-left": children = buildSidebarLeft(data, cfg); break;
    case "sidebar-right": children = buildSidebarRight(data, cfg); break;
    case "header-band": children = buildHeaderBand(data, cfg); break;
    case "single-column": children = buildSingleColumn(data, cfg); break;
    default: children = buildSidebarLeft(data, cfg); break;
  }

  // Add page breaks before major sections for long resumes (multi-page support)
  // Insert a page break before Experience if there's a lot of content before it
  const hasLongContent = data.experience.length > 2 || data.projects.length > 3;
  if (hasLongContent) {
    // Find the "Experience" section header and add pageBreakBefore
    children = children.map((p, i) => {
      // Check if this paragraph is a section header for Experience
      const text = (p as unknown as { text?: string }).text || "";
      if (/^experience$/i.test(text.trim()) && i > 5) {
        // Add pageBreakBefore to this paragraph
        return new Paragraph({
          ...(p as unknown as { options?: Record<string, unknown> }).options,
          pageBreakBefore: true,
        });
      }
      return p;
    });
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: INCH(8.27),  // A4 width
            height: INCH(11.69), // A4 height
          },
          margin: cfg.marginCm === 0
            ? { top: 0, bottom: 0, left: 0, right: 0 }
            : {
                top: CM(cfg.marginCm),
                bottom: CM(cfg.marginCm),
                left: CM(cfg.marginCm + 0.2),
                right: CM(cfg.marginCm + 0.2),
              },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.name.replace(/\s+/g, "_")}_Resume.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
