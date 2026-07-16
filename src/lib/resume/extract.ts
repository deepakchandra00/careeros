"use client";

/**
 * Client-side text extraction from uploaded resume files.
 * PDF via pdfjs-dist, DOCX via mammoth. Returns plain text.
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file);
  }
  if (
    name.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(file);
  }
  if (name.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc is not supported. Please save as .docx or PDF and try again."
    );
  }
  if (name.endsWith(".txt")) {
    return await file.text();
  }
  // Fallback: try as text
  try {
    return await file.text();
  } catch {
    throw new Error("Unsupported file type. Upload a PDF or DOCX file.");
  }
}

async function extractPdfText(file: File): Promise<string> {
  // Dynamic import keeps pdfjs out of the initial bundle
  const pdfjs = await import("pdfjs-dist");
  // Configure the worker. Use the bundled worker via a Blob URL so it works
  // without a CDN/network access (sandbox-safe). Falls back to a fake worker
  // (main-thread) if worker setup fails.
  try {
    const workerModule = await import("pdfjs-dist/build/pdf.worker.mjs");
    const workerBlob = new Blob(
      [workerModule.default as unknown as string],
      { type: "application/javascript" }
    );
    pdfjs.GlobalWorkerOptions.workerSrc =
      URL.createObjectURL(workerBlob);
  } catch {
    // worker import failed — pdfjs will use a fake worker on the main thread
  }

  const buf = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buf),
  });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it) => ("str" in it ? (it as { str: string }).str : ""))
      .join(" ");
    pages.push(text);
  }
  return pages.join("\n\n").trim();
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  // mammoth expects { buffer: Buffer } in Node or { arrayBuffer: ArrayBuffer } in browser.
  // In Next.js/Turbopack the Node build may be loaded, so we try both formats.
  let result: { value: string };
  try {
    result = await (mammoth as unknown as { extractRawText: (opts: unknown) => Promise<{ value: string }> }).extractRawText({ arrayBuffer: buf });
  } catch {
    // Fallback: wrap in Uint8Array (works with the Node Buffer-based mammoth build)
    result = await (mammoth as unknown as { extractRawText: (opts: unknown) => Promise<{ value: string }> }).extractRawText({ buffer: new Uint8Array(buf) });
  }
  return result.value.trim();
}
