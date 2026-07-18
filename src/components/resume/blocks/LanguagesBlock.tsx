"use client";

import * as React from "react";
import type { BlockProps, SimpleSectionData } from "./types";
import { SectionTitle } from "./SummaryBlock";

/**
 * LanguagesBlock — renders languages as a comma-separated inline list.
 *
 * Languages are stored as a string[] in the resume data. We render them as a
 * single flowing paragraph for a compact, ATS-friendly look.
 */
export function LanguagesBlock({ data, accent }: BlockProps<string[]>) {
  const items = (data || []).filter((s) => s?.trim());
  if (items.length === 0) return null;

  return (
    <section
      style={{
        marginBottom: 16,
        breakInside: "avoid" as const,
      }}
    >
      <SectionTitle accent={accent}>Languages</SectionTitle>
      <p
        style={{
          fontSize: 10.5,
          lineHeight: 1.6,
          color: "#444",
          margin: 0,
        }}
      >
        {items.join(", ")}
      </p>
    </section>
  );
}

/**
 * InterestsBlock — renders interests as a comma-separated inline list.
 * Same layout as Languages; kept as a separate component for clarity.
 */
export function InterestsBlock({ data, accent }: BlockProps<string[]>) {
  const items = (data || []).filter((s) => s?.trim());
  if (items.length === 0) return null;

  return (
    <section
      style={{
        marginBottom: 16,
        breakInside: "avoid" as const,
      }}
    >
      <SectionTitle accent={accent}>Interests</SectionTitle>
      <p
        style={{
          fontSize: 10.5,
          lineHeight: 1.6,
          color: "#444",
          margin: 0,
        }}
      >
        {items.join(", ")}
      </p>
    </section>
  );
}

/**
 * CustomSectionBlock — renders a user-defined custom section with a title
 * and a list of SimpleItem entries.
 */
export function CustomSectionBlock({
  data,
  accent,
}: BlockProps<{ title: string; items: SimpleSectionData }>) {
  const items = (data?.items || []).filter(
    (it) => it && (it.title || it.subtitle || it.description)
  );
  if (items.length === 0) return null;

  return (
    <section
      style={{
        marginBottom: 16,
        breakInside: "avoid" as const,
      }}
    >
      <SectionTitle accent={accent}>{data.title || "Section"}</SectionTitle>
      {items.map((item, i) => (
        <div
          key={item.id || i}
          style={{
            marginBottom: 6,
            breakInside: "avoid" as const,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "#1a1a2e" }}>
              {item.title}
            </span>
            {item.date ? (
              <span style={{ fontSize: 9, color: "#888", whiteSpace: "nowrap" }}>
                {item.date}
              </span>
            ) : null}
          </div>
          {item.subtitle ? (
            <div style={{ fontSize: 10, color: accent, fontWeight: 500 }}>
              {item.subtitle}
            </div>
          ) : null}
          {item.description ? (
            <div
              style={{
                fontSize: 10,
                lineHeight: 1.5,
                color: "#666",
                marginTop: 1,
              }}
            >
              {item.description}
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
