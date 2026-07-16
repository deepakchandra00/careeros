/**
 * PDF Service — renders a resume template to a pixel-perfect PDF using Playwright.
 *
 * Flow:
 *   1. Client POSTs { data, style } to this service (via gateway with XTransformPort=3002)
 *   2. This service POSTs to the Next.js /api/resume/render route to get the template HTML
 *   3. Playwright loads the HTML, generates a PDF, returns it as a binary stream
 *
 * Port: 3002 (fixed). The gateway forwards /api/pdf?XTransformPort=3002 to this service.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { chromium } from "playwright-core";

const PORT = 3002;
const CHROME_PATH =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ||
  "/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome";
const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";

interface PdfRequest {
  data: unknown;
  style: unknown;
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

function send(res: ServerResponse, status: number, body: unknown, contentType = "application/json") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function generatePdf(payload: PdfRequest): Promise<Buffer> {
  // 1. Get the rendered HTML from the Next.js resume-render page.
  // Use base64 encoding to avoid URL-encoding issues with special chars like %.
  const dataB64 = Buffer.from(JSON.stringify(payload.data)).toString("base64");
  const styleB64 = Buffer.from(JSON.stringify(payload.style)).toString("base64");
  const url = `${APP_ORIGIN}/resume-render?d=${dataB64}&s=${styleB64}`;
  console.log("[pdf-service] fetching render page, URL length:", url.length);
  const renderRes = await fetch(url);
  if (!renderRes.ok) {
    const txt = await renderRes.text();
    throw new Error(`Render page failed (${renderRes.status}): ${txt.slice(0, 200)}`);
  }
  const html = await renderRes.text();

  // 2. Launch Playwright and generate the PDF
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    // Small delay to ensure fonts/images settle
    await page.waitForTimeout(300);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      preferCSSPageSize: false,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }
  if (req.method !== "POST") {
    send(res, 405, { error: "Method not allowed" });
    return;
  }
  try {
    const bodyText = await readBody(req);
    const payload = JSON.parse(bodyText) as PdfRequest;
    if (!payload.data || !payload.style) {
      send(res, 400, { error: "Missing data or style" });
      return;
    }
    const pdf = await generatePdf(payload);
    send(res, 200, pdf, "application/pdf");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed";
    console.error("[pdf-service] error:", msg);
    send(res, 500, { error: msg });
  }
});

server.listen(PORT, () => {
  console.log(`[pdf-service] listening on http://localhost:${PORT}`);
});
