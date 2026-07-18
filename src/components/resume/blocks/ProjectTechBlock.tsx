"use client";

import * as React from "react";

/**
 * ProjectTechBlock — renders a project's tech-stack chips.
 *
 * Emitted by the flow engine as an atomic unit after the project header
 * and description.
 */
export function ProjectTechBlock({ data }: { data: { tech: string[] } }) {
  const tech = (data?.tech || []).filter((t) => t?.trim());
  if (tech.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
      {tech.map((t, i) => (
        <span
          key={i}
          style={{
            fontSize: 9,
            color: "#666",
            background: "#f3f4f6",
            borderRadius: 3,
            padding: "2px 6px",
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
