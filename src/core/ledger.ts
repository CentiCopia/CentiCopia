export const INCOME_ACCOUNT_ID: string =
  '00000000-0000-4000-8000-000000000101';
export const EXPENSES_ACCOUNT_ID: string =
  '00000000-0000-4000-8000-000000000102';
export const OPENING_BALANCES_ACCOUNT_ID: string =
  '00000000-0000-4000-8000-000000000103';

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
