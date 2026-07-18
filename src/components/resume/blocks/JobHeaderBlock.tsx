"use client";

import * as React from "react";
import type { ExperienceItem } from "@/store/resume-store";

/**
 * JobHeaderBlock — renders an experience entry's header (role, company,
 * dates, location) WITHOUT bullets.
 *
 * Emitted by the flow engine as a keepWithNext atom. The bullets that
 * belong to this job are emitted as separate BulletBlock atoms right
 * after it, so they can flow individually across pages.
 */
export function JobHeaderBlock({ data, accent }: { data: ExperienceItem; accent: string }) {
  const dateLine = [data.start, data.end || "Present"].filter(Boolean).join(" — ");

  return (
    <div style={{ marginBottom: 6, breakInside: "avoid" as const }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>
          {data.role}
        </span>
        {dateLine ? (
          <span style={{ fontSize: 9, color: "#888", whiteSpace: "nowrap" }}>
            {dateLine}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>
          {data.company}
        </span>
        {data.location ? (
          <span style={{ fontSize: 9, color: "#888" }}>
            · {data.location}
          </span>
        ) : null}
      </div>
    </div>
  );
}
