import { describe, expect, it } from 'vitest';

import { mapAccount } from '../src/db/account.mapper';
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
      is_hidden: 1,
      is_archived: 1,
      created_at: '2026-10-21 10:00:00',
    };

    const result: Account = mapAccount(row);

    expect(result.isHidden).toBe(true);
    expect(result.isArchived).toBe(true);
  });
});
