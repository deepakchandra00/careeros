"use client";

import { create } from "zustand";

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  tech: string[];
  link: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
  grade: string;
}

export interface SimpleItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  role: string;
  company: string;
  contact: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: SimpleItem[];
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  photo: string; // base64 data URL (empty = no photo)
  summary: string;
  experience: ExperienceItem[];
  skills: string[];
  skillLevels: Record<string, number>; // skill name -> 0-100 (for skill bar templates)
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: SimpleItem[];
  languages: string[];
  awards: SimpleItem[];
  publications: SimpleItem[];
  interests: string[];
  references: ReferenceItem[];
  customSections: CustomSection[];
  sectionOrder: string[];
}

export type SectionId =
  | "personal"
  | "summary"
  | "experience"
  | "skills"
  | "projects"
  | "education"
  | "certifications"
  | "languages"
  | "awards"
  | "publications"
  | "interests"
  | "references";

export interface TemplateStyle {
  template: string;
  accent: string;
  font: string; // "sans" | "serif" | "mono"
}

export interface PageLayout {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

const DEFAULT_PAGE_LAYOUT: PageLayout = {
  paddingTop: 40,
  paddingBottom: 40,
  paddingLeft: 0,
  paddingRight: 0,
};

/** Per-section layout settings — controlled from the editor toolbar. */
export interface SectionSettings {
  /** When true, the section's content stays together on a single page (no splits). */
  keepTogether: boolean;
  /** When true, the section always starts on a new page (manual page break). */
  startOnNewPage: boolean;
}

const DEFAULT_SECTION_SETTINGS: SectionSettings = {
  keepTogether: false,
  startOnNewPage: false,
};

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_RESUME: ResumeData = {
  name: "Deepak Sharma",
  title: "Senior Frontend Engineer",
  email: "deepak.sharma@email.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  linkedin: "linkedin.com/in/deepaksharma",
  github: "github.com/deepaksharma",
  website: "deepaksharma.dev",
  photo: "",
  summary:
    "Frontend Engineer with 6+ years building performant, accessible web applications at scale. Specialized in React, Next.js, and design systems. Shipped products used by 10M+ users.",
  experience: [
    {
      id: "e1",
      role: "Senior Frontend Engineer",
      company: "Razorpay",
      location: "Bengaluru",
      start: "2022",
      end: "Present",
      bullets: [
        "Developed React app.",
        "Led migration from CRA to Next.js 14, cutting build time by 60%.",
        "Built design system adopted by 8 product teams.",
      ],
    },
    {
      id: "e2",
      role: "Frontend Engineer",
      company: "Swiggy",
      location: "Bengaluru",
      start: "2019",
      end: "2022",
      bullets: [
        "Built real-time order tracking used by 5M+ daily users.",
        "Optimized LCP from 4.2s to 1.8s across the consumer app.",
      ],
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
    "GraphQL",
    "Redux Toolkit",
    "Jest",
    "Cypress",
    "Figma",
  ],
  skillLevels: {
    React: 92,
    TypeScript: 88,
    "Next.js": 90,
    "Tailwind CSS": 85,
    "Node.js": 78,
    GraphQL: 72,
    "Redux Toolkit": 80,
    Jest: 75,
  },
  projects: [
    {
      id: "p1",
      name: "DevMetrics",
      description:
        "Open-source analytics dashboard for developer productivity, 2.4k GitHub stars.",
      tech: ["Next.js", "Prisma", "PostgreSQL", "Recharts"],
      link: "github.com/deepaksharma/devmetrics",
    },
    {
      id: "p2",
      name: "PixelPuzzle",
      description: "Browser-based collaborative jigsaw game with WebRTC.",
      tech: ["React", "WebRTC", "Canvas API"],
      link: "",
    },
  ],
  education: [
    {
      id: "ed1",
      degree: "B.Tech, Computer Science",
      school: "BITS Pilani",
      location: "Pilani",
      start: "2015",
      end: "2019",
      grade: "8.7 CGPA",
    },
  ],
  certifications: [
    {
      id: "c1",
      title: "AWS Certified Developer Associate",
      subtitle: "Amazon Web Services",
      description: "",
      date: "2023",
    },
    {
      id: "c2",
      title: "Meta Frontend Professional",
      subtitle: "Meta / Coursera",
      description: "",
      date: "2022",
    },
  ],
  languages: ["English", "Hindi", "Kannada"],
  awards: [
    {
      id: "a1",
      title: "Spot Award",
      subtitle: "Razorpay",
      description: "Recognized for leading the Next.js migration initiative.",
      date: "2023",
    },
  ],
  publications: [],
  interests: ["Open Source", "UI/UX Design", "Chess", "Long-distance running"],
  references: [],
  customSections: [],
  sectionOrder: ["personal", "summary", "experience", "skills", "projects", "education", "certifications", "languages", "awards", "publications", "interests", "references"],
};

const STORAGE_KEY = "careeros-resume-v2";
const STYLE_KEY = "careeros-resume-style-v2";
const PAGE_BREAKS_KEY = "careeros-page-breaks-v1";
const SECTION_SETTINGS_KEY = "careeros-section-settings-v1";

function loadStored(): ResumeData {
  if (typeof window === "undefined") return DEFAULT_RESUME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RESUME;
    const parsed = JSON.parse(raw) as Partial<ResumeData>;
    // merge with defaults to guarantee all keys exist
    return { ...DEFAULT_RESUME, ...parsed };
  } catch {
    return DEFAULT_RESUME;
  }
}

function loadStyle(): TemplateStyle {
  if (typeof window === "undefined")
    return { template: "modern", accent: "#10b981", font: "sans" };
  try {
    const raw = localStorage.getItem(STYLE_KEY);
    if (!raw) return { template: "modern", accent: "#10b981", font: "sans" };
    return JSON.parse(raw) as TemplateStyle;
  } catch {
    return { template: "modern", accent: "#10b981", font: "sans" };
  }
}

interface ResumeStore {
  data: ResumeData;
  style: TemplateStyle;
  pageLayout: PageLayout;
  /** Section IDs that should start on a new page (manual page breaks). */
  pageBreaks: string[];
  /** Per-section layout settings (keepTogether, startOnNewPage). */
  sectionSettings: Record<string, SectionSettings>;
  hydrated: boolean;
  hydrate: () => void;
  setData: (d: ResumeData) => void;
  setStyle: (s: Partial<TemplateStyle>) => void;
  setPageLayout: (p: Partial<PageLayout>) => void;
  resetPageLayout: () => void;
  // Page breaks (manual)
  addPageBreak: (sectionId: string) => void;
  removePageBreak: (sectionId: string) => void;
  togglePageBreak: (sectionId: string) => void;
  // Section settings (keep together / start on new page)
  toggleKeepTogether: (sectionId: string) => void;
  toggleStartOnNewPage: (sectionId: string) => void;
  getSectionSettings: (sectionId: string) => SectionSettings;
  update: (patch: Partial<ResumeData>) => void;
  updateSummary: (s: string) => void;
  updateBullet: (expId: string, idx: number, text: string) => void;
  setSkills: (s: string[]) => void;
  setPhoto: (dataUrl: string) => void;
  setSkillLevel: (skill: string, level: number) => void;
  reset: () => void;
  // generic item ops
  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  duplicateExperience: (id: string) => void;
  addBullet: (expId: string) => void;
  removeBullet: (expId: string, idx: number) => void;
  addProject: () => void;
  updateProject: (id: string, patch: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;
  addSimple: (
    key: "certifications" | "awards" | "publications"
  ) => void;
  updateSimple: (
    key: "certifications" | "awards" | "publications",
    id: string,
    patch: Partial<SimpleItem>
  ) => void;
  removeSimple: (
    key: "certifications" | "awards" | "publications",
    id: string
  ) => void;
  setTagList: (key: "languages" | "interests", values: string[]) => void;
  addReference: () => void;
  updateReference: (id: string, patch: Partial<ReferenceItem>) => void;
  removeReference: (id: string) => void;
  addCustomSection: (title: string) => void;
  updateCustomSection: (id: string, patch: Partial<CustomSection>) => void;
  removeCustomSection: (id: string) => void;
  addCustomItem: (sectionId: string) => void;
  updateCustomItem: (sectionId: string, itemId: string, patch: Partial<SimpleItem>) => void;
  removeCustomItem: (sectionId: string, itemId: string) => void;
  moveExperience: (fromIdx: number, toIdx: number) => void;
  moveProject: (fromIdx: number, toIdx: number) => void;
  moveEducation: (fromIdx: number, toIdx: number) => void;
  moveBullet: (expId: string, fromIdx: number, toIdx: number) => void;
  moveCustomItem: (sectionId: string, fromIdx: number, toIdx: number) => void;
  setSectionOrder: (order: string[]) => void;
}

function persist(data: ResumeData) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }
}

function persistStyle(style: TemplateStyle) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STYLE_KEY, JSON.stringify(style));
    } catch {}
  }
}

const PAGE_LAYOUT_KEY = "careeros-page-layout-v1";

function loadPageLayout(): PageLayout {
  if (typeof window === "undefined") return DEFAULT_PAGE_LAYOUT;
  try {
    const raw = localStorage.getItem(PAGE_LAYOUT_KEY);
    if (!raw) return DEFAULT_PAGE_LAYOUT;
    return { ...DEFAULT_PAGE_LAYOUT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PAGE_LAYOUT;
  }
}

function persistPageLayout(layout: PageLayout) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PAGE_LAYOUT_KEY, JSON.stringify(layout));
    } catch {}
  }
}

function loadPageBreaks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PAGE_BREAKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function persistPageBreaks(breaks: string[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PAGE_BREAKS_KEY, JSON.stringify(breaks));
    } catch {}
  }
}

function loadSectionSettings(): Record<string, SectionSettings> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SECTION_SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SectionSettings>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistSectionSettings(settings: Record<string, SectionSettings>) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SECTION_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  data: DEFAULT_RESUME,
  style: { template: "modern", accent: "#10b981", font: "sans" },
  pageLayout: DEFAULT_PAGE_LAYOUT,
  pageBreaks: [],
  sectionSettings: {},
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({
      data: loadStored(),
      style: loadStyle(),
      pageLayout: loadPageLayout(),
      pageBreaks: loadPageBreaks(),
      sectionSettings: loadSectionSettings(),
      hydrated: true,
    });
  },
  setData: (d) => {
    persist(d);
    set({ data: d });
  },
  setStyle: (s) => {
    const next = { ...get().style, ...s };
    persistStyle(next);
    set({ style: next });
  },
  setPageLayout: (p) => {
    const next = { ...get().pageLayout, ...p };
    persistPageLayout(next);
    set({ pageLayout: next });
  },
  resetPageLayout: () => {
    persistPageLayout(DEFAULT_PAGE_LAYOUT);
    set({ pageLayout: DEFAULT_PAGE_LAYOUT });
  },
  addPageBreak: (sectionId) => {
    if (get().pageBreaks.includes(sectionId)) return;
    const next = [...get().pageBreaks, sectionId];
    persistPageBreaks(next);
    set({ pageBreaks: next });
  },
  removePageBreak: (sectionId) => {
    const next = get().pageBreaks.filter((id) => id !== sectionId);
    persistPageBreaks(next);
    set({ pageBreaks: next });
  },
  togglePageBreak: (sectionId) => {
    const exists = get().pageBreaks.includes(sectionId);
    const next = exists
      ? get().pageBreaks.filter((id) => id !== sectionId)
      : [...get().pageBreaks, sectionId];
    persistPageBreaks(next);
    set({ pageBreaks: next });
  },
  toggleKeepTogether: (sectionId) => {
    const current = get().sectionSettings[sectionId] ?? DEFAULT_SECTION_SETTINGS;
    const next = { ...get().sectionSettings, [sectionId]: { ...current, keepTogether: !current.keepTogether } };
    persistSectionSettings(next);
    set({ sectionSettings: next });
  },
  toggleStartOnNewPage: (sectionId) => {
    const current = get().sectionSettings[sectionId] ?? DEFAULT_SECTION_SETTINGS;
    const next = { ...get().sectionSettings, [sectionId]: { ...current, startOnNewPage: !current.startOnNewPage } };
    persistSectionSettings(next);
    set({ sectionSettings: next });
  },
  getSectionSettings: (sectionId) => {
    return get().sectionSettings[sectionId] ?? DEFAULT_SECTION_SETTINGS;
  },
  update: (patch) => {
    const d = { ...get().data, ...patch };
    persist(d);
    set({ data: d });
  },
  updateSummary: (s) => {
    const d = { ...get().data, summary: s };
    persist(d);
    set({ data: d });
  },
  updateBullet: (expId, idx, text) => {
    const d = {
      ...get().data,
      experience: get().data.experience.map((e) =>
        e.id === expId
          ? { ...e, bullets: e.bullets.map((b, i) => (i === idx ? text : b)) }
          : e
      ),
    };
    persist(d);
    set({ data: d });
  },
  setSkills: (s) => {
    const d = { ...get().data, skills: s };
    persist(d);
    set({ data: d });
  },
  setPhoto: (dataUrl) => {
    const d = { ...get().data, photo: dataUrl };
    persist(d);
    set({ data: d });
  },
  setSkillLevel: (skill, level) => {
    const d = {
      ...get().data,
      skillLevels: { ...get().data.skillLevels, [skill]: level },
    };
    persist(d);
    set({ data: d });
  },
  reset: () => {
    persist(DEFAULT_RESUME);
    persistPageBreaks([]);
    persistSectionSettings({});
    set({ data: DEFAULT_RESUME, pageBreaks: [], sectionSettings: {} });
  },
  addExperience: () => {
    const newExp: ExperienceItem = {
      id: uid(),
      role: "New Role",
      company: "Company",
      location: "",
      start: "",
      end: "",
      bullets: ["Describe your impact…"],
    };
    const d = { ...get().data, experience: [...get().data.experience, newExp] };
    persist(d);
    set({ data: d });
  },
  updateExperience: (id, patch) => {
    const d = {
      ...get().data,
      experience: get().data.experience.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    };
    persist(d);
    set({ data: d });
  },
  removeExperience: (id) => {
    const d = {
      ...get().data,
      experience: get().data.experience.filter((e) => e.id !== id),
    };
    persist(d);
    set({ data: d });
  },
  duplicateExperience: (id) => {
    const exp = get().data.experience.find((e) => e.id === id);
    if (!exp) return;
    const copy = { ...exp, id: uid(), bullets: [...exp.bullets] };
    const idx = get().data.experience.findIndex((e) => e.id === id);
    const list = [...get().data.experience];
    list.splice(idx + 1, 0, copy);
    const d = { ...get().data, experience: list };
    persist(d);
    set({ data: d });
  },
  addBullet: (expId) => {
    const d = {
      ...get().data,
      experience: get().data.experience.map((e) =>
        e.id === expId ? { ...e, bullets: [...e.bullets, "New bullet"] } : e
      ),
    };
    persist(d);
    set({ data: d });
  },
  removeBullet: (expId, idx) => {
    const d = {
      ...get().data,
      experience: get().data.experience.map((e) =>
        e.id === expId
          ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) }
          : e
      ),
    };
    persist(d);
    set({ data: d });
  },
  addProject: () => {
    const np: ProjectItem = {
      id: uid(),
      name: "New Project",
      description: "What it does and your impact.",
      tech: [],
      link: "",
    };
    const d = { ...get().data, projects: [...get().data.projects, np] };
    persist(d);
    set({ data: d });
  },
  updateProject: (id, patch) => {
    const d = {
      ...get().data,
      projects: get().data.projects.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    };
    persist(d);
    set({ data: d });
  },
  removeProject: (id) => {
    const d = {
      ...get().data,
      projects: get().data.projects.filter((p) => p.id !== id),
    };
    persist(d);
    set({ data: d });
  },
  addEducation: () => {
    const ne: EducationItem = {
      id: uid(),
      degree: "Degree",
      school: "School",
      location: "",
      start: "",
      end: "",
      grade: "",
    };
    const d = { ...get().data, education: [...get().data.education, ne] };
    persist(d);
    set({ data: d });
  },
  updateEducation: (id, patch) => {
    const d = {
      ...get().data,
      education: get().data.education.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    };
    persist(d);
    set({ data: d });
  },
  removeEducation: (id) => {
    const d = {
      ...get().data,
      education: get().data.education.filter((e) => e.id !== id),
    };
    persist(d);
    set({ data: d });
  },
  addSimple: (key) => {
    const item: SimpleItem = {
      id: uid(),
      title: "New entry",
      subtitle: "",
      description: "",
      date: "",
    };
    const d = { ...get().data, [key]: [...get().data[key], item] } as ResumeData;
    persist(d);
    set({ data: d });
  },
  updateSimple: (key, id, patch) => {
    const d = {
      ...get().data,
      [key]: (get().data[key] as SimpleItem[]).map((it) =>
        it.id === id ? { ...it, ...patch } : it
      ),
    } as ResumeData;
    persist(d);
    set({ data: d });
  },
  removeSimple: (key, id) => {
    const d = {
      ...get().data,
      [key]: (get().data[key] as SimpleItem[]).filter((it) => it.id !== id),
    } as ResumeData;
    persist(d);
    set({ data: d });
  },
  setTagList: (key, values) => {
    const d = { ...get().data, [key]: values } as ResumeData;
    persist(d);
    set({ data: d });
  },
  addReference: () => {
    const r: ReferenceItem = {
      id: uid(),
      name: "Name",
      role: "Role",
      company: "Company",
      contact: "email / phone",
    };
    const d = { ...get().data, references: [...get().data.references, r] };
    persist(d);
    set({ data: d });
  },
  updateReference: (id, patch) => {
    const d = {
      ...get().data,
      references: get().data.references.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    };
    persist(d);
    set({ data: d });
  },
  removeReference: (id) => {
    const d = {
      ...get().data,
      references: get().data.references.filter((r) => r.id !== id),
    };
    persist(d);
    set({ data: d });
  },
  addCustomSection: (title) => {
    const section: CustomSection = { id: uid(), title, items: [] };
    const d = { ...get().data, customSections: [...get().data.customSections, section] };
    persist(d);
    set({ data: d });
  },
  updateCustomSection: (id, patch) => {
    const d = {
      ...get().data,
      customSections: get().data.customSections.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    };
    persist(d);
    set({ data: d });
  },
  removeCustomSection: (id) => {
    const d = {
      ...get().data,
      customSections: get().data.customSections.filter((s) => s.id !== id),
    };
    persist(d);
    set({ data: d });
  },
  addCustomItem: (sectionId) => {
    const item: SimpleItem = { id: uid(), title: "New entry", subtitle: "", description: "", date: "" };
    const d = {
      ...get().data,
      customSections: get().data.customSections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, item] } : s
      ),
    };
    persist(d);
    set({ data: d });
  },
  updateCustomItem: (sectionId, itemId, patch) => {
    const d = {
      ...get().data,
      customSections: get().data.customSections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : s
      ),
    };
    persist(d);
    set({ data: d });
  },
  removeCustomItem: (sectionId, itemId) => {
    const d = {
      ...get().data,
      customSections: get().data.customSections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((it) => it.id !== itemId) }
          : s
      ),
    };
    persist(d);
    set({ data: d });
  },
  moveExperience: (fromIdx, toIdx) => {
    const list = [...get().data.experience];
    if (fromIdx < 0 || fromIdx >= list.length || toIdx < 0 || toIdx >= list.length) return;
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    const d = { ...get().data, experience: list };
    persist(d);
    set({ data: d });
  },
  moveProject: (fromIdx, toIdx) => {
    const list = [...get().data.projects];
    if (fromIdx < 0 || fromIdx >= list.length || toIdx < 0 || toIdx >= list.length) return;
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    const d = { ...get().data, projects: list };
    persist(d);
    set({ data: d });
  },
  moveEducation: (fromIdx, toIdx) => {
    const list = [...get().data.education];
    if (fromIdx < 0 || fromIdx >= list.length || toIdx < 0 || toIdx >= list.length) return;
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    const d = { ...get().data, education: list };
    persist(d);
    set({ data: d });
  },
  moveBullet: (expId, fromIdx, toIdx) => {
    const exp = get().data.experience.find((e) => e.id === expId);
    if (!exp) return;
    const bullets = [...exp.bullets];
    if (fromIdx < 0 || fromIdx >= bullets.length || toIdx < 0 || toIdx >= bullets.length) return;
    const [item] = bullets.splice(fromIdx, 1);
    bullets.splice(toIdx, 0, item);
    const d = {
      ...get().data,
      experience: get().data.experience.map((e) =>
        e.id === expId ? { ...e, bullets } : e
      ),
    };
    persist(d);
    set({ data: d });
  },
  moveCustomItem: (sectionId, fromIdx, toIdx) => {
    const section = get().data.customSections.find((s) => s.id === sectionId);
    if (!section) return;
    const items = [...section.items];
    if (fromIdx < 0 || fromIdx >= items.length || toIdx < 0 || toIdx >= items.length) return;
    const [item] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, item);
    const d = {
      ...get().data,
      customSections: get().data.customSections.map((s) =>
        s.id === sectionId ? { ...s, items } : s
      ),
    };
    persist(d);
    set({ data: d });
  },
  setSectionOrder: (order) => {
    const d = { ...get().data, sectionOrder: order };
    persist(d);
    set({ data: d });
  },
}));
