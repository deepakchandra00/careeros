/**
 * Seed Supabase database with demo data via the PostgREST API.
 * Uses the service_role key to bypass RLS.
 */

const SUPABASE_URL = "https://ryhfjtbvkhoqujpumfpn.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5aGZqdGJ2a2hvcXVqcHVtZnBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NDEzMSwiZXhwIjoyMDk5NzUwMTMxfQ.bVwmmT4eOdWdE3P2T_Z9XgE70SyhKx8RX6gBCHaPo8Y";

import bcrypt from "bcryptjs";

async function insert(table: string, rows: Record<string, unknown>[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify(rows),
  });
  const text = await res.text();
  if (!res.ok) {
    console.log(`  ✗ ${table}: ${res.status} ${text.slice(0, 200)}`);
    return null;
  }
  const data = JSON.parse(text);
  console.log(`  ✓ ${table}: ${data.length} rows inserted`);
  return data;
}

async function main() {
  console.log("=== Seeding Supabase database ===\n");

  // 1. Create demo users with hashed passwords
  console.log("1. Creating users...");
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const adminHash = await bcrypt.hash("admin1234", 10);
  const now = new Date().toISOString();

  const users = await insert("User", [
    {
      id: "user-demo-001",
      name: "Demo User",
      email: "demo@careeros.com",
      password: passwordHash,
      role: "JOBSEEKER",
      plan: "PRO",
      onboarded: true,
      updatedAt: now,
    },
    {
      id: "user-deepak-001",
      name: "Deepak Chandra",
      email: "deepak@careeros.com",
      password: passwordHash,
      role: "JOBSEEKER",
      plan: "FREE",
      onboarded: true,
      updatedAt: now,
    },
    {
      id: "user-aarav-001",
      name: "Aarav Mehta",
      email: "aarav@careeros.com",
      password: passwordHash,
      role: "JOBSEEKER",
      plan: "PRO",
      onboarded: true,
      updatedAt: now,
    },
    {
      id: "user-recruiter-001",
      name: "Priya Sharma",
      email: "priya@careeros.com",
      password: adminHash,
      role: "RECRUITER",
      plan: "TEAM",
      onboarded: true,
      updatedAt: now,
    },
    {
      id: "user-admin-001",
      name: "Admin User",
      email: "admin@careeros.com",
      password: adminHash,
      role: "ADMIN",
      plan: "TEAM",
      onboarded: true,
      updatedAt: now,
    },
  ]);

  if (!users) {
    console.log("Failed to create users. Aborting.");
    return;
  }

  // 2. Create resume data for the demo users
  console.log("\n2. Creating resume data...");
  const deepakResume = {
    name: "Deepak Chandra",
    title: "Technical Lead | React Architect | Frontend Architect",
    email: "deepakchandra076@gmail.com",
    phone: "+91 85 05 94 51 23",
    location: "Bangalore, India",
    linkedin: "linkedin.com/in/deepakchandra0",
    github: "github.com/DeepakChandra0",
    website: "",
    photo: "",
    summary: "Technical Lead with 12+ years of experience designing and delivering enterprise-grade web applications using React.js, Next.js, TypeScript, and Tailwind CSS. Proven expertise in front-end architecture, component-driven design, performance optimization, and mentoring teams.",
    experience: [
      {
        id: "exp1",
        role: "Technical Lead",
        company: "Onward Technologies (Client: Caterpillar)",
        location: "Bangalore, India",
        start: "Jan 2023",
        end: "Present",
        bullets: [
          "Frontend Technical Lead for Caterpillar's enterprise CSR eCommerce platform",
          "Led a frontend engineering team, providing technical leadership and mentoring",
          "Architected scalable frontend solutions using React.js, Next.js, TypeScript, Redux Toolkit",
          "Optimized application performance, reducing page load time by 35%",
        ],
      },
      {
        id: "exp2",
        role: "Senior Software Engineer",
        company: "Cams Data (Client: Cargill)",
        location: "Bangalore, India",
        start: "Sep 2021",
        end: "Jan 2023",
        bullets: [
          "Engineered E-idex, an enterprise multi-location operator dashboard",
          "Designed reusable, scalable UI components improving development efficiency",
          "Integrated enterprise applications with Azure and AWS cloud services",
        ],
      },
      {
        id: "exp3",
        role: "Front-End Developer",
        company: "Data Analytics Services",
        location: "Bangalore, India",
        start: "Nov 2017",
        end: "Sep 2021",
        bullets: [
          "Developed Scikiq, a self-service data visualization platform",
          "Delivered RPA dashboards for finance and retail clients",
          "Built reusable frontend modules for charts and reporting",
        ],
      },
    ],
    skills: [
      "React.js", "Next.js", "TypeScript", "JavaScript", "Redux Toolkit",
      "Tailwind CSS", "Material UI", "Node.js", "GraphQL", "REST APIs",
      "AWS", "Azure", "Docker", "CI/CD", "Playwright", "Jest",
    ],
    skillLevels: {},
    projects: [
      {
        id: "proj1",
        name: "CAT eCommerce Portal",
        description: "Dealer-exclusive CSR eCommerce platform for Caterpillar's global parts distribution",
        tech: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL"],
        link: "parts.cat.com",
      },
      {
        id: "proj2",
        name: "TechHealth (Cargill)",
        description: "Enterprise healthcare platform for monitoring employee health and wellness",
        tech: ["React.js", "Redux", "TypeScript", "Material UI", "Python APIs"],
        link: "",
      },
      {
        id: "proj3",
        name: "E-idex",
        description: "Enterprise dashboard for monitoring operational KPIs across manufacturing locations",
        tech: ["React.js", "Redux", "TypeScript", "Material UI"],
        link: "",
      },
    ],
    education: [
      {
        id: "edu1",
        degree: "Bachelor in Computer Applications",
        school: "AN College, Patna",
        location: "Patna, India",
        start: "2008",
        end: "2011",
        grade: "",
      },
    ],
    certifications: [],
    languages: ["English", "Hindi"],
    awards: [],
    publications: [],
    interests: ["System Design", "Open Source", "Mentoring"],
    references: [],
    customSections: [],
    sectionOrder: [
      "personal", "summary", "experience", "skills", "projects",
      "education", "certifications", "languages", "awards", "interests",
    ],
  };

  const aaravResume = {
    name: "Aarav Mehta",
    title: "Senior Software Engineer & Product Architect",
    email: "aarav.mehta@email.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/aaravmehta",
    github: "github.com/aaravmehta",
    website: "aaravmehta.dev",
    photo: "",
    summary: "Senior Software Engineer with 8+ years building scalable web platforms, design systems, and AI products. Led teams of 12+ engineers, shipped products used by 25M+ users.",
    experience: [
      {
        id: "exp1",
        role: "Senior Software Engineer",
        company: "Razorpay",
        location: "Bengaluru",
        start: "Jan 2022",
        end: "Present",
        bullets: [
          "Architected next-gen checkout platform handling 12M+ daily transactions",
          "Led migration from monolith to micro-frontend architecture",
          "Mentored 8 engineers and established the frontend guild",
        ],
      },
      {
        id: "exp2",
        role: "Software Engineer II",
        company: "Flipkart",
        location: "Bengaluru",
        start: "Jul 2019",
        end: "Dec 2021",
        bullets: [
          "Built real-time order tracking system for 50M+ monthly users",
          "Optimized React bundle size by 45%",
          "Created internal design system adopted by 9 product teams",
        ],
      },
    ],
    skills: ["TypeScript", "React", "Next.js", "Node.js", "GraphQL", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Redis"],
    skillLevels: {},
    projects: [
      {
        id: "proj1",
        name: "AI CareerOS",
        description: "Open-source AI-powered career platform with resume builder and ATS optimization",
        tech: ["Next.js", "TypeScript", "Prisma", "OpenAI"],
        link: "github.com/aaravmehta/careeros",
      },
    ],
    education: [
      {
        id: "edu1",
        degree: "B.Tech in Computer Science",
        school: "IIT Madras",
        location: "Chennai",
        start: "2013",
        end: "2017",
        grade: "CGPA: 8.9/10",
      },
    ],
    certifications: [
      { id: "c1", title: "AWS Solutions Architect Professional", subtitle: "Amazon Web Services", description: "", date: "2023" },
    ],
    languages: ["English", "Hindi", "Tamil"],
    awards: [
      { id: "a1", title: "Engineering Excellence Award", subtitle: "Razorpay", description: "Top 1% of 1200+ engineers", date: "2023" },
    ],
    publications: [],
    interests: ["System Design", "Open Source", "Mentoring", "Chess"],
    references: [],
    customSections: [],
    sectionOrder: [
      "personal", "summary", "experience", "skills", "projects",
      "education", "certifications", "languages", "awards", "interests",
    ],
  };

  await insert("ResumeData", [
    {
      id: "resume-deepak-001",
      userId: "user-deepak-001",
      data: deepakResume,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "resume-aarav-001",
      userId: "user-aarav-001",
      data: aaravResume,
      updatedAt: new Date().toISOString(),
    },
  ]);

  // 3. Create audit logs
  console.log("\n3. Creating audit logs...");
  await insert("AuditLog", [
    { id: "log-001", userId: "user-demo-001", action: "auth.signup", metadata: { method: "credentials" }, ip: "127.0.0.1", createdAt: now },
    { id: "log-002", userId: "user-deepak-001", action: "resume.import", metadata: { sections: 6, source: "pdf" }, ip: "127.0.0.1", createdAt: now },
    { id: "log-003", userId: "user-aarav-001", action: "ai.linkedin.analyze", metadata: { score: 78 }, ip: "127.0.0.1", createdAt: now },
    { id: "log-004", userId: "user-deepak-001", action: "ai.naukri.analyze", metadata: { visibility: 84 }, ip: "127.0.0.1", createdAt: now },
    { id: "log-005", userId: "user-admin-001", action: "admin.login", metadata: {}, ip: "127.0.0.1", createdAt: now },
  ]);

  // 4. Create feature flags
  console.log("\n4. Creating feature flags...");
  await insert("FeatureFlag", [
    { id: "flag-001", key: "career-intelligence", enabled: true, rollout: 100, updatedAt: new Date().toISOString() },
    { id: "flag-002", key: "linkedin-optimizer", enabled: true, rollout: 100, updatedAt: new Date().toISOString() },
    { id: "flag-003", key: "naukri-optimizer", enabled: true, rollout: 100, updatedAt: new Date().toISOString() },
    { id: "flag-004", key: "chunked-import", enabled: true, rollout: 100, updatedAt: new Date().toISOString() },
    { id: "flag-005", key: "custom-sections", enabled: true, rollout: 100, updatedAt: new Date().toISOString() },
    { id: "flag-006", key: "pro-templates", enabled: false, rollout: 0, updatedAt: new Date().toISOString() },
    { id: "flag-007", key: "tech-templates", enabled: false, rollout: 0, updatedAt: new Date().toISOString() },
    { id: "flag-008", key: "luxury-templates", enabled: false, rollout: 0, updatedAt: new Date().toISOString() },
  ]);

  console.log("\n=== Seed complete! ===");
  console.log("\nDemo accounts:");
  console.log("  demo@careeros.com / demo1234 (JOBSEEKER, PRO plan)");
  console.log("  deepak@careeros.com / demo1234 (JOBSEEKER, FREE plan)");
  console.log("  aarav@careeros.com / demo1234 (JOBSEEKER, PRO plan)");
  console.log("  priya@careeros.com / admin1234 (RECRUITER, TEAM plan)");
  console.log("  admin@careeros.com / admin1234 (ADMIN, TEAM plan)");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
