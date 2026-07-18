"use client";

import * as React from "react";

/**
 * ParagraphBlock — renders a text paragraph (summary text, project description).
 *
 * Emitted by the flow engine as a SPLITTABLE atom. When the text is too
 * long for the current page, the engine splits it line-by-line and emits
 * a continued ParagraphBlock on the next page.
 *
 * No section title is rendered here — the title is a separate SectionTitle
 * atom emitted before this block.
 */
export function ParagraphBlock({
  data,
  continued = false,
}: {
  data: { text: string };
  continued?: boolean;
}) {
  const text = (data?.text ?? "").trim();
  if (!text) return null;

  return (
    <p
      style={{
        fontSize: 10.5,
        lineHeight: 1.7,
        color: "#444",
        margin: continued ? "8px 0 0 0" : "0 0 8px 0",
      }}
    >
      {text}
    </p>
  );
}
