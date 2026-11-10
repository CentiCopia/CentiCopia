import { toDisplayBalance } from '../core/ledger';
import type { Account, AccountType } from './types';

export interface AccountRow {
  id: string;
  name: string;
  type: AccountType;
  subtype: string;
  opening_date: string | null;
  balance_cents: number;
  is_hidden: number;
  is_archived: number;
  created_at: string;
}

export function mapAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    subtype: row.subtype,
    balanceCents: toDisplayBalance(row.type, row.balance_cents),
    openingDate: row.opening_date,
    isHidden: row.is_hidden === 1,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
  };
}

const accountTypes: readonly string[] = [
  'asset',
  'liability',
  'income',
  'expense',
  'equity',
];

export function isAccountRow(value: unknown): value is AccountRow {
  if (typeof value != 'object' || value === null) return false;

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.type === 'string' &&
    accountTypes.includes(row.type) &&
    typeof row.subtype === 'string' &&
    typeof row.balance_cents === 'number' &&
    (row.opening_date === null || typeof row.opening_date === 'string') &&
    typeof row.is_hidden === 'number' &&
    typeof row.is_archived === 'number' &&
    typeof row.created_at === 'string'
  );
}
