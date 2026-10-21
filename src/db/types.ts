export type AccountType =
  | 'asset'
  | 'liability'
  | 'income'
  | 'expense'
  | 'equity';

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
  isHidden: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface CreateAccountInput {
  name: string;
  subtype: AccountSubtype;
}
