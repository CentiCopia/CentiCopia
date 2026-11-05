import { describe, it, expect } from "vitest";

import { isIsoDate } from "../src/core/dates";

describe("isIsoDate()", (): void => {
  it("returns true for appropriate dates", (): void => {
    expect(isIsoDate("2026-11-05")).toBe(true);
  });

  it("returns false for bad dates", (): void => {
    const badDates: string[] = ["2026-02-31", "2026-13-01", "11/05/2026", ""];

    for (const date of badDates) {
      expect(isIsoDate(date)).toBe(false);
    }
  });
});
