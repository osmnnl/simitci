import { describe, it, expect } from "vitest";
import { createInitialState } from "./state";
import { click, sell, buyProducer, buyUpgrade } from "./actions";

describe("click", () => {
  it("adds one simit to stock at base power", () => {
    const s = createInitialState(0);
    const next = click(s);
    expect(next.stock).toBe(1);
    expect(next.xp).toBe(1);
    expect(next.stats.totalBaked).toBe(1);
  });

  it("doubles the yield once Güçlü bilek is owned", () => {
    let s = createInitialState(0);
    s = { ...s, money: 100 };
    s = buyUpgrade(s, "guclubilek");
    const next = click(s);
    expect(next.stock).toBe(2);
  });
});

describe("sell", () => {
  it("converts all stock to money at the base price", () => {
    let s = createInitialState(0);
    s = { ...s, stock: 10 };
    const next = sell(s);
    expect(next.stock).toBe(0);
    expect(next.money).toBe(10);
    expect(next.stats.totalEarned).toBe(10);
  });

  it("is a no-op with empty stock", () => {
    const s = createInitialState(0);
    expect(sell(s)).toBe(s);
  });
});

describe("buyProducer", () => {
  it("refuses when money is insufficient", () => {
    const s = createInitialState(0);
    expect(buyProducer(s, "cirak")).toBe(s);
  });

  it("refuses when the level requirement isn't met", () => {
    let s = createInitialState(0);
    s = { ...s, money: 1_000_000 };
    expect(buyProducer(s, "kalfa")).toBe(s); // needs level 3
  });

  it("charges the current cost and increments ownership", () => {
    let s = createInitialState(0);
    s = { ...s, money: 15 };
    const next = buyProducer(s, "cirak");
    expect(next.money).toBe(0);
    expect(next.producers.cirak).toBe(1);
  });
});

describe("buyUpgrade", () => {
  it("cannot be bought twice", () => {
    let s = createInitialState(0);
    s = { ...s, money: 1000 };
    s = buyUpgrade(s, "guclubilek");
    const again = buyUpgrade(s, "guclubilek");
    expect(again).toBe(s);
  });

  it("refuses below the unlock level", () => {
    let s = createInitialState(0);
    s = { ...s, money: 1000 };
    expect(buyUpgrade(s, "tezgah")).toBe(s); // needs level 2
  });
});
