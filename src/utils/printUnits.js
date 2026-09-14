export const CSS_DPI = 96;
export const MM_PER_INCH = 25.4;

export const A4_SIZE_MM = Object.freeze({
  width: 210,
  height: 297,
});

const toFiniteNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const mmToCssPx = (mm, dpi = CSS_DPI) => {
  return Math.round((toFiniteNumber(mm) * toFiniteNumber(dpi)) / MM_PER_INCH);
};

export const cssPxToMm = (px, dpi = CSS_DPI) => {
  const safeDpi = toFiniteNumber(dpi);
  if (safeDpi <= 0) {
    return 0;
  }

  return (toFiniteNumber(px) * MM_PER_INCH) / safeDpi;
};

export const getA4FramePx = (dpi = CSS_DPI) => {
  return {
    widthPx: mmToCssPx(A4_SIZE_MM.width, dpi),
    heightPx: mmToCssPx(A4_SIZE_MM.height, dpi),
  };
};
