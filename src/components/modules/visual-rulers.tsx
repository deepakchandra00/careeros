"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Visual Rulers — Figma/Word style rulers for the resume canvas.
 *
 * Shows tick marks every 10mm, with major marks every 50mm.
 * Draggable guide lines that adjust padding.
 *
 * Horizontal ruler: top of preview (0-210mm for A4)
 * Vertical ruler: left of preview (0-297mm for A4)
 */

interface RulerProps {
  orientation: "horizontal" | "vertical";
  length: number; // in mm (210 for A4 width, 297 for A4 height)
  pixelsPerMm: number; // scale factor
  guidePosition?: number; // current guide position in mm
  onGuideChange?: (mm: number) => void;
}

export function VisualRuler({
  orientation,
  length,
  pixelsPerMm,
  guidePosition,
  onGuideChange,
}: RulerProps) {
  const isHorizontal = orientation === "horizontal";
  const totalPixels = length * pixelsPerMm;
  const [dragging, setDragging] = React.useState(false);
  const rulerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onGuideChange) return;
    setDragging(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!rulerRef.current || !onGuideChange) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const offset = isHorizontal
        ? e.clientX - rect.left
        : e.clientY - rect.top;
      const mm = Math.max(0, Math.min(length, offset / pixelsPerMm));
      onGuideChange(Math.round(mm));
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, isHorizontal, length, pixelsPerMm, onGuideChange]);

  // Generate tick marks
  const ticks: { mm: number; major: boolean }[] = [];
  for (let mm = 0; mm <= length; mm += 10) {
    ticks.push({ mm, major: mm % 50 === 0 });
  }

  return (
    <div
      ref={rulerRef}
      className={cn(
        "relative bg-muted/50 select-none",
        isHorizontal ? "h-6 w-full" : "h-full w-6"
      )}
      style={{ cursor: onGuideChange ? (dragging ? "grabbing" : "grab") : "default" }}
      onMouseDown={handleMouseDown}
    >
      {/* Tick marks */}
      {ticks.map(({ mm, major }) => {
        const pos = mm * pixelsPerMm;
        return (
          <div
            key={mm}
            className="absolute"
            style={
              isHorizontal
                ? { left: `${pos}px`, top: 0, bottom: 0 }
                : { top: `${pos}px`, left: 0, right: 0 }
            }
          >
            {/* Tick line */}
            <div
              className={cn(
                "absolute bg-muted-foreground/40",
                isHorizontal
                  ? `bottom-0 w-px ${major ? "h-4" : "h-2"}`
                  : `right-0 h-px ${major ? "w-4" : "w-2"}`
              )}
            />
            {/* Label for major ticks */}
            {major && mm > 0 && (
              <span
                className="absolute text-[8px] font-medium text-muted-foreground/60"
                style={
                  isHorizontal
                    ? { left: "2px", top: "2px" }
                    : { top: "2px", left: "2px", writingMode: "vertical-rl" }
                }
              >
                {mm}
              </span>
            )}
          </div>
        );
      })}

      {/* Draggable guide line */}
      {guidePosition !== undefined && onGuideChange && (
        <div
          className={cn(
            "absolute z-10 pointer-events-none",
            isHorizontal
              ? "left-0 right-0 h-px bg-blue-500/60"
              : "top-0 bottom-0 w-px bg-blue-500/60"
          )}
          style={
            isHorizontal
              ? { top: `${guidePosition * pixelsPerMm}px` }
              : { left: `${guidePosition * pixelsPerMm}px` }
          }
        >
          <div
            className={cn(
              "absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow pointer-events-auto cursor-grab",
              isHorizontal ? "left-0 top-1/2" : "top-0 left-1/2"
            )}
            style={
              isHorizontal
                ? { left: "0", top: "50%" }
                : { top: "0", left: "50%" }
            }
          />
        </div>
      )}
    </div>
  );
}

/**
 * Ruler wrapper — renders both horizontal and vertical rulers around the canvas.
 */
export function RulerFrame({
  children,
  widthMm = 210,
  heightMm = 297,
  pixelsPerMm = 3.78, // 96 DPI: 1mm = 3.78px
  topGuide,
  bottomGuide,
  leftGuide,
  rightGuide,
  onTopGuideChange,
  onBottomGuideChange,
  onLeftGuideChange,
  onRightGuideChange,
}: {
  children: React.ReactNode;
  widthMm?: number;
  heightMm?: number;
  pixelsPerMm?: number;
  topGuide?: number;
  bottomGuide?: number;
  leftGuide?: number;
  rightGuide?: number;
  onTopGuideChange?: (mm: number) => void;
  onBottomGuideChange?: (mm: number) => void;
  onLeftGuideChange?: (mm: number) => void;
  onRightGuideChange?: (mm: number) => void;
}) {
  const widthPx = widthMm * pixelsPerMm;
  const heightPx = heightMm * pixelsPerMm;

  return (
    <div className="inline-block">
      <div className="flex">
        {/* Corner */}
        <div className="size-6 shrink-0 bg-muted/50" />
        {/* Horizontal ruler */}
        <div style={{ width: `${widthPx}px` }}>
          <VisualRuler
            orientation="horizontal"
            length={widthMm}
            pixelsPerMm={pixelsPerMm}
            guidePosition={leftGuide}
            onGuideChange={onLeftGuideChange}
          />
        </div>
      </div>
      <div className="flex">
        {/* Vertical ruler */}
        <div style={{ height: `${heightPx}px` }}>
          <VisualRuler
            orientation="vertical"
            length={heightMm}
            pixelsPerMm={pixelsPerMm}
            guidePosition={topGuide}
            onGuideChange={onTopGuideChange}
          />
        </div>
        {/* Canvas content */}
        <div style={{ width: `${widthPx}px`, height: `${heightPx}px` }} className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
