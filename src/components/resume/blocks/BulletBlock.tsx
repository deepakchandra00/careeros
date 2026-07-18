"use client";

import * as React from "react";

/**
 * BulletBlock — renders a single bullet point.
 *
 * Emitted by the flow engine as an atomic unit. Each bullet flows
 * independently, so a job with 25 bullets can split across pages
 * without moving the whole job.
 *
 * Uses a <div> (not <li>) because bullets are emitted as individual
 * atoms without a wrapping <ul>. Using <li> outside <ul> causes
 * browsers to add unpredictable default spacing.
 */
export function BulletBlock({ data, accent }: { data: { text: string }; accent: string }) {
  const text = (data?.text ?? "").trim();
  if (!text) return null;

  return (
    <div
      style={{
        fontSize: 10,
        lineHeight: 1.6,
        color: "#555",
        paddingLeft: 12,
        position: "relative",
        marginBottom: 4,
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
      {text}
    </div>
  );
}
