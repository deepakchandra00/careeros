import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || "http://localhost:3002";

/**
 * Proxy to the Playwright PDF mini-service.
 * The browser calls this route; we forward to the PDF service on port 3002
 * and stream the PDF back. This avoids requiring the browser to go through
 * the gateway with XTransformPort.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(PDF_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { error: `PDF service error: ${txt.slice(0, 200)}` },
        { status: res.status }
      );
    }
    const pdf = await res.arrayBuffer();
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PDF proxy failed" },
      { status: 500 }
    );
  }
}
