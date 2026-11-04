import type { AccountType } from "../db/types";

export const INCOME_ACCOUNT_ID: string = "00000000-0000-4000-8000-000000000101";
export const EXPENSES_ACCOUNT_ID: string =
  "00000000-0000-4000-8000-000000000102";
export const OPENING_BALANCES_ACCOUNT_ID: string =
  "00000000-0000-4000-8000-000000000103";

/**
 * A transaction is balanced when its entries are non-zero integer cents
 * that sum to exactly zero. Positive = debit.
 */
export function isBalanced(amounts: readonly number[]): boolean {
  if (amounts.length < 2) return false;

  let sum: number = 0;

  for (const amount of amounts) {
    if (!Number.isSafeInteger(amount) || amount === 0) return false;
    sum += amount;
  }

  return sum === 0;
}

/**
 * Convert the raw sum of an account's entries into the balance a user
 * expects: money held for assets, amount owed for liabilities.
 */
export function toDisplayBalance(
  type: AccountType,
  rawSumCents: number,
): number {
  return type === "liability" ? 0 - rawSumCents : rawSumCents;
}

/** Net worth = assets held minus liabilities owed. */
export function netWorth(
  accounts: readonly { type: AccountType; balanceCents: number }[],
): number {
  let total: number = 0;

  for (const account of accounts) {
    if (account.type === "asset") total += account.balanceCents;
    else if (account.type === "liability") total -= account.balanceCents;
  }

  return total;
}
