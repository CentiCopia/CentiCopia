import type { Party } from './types';
export interface PartyRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export function mapParty(row: PartyRow): Party {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    createdAt: row.created_at,
  };
}

export function isPartyRow(value: unknown): value is PartyRow {
  if (typeof value !== 'object' || value === null) return false;

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    (row.phone === null || typeof row.phone === 'string') &&
    (row.email === null || typeof row.email === 'string') &&
    (row.address === null || typeof row.address === 'string') &&
    typeof row.created_at === 'string'
  );
}
