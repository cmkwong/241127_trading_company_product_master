const clampPositive = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return numeric > 0 ? numeric : fallback;
};

const normalizeRows = (rows) => (Array.isArray(rows) ? rows : []);

const normalizeUnits = (rows, estimateRowUnits) => {
  const resolver =
    typeof estimateRowUnits === 'function' ? estimateRowUnits : () => 1;

  return rows.map((row, index) => clampPositive(resolver(row, index), 1));
};

const pushChunk = ({ chunks, rows, rowUnits, start, end, includeFooter }) => {
  const safeStart = Math.max(0, start);
  const safeEnd = Math.max(safeStart, end);
  const chunkRows = rows.slice(safeStart, safeEnd);
  const chunkUnits = rowUnits.slice(safeStart, safeEnd);

  chunks.push({
    rows: chunkRows,
    startIndex: safeStart,
    rowUnits: chunkUnits,
    rowUnitTotal: chunkUnits.reduce((sum, value) => sum + value, 0),
    includeFooter: Boolean(includeFooter),
  });
};

const chunkRowsByBudget = ({ rows, rowUnits, start, end, budget, chunks }) => {
  const safeBudget = clampPositive(budget, 1);
  let cursor = start;

  while (cursor < end) {
    let unitTotal = 0;
    let next = cursor;

    while (next < end) {
      const rowUnit = rowUnits[next];
      if (next > cursor && unitTotal + rowUnit > safeBudget) {
        break;
      }
      unitTotal += rowUnit;
      next += 1;

      if (unitTotal >= safeBudget) {
        break;
      }
    }

    if (next === cursor) {
      next = cursor + 1;
    }

    pushChunk({
      chunks,
      rows,
      rowUnits,
      start: cursor,
      end: next,
      includeFooter: false,
    });
    cursor = next;
  }
};

export const paginateRowsWithFooter = ({
  rows,
  estimateRowUnits,
  pageRowBudget,
  footerUnits = 0,
}) => {
  const normalizedRows = normalizeRows(rows);
  const normalizedUnits = normalizeUnits(normalizedRows, estimateRowUnits);
  const pageBudget = clampPositive(pageRowBudget, 1);
  const footerBudget = clampPositive(footerUnits, 0);
  const footerPageBudget = Math.max(0, pageBudget - footerBudget);

  if (normalizedRows.length === 0) {
    return [
      {
        rows: [],
        startIndex: 0,
        rowUnits: [],
        rowUnitTotal: 0,
        includeFooter: true,
      },
    ];
  }

  const chunks = [];

  chunkRowsByBudget({
    rows: normalizedRows,
    rowUnits: normalizedUnits,
    start: 0,
    end: normalizedRows.length,
    budget: pageBudget,
    chunks,
  });

  if (chunks.length === 0) {
    return [
      {
        rows: normalizedRows,
        startIndex: 0,
        rowUnits: normalizedUnits,
        rowUnitTotal: normalizedUnits.reduce((sum, value) => sum + value, 0),
        includeFooter: true,
      },
    ];
  }

  if (footerBudget <= 0) {
    chunks[chunks.length - 1].includeFooter = true;
    return chunks;
  }

  const lastChunk = chunks[chunks.length - 1];
  if (lastChunk.rowUnitTotal + footerBudget <= pageBudget) {
    lastChunk.includeFooter = true;
    return chunks;
  }

  const movedRows = [];
  const movedUnits = [];
  let movedUnitTotal = 0;

  while (lastChunk.rows.length > 0) {
    const nextUnit = lastChunk.rowUnits[lastChunk.rowUnits.length - 1];
    if (movedRows.length > 0 && movedUnitTotal + nextUnit > footerPageBudget) {
      break;
    }

    movedRows.unshift(lastChunk.rows.pop());
    movedUnits.unshift(lastChunk.rowUnits.pop());
    lastChunk.rowUnitTotal -= nextUnit;
    movedUnitTotal += nextUnit;

    if (movedUnitTotal >= footerPageBudget) {
      break;
    }
  }

  const hasOverflowSingleRow =
    movedRows.length === 0 &&
    lastChunk.rowUnits[lastChunk.rowUnits.length - 1] > footerPageBudget;

  if (lastChunk.rows.length === 0) {
    chunks.pop();
  }

  if (movedRows.length > 0) {
    const startIndex = lastChunk.startIndex + lastChunk.rows.length;
    chunks.push({
      rows: movedRows,
      startIndex,
      rowUnits: movedUnits,
      rowUnitTotal: movedUnitTotal,
      includeFooter: true,
    });
    return chunks;
  }

  if (hasOverflowSingleRow) {
    lastChunk.includeFooter = true;
    return chunks;
  }

  chunks.push({
    rows: [],
    startIndex: normalizedRows.length,
    rowUnits: [],
    rowUnitTotal: 0,
    includeFooter: true,
  });

  return chunks;
};

/**
 * Pixel-driven pagination: given the real rendered height of each row plus the
 * measured page geometry, split rows across pages so content never overflows
 * the A4 content box. Unlike `paginateRowsWithFooter` (which works in abstract
 * "row units" supplied by an estimator), this operates on measured pixels.
 *
 * The footer (terms + totals) is reserved on the last page only: a page is the
 * final one once the remaining rows fit within the footer-reserved budget; the
 * taller footer never shares a page with the trailing spacer block.
 *
 * Returns chunks of the shape
 *   { startIndex, endIndex, rowCount, usedPx, availablePx, includeFooter }
 * Guaranteed: at least one row per page (a row taller than a page overflows by
 * necessity rather than being dropped), and the last chunk is the footer page.
 */
export const paginateRowsByPixelHeight = ({
  rowHeightsPx = [],
  pageContentPx,
  pageOverheadPx = 0,
  pageSpacerPx = 0,
  pageFooterPx = 0,
  slackPx = 2,
}) => {
  const heights = (Array.isArray(rowHeightsPx) ? rowHeightsPx : []).map(
    (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
    },
  );
  const contentPx = clampPositive(pageContentPx, 1);
  const overheadPx = clampPositive(pageOverheadPx, 0);
  const spacerPx = clampPositive(pageSpacerPx, 0);
  const footerPx = clampPositive(pageFooterPx, 0);
  const slack = clampPositive(slackPx, 0);

  // Non-final pages reserve the trailing spacer block; the final page reserves
  // the taller footer block (terms + totals) instead.
  const availAll = contentPx - overheadPx - spacerPx - slack;
  const availLast = contentPx - overheadPx - footerPx - slack;

  if (heights.length === 0) {
    return [
      {
        startIndex: 0,
        endIndex: 0,
        rowCount: 0,
        usedPx: 0,
        availablePx: Math.max(0, availLast),
        includeFooter: true,
      },
    ];
  }

  // suffix[k] = total height of rows k..end; used to decide the final page.
  const suffix = new Array(heights.length + 1).fill(0);
  for (let k = heights.length - 1; k >= 0; k -= 1) {
    suffix[k] = suffix[k + 1] + heights[k];
  }

  const chunks = [];
  let i = 0;

  while (i < heights.length) {
    const isFinalPage = suffix[i] <= availLast;
    const available = Math.max(1, isFinalPage ? availLast : availAll);
    const start = i;
    let used = 0;

    // Always place at least one row so an oversized row cannot loop forever.
    while (i < heights.length) {
      if (i !== start) {
        // Stop before the page overflows, and (on a non-final page) always
        // leave at least one row for the footer page so the taller footer is
        // reserved on its own final page instead of overflowing the spacer.
        if (used + heights[i] > available) break;
        if (!isFinalPage && i >= heights.length - 1) break;
      }
      used += heights[i];
      i += 1;
    }

    chunks.push({
      startIndex: start,
      endIndex: i,
      rowCount: i - start,
      usedPx: used,
      availablePx: available,
      includeFooter: isFinalPage,
    });
  }

  // Safety net for a row taller than the whole page: the final chunk is still
  // the footer page even though it necessarily overflows.
  if (chunks.length > 0 && !chunks[chunks.length - 1].includeFooter) {
    chunks[chunks.length - 1].includeFooter = true;
  }

  return chunks;
};

export const buildPageNumberLabel = (pageIndex, totalPages) => {
  const safeIndex = Number.isFinite(Number(pageIndex))
    ? Number(pageIndex)
    : Number(pageIndex) || 0;
  const safeTotal = Number.isFinite(Number(totalPages))
    ? Number(totalPages)
    : Number(totalPages) || 0;

  return `${Math.max(1, safeIndex + 1)}/${Math.max(1, safeTotal)}`;
};
