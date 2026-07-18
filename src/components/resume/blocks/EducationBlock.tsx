"use client";

import * as React from "react";
import type { EducationItem } from "@/store/resume-store";
import type { BlockProps } from "./types";

/**
 * EducationBlock — renders ONE education entry.
 *
 * Shows degree, school, dates, grade, and location. `breakInside: avoid`
 * keeps the entry together on a single page.
 */
export function EducationBlock({ data, accent }: BlockProps<EducationItem>) {
  const dateLine = [data.start, data.end].filter(Boolean).join(" — ");

  return (
    <div
      style={{
        marginBottom: 10,
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
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>
          {data.degree}
        </span>
        {dateLine ? (
          <span style={{ fontSize: 9, color: "#888", whiteSpace: "nowrap" }}>
            {dateLine}
          </span>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>
          {data.school}
        </span>
        {data.location ? (
          <span style={{ fontSize: 9, color: "#888" }}>{data.location}</span>
        ) : null}
      </div>
      {data.grade ? (
        <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
          {data.grade}
        </div>
      ) : null}
    </div>
  );
}
