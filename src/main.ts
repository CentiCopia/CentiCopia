import './styles/main.css';

import { netWorth } from './core/ledger';
import { formatCents, parseCents } from './core/money';
import { findExactName, findNearName } from './core/names';
import { DatabaseClient } from './db/client';
import type {
  Account,
  AccountSubtype,
  Party,
  UpdateAccountInput,
} from './db/types';

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
const balanceInput = getElement<HTMLInputElement>('#opening-balance');
const dateInput = getElement<HTMLInputElement>('#opening-date');
const addButton = getElement<HTMLButtonElement>('#add-button');
const refreshButton = getElement<HTMLButtonElement>('#refresh-button');
const showHidden = getElement<HTMLInputElement>('#show-inactive');
const showArchived = getElement<HTMLInputElement>('#show-archived');
const showAdmin = getElement<HTMLInputElement>('#show-admin');
const accountList = getElement<HTMLUListElement>('#account-list');
const accountCount = getElement<HTMLParagraphElement>('#account-count');
const status = getElement<HTMLParagraphElement>('#status');
const databaseInfo = getElement<HTMLElement>('#database-info');
const netWorthText = getElement<HTMLParagraphElement>('#net-worth');
const resetButton = getElement<HTMLButtonElement>('#reset-button');
const partyForm = getElement<HTMLFormElement>('#party-form');
const partyNameInput = getElement<HTMLInputElement>('#party-name');
const partyPhoneInput = getElement<HTMLInputElement>('#party-phone');
const partyEmailInput = getElement<HTMLInputElement>('#party-email');
const partyAddressInput = getElement<HTMLInputElement>('#party-address');
const addPartyButton = getElement<HTMLButtonElement>('#add-party-button');
const refreshPartiesButton = getElement<HTMLButtonElement>(
  '#refresh-parties-button',
);
const partyList = getElement<HTMLUListElement>('#party-list');
const partyCount = getElement<HTMLParagraphElement>('#party-count');
const menuToggle = getElement<HTMLButtonElement>('#menu-toggle');
const viewMenu = getElement<HTMLElement>('#view-menu');

menuToggle.addEventListener('click', (): void => {
  const open: boolean = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  viewMenu.classList.toggle('is-open', !open);
});

const viewTabs = document.querySelectorAll<HTMLButtonElement>('.view-tab');
const views = document.querySelectorAll<HTMLElement>(
  '#view-accounts, #view-parties',
);

for (const tab of viewTabs) {
  tab.addEventListener('click', (): void => {
    for (const other of viewTabs) {
      other.classList.toggle('is-active', other === tab);
    }

    for (const view of views) {
      view.hidden = view.id !== `view-${tab.dataset.view}`;
    }

    viewMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
}

let allAccounts: Account[] = [];
let allParties: Party[] = [];

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
  balanceInput.disabled = value;
  dateInput.disabled = value;
  showAdmin.disabled = value;
  showArchived.disabled = value;
  showHidden.disabled = value;
  resetButton.disabled = value;
  addPartyButton.disabled = value;
  refreshPartiesButton.disabled = value;
  partyNameInput.disabled = value;
  partyPhoneInput.disabled = value;
  partyEmailInput.disabled = value;
  partyAddressInput.disabled = value;
}

function todayLocal(): string {
  // en-CA formats as YYYY-MM-DD in the user's local time zone.
  return new Date().toLocaleDateString('en-CA');
}

function resetForm(): void {
  form.reset();
  dateInput.value = todayLocal();
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

function makeActionButton(
  label: string,
  onClick: () => void,
): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');

  button.type = 'button';
  button.className = 'secondary-button';
  button.textContent = label;
  button.addEventListener('click', onClick);

  return button;
}

function changeAccount(input: UpdateAccountInput, message: string): void {
  runAction(async (): Promise<void> => {
    await database.updateAccount(input);
    await refreshAccounts();
  }, message);
}

function renameAccount(account: Account): void {
  // TODO: replace prompt() with an inline editor later.
  const next: string | null = window.prompt('New account name', account.name);

  if (next === null) return;

  changeAccount({ id: account.id, name: next }, 'Account renamed.');
}

function isAdmin(account: Account): boolean {
  return !['asset', 'liability'].includes(account.type);
}

function renderAccounts(accounts: Account[] = allAccounts): void {
  const visible: Account[] =
    showHidden.checked && showArchived.checked && showAdmin.checked
      ? accounts
      : accounts.filter((account: Account): boolean => {
          if (!showHidden.checked && account.isHidden) return false;
          else if (!showArchived.checked && account.isArchived) return false;
          else if (!showAdmin.checked && isAdmin(account)) return false;
          else return true;
        });
  accountList.replaceChildren();

  accountCount.textContent = `${visible.length} account${visible.length === 1 ? '' : 's'}`;

  netWorthText.textContent = `Net worth: ${formatCents(
    netWorth(
      accounts.map((account) => {
        return {
          type: account.type,
          balanceCents: account.balanceCents,
        };
      }),
    ),
  )}`;

  if (visible.length === 0) {
    const empty = document.createElement('li');

    empty.className = 'empty-state';
    empty.textContent =
      allAccounts.length === 0
        ? 'No accounts yet. Add one to get started.'
        : 'No accounts match the current filters.';

    accountList.append(empty);
    return;
  }

  for (const account of visible) {
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

    if (account.isHidden || account.isArchived || isAdmin(account)) {
      item.classList.add('is-inactive');
    }

    const actions: HTMLDivElement = document.createElement('div');
    actions.className = 'account-actions';

    if (!isAdmin(account)) {
      actions.append(
        makeActionButton('Rename', (): void => renameAccount(account)),
        makeActionButton(account.isHidden ? 'Unhide' : 'Hide', (): void =>
          changeAccount(
            { id: account.id, isHidden: !account.isHidden },
            account.isHidden ? 'Account unhidden.' : 'Account hidden.',
          ),
        ),
        makeActionButton(
          account.isArchived ? 'Unarchive' : 'Archive',
          (): void =>
            changeAccount(
              { id: account.id, isArchived: !account.isArchived },
              account.isArchived ? 'Account unarchived.' : 'Account archived.',
            ),
        ),
      );
    } else {
      actions.append('Admin accounts cannot be modified.');
    }

    const balance = document.createElement('span');
    balance.className = 'account-balance';
    balance.textContent =
      account.type === 'liability'
        ? `${formatCents(account.balanceCents)} owed`
        : formatCents(account.balanceCents);

    item.append(details, balance, badge, actions);
    accountList.append(item);
  }
}

async function refreshAccounts(): Promise<void> {
  allAccounts = await database.getAccounts();
  renderAccounts();
}

function removeParty(party: Party): void {
  void runAction(async (): Promise<void> => {
    await database.removeParty(party.id);
    await refreshParties();
  }, 'Party removed.');
}

function renderParties(parties: Party[] = allParties): void {
  partyList.replaceChildren();
  partyCount.textContent = `${parties.length} parties`;

  if (parties.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No parties yet. Add one to get started.';
    partyList.append(empty);
    return;
  }

  for (const party of parties) {
    const item = document.createElement('li');
    item.className = 'account-item';
    const name = document.createElement('span');
    name.textContent = party.name;
    const remove = makeActionButton('Remove', (): void => {
      removeParty(party);
    });
    item.append(name, remove);
    partyList.append(item);
  }
}

function resetPartyForm(): void {
  partyForm.reset();
}

function partyNameIsAvailable(name: string): boolean {
  const existingNames: string[] = allParties.map(
    (party: Party): string => party.name,
  );
  const exact: string | undefined = findExactName(existingNames, name);
  if (exact !== undefined) {
    setStatus(`A party named "${exact}" already exists.`, 'error');
    return false;
  }

  const near: string | undefined = findNearName(existingNames, name);
  if (near !== undefined) {
    const message: string = `A party named "${near}" already exists. Create "${name}" anyway?`;
    if (!window.confirm(message)) {
      setStatus('Party creation cancelled.');
      return false;
    }
  }

  return true;
}

partyForm.addEventListener('submit', (event: SubmitEvent): void => {
  event.preventDefault();

  const name: string = partyNameInput.value.trim();
  if (!partyNameIsAvailable(name)) return;

  void runAction(async (): Promise<void> => {
    await database.createParty({
      name,
      phone: partyPhoneInput.value,
      email: partyEmailInput.value,
      address: partyAddressInput.value,
    });

    await refreshParties();
    resetPartyForm();
  }, 'Party created successfully.');
});

async function refreshParties(): Promise<void> {
  allParties = await database.getParties();
  renderParties();
}

refreshPartiesButton.addEventListener('click', (): void => {
  void runAction(refreshParties, 'Parties refreshed successfully.');
});

showArchived.addEventListener('change', (): void => {
  renderAccounts();
});
showHidden.addEventListener('change', (): void => {
  renderAccounts();
});
showAdmin.addEventListener('change', (): void => {
  renderAccounts();
});

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
    setStatus(error instanceof Error ? error.message : String(error), 'error');
  } finally {
    setBusy(false);
  }
}

function isAccountSubtype(value: string): value is AccountSubtype {
  return accountTypes.has(value);
}

form.addEventListener('submit', (event: SubmitEvent): void => {
  event.preventDefault();

  const name: string = nameInput.value.trim();
  const existingNames: string[] = allAccounts.map(
    (account: Account): string => account.name,
  );
  const exact: string | undefined = findExactName(existingNames, name);
  if (exact !== undefined) {
    setStatus(`An account named "${exact}" already exists.`, 'error');
    return;
  }

  const near: string | undefined = findNearName(existingNames, name);
  if (near !== undefined) {
    const message: string = `An account named "${near}" already exists. Create "${name}" anyway?`;
    if (!window.confirm(message)) {
      setStatus('Account creation cancelled.');
      return;
    }
  }

  void runAction(async (): Promise<void> => {
    const subtype: string = typeSelect.value;
    const balanceText: string = balanceInput.value.trim();
    const openingBalanceCents: number | null =
      balanceText === '' ? 0 : parseCents(balanceText);

    if (openingBalanceCents === null) {
      throw new Error('Opening balance must be an amount like 500.00.');
    }

    if (name.length === 0) {
      throw new Error('Please enter an account name.');
    }

    if (!isAccountSubtype(subtype)) {
      throw new Error('Invalid account type.');
    }

    await database.createAccount({
      name,
      subtype,
      openingBalanceCents,
      openingDate: dateInput.value,
    });

    await refreshAccounts();
    resetForm();
  }, 'Account created successfully.');
});

refreshButton.addEventListener('click', (): void => {
  void runAction(refreshAccounts, 'Accounts refreshed successfully.');
});

resetButton.addEventListener('click', (): void => {
  const phrase: string | null = window.prompt(
    'Type DELETE MY DATA to erase all accounts and transactions. Backups are not created automatically.',
  );

  if (phrase !== 'DELETE MY DATA') {
    setStatus('Reset cancelled; no data was changed.');
    return;
  }

  void runAction(async (): Promise<void> => {
    await database.resetData();
    await refreshAccounts();
  }, 'All data was reset.');
});

async function initializeApp(): Promise<void> {
  setBusy(true);

  try {
    const ready = await database.ready;

    databaseInfo.textContent = `SQLite ${ready.sqliteVersion} | Schema ${ready.schemaVersion}`;

    await refreshAccounts();
    await refreshParties();

    setStatus('Local database connected.', 'success');
    setBusy(false);
  } catch (error: unknown) {
    setStatus(error instanceof Error ? error.message : String(error), 'error');

    accountCount.textContent = 'Database unavailable.';
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {
    // Offline support is optional; the app still works online.
  });
}

void initializeApp();
