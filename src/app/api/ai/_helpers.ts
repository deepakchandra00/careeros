import { NextResponse } from "next/server";

export function aiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function aiOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
