import type { Account, CreateAccountInput, UpdateAccountInput } from './types';

export type DatabaseCommand =
  | { type: 'getAccounts' }
  | {
      type: 'createAccount';
      input: CreateAccountInput;
    }
  | {
      type: 'updateAccount';
      input: UpdateAccountInput;
    };

export type DatabaseRequest = DatabaseCommand & { id: number };

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
    }
  | {
      type: 'accountUpdated';
      id: number;
      account: Account;
    };
