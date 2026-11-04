import { describe, expect, it } from 'vitest';

import { isBalanced } from '../src/core/ledger';

describe('isBalanced()', (): void => {
  it('accepts a two-entry transfer', (): void => {
    expect(isBalanced([-10000, 10000])).toBe(true);
  });

  it('accepts a split transaction', (): void => {
    expect(isBalanced([3000, 1250, -4250])).toBe(true);
  });

  it('rejects entries that do not sum to zero', (): void => {
    expect(isBalanced([-10000, 9999])).toBe(false);
  });

  it('rejects an empty or single-entry transaction', (): void => {
    expect(isBalanced([])).toBe(false);
    expect(isBalanced([5000])).toBe(false);
  });

  it('rejects zero amounts', (): void => {
    expect(isBalanced([0, 0])).toBe(false);
    expect(isBalanced([5000, 0, -5000])).toBe(false);
  });

  it('rejects non-integer amounts', (): void => {
    expect(isBalanced([10.5, -10.5])).toBe(false);
  });
});
