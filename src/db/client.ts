import type {
  DatabaseCommand,
  DatabaseResponse,
} from './protocol';

import type {
  Account,
  CreateAccountInput,
} from './types';

type Result = Extract<DatabaseResponse, { id: number }>;
type Ready = Extract<DatabaseResponse, { type: 'ready' }>;

export class DatabaseClient {
  private readonly worker: Worker;
  private readonly pending = new Map<
    number,
    {
      resolve: (response: Result) => void;
      reject: (error: Error) => void;
    }
  >();

  private nextId: number = 0;

  public readonly ready: Promise<Ready>;

  public constructor() {
    this.worker = new Worker(
      new URL('./sqlite.worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.ready = new Promise<Ready>((resolve, reject) => {
      this.worker.onmessage = (
        event: MessageEvent<DatabaseResponse>
      ): void => {
        const response = event.data;

        if (response.type === 'ready') {
          resolve(response);
          return;
        }

        if (response.type === 'fatal') {
          const error = new Error(response.message);
          reject(error);
          this.rejectPending(error);
          return;
        }

        const task = this.pending.get(response.id);

        if (task === undefined) return;

        this.pending.delete(response.id);

        if (response.type === 'error') {
          task.reject(new Error(response.message));
        } else {
          task.resolve(response);
        }
      };

      this.worker.onerror = (event: ErrorEvent): void => {
        const error = new Error(
          event.message || 'Database worker failed.'
        );

        reject(error);
        this.rejectPending(error);
      };
    });
  }

  private rejectPending(error: Error): void {
    for (const task of this.pending.values()) {
      task.reject(error);
    }

    this.pending.clear();
  }

  private async send(
    request: DatabaseCommand
  ): Promise<Result> {
    await this.ready;

    const id = ++this.nextId;

    return new Promise<Result>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      this.worker.postMessage({ ...request, id });
    });
  }

  public async getAccounts(): Promise<Account[]> {
    const response = await this.send({
      type: 'getAccounts',
    });

    if (response.type !== 'accounts') {
      throw new Error('Unexpected database response.');
    }

    return response.accounts;
  }

  public async createAccount(
    input: CreateAccountInput
  ): Promise<Account> {
    const response = await this.send({
      type: 'createAccount',
      input,
    });

    if (response.type !== 'accountCreated') {
      throw new Error('Unexpected database response.');
    }

    return response.account;
  }

  public close(): void {
    this.worker.terminate();
    this.rejectPending(
      new Error('Database client was closed.')
    );
  }
}
