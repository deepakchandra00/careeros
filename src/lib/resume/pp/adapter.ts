// Adapter: convert our CareerOS ResumeData (from resume-store) → PagePerfect
// Resume schema. Keeps the PagePerfect engine decoupled from our store shape.

import type { ResumeData } from "@/store/resume-store";
import type { Resume, SkillGroup } from "./schema";

export function toPagePerfectResume(data: ResumeData): Resume {
  // Our store has flat skills[] + skillLevels{}. PagePerfect wants grouped
  // skills. Put all skills into a single "Skills" category.
  const skills: SkillGroup[] =
    data.skills.length > 0
      ? [{ category: "Skills", items: data.skills }]
      : [];

  return {
    profile: {
      fullName: data.name,
      headline: data.title,
      email: data.email,
      phone: data.phone,
      location: data.location,
      website: data.website,
      links: [
        data.linkedin ? { label: "LinkedIn", url: data.linkedin } : null,
        data.github ? { label: "GitHub", url: data.github } : null,
      ].filter((l): l is { label: string; url: string } => Boolean(l && l.url)),
      photo: data.photo,
    },
    summary: data.summary,
    experience: data.experience.map((x) => ({
      company: x.company,
      role: x.role,
      location: x.location,
      start: x.start,
      end: x.end,
      current: x.end?.toLowerCase() === "present" || false,
      summary: "",
      bullets: x.bullets,
      tech: [],
    })),
    projects: data.projects.map((p) => ({
      name: p.name,
      role: "",
      url: p.link,
      description: p.description,
      bullets: [],
      tech: p.tech,
    })),
    education: data.education.map((e) => ({
      school: e.school,
      degree: e.degree,
      field: "",
      location: e.location,
      start: e.start,
      end: e.end,
      gpa: e.grade,
      notes: "",
    })),
    skills,
    certifications: data.certifications.map((c) => ({
      name: c.title,
      issuer: c.subtitle,
      date: c.date,
      url: "",
    })),
    languages: data.languages.map((l) => ({ name: l, level: "" })),
    awards: data.awards.map((a) => ({
      title: a.title,
      issuer: a.subtitle,
      date: a.date,
      description: a.description,
    })),
    publications: data.publications.map((p) => ({
      title: p.title,
      publisher: p.subtitle,
      date: p.date,
      url: "",
      description: p.description,
    })),
    references: data.references.map((r) => ({
      name: r.name,
      role: r.role,
      company: r.company,
      email: r.contact,
      phone: "",
    })),
    interests: data.interests,
  };
}
