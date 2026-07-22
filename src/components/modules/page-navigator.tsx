"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Page Navigator — clickable page number buttons below the preview.
 *
 * Shows: ① ② ③ ④ ⑤
 * Click to scroll the preview to that page.
 */
export function PageNavigator({
  totalPages,
  currentPage,
  onPageClick,
}: {
  totalPages: number;
  currentPage: number;
  onPageClick: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {Array.from({ length: totalPages }, (_, i) => {
        const pageNum = i + 1;
        const isActive = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            onClick={() => onPageClick(pageNum)}
            className={cn(
              "flex size-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {pageNum}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Page Thumbnails — mini page previews in a sidebar.
 *
 * Shows small versions of each A4 page.
 * Click to jump to that page.
 */
export function PageThumbnails({
  totalPages,
  currentPage,
  onPageClick,
}: {
  totalPages: number;
  currentPage: number;
  onPageClick: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-2 p-2">
      <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Pages
      </span>
      {Array.from({ length: totalPages }, (_, i) => {
        const pageNum = i + 1;
        const isActive = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            onClick={() => onPageClick(pageNum)}
            className={cn(
              "group relative aspect-[210/297] w-full overflow-hidden rounded border-2 transition-all",
              isActive
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/40"
            )}
          >
            <div className="flex h-full flex-col items-center justify-center bg-white p-1">
              <span className="text-[8px] font-bold text-muted-foreground">
                {pageNum}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
