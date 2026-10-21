import './styles/main.css';

import { DatabaseClient } from './db/client';
import type { Account, AccountSubtype } from './db/types';

const database = new DatabaseClient();

const accountTypes: ReadonlySet<string> = new Set<AccountSubtype>([
  'checking',
  'savings',
  'cash',
  'gift_card',
  'credit_card',
  'loan',
  'other',
]);

const form = getElement<HTMLFormElement>('#account-form');
const nameInput = getElement<HTMLInputElement>('#account-name');
const typeSelect = getElement<HTMLSelectElement>('#account-type');
const addButton = getElement<HTMLButtonElement>('#add-button');
const refreshButton = getElement<HTMLButtonElement>('#refresh-button');
const accountList = getElement<HTMLUListElement>('#account-list');
const accountCount = getElement<HTMLParagraphElement>('#account-count');
const status = getElement<HTMLParagraphElement>('#status');
const databaseInfo = getElement<HTMLElement>('#database-info');

let busy: boolean = true;

function getElement<T extends Element>(selector: string): T {
  const element: T | null = document.querySelector<T>(selector);

  if (element === null) {
    throw new Error(`Missing UI element: ${selector}`);
  }

  return element;
}

function setBusy(value: boolean): void {
  busy = value;

  addButton.disabled = value;
  refreshButton.disabled = value;
  nameInput.disabled = value;
  typeSelect.disabled = value;
}

function setStatus(
  message: string,
  state: 'success' | 'error' | 'neutral' = 'neutral',
): void {
  status.textContent = message;
  status.dataset.state = state;
}

function formatAccountType(subtype: string): string {
  const labels: Record<string, string> = {
    checking: 'Checking',
    savings: 'Savings',
    cash: 'Cash',
    gift_card: 'Gift Card',
    credit_card: 'Credit Card',
    loan: 'Loan',
    other: 'Other',
  };

  return labels[subtype] ?? subtype;
}

function renderAccounts(accounts: Account[]): void {
  accountList.replaceChildren();

  accountCount.textContent =
    `${accounts.length} account${accounts.length === 1 ? '' : 's'}`;

  if (accounts.length === 0) {
    const empty = document.createElement('li');

    empty.className = 'empty-state';
    empty.textContent = 'No accounts yet. Add one to get started.';

    accountList.append(empty);
    return;
  }

  for (const account of accounts) {
    const item = document.createElement('li');
    item.className = 'account-item';

    const details = document.createElement('div');
    details.className = 'account-details';

    const name = document.createElement('strong');
    name.textContent = account.name;

    const subtype = document.createElement('span');
    subtype.textContent = formatAccountType(account.subtype);

    const id = document.createElement('small');
    id.textContent = account.id;
    id.title = 'Account ID';

    details.append(name, subtype, id);

    const badge = document.createElement('span');
    badge.className = 'account-badge';
    badge.textContent = account.type;

    item.append(details, badge);
    accountList.append(item);
  }
}

async function refreshAccounts(): Promise<void> {
  const accounts: Account[] = await database.getAccounts();
  renderAccounts(accounts);
}

async function runAction(
  action: () => Promise<void>,
  successMessage: string,
): Promise<void> {
  if (busy) return;

  setBusy(true);
  setStatus('Working...');

  try {
    await action();
    setStatus(successMessage, 'success');
  } catch (error: unknown) {
    setStatus(
      error instanceof Error ? error.message : String(error),
      'error',
    );
  } finally {
    setBusy(false);
  }
}

function isAccountSubtype(value: string): value is AccountSubtype {
  return accountTypes.has(value);
}

form.addEventListener('submit', (event: SubmitEvent): void => {
  event.preventDefault();

  void runAction(async (): Promise<void> => {
    const name: string = nameInput.value.trim();
    const subtype: string = typeSelect.value;

    if (name.length === 0) {
      throw new Error('Please enter an account name.');
    }

    if (!isAccountSubtype(subtype)) {
      throw new Error('Invalid account type.');
    }

    await database.createAccount({ name, subtype });

    await refreshAccounts();
    form.reset();
  }, 'Account created successfully.');
});

refreshButton.addEventListener('click', (): void => {
  void runAction(
    refreshAccounts,
    'Accounts refreshed successfully.',
  );
});

async function initializeApp(): Promise<void> {
  setBusy(true);

  try {
    const ready = await database.ready;

    databaseInfo.textContent =
      `SQLite ${ready.sqliteVersion} | Schema ${ready.schemaVersion}`;

    await refreshAccounts();

    setStatus('Local database connected.', 'success');
    setBusy(false);
  } catch (error: unknown) {
    setStatus(
      error instanceof Error ? error.message : String(error),
      'error',
    );

    accountCount.textContent = 'Database unavailable.';
  }
}

void initializeApp();
