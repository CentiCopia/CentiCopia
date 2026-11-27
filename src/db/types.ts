export type AccountType =
  'asset' | 'liability' | 'income' | 'expense' | 'equity';

export type AccountSubtype =
  | 'checking'
  | 'savings'
  | 'cash'
  | 'gift_card'
  | 'credit_card'
  | 'loan'
  | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  subtype: string;
  balanceCents: number;
  openingDate: string | null;
  isHidden: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface CreateAccountInput {
  name: string;
  subtype: AccountSubtype;
  openingBalanceCents: number;
  openingDate: string | null;
}

export interface UpdateAccountInput {
  id: string;
  name?: string;
  isHidden?: boolean;
  isArchived?: boolean;
}

export interface Party {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
}

export interface CreatePartyInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}
