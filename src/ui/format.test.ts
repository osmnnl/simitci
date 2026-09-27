import { describe, it, expect } from "vitest";
import { formatNumber, formatMoney, formatRate } from "./format";

describe("formatNumber", () => {
  it("shows small numbers as-is", () => {
    expect(formatNumber(999)).toBe("999");
  });

  it("abbreviates thousands and millions", () => {
    expect(formatNumber(1200)).toBe("1,2K");
    expect(formatNumber(3_400_000)).toBe("3,4M");
  });

  it("drops the decimal once the value is 10 or more in its unit", () => {
    expect(formatNumber(125_000)).toBe("125K");
  });
});

describe("formatMoney", () => {
  it("prefixes with the lira sign", () => {
    expect(formatMoney(50)).toBe("₺50");
  });
});

describe("formatRate", () => {
  it("does not collapse sub-1 rates to zero", () => {
    expect(formatRate(0.5)).toBe("0,5");
  });

  it("shows whole numbers without decimals", () => {
    expect(formatRate(4)).toBe("4");
  });

  it("falls back to formatNumber above 10", () => {
    expect(formatRate(1200)).toBe(formatNumber(1200));
  });

  it("treats non-positive rates as zero", () => {
    expect(formatRate(0)).toBe("0");
  });
});
