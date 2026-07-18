"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";
import type { BlockProps } from "./types";

/**
 * HeaderBlock — renders the candidate's name, title, and contact line.
 *
 * This is the "personal" / contact section. It receives the full ResumeData
 * (only the contact fields are read) so it can render name, title, email,
 * phone, location, and any linked profiles in a single, compact header.
 *
 * Inline styles are used for PDF-export compatibility.
 */
export function HeaderBlock({ data, accent }: BlockProps<ResumeData>) {
  const contacts: string[] = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.github,
    data.website,
  ].filter(Boolean) as string[];

  return (
    <header
      style={{
        marginBottom: 16,
        breakInside: "avoid" as const,
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#1a1a2e",
          margin: 0,
          lineHeight: 1.15,
          letterSpacing: -0.3,
        }}
      >
        {data.name}
      </h1>
      {data.title ? (
        <p
          style={{
            fontSize: 13,
            color: accent,
            fontWeight: 600,
            margin: "4px 0 0 0",
            letterSpacing: 0.2,
          }}
        >
          {data.title}
        </p>
      ) : null}
      {contacts.length > 0 ? (
        <div
          style={{
            fontSize: 10,
            color: "#666",
            marginTop: 6,
            lineHeight: 1.5,
            display: "flex",
            flexWrap: "wrap",
            gap: "2px 8px",
          }}
        >
          {contacts.map((c, i) => (
            <span key={i}>
              {c}
              {i < contacts.length - 1 ? (
                <span style={{ color: accent, margin: "0 0 0 8px" }}>·</span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </header>
  );
}
