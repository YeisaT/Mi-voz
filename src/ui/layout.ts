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
};

export function getLayout(w: number, h: number): LayoutMetrics {
  const isPhone = w < 560;
  const isTablet = w >= 560 && w < 900;
  const pad = isPhone ? 16 : 24;
  const titleSize = isPhone ? 22 : 28;
  const bodySize = isPhone ? 20 : 22;
  const titleTop = isPhone ? 12 : 16;
  const contentTop = titleTop + (isPhone ? 44 : 52);
  const footerH = isPhone ? 72 : 84;
  const footerY = h - footerH;
  const contentBottom = footerY - 8;
  const contentH = Math.max(120, contentBottom - contentTop);
  const maxTextW = Math.min(640, w - pad * 2);
  const cardW = Math.min(560, w - pad * 2);

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
