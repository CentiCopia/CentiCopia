import { describe, expect, it } from 'vitest';

import { mapAccount, isAccountRow } from '../src/db/account.mapper';
import type { AccountRow } from '../src/db/account.mapper';
import type { Account } from '../src/db/types';

describe('mapAccount()', (): void => {
  it('maps a checking account correctly', (): void => {
    // Arrange
    const row: AccountRow = {
      id: 'account-001',
      name: 'Main Checking',
      type: 'asset',
      subtype: 'checking',
      balance_cents: 0,
      opening_date: null,
      is_hidden: 0,
      is_archived: 0,
      created_at: '2026-10-21 10:00:00',
    };

    // Act
    const result: Account = mapAccount(row);

    // Assert
    expect(result).toEqual({
      id: 'account-001',
      name: 'Main Checking',
      type: 'asset',
      subtype: 'checking',
      balanceCents: 0,
      openingDate: null,
      isHidden: false,
      isArchived: false,
      createdAt: '2026-10-21 10:00:00',
    });
  });

  it('maps a credit card correctly', (): void => {
    const row: AccountRow = {
      id: 'account-002',
      name: 'Visa Credit Card',
      type: 'liability',
      subtype: 'credit_card',
      balance_cents: 0,
      opening_date: null,
      is_hidden: 0,
      is_archived: 0,
      created_at: '2026-10-21 10:00:00',
    };

    const result: Account = mapAccount(row);

    expect(result.name).toBe('Visa Credit Card');
    expect(result.type).toBe('liability');
    expect(result.subtype).toBe('credit_card');
  });

  it('converts SQLite flags to booleans', (): void => {
    const row: AccountRow = {
      id: 'account-003',
      name: 'Archived Savings',
      type: 'asset',
      subtype: 'savings',
      balance_cents: 0,
      opening_date: null,
      is_hidden: 1,
      is_archived: 1,
      created_at: '2026-10-21 10:00:00',
    };

    const result: Account = mapAccount(row);

    expect(result.isHidden).toBe(true);
    expect(result.isArchived).toBe(true);
  });

  it('returns opening_date', (): void => {
    const row: AccountRow = {
      id: 'account-004',
      name: 'Main Savings',
      type: 'asset',
      subtype: 'savings',
      balance_cents: 0,
      opening_date: '2026-01-15',
      is_hidden: 1,
      is_archived: 1,
      created_at: '2026-10-21 10:00:00',
    };

    const result: Account = mapAccount(row);

    expect(result.openingDate).toBe('2026-01-15');
  });
});

describe('isAccountRow()', (): void => {
  it('detects null rows', (): void => {
    // Arrange
    const row = null;

    // Act
    const result: boolean = isAccountRow(row);

    // Assert
    expect(result).toBe(false);
  });

  it('detects missing name', (): void => {
    // Arrange
    const row = {
      id: 'account-003',
      type: 'asset',
      subtype: 'savings',
      balance_cents: 0,
      is_hidden: 1,
      is_archived: 1,
      created_at: '2026-10-21 10:00:00',
    };

    // Act
    const result: boolean = isAccountRow(row);

    // Assert
    expect(result).toBe(false);
  });

  it('detects bogus account type', (): void => {
    // Arrange
    const row = {
      id: 'account-003',
      name: 'Archived Savings',
      type: 'bogus',
      subtype: 'savings',
      balance_cents: 0,
      is_hidden: 1,
      is_archived: 1,
      created_at: '2026-10-21 10:00:00',
    };

    // Act
    const result: boolean = isAccountRow(row);

    // Assert
    expect(result).toBe(false);
  });

  it('detects invalid types', (): void => {
    // Arrange
    const row: unknown = {
      id: 'account-003',
      name: 'Archived Savings',
      type: 'asset',
      subtype: 'savings',
      balance_cents: 0,
      is_hidden: '1',
      is_archived: 1,
      created_at: '2026-10-21 10:00:00',
    };

    // Act
    const result: boolean = isAccountRow(row);

    // Assert
    expect(result).toBe(false);
  });

  it('detects a valid row', (): void => {
    // Arrange
    const row: unknown = {
      id: 'account-001',
      name: 'Main Checking',
      type: 'asset',
      subtype: 'checking',
      balance_cents: 0,
      opening_date: null,
      is_hidden: 0,
      is_archived: 0,
      created_at: '2026-10-21 10:00:00',
    };

    // Act
    const result: boolean = isAccountRow(row);

    // Assert
    expect(result).toBe(true);
  });

  it('rejects invalid opening_date', (): void => {
    // Arrange
    const row: unknown = {
      id: 'account-001',
      name: 'Main Checking',
      type: 'asset',
      subtype: 'checking',
      opening_date: 20260115,
      is_hidden: 0,
      is_archived: 0,
      created_at: '2026-10-21 10:00:00',
    };

    // Act
    const result: boolean = isAccountRow(row);

    // Assert
    expect(result).toBe(false);
  });
});
