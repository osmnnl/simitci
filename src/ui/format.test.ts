import { describe, expect, it } from "vitest";
import { duration, fmt, rate } from "./format";

describe("format", () => {
  it("abbreviates with Turkish suffixes", () => {
    expect(fmt(999)).toBe("999");
    expect(fmt(1234)).toBe("1,23K");
    expect(fmt(4.5e9)).toBe("4,50Mr");
    expect(fmt(2.5e20)).toBe("250Kn");
    expect(fmt(1.5e40)).toBe("1,50e40");
  });
  it("keeps small rates readable", () => expect(rate(0.5)).toBe("0,5"));
  it("formats durations", () => {
    expect(duration(59)).toBe("59 sn");
    expect(duration(3 * 3600 + 120)).toBe("3 sa 2 dk");
    expect(duration(90000)).toBe("1 gün 1 sa");
  });
});
