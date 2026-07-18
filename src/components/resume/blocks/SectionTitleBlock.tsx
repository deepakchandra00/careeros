"use client";

import * as React from "react";
import { SectionTitle } from "./SummaryBlock";

/**
 * SectionTitleBlock — renders a standalone section title.
 *
 * Emitted by the flow engine as a keepWithNext atom before a section's
 * content. The title text is passed explicitly in `data.title` (unlike
 * the legacy SectionHeaderBlock which derives it from a BlockType).
 */
export function SectionTitleBlock({
  data,
  accent,
}: {
  data: { title: string; isSidebar?: boolean };
  accent: string;
}) {
  const title = data?.title;
  if (!title) return null;
  return <SectionTitle accent={accent} isSidebar={data.isSidebar}>{title}</SectionTitle>;
}
