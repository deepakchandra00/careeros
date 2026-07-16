/**
 * Thumbnail Generator — screenshots every resume template at A4 ratio.
 *
 * Usage:
 *   bun run /home/z/my-project/scripts/generate-thumbnails.ts
 *
 * Output:
 *   /home/z/my-project/public/thumbnails/{template-id}.png
 *
 * Flow:
 *   1. Define a list of all templates (id + accent + font)
 *   2. For each template, build a sample resume payload (base64-encoded JSON)
 *   3. Fetch the Next.js /resume-render page with that payload
 *   4. Use Playwright to screenshot the rendered HTML at 794x1123 (A4 ratio)
 *   5. Save the PNG to /public/thumbnails/{template-id}.png
 */

import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";
const CHROME_PATH =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ||
  "/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome";
const OUT_DIR = "/home/z/my-project/public/thumbnails";

// =====================================================================
// Sample resume data — rich enough to make every template look good
// =====================================================================

const SAMPLE_RESUME = {
  name: "Aarav Mehta",
  title: "Senior Software Engineer & Product Architect",
  email: "aarav.mehta@email.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  linkedin: "linkedin.com/in/aaravmehta",
  github: "github.com/aaravmehta",
  website: "aaravmehta.dev",
  photo: "", // no photo — most templates show initials avatar
  summary:
    "Senior Software Engineer with 8+ years building scalable web platforms, design systems, and AI products. Led teams of 12+ engineers, shipped products used by 25M+ users, and reduced infra costs by 40% through architectural refactoring. Passionate about developer experience, accessibility, and mentoring.",
  experience: [
    {
      id: "e1",
      role: "Senior Software Engineer",
      company: "Razorpay",
      location: "Bengaluru",
      start: "Jan 2022",
      end: "Present",
      bullets: [
        "Architected the next-gen checkout platform handling 12M+ daily transactions with 99.99% uptime",
        "Led migration from monolith to micro-frontend architecture, cutting deploy time by 70%",
        "Mentored 8 engineers and established the frontend guild with weekly knowledge-sharing sessions",
        "Drove adoption of TypeScript and React Query across 14 teams, reducing runtime errors by 60%",
      ],
    },
    {
      id: "e2",
      role: "Software Engineer II",
      company: "Flipkart",
      location: "Bengaluru",
      start: "Jul 2019",
      end: "Dec 2021",
      bullets: [
        "Built the real-time order tracking system used by 50M+ monthly active users",
        "Optimized React bundle size by 45% using code-splitting and lazy loading strategies",
        "Created an internal design system adopted by 9 product teams across the organization",
      ],
    },
    {
      id: "e3",
      role: "Frontend Developer",
      company: "Zoho Corporation",
      location: "Chennai",
      start: "Jun 2017",
      end: "Jun 2019",
      bullets: [
        "Developed 12+ responsive web applications using React, Redux, and GraphQL",
        "Improved Lighthouse performance scores from 62 to 95+ across key product pages",
      ],
    },
  ],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "GraphQL",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Redis",
    "Python",
    "Go",
  ],
  skillLevels: {
    TypeScript: 92,
    React: 95,
    "Next.js": 90,
    "Node.js": 85,
    GraphQL: 80,
    PostgreSQL: 78,
    AWS: 75,
    Docker: 72,
  },
  projects: [
    {
      id: "p1",
      name: "AI CareerOS",
      description: "Open-source AI-powered career platform with resume builder, ATS optimization, and interview prep.",
      tech: ["Next.js", "TypeScript", "Prisma", "OpenAI"],
      link: "github.com/aaravmehta/careeros",
    },
    {
      id: "p2",
      name: "Realtime Collab Editor",
      description: "Collaborative code editor with CRDT-based conflict resolution and WebRTC peer connections.",
      tech: ["React", "WebRTC", "Yjs", "Node.js"],
      link: "collab.aaravmehta.dev",
    },
    {
      id: "p3",
      name: "Design System Lite",
      description: "Headless component library with 40+ accessible primitives, 8K+ weekly npm downloads.",
      tech: ["TypeScript", "Radix UI", "Tailwind"],
      link: "npmjs.com/package/ds-lite",
    },
  ],
  education: [
    {
      id: "ed1",
      degree: "B.Tech in Computer Science",
      school: "Indian Institute of Technology, Madras",
      location: "Chennai",
      start: "2013",
      end: "2017",
      grade: "CGPA: 8.9 / 10",
    },
  ],
  certifications: [
    { id: "c1", title: "AWS Solutions Architect — Professional", subtitle: "Amazon Web Services", description: "", date: "2023" },
    { id: "c2", title: "Certified Kubernetes Administrator (CKA)", subtitle: "Cloud Native Computing Foundation", description: "", date: "2022" },
  ],
  languages: ["English (Fluent)", "Hindi (Native)", "Tamil (Conversational)"],
  awards: [
    { id: "a1", title: "Engineering Excellence Award", subtitle: "Razorpay", description: "Top 1% of 1200+ engineers", date: "2023" },
    { id: "a2", title: "Open Source Contributor of the Year", subtitle: "GitHub India", description: "", date: "2022" },
  ],
  publications: [
    { id: "pub1", title: "Scaling React Apps to Millions of Users", subtitle: "freeCodeCamp", description: "", date: "2023" },
  ],
  interests: ["System Design", "Open Source", "Mentoring", "Chess", "Trekking"],
  references: [],
  customSections: [
    {
      id: "cs1",
      title: "Talks & Workshops",
      items: [
        { id: "cs1i1", title: "Building Resilient Frontends at Scale", subtitle: "ReactConf India 2023", description: "500+ attendees", date: "2023" },
        { id: "cs1i2", title: "Design Systems Workshop", subtitle: "JSConf Bengaluru", description: "Hands-on workshop", date: "2022" },
      ],
    },
  ],
  sectionOrder: [
    "personal",
    "summary",
    "experience",
    "skills",
    "projects",
    "education",
    "certifications",
    "languages",
    "awards",
    "publications",
    "interests",
    "references",
  ],
};

// =====================================================================
// All templates that need thumbnails
// =====================================================================

interface ThumbSpec {
  id: string;
  accent: string;
  font: "sans" | "serif" | "mono";
}

const TEMPLATES: ThumbSpec[] = [
  // Base templates (13)
  { id: "modern", accent: "#10b981", font: "sans" },
  { id: "ats", accent: "#374151", font: "sans" },
  { id: "executive", accent: "#b45309", font: "serif" },
  { id: "minimal", accent: "#0f172a", font: "sans" },
  { id: "software-engineer", accent: "#1e293b", font: "sans" },
  { id: "academic", accent: "#374151", font: "serif" },
  { id: "creative", accent: "#ea580c", font: "sans" },
  { id: "web-developer", accent: "#f97316", font: "sans" },
  { id: "ux-designer", accent: "#1e3a5f", font: "sans" },
  { id: "teacher", accent: "#eab308", font: "sans" },
  { id: "product-manager", accent: "#059669", font: "sans" },
  { id: "finance", accent: "#1f2937", font: "sans" },
  { id: "business-analyst", accent: "#1e3a5f", font: "sans" },

  // Premium templates (14)
  { id: "premium-purple-executive", accent: "#7c3aed", font: "sans" },
  { id: "premium-brown-classic", accent: "#92400e", font: "serif" },
  { id: "premium-peach-modern", accent: "#fb923c", font: "sans" },
  { id: "premium-warm-professional", accent: "#a16207", font: "sans" },
  { id: "premium-earth-premium", accent: "#854d0e", font: "serif" },
  { id: "premium-pink-geometric", accent: "#ec4899", font: "sans" },
  { id: "premium-rose-elegant", accent: "#f43f5e", font: "serif" },
  { id: "premium-foundation-purple", accent: "#6d28d9", font: "sans" },
  { id: "premium-blue-sidebar", accent: "#1d4ed8", font: "sans" },
  { id: "premium-aspire-teal", accent: "#0d9488", font: "sans" },
  { id: "premium-canva-pink-blue", accent: "#e11d48", font: "sans" },
  { id: "premium-college-teal", accent: "#0d9488", font: "sans" },
  { id: "premium-combined-blue", accent: "#1e40af", font: "sans" },
  { id: "premium-navy-yellow", accent: "#1e3a5f", font: "sans" },

  // Pro designer templates (16)
  { id: "stanford", accent: "#0f766e", font: "sans" },
  { id: "harvard", accent: "#b8860b", font: "serif" },
  { id: "silicon-valley", accent: "#10b981", font: "mono" },
  { id: "manhattan", accent: "#0f172a", font: "sans" },
  { id: "prague", accent: "#7c3aed", font: "sans" },
  { id: "tokyo", accent: "#e11d48", font: "sans" },
  { id: "oxford", accent: "#1e3a5f", font: "serif" },
  { id: "berlin", accent: "#f59e0b", font: "sans" },
  { id: "miami", accent: "#fb7185", font: "sans" },
  { id: "seoul", accent: "#22c55e", font: "mono" },
  { id: "dubai", accent: "#c5a572", font: "serif" },
  { id: "singapore", accent: "#0891b2", font: "sans" },
  { id: "stockholm", accent: "#475569", font: "sans" },
  { id: "mumbai", accent: "#ea580c", font: "sans" },
  { id: "toronto", accent: "#1e40af", font: "sans" },
  { id: "sydney", accent: "#14b8a6", font: "sans" },

  // Tech / Futuristic templates (6)
  { id: "quantum", accent: "#06b6d4", font: "sans" },
  { id: "nebula", accent: "#10b981", font: "sans" },
  { id: "cyber", accent: "#3b82f6", font: "mono" },
  { id: "voltage", accent: "#fb7185", font: "sans" },
  { id: "synthwave", accent: "#ec4899", font: "sans" },
  { id: "hologram", accent: "#a78bfa", font: "sans" },

  // Luxury / Editorial templates (6)
  { id: "vogue", accent: "#c5a572", font: "serif" },
  { id: "maison", accent: "#c5a572", font: "serif" },
  { id: "atelier", accent: "#5b1a1a", font: "serif" },
  { id: "riviera", accent: "#0f3460", font: "serif" },
  { id: "noir", accent: "#10b981", font: "serif" },
  { id: "heritage", accent: "#c5a572", font: "serif" },
];

// =====================================================================
// Thumbnail generation logic
// =====================================================================

async function generateThumbnail(
  browser: import("playwright-core").Browser,
  spec: ThumbSpec,
): Promise<{ id: string; ok: boolean; error?: string; size?: number }> {
  const data = SAMPLE_RESUME;
  const style = { template: spec.id, accent: spec.accent, font: spec.font };

  const dataB64 = Buffer.from(JSON.stringify(data)).toString("base64");
  const styleB64 = Buffer.from(JSON.stringify(style)).toString("base64");
  const url = `${APP_ORIGIN}/resume-render?d=${dataB64}&s=${styleB64}`;

  const context = await browser.newContext({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    if (!response || !response.ok()) {
      return { id: spec.id, ok: false, error: `HTTP ${response?.status() ?? "no response"}` };
    }
    // Small delay to ensure fonts/images settle
    await page.waitForTimeout(800);

    const outPath = `${OUT_DIR}/${spec.id}.png`;
    await page.screenshot({
      path: outPath,
      type: "png",
      fullPage: false,
      clip: { x: 0, y: 0, width: 794, height: 1123 },
    });

    const size = existsSync(outPath) ? (await import("node:fs/promises")).stat(outPath).then(s => s.size) : 0;
    return { id: spec.id, ok: true, size: await size };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { id: spec.id, ok: false, error: msg.slice(0, 200) };
  } finally {
    await page.close();
    await context.close();
  }
}

async function main() {
  console.log(`[thumb-gen] output dir: ${OUT_DIR}`);
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  // Filter by argv if specified: `bun run script.ts stanford harvard`
  const argv = process.argv.slice(2);
  const specs = argv.length > 0 ? TEMPLATES.filter(t => argv.includes(t.id)) : TEMPLATES;
  console.log(`[thumb-gen] generating ${specs.length} thumbnails`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  const results: { ok: number; fail: number; failed: string[] } = { ok: 0, fail: 0, failed: [] };
  // Run 3 at a time to balance speed vs stability
  const BATCH_SIZE = 3;
  for (let i = 0; i < specs.length; i += BATCH_SIZE) {
    const batch = specs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(s => generateThumbnail(browser, s)));
    for (const r of batchResults) {
      if (r.ok) {
        results.ok++;
        console.log(`  ✓ ${r.id} (${r.size ? (r.size / 1024).toFixed(1) : "?"} KB)`);
      } else {
        results.fail++;
        results.failed.push(r.id);
        console.log(`  ✗ ${r.id}: ${r.error}`);
      }
    }
  }

  await browser.close();
  console.log(`\n[thumb-gen] done: ${results.ok} ok, ${results.fail} failed`);
  if (results.failed.length > 0) {
    console.log(`[thumb-gen] failed: ${results.failed.join(", ")}`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error("[thumb-gen] fatal:", e);
  process.exit(1);
});
