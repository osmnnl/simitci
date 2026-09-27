const SUFFIXES = ["", "K", "M", "Mr", "T", "Ka", "Kn", "Sk", "Sp", "Ok", "N", "D"];

/** 999 → "999", 1234 → "1,23K", 4.5e9 → "4,50Mr"; beyond the table → "1,23e45". */
export function fmt(value: number): string {
  if (!Number.isFinite(value)) return "∞";
  if (value < 1000) return Math.floor(value).toLocaleString("tr-TR");
  const exp = Math.floor(Math.log10(value) / 3);
  if (exp >= SUFFIXES.length) {
    const e = Math.floor(Math.log10(value));
    return `${(value / 10 ** e).toFixed(2).replace(".", ",")}e${e}`;
  }
  const v = value / 1000 ** exp;
  const digits = v < 10 ? 2 : v < 100 ? 1 : 0;
  return `${v.toFixed(digits).replace(".", ",")}${SUFFIXES[exp]}`;
}

export const money = (v: number) => `₺${fmt(v)}`;

export function rate(v: number): string {
  if (v > 0 && v < 10) return (Math.round(v * 10) / 10).toString().replace(".", ",");
  return fmt(v);
}

export function duration(sec: number): string {
  sec = Math.max(0, Math.floor(sec));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d} gün ${h} sa`;
  if (h > 0) return `${h} sa ${m} dk`;
  if (m > 0) return `${m} dk ${sec % 60} sn`;
  return `${sec} sn`;
}
