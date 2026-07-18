"use client";

import * as React from "react";
import type { ProjectItem } from "@/store/resume-store";
import type { BlockProps } from "./types";

/**
 * ProjectsBlock — renders ONE project entry.
 *
 * Shows project name, optional link, description, and tech stack chips.
 * `breakInside: avoid` keeps the entry together on a single page.
 */
export function ProjectsBlock({ data, accent }: BlockProps<ProjectItem>) {
  const tech = (data.tech || []).filter((t) => t?.trim());

  return (
    <div
      style={{
        marginBottom: 12,
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
          {data.name}
        </span>
        {data.link ? (
          <span
            style={{
              fontSize: 9,
              color: accent,
              whiteSpace: "nowrap",
              textDecoration: "none",
            }}
          >
            {data.link}
          </span>
        ) : null}
      </div>
      {data.description ? (
        <p
          style={{
            fontSize: 10,
            lineHeight: 1.6,
            color: "#555",
            margin: "4px 0 0 0",
          }}
        >
          {data.description}
        </p>
      ) : null}
      {tech.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginTop: 4,
          }}
        >
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
      ) : null}
    </div>
  );
}
