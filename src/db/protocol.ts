import type {
  Account,
  CreateAccountInput,
} from './types';

export type DatabaseCommand =
  | { type: 'getAccounts' }
  | {
    type: 'createAccount';
    input: CreateAccountInput;
  };

export type DatabaseRequest =
  DatabaseCommand & { id: number };

export type DatabaseResponse =
  | {
    type: 'ready';
    sqliteVersion: string;
    schemaVersion: number;
  }
  | {
    type: 'fatal';
    message: string;
  }
  | {
    type: 'accounts';
    id: number;
    accounts: Account[];
  }
  | {
    type: 'accountCreated';
    id: number;
    account: Account;
  }
  | {
    type: 'error';
    id: number;
    message: string;
  };
