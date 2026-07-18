"use client";

import * as React from "react";
import type { SimpleItem } from "@/store/resume-store";
import type { BlockProps, SimpleSectionData } from "./types";
import { SectionTitle } from "./SummaryBlock";

/**
 * SimpleSectionBlock — renders a titled list of SimpleItem entries.
 *
 * Used for Certifications, Awards, Publications, and any other section that
 * is a flat list of { title, subtitle, description, date } items. The title
 * is passed in by the BlockRenderer based on the block type (e.g.
 * "Certifications", "Achievements").
 *
 * Each item is wrapped in a `breakInside: avoid` container so an item is
 * never split across two pages.
 */
export function SimpleSectionBlock({
  data,
  accent,
  title,
}: BlockProps<SimpleSectionData> & { title: string }) {
  const items = (data || []).filter((it) => it && (it.title || it.subtitle || it.description));
  if (items.length === 0) return null;

  return (
    <section
      style={{
        marginBottom: 16,
        breakInside: "avoid" as const,
      }}
    >
      <SectionTitle accent={accent}>{title}</SectionTitle>
      {items.map((item, i) => (
        <SimpleItemRow key={item.id || i} item={item} accent={accent} />
      ))}
    </section>
  );
}

function SimpleItemRow({ item, accent }: { item: SimpleItem; accent: string }) {
  return (
    <div
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
        <div style={{ fontSize: 10, lineHeight: 1.5, color: "#666", marginTop: 1 }}>
          {item.description}
        </div>
      ) : null}
    </div>
  );
}
