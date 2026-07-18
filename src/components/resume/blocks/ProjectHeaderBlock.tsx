"use client";

import * as React from "react";
import type { ProjectItem } from "@/store/resume-store";

/**
 * ProjectHeaderBlock — renders a project entry's header (name + link).
 *
 * Emitted by the flow engine as a keepWithNext atom. The description
 * and tech chips follow as separate atoms.
 */
export function ProjectHeaderBlock({ data, accent }: { data: ProjectItem; accent: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        marginBottom: 4,
        breakInside: "avoid" as const,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>
        {data.name}
      </span>
      {data.link ? (
        <span style={{ fontSize: 9, color: accent, whiteSpace: "nowrap" }}>
          {data.link}
        </span>
      ) : null}
    </div>
  );
}
