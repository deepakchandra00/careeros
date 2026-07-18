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
 */

import type { Insets } from "./types";
import { BlockType, type LayoutNode, type PageBlock, type PageModel, type Page } from "./types";

/**
 * Paginate LayoutNodes into a PageModel.
 *
 * @param nodes - The measured layout nodes (from the measurer)
 * @param contentArea - The content area { width, height } available per page
 * @param padding - The user-adjustable padding (Insets)
 */
export function paginate(
  nodes: LayoutNode[],
  contentArea: { width: number; height: number },
  padding: Insets
): PageModel {
  const pages: Page[] = [];
  const availableHeight = contentArea.height - padding.top - padding.bottom;
  const availableWidth = contentArea.width - padding.left - padding.right;

  let currentPage: Page = { pageNumber: 1, blocks: [] };
  let currentY = padding.top;
  let pageNumber = 1;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeHeight = node.estimatedHeight + node.marginTop + node.marginBottom;

    // Check if this node fits on the current page
    if (currentY + nodeHeight <= padding.top + availableHeight) {
      // Fits — add to current page
      addNodeToPage(currentPage, node, padding.left, currentY + node.marginTop, availableWidth);
      currentY += nodeHeight;
    } else {
      // Doesn't fit
      if (node.rules.keepTogether || !node.rules.allowSplit || !node.children) {
        // Move to next page
        pages.push(currentPage);
        pageNumber++;
        currentPage = { pageNumber, blocks: [] };
        currentY = padding.top;
        
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
        const remainingHeight = padding.top + availableHeight - currentY;

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
              // First, add a continuation header on the new page
              pages.push(currentPage);
              pageNumber++;
              currentPage = { pageNumber, blocks: [] };
              currentY = padding.top;

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
