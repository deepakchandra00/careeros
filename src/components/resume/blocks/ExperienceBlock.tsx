"use client";

import * as React from "react";
import type { ExperienceItem } from "@/store/resume-store";
import type { BlockProps } from "./types";

/**
 * ExperienceBlock — renders ONE experience entry (role, company, dates, bullets).
 *
 * This block receives a single ExperienceItem, NOT the whole experience list.
 * The layout engine emits one ExperienceBlock per entry when paginating.
 *
 * `breakInside: avoid` keeps the entry from being split across pages.
 */
export function ExperienceBlock({ data, accent }: BlockProps<ExperienceItem>) {
  const bullets = (data.bullets || []).filter((b) => b?.trim());
  const dateLine = [data.start, data.end || "Present"]
    .filter(Boolean)
    .join(" — ");

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
          {data.role}
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
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>
          {data.company}
          {data.location ? (
            <span style={{ color: "#888", fontWeight: 400 }}>
              {"  ·  "}
              {data.location}
            </span>
          ) : null}
        </span>
      </div>
      {bullets.length > 0 ? (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {bullets.map((b, i) => (
            <li
              key={i}
              style={{
                fontSize: 10,
                lineHeight: 1.6,
                color: "#555",
                paddingLeft: 12,
                position: "relative",
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  color: accent,
                  fontWeight: 700,
                }}
              >
                •
              </span>
              {b}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
