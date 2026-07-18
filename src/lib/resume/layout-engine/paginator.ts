/**
 * Pagination Engine — Assigns LayoutNodes to pages.
 *
 * Pure TypeScript. No React. No DOM.
 *
 * FIXED:
 * 1. startNewPage() always creates a new page (no early return on empty)
 * 2. headerHeight uses Math.max(0, ...) — never negative
 * 3. No double-counting of margins (estimator includes margins in section height,
 *    paginator uses nodeHeight = estimatedHeight only, NOT + marginTop + marginBottom
 *    for parent nodes — margins are already baked in)
 * 4. Children fill the current page 100% before moving to next page
 * 5. No empty pages created
 */

import type { Insets } from "./types";
import type { LayoutNode, PageBlock, PageModel, Page } from "./types";

export interface PaginateOptions {
  pageBreaks?: string[];
}

export function paginate(
  nodes: LayoutNode[],
  contentArea: { width: number; height: number },
  padding: Insets,
  options?: PaginateOptions
): PageModel {
  const pages: Page[] = [];
  const availableHeight = contentArea.height - padding.top - padding.bottom;
  const availableWidth = contentArea.width - padding.left - padding.right;
  const pageBreakSet = new Set(options?.pageBreaks ?? []);

  let currentPage: Page = { pageNumber: 1, blocks: [] };
  let currentY = 0; // Track Y within the content area (0 = top of usable area)
  let pageNumber = 1;

  /** Start a new page. Always creates a fresh page. */
  const startNewPage = () => {
    if (currentPage.blocks.length > 0) {
      pages.push(currentPage);
      pageNumber++;
    }
    currentPage = { pageNumber, blocks: [] };
    currentY = 0;
  };

  /** Check if a block of the given height fits in the remaining space */
  const fits = (height: number) => currentY + height <= availableHeight;

  /** Add a node to the current page */
  const addBlock = (node: LayoutNode, isHeader = false, isContinuation = false) => {
    currentPage.blocks.push({
      id: isContinuation ? node.id + "-cont-" + pageNumber : node.id,
      type: node.type,
      x: padding.left,
      y: padding.top + currentY,
      width: availableWidth,
      height: node.estimatedHeight,
      data: isHeader
        ? { isHeader: true, isContinuation, sectionType: node.type, sectionData: node.data }
        : node.data,
    });
    // Use estimatedHeight only (margins are already included in the estimator's calculation)
    currentY += node.estimatedHeight;
  };

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Manual page break
    if (pageBreakSet.has(node.id)) {
      startNewPage();
    }

    // For nodes WITHOUT children (simple blocks: contact, summary, skills, etc.)
    if (!node.children || node.children.length === 0) {
      if (fits(node.estimatedHeight)) {
        addBlock(node);
      } else {
        // Doesn't fit — move to next page
        startNewPage();
        addBlock(node); // Add even if taller than page (better than skipping)
      }
      continue;
    }

    // For nodes WITH children (experience, projects, education — splittable sections)
    // Calculate the header height safely
    const childrenHeight = node.children.reduce(
      (sum, child) => sum + child.estimatedHeight,
      0
    );
    const headerHeight = Math.max(0, node.estimatedHeight - childrenHeight);

    // Try to fit the entire section on the current page
    if (fits(node.estimatedHeight)) {
      // Entire section fits — add as one block
      addBlock(node);
      continue;
    }

    // Section doesn't fit — need to split
    // First, add the section header to the current page (if there's room)
    if (headerHeight > 0 && fits(headerHeight)) {
      addBlock(node, true, false); // Header block
    }

    // Distribute children across pages — FILL each page 100% before moving
    let isFirstChunk = true;
    for (const child of node.children) {
      if (fits(child.estimatedHeight)) {
        // Child fits on current page — add it
        addBlock(child);
      } else {
        // Child doesn't fit — start a new page
        startNewPage();

        // Add continuation header on the new page (smaller)
        if (headerHeight > 0) {
          currentPage.blocks.push({
            id: node.id + "-cont-" + pageNumber,
            type: node.type,
            x: padding.left,
            y: padding.top,
            width: availableWidth,
            height: 20,
            data: { isHeader: true, isContinuation: true, sectionType: node.type, sectionData: node.data },
          });
          currentY += 20;
        }

        // Add the child to the new page
        addBlock(child);
        isFirstChunk = false;
      }
    }
  }

  // Push the last page if it has content
  if (currentPage.blocks.length > 0) {
    pages.push(currentPage);
  }

  // Ensure at least one page
  if (pages.length === 0) {
    pages.push({ pageNumber: 1, blocks: [] });
  }

  return {
    version: 1,
    pages,
    totalPages: pages.length,
  };
}
