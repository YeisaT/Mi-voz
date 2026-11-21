/** Métricas responsivas compartidas (móvil / tablet / escritorio). */

export type LayoutMetrics = {
  w: number;
  h: number;
  pad: number;
  isPhone: boolean;
  isTablet: boolean;
  titleSize: number;
  bodySize: number;
  titleTop: number;
  contentTop: number;
  footerH: number;
  footerY: number;
  contentBottom: number;
  contentH: number;
  cardW: number;
  maxTextW: number;
  columnX: number;
  columnW: number;
};

export function getLayout(w: number, h: number): LayoutMetrics {
  const isPhone = w < 560;
  const isTablet = w >= 560 && w < 900;
  const pad = isPhone ? 20 : 24;
  const titleSize = isPhone ? 30 : 34;
  const bodySize = isPhone ? 18 : 19;
  const titleTop = 20;
  const contentTop = titleTop + (isPhone ? 78 : 72);
  const footerH = isPhone ? 88 : 96;
  const footerY = h - footerH;
  const contentBottom = footerY - 8;
  const contentH = Math.max(120, contentBottom - contentTop);
  const columnW = Math.min(440, w - pad * 2);
  const columnX = (w - columnW) / 2;
  const maxTextW = columnW;
  const cardW = columnW;

  return {
    w,
    h,
    pad,
    isPhone,
    isTablet,
    titleSize,
    bodySize,
    titleTop,
    contentTop,
    footerH,
    footerY,
    contentBottom,
    contentH,
    cardW,
    maxTextW,
    columnX,
    columnW,
  };
}

export function centerX(totalW: number, itemW: number): number {
  return (totalW - itemW) / 2;
}

export function colsForWidth(w: number, prefer = 3): number {
  if (w < 420) return 2;
  if (w < 700) return prefer === 3 ? 3 : 2;
  return prefer;
}
