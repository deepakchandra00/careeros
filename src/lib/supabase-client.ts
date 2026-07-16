/**
 * Supabase REST API client — used as a fallback when direct PostgreSQL
 * connection is not available (e.g., sandbox environments with IPv6-only).
 *
 * Uses the PostgREST API with the service_role key to bypass RLS.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function supabaseRequest(
  table: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
  query?: string,
) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${table} ${method}: ${res.status} ${text.slice(0, 200)}`);
  }

  if (method === "GET") {
    return await res.json();
  }
  if (method === "POST") {
    return await res.json();
  }
  return null;
}

// ============================================================
// User operations
// ============================================================

export interface SupabaseUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: string | null;
  image: string | null;
  password: string | null;
  role: string;
  plan: string;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  metadata: unknown;
  ip: string | null;
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  rollout: number;
  createdAt: string;
  updatedAt: string;
}

// Minimal resume data shape used by admin views (the full type lives in the
// resume store, but the admin panel only needs a few summary fields).
export interface ResumeData {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  summary?: string;
  experience?: Array<{ id?: string; role?: string; company?: string; location?: string; start?: string; end?: string; bullets?: string[] }>;
  skills?: string[];
  skillLevels?: Record<string, number>;
  projects?: Array<{ id?: string; name?: string; description?: string }>;
  education?: Array<{ id?: string; degree?: string; school?: string; grade?: string; start?: string; end?: string }>;
  certifications?: Array<{ id?: string; name?: string; issuer?: string; date?: string }>;
  languages?: string[];
  awards?: Array<{ id?: string; name?: string; date?: string }>;
  publications?: Array<{ id?: string; name?: string; date?: string }>;
  interests?: string[];
  customSections?: Array<{ id?: string; title?: string; items?: unknown[] }>;
  sectionOrder?: string[];
  template?: string;
  accent?: string;
  [key: string]: unknown;
}

export async function findUserByEmail(email: string): Promise<SupabaseUser | null> {
  const rows = await supabaseRequest(
    "User",
    "GET",
    undefined,
    `email=eq.${encodeURIComponent(email.toLowerCase().trim())}&limit=1`,
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function findUserById(id: string): Promise<SupabaseUser | null> {
  const rows = await supabaseRequest(
    "User",
    "GET",
    undefined,
    `id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function createUser(data: {
  id?: string;
  name: string | null;
  email: string;
  password: string;
  role?: string;
  plan?: string;
  onboarded?: boolean;
}): Promise<SupabaseUser> {
  const now = new Date().toISOString();
  // Generate a cuid-like ID if not provided
  const id = data.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const rows = await supabaseRequest("User", "POST", {
    id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || "JOBSEEKER",
    plan: data.plan || "FREE",
    onboarded: data.onboarded ?? false,
    updatedAt: now,
  });
  return rows[0];
}

export async function updateUser(
  id: string,
  patch: Partial<SupabaseUser>,
): Promise<void> {
  await supabaseRequest(
    "User",
    "PATCH",
    { ...patch, updatedAt: new Date().toISOString() },
    `id=eq.${encodeURIComponent(id)}`,
  );
}

// ============================================================
// Account operations (OAuth)
// ============================================================

export interface SupabaseAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export async function findAccountByProvider(
  provider: string,
  providerAccountId: string,
): Promise<SupabaseAccount | null> {
  const rows = await supabaseRequest(
    "Account",
    "GET",
    undefined,
    `provider=eq.${encodeURIComponent(provider)}&providerAccountId=eq.${encodeURIComponent(providerAccountId)}&limit=1`,
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function createAccount(data: Partial<SupabaseAccount>): Promise<void> {
  await supabaseRequest("Account", "POST", data);
}

export async function updateAccount(
  id: string,
  patch: Partial<SupabaseAccount>,
): Promise<void> {
  await supabaseRequest("Account", "PATCH", patch, `id=eq.${encodeURIComponent(id)}`);
}

export async function deleteAccount(id: string): Promise<void> {
  await supabaseRequest("Account", "DELETE", undefined, `id=eq.${encodeURIComponent(id)}`);
}

// ============================================================
// Session operations
// ============================================================

export interface SupabaseSession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string;
}

export async function findSessionByToken(token: string): Promise<SupabaseSession | null> {
  const rows = await supabaseRequest(
    "Session",
    "GET",
    undefined,
    `sessionToken=eq.${encodeURIComponent(token)}&limit=1`,
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function createSession(data: {
  sessionToken: string;
  userId: string;
  expires: Date;
}): Promise<void> {
  await supabaseRequest("Session", "POST", {
    sessionToken: data.sessionToken,
    userId: data.userId,
    expires: data.expires.toISOString(),
  });
}

export async function updateSession(
  sessionToken: string,
  patch: Partial<SupabaseSession>,
): Promise<void> {
  await supabaseRequest(
    "Session",
    "PATCH",
    patch,
    `sessionToken=eq.${encodeURIComponent(sessionToken)}`,
  );
}

export async function deleteSession(token: string): Promise<void> {
  await supabaseRequest("Session", "DELETE", undefined, `sessionToken=eq.${encodeURIComponent(token)}`);
}

// ============================================================
// VerificationToken operations
// ============================================================

export async function findVerificationToken(token: string): Promise<{ identifier: string; expires: string } | null> {
  const rows = await supabaseRequest(
    "VerificationToken",
    "GET",
    undefined,
    `token=eq.${encodeURIComponent(token)}&limit=1`,
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function createVerificationToken(data: {
  identifier: string;
  token: string;
  expires: Date;
}): Promise<void> {
  await supabaseRequest("VerificationToken", "POST", {
    identifier: data.identifier,
    token: data.token,
    expires: data.expires.toISOString(),
  });
}

export async function deleteVerificationToken(token: string): Promise<void> {
  await supabaseRequest("VerificationToken", "DELETE", undefined, `token=eq.${encodeURIComponent(token)}`);
}

// ============================================================
// ResumeData operations
// ============================================================

export async function getResumeData(userId: string): Promise<unknown | null> {
  const rows = await supabaseRequest(
    "ResumeData",
    "GET",
    undefined,
    `userId=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function upsertResumeData(userId: string, data: unknown): Promise<void> {
  const existing = await getResumeData(userId);
  if (existing) {
    await supabaseRequest(
      "ResumeData",
      "PATCH",
      { data, updatedAt: new Date().toISOString() },
      `userId=eq.${encodeURIComponent(userId)}`,
    );
  } else {
    await supabaseRequest("ResumeData", "POST", {
      userId,
      data,
      updatedAt: new Date().toISOString(),
    });
  }
}

// ============================================================
// AuditLog operations (for audit feed)
// ============================================================

export async function createAuditLog(data: {
  userId?: string | null;
  action: string;
  metadata?: unknown;
  ip?: string | null;
}): Promise<void> {
  await supabaseRequest("AuditLog", "POST", {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    userId: data.userId ?? null,
    action: data.action,
    metadata: data.metadata ?? null,
    ip: data.ip ?? null,
  });
}

// ============================================================
// Admin operations (superadmin only)
// ============================================================

export async function adminGetAllUsers(): Promise<SupabaseUser[]> {
  const rows = await supabaseRequest("User", "GET", undefined, "select=*&order=createdAt.desc");
  return rows || [];
}

export async function adminGetUserDetail(
  userId: string,
): Promise<{ user: SupabaseUser | null; resumeData: ResumeData | null; auditLogs: AuditLog[] }> {
  const [userRows, resumeRows, logRows] = await Promise.all([
    supabaseRequest("User", "GET", undefined, `id=eq.${encodeURIComponent(userId)}&limit=1`),
    supabaseRequest("ResumeData", "GET", undefined, `userId=eq.${encodeURIComponent(userId)}&limit=1`),
    supabaseRequest(
      "AuditLog",
      "GET",
      undefined,
      `userId=eq.${encodeURIComponent(userId)}&order=createdAt.desc&limit=50`,
    ),
  ]);
  return {
    user: userRows?.[0] || null,
    resumeData: resumeRows?.[0]?.data || null,
    auditLogs: logRows || [],
  };
}

export async function adminUpdateUserRole(userId: string, role: string): Promise<void> {
  await updateUser(userId, { role });
}

export async function adminUpdateUserPlan(userId: string, plan: string): Promise<void> {
  await updateUser(userId, { plan });
}

export async function adminGetAllAuditLogs(limit = 100): Promise<AuditLog[]> {
  const rows = await supabaseRequest(
    "AuditLog",
    "GET",
    undefined,
    `select=*&order=createdAt.desc&limit=${limit}`,
  );
  return rows || [];
}

export async function adminGetAllFeatureFlags(): Promise<FeatureFlag[]> {
  const rows = await supabaseRequest("FeatureFlag", "GET", undefined, "select=*&order=key.asc");
  return rows || [];
}

export async function adminUpdateFeatureFlag(
  key: string,
  enabled: boolean,
  rollout?: number,
): Promise<void> {
  await supabaseRequest(
    "FeatureFlag",
    "PATCH",
    {
      enabled,
      ...(rollout !== undefined ? { rollout } : {}),
      updatedAt: new Date().toISOString(),
    },
    `key=eq.${encodeURIComponent(key)}`,
  );
}

export async function adminCreateFeatureFlag(key: string, enabled: boolean, rollout = 100): Promise<void> {
  await supabaseRequest("FeatureFlag", "POST", {
    id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key,
    enabled,
    rollout,
    updatedAt: new Date().toISOString(),
  });
}

// Navigation visibility config (stored in FeatureFlag table with key prefix "nav.")
export async function adminGetNavConfig(): Promise<Record<string, boolean>> {
  const rows = await supabaseRequest(
    "FeatureFlag",
    "GET",
    undefined,
    "key=like.nav.*&order=key.asc",
  );
  const config: Record<string, boolean> = {};
  for (const row of rows || []) {
    const moduleId = String(row.key).replace("nav.", "");
    config[moduleId] = Boolean(row.enabled);
  }
  return config;
}

export async function adminSetNavVisibility(moduleId: string, visible: boolean): Promise<void> {
  const key = `nav.${moduleId}`;
  // Check if exists
  const existing = await supabaseRequest(
    "FeatureFlag",
    "GET",
    undefined,
    `key=eq.${encodeURIComponent(key)}&limit=1`,
  );
  if (existing && existing.length > 0) {
    await adminUpdateFeatureFlag(key, visible);
  } else {
    await supabaseRequest("FeatureFlag", "POST", {
      id: `flag-nav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      key,
      enabled: visible,
      rollout: 100,
      updatedAt: new Date().toISOString(),
    });
  }
}
