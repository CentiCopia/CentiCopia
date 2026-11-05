import { describe, expect, it } from "vitest";

import {
  isBalanced,
  toDisplayBalance,
  netWorth,
  buildOpeningEntries,
  EntryDraft,
} from "../src/core/ledger";
import { OPENING_BALANCES_ACCOUNT_ID } from "../src/core/ledger";

describe("isBalanced()", (): void => {
  it("accepts a two-entry transfer", (): void => {
    expect(isBalanced([-10000, 10000])).toBe(true);
  });

  it("accepts a split transaction", (): void => {
    expect(isBalanced([3000, 1250, -4250])).toBe(true);
  });

  it("rejects entries that do not sum to zero", (): void => {
    expect(isBalanced([-10000, 9999])).toBe(false);
  });

  it("rejects an empty or single-entry transaction", (): void => {
    expect(isBalanced([])).toBe(false);
    expect(isBalanced([5000])).toBe(false);
  });

  it("rejects zero amounts", (): void => {
    expect(isBalanced([0, 0])).toBe(false);
    expect(isBalanced([5000, 0, -5000])).toBe(false);
  });

  it("rejects non-integer amounts", (): void => {
    expect(isBalanced([10.5, -10.5])).toBe(false);
  });
});

describe("toDisplayBalance()", (): void => {
  it("returns a positive asset", (): void => {
    expect(toDisplayBalance("asset", 50000)).toBe(50000);
  });

  it("returns a positive liability", (): void => {
    expect(toDisplayBalance("liability", -2000)).toBe(2000);
  });

  it("returns 0 instead of -0", (): void => {
    expect(toDisplayBalance("liability", 0)).toBe(0);
  });
});

describe("netWorth()", (): void => {
  it("calculates correctly", (): void => {
    expect(
      netWorth([
        {
          type: "asset",
          balanceCents: 50000,
        },
        {
          type: "liability",
          balanceCents: 2000,
        },
      ]),
    ).toBe(48000);
  });

  it("returns 0 for an empty set", (): void => {
    expect(netWorth([])).toBe(0);
  });
});

describe("buildOpeningEntries()", (): void => {
  // In each non-empty case, isBalanced on the amounts is true.

  // buildOpeningEntries: asset 50000 gives +50000 on the account and -50000 on Opening Balances.
  it("properly calculates assets", (): void => {
    const entries: EntryDraft[] = buildOpeningEntries("0001", "asset", 50000);

    expect(entries).toStrictEqual([
      {
        accountId: "0001",
        amountCents: 50000,
      },
      {
        accountId: OPENING_BALANCES_ACCOUNT_ID,
        amountCents: -50000,
      },
    ]);
    expect(isBalanced(entries.map((entry) => entry.amountCents))).toBe(true);
  });

  // Liability 2000 gives -2000 on the account and +2000 on Opening Balances.
  it("properly calculates liabilities", (): void => {
    const entries: EntryDraft[] = buildOpeningEntries(
      "0002",
      "liability",
      2000,
    );

    expect(entries).toStrictEqual([
      {
        accountId: "0002",
        amountCents: -2000,
      },
      {
        accountId: OPENING_BALANCES_ACCOUNT_ID,
        amountCents: 2000,
      },
    ]);
    expect(isBalanced(entries.map((entry) => entry.amountCents))).toBe(true);
  });

  // Zero gives [].
  it("returns an empty array for a starting balance of zero", (): void => {
    const entries: EntryDraft[] = buildOpeningEntries("0003", "asset", 0);

    expect(entries).toStrictEqual([]);
  });
});
