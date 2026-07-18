/**
 * Pagination Engine — Assigns LayoutNodes to pages.
 *
 * Pure TypeScript. No React. No DOM.
 *
 * Input: LayoutNode[] (measured, with estimated heights)
 * Output: PageModel (pages with blocks at absolute positions)
 *
 * Rules:
 * - keepTogether: if a node doesn't fit on the current page, move it to the next
 * - allowSplit: if a node has children, try to split children across pages
 * - keepWithNext: keep a node with the next one (e.g., section header with first entry)
 * - widowLines/orphanLines: minimum lines at start/end of a split block
 * - pageBreaks: list of section IDs (top-level node ids) that must start a new page
 * - sectionSettings.startOnNewPage: equivalent to pageBreaks for that section
 */

import type { Insets } from "./types";
import type { LayoutNode, PageBlock, PageModel, Page } from "./types";

/** Optional pagination controls driven by the resume store. */
export interface PaginateOptions {
  /** Section IDs that must always start on a new page (manual page breaks). */
  pageBreaks?: string[];
}

/**
 * Paginate LayoutNodes into a PageModel.
 *
 * @param nodes - The measured layout nodes (from the measurer)
 * @param contentArea - The content area { width, height } available per page
 * @param padding - The user-adjustable padding (Insets)
 * @param options - Optional page-break overrides from the store
 */
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
  let currentY = padding.top;
  let pageNumber = 1;

  /**
   * Start a new page. Pushes the current page to the pages array and resets
   * the cursor. No-op if the current page is already empty (avoids blank pages
   * when a break is requested at the top of a fresh page).
   */
  const startNewPage = () => {
    if (currentPage.blocks.length === 0) return; // already on a fresh page
    pages.push(currentPage);
    pageNumber++;
    currentPage = { pageNumber, blocks: [] };
    currentY = padding.top;
  };

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeHeight = node.estimatedHeight + node.marginTop + node.marginBottom;

    // Manual page break: this section must start on a new page.
    // We treat both the explicit `pageBreaks` list and any node whose id is in
    // the set as a forced break.
    if (pageBreakSet.has(node.id)) {
      startNewPage();
    }

    // Check if this node fits on the current page
    if (currentY + nodeHeight <= padding.top + availableHeight) {
      // Fits — add to current page
      addNodeToPage(currentPage, node, padding.left, currentY + node.marginTop, availableWidth);
      currentY += nodeHeight;
    } else {
      // Doesn't fit
      if (node.rules.keepTogether || !node.rules.allowSplit || !node.children) {
        // Move to next page
        startNewPage();

        // Add to new page (if it fits on a fresh page)
        if (nodeHeight <= availableHeight) {
          addNodeToPage(currentPage, node, padding.left, currentY + node.marginTop, availableWidth);
          currentY += nodeHeight;
        } else {
          // Node is taller than a full page — add it anyway (will overflow but that's OK for now)
          addNodeToPage(currentPage, node, padding.left, currentY + node.marginTop, availableWidth);
          currentY += nodeHeight;
        }
      } else {
        // allowSplit — try to add children to current page, rest to next

        // Add section header to current page
        const headerHeight = node.estimatedHeight - (node.children?.reduce((sum, c) => sum + c.estimatedHeight + c.marginTop + c.marginBottom, 0) || 0);
        if (headerHeight > 0 && currentY + headerHeight <= padding.top + availableHeight) {
          // Add a header block for this section
          currentPage.blocks.push({
            id: node.id + "-header",
            type: node.type,
            x: padding.left,
            y: currentY + node.marginTop,
            width: availableWidth,
            height: headerHeight,
            data: { isHeader: true, sectionType: node.type, sectionData: node.data },
          });
          currentY += headerHeight + node.marginTop;
        }

        // Distribute children across pages
        if (node.children) {
          for (const child of node.children) {
            const childHeight = child.estimatedHeight + child.marginTop + child.marginBottom;

            if (currentY + childHeight <= padding.top + availableHeight) {
              // Child fits on current page
              addNodeToPage(currentPage, child, padding.left, currentY + child.marginTop, availableWidth);
              currentY += childHeight;
            } else {
              // Child doesn't fit — new page
              startNewPage();

              // Add continuation header
              if (headerHeight > 0) {
                currentPage.blocks.push({
                  id: node.id + "-cont-" + pageNumber,
                  type: node.type,
                  x: padding.left,
                  y: currentY,
                  width: availableWidth,
                  height: 20, // smaller continuation header
                  data: { isHeader: true, isContinuation: true, sectionType: node.type, sectionData: node.data },
                });
                currentY += 20;
              }

              // Add child to new page
              addNodeToPage(currentPage, child, padding.left, currentY + child.marginTop, availableWidth);
              currentY += childHeight;
            }
          }
        }
      }
    }
  }

  // Push the last page
  if (currentPage.blocks.length > 0) {
    pages.push(currentPage);
  }

  // If no pages (empty resume), create one empty page
  if (pages.length === 0) {
    pages.push({ pageNumber: 1, blocks: [] });
  }

  return {
    version: 1,
    pages,
    totalPages: pages.length,
  };
}

/** Add a LayoutNode to a page as a PageBlock */
function addNodeToPage(
  page: Page,
  node: LayoutNode,
  x: number,
  y: number,
  width: number
): void {
  page.blocks.push({
    id: node.id,
    type: node.type,
    x,
    y,
    width,
    height: node.estimatedHeight,
    data: node.data,
  });
}
