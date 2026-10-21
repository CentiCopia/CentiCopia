import type { Account, AccountType } from './types';

export interface AccountRow {
  id: string;
  name: string;
  type: AccountType;
  subtype: string;
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
    isHidden: row.is_hidden === 1,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
  };
}
