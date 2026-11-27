import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
  Party,
  CreatePartyInput,
} from './types';

export type DatabaseCommand =
  | { type: 'getAccounts' }
  | {
      type: 'createAccount';
      input: CreateAccountInput;
    }
  | {
      type: 'updateAccount';
      input: UpdateAccountInput;
    }
  | { type: 'resetData' }
  | { type: 'getParties' }
  | {
      type: 'createParty';
      input: CreatePartyInput;
    }
  | { type: 'removeParty'; partyId: string };

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
    }
  | {
      type: 'resetCompleted';
      id: number;
    }
  | {
      type: 'parties';
      id: number;
      parties: Party[];
    }
  | {
      type: 'partyCreated';
      id: number;
      party: Party;
    }
  | {
      type: 'partyRemoved';
      id: number;
    };
