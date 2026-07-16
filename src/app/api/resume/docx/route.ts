import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Convert a resume template to DOCX via html-to-docx (server-side only).
 * The client POSTs { data, style }; we fetch the rendered HTML from the
 * resume-render page and convert it to DOCX.
 *
 * For the ATS template, the client handles pure-OOXML generation directly
 * (no need to call this route).
 */
export async function POST(req: NextRequest) {
  try {
    const { data, style } = (await req.json()) as {
      data: unknown;
      style: { template: string; accent: string; font: string };
    };
    if (!data || !style) {
      return NextResponse.json({ error: "Missing data or style" }, { status: 400 });
    }

    // 1. Fetch the rendered HTML via base64 query params (avoids URL-encoding issues with %)
    const origin = req.nextUrl.origin;
    const dataB64 = Buffer.from(JSON.stringify(data)).toString("base64");
    const styleB64 = Buffer.from(JSON.stringify(style)).toString("base64");
    const renderRes = await fetch(`${origin}/resume-render?d=${dataB64}&s=${styleB64}`);
    if (!renderRes.ok) {
      return NextResponse.json(
        { error: "Failed to render template" },
        { status: 500 }
      );
    }
    let html = await renderRes.text();
    // Strip scripts that html-to-docx can't handle
    html = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    // 2. Convert to DOCX
    const htmlToDocx = (await import("html-to-docx")).default;
    const buffer = (await htmlToDocx(html, undefined, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
    })) as Buffer;

    // 3. Return as downloadable .docx
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=resume.docx",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DOCX export failed" },
      { status: 500 }
    );
  }
}
