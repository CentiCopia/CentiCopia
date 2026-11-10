import { assert, describe, expect, it } from 'vitest';

import { formatCents } from '../src/core/money';

describe('formatCents()', (): void => {
  it('properly displays currency in the en-US locale', (): void => {
    expect(formatCents(123456, 'USD', 'en-US')).toBe('$1,234.56');
    expect(formatCents(5, 'USD', 'en-US')).toBe('$0.05');
    expect(formatCents(-250, 'USD', 'en-US')).toBe('-$2.50');
    expect(formatCents(0, 'USD', 'en-US')).toBe('$0.00');
    expect(formatCents(-0, 'USD', 'en-US')).toBe('$0.00');
    expect(() => formatCents(10.5)).toThrow(RangeError);
  });
});
