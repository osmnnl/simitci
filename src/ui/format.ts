const UNITS = ["K", "M", "B", "T"];

/** 999 -> "999", 1200 -> "1,2K", 3400000 -> "3,4M" (Turkish decimal comma). */
export function formatNumber(value: number): string {
  const n = Math.floor(value);
  if (n < 1000) return n.toLocaleString("tr-TR");

  let v = n;
  let unitIndex = -1;
  while (v >= 1000 && unitIndex < UNITS.length - 1) {
    v /= 1000;
    unitIndex += 1;
  }
  const decimals = v < 10 ? 1 : 0;
  return `${v.toFixed(decimals).replace(".", ",")}${UNITS[unitIndex]}`;
}

export function formatMoney(value: number): string {
  return `₺${formatNumber(value)}`;
}

/**
 * For per-second rates, which can legitimately sit below 1 (e.g. a single
 * Çırak produces 0.5 simit/sn). formatNumber floors its input, which would
 * silently display any such rate as "0" — this keeps up to two decimals
 * for small values instead of truncating them away.
 */
export function formatRate(value: number): string {
  if (value <= 0) return "0";
  if (value < 10) {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toString().replace(".", ",");
  }
  return formatNumber(value);
}
