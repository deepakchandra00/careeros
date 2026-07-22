// Server-side proxy for admin user operations.
// The supabase-client.ts functions use the SUPABASE_SERVICE_ROLE_KEY which
// must NEVER be exposed to the browser. These API routes run server-side and
// call the supabase-client functions, then return the JSON to the client.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminGetAllUsers } from "@/lib/supabase-client";

export const dynamic = "force-dynamic";

export async function GET() {
  // Verify the caller is authenticated and is an admin
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await adminGetAllUsers();
    return NextResponse.json(users);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
