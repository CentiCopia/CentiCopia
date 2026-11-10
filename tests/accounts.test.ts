import { describe, expect, it } from 'vitest';
import { normalizeAccountName } from '../src/core/accounts';

const errorMsg = 'Account name must be 1-100 characters.';

describe('normalizeAccountName()', (): void => {
  it('trims the text', (): void => {
    expect(normalizeAccountName('    name    ')).toBe('name');
  });

  it('rejects an empty name', (): void => {
    expect(() => normalizeAccountName('')).toThrow(errorMsg);
    expect(() => normalizeAccountName('    ')).toThrow(errorMsg);
  });

  it('accepts names up to 100 characters long', (): void => {
    const longName = '*'.repeat(100);

    expect(normalizeAccountName(longName)).toBe(longName);
  });

  it('rejects names over 100 characters', (): void => {
    expect(() => normalizeAccountName('*'.repeat(101))).toThrow(errorMsg);
  });
});
