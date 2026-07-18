"use client";

import * as React from "react";
import type { TemplatePattern } from "./template-layout";

/**
 * TemplateBackground — the visual background layer of a resume page.
 *
 * This is a SEPARATE layer from the content. It fills the entire A4 page
 * (absolutely positioned, behind the content) and renders the template's
 * structural decoration:
 *
 *   - sidebar-left   →  colored sidebar on the left
 *   - sidebar-right  →  colored sidebar on the right
 *   - header-band    →  colored band across the top
 *   - single-column  →  no background (white)
 *
 * The content layer (rendered by PageRenderer) sits on top of this and is
 * padded so it never overlaps the sidebar/header band.
 */
export function TemplateBackground({
  pattern,
  accent,
  sidebarWidth = 240,
  headerHeight = 120,
}: {
  pattern: TemplatePattern;
  accent: string;
  /** Sidebar width in px (sidebar patterns only). */
  sidebarWidth?: number;
  /** Header band height in px (header-band pattern only). */
  headerHeight?: number;
}) {
  if (pattern === "sidebar-left") {
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: sidebarWidth,
          background: accent,
          zIndex: 0,
        }}
      />
    );
  }

  if (pattern === "sidebar-right") {
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: sidebarWidth,
          background: accent,
          zIndex: 0,
        }}
      />
    );
  }

  if (pattern === "header-band") {
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: headerHeight,
          background: accent,
          zIndex: 0,
        }}
      />
    );
  }

  // single-column — no background decoration.
  return null;
}
