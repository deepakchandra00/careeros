"use client";

import * as React from "react";
import type { ResumeData } from "@/store/resume-store";

interface HeaderBlockProps {
  data: ResumeData;
  accent: string;
  isSidebar?: boolean;
}

/**
 * HeaderBlock — renders the candidate's name, title, and contact info.
 *
 * When `isSidebar` is true, renders with white text (for colored sidebar backgrounds).
 * When false, renders with dark text (for white main content area).
 */
export function HeaderBlock({ data, accent, isSidebar = false }: HeaderBlockProps) {
  const contacts: string[] = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.github,
    data.website,
  ].filter(Boolean) as string[];

  const textColor = isSidebar ? "#ffffff" : "#1a1a2e";
  const subColor = isSidebar ? "rgba(255,255,255,0.85)" : accent;
  const contactColor = isSidebar ? "rgba(255,255,255,0.7)" : "#666";

  if (isSidebar) {
    // Sidebar mode: compact, white text, centered
    return (
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        {data.photo ? (
          <img
            src={data.photo}
            alt={data.name}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 12px",
              border: "3px solid rgba(255,255,255,0.3)",
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              border: "3px solid rgba(255,255,255,0.3)",
            }}
          >
            {data.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
        )}
        <h1 style={{ fontSize: 18, fontWeight: 800, color: textColor, margin: 0, lineHeight: 1.2 }}>
          {data.name}
        </h1>
        {data.title ? (
          <p style={{ fontSize: 10, color: subColor, margin: "4px 0 0", fontWeight: 500 }}>
            {data.title}
          </p>
        ) : null}
        {contacts.length > 0 ? (
          <div style={{ fontSize: 9, color: contactColor, marginTop: 8, lineHeight: 1.6 }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ marginBottom: 2, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  // Main content mode: large name, horizontal contact line
  return (
    <header style={{ marginBottom: 16, breakInside: "avoid" as const }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: textColor,
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
            color: subColor,
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
            color: contactColor,
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
