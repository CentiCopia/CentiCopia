# CentiCopia Design Plan

Broad plan only. Each phase should get its own short spec before coding.

## 1. Where things stand

- Working: create and list accounts, stored in SQLite (WASM) on OPFS, behind a
Web Worker with a typed request/response protocol.
- Schema only (no code): transactions, entries, categories, budgets,
budget_allocations, goals, settings.
- Empty: `src/ui/`, `public/sw.js`, `public/manifest.webmanifest`.

The foundation (worker, protocol, client, mapper, migrations) is solid and
should not be redesigned. The plan builds on it.

## 2. Guiding principles

1. Local-first. Nothing leaves the device unless the user opts in.
2. Money is integer cents. No floats, ever.
3. Correctness over features. A finance app that is wrong once loses trust.
4. Simple surface, rigorous core. Users see "money in, money out, transfer"; the
   database does double-entry underneath.
5. Pure logic is testable logic. SQL stays in the worker; rules live in pure functions.
6. Never lose data: archive instead of delete, export always available.

## 3. Architecture

```text
UI views (src/ui)  ->  DatabaseClient  ->  worker  ->  SQLite/OPFS
        |                                     |
   view state                     validators, SQL, mappers
```

- **Worker**: the only code that touches SQL. Split the growing `switch` into
one handler module per domain (`accounts`, `transactions`, `categories`,
`budgets`, `goals`), each exporting `handle(db, command)`. The worker just
dispatches.
- **Protocol**: keep the discriminated unions. Consider grouping commands by
domain so `protocol.ts` doesn't become one giant list.
- **Client**: stays thin. One typed method per command.
- **UI**: no framework for now. Small view modules (`renderAccounts`,
`renderTransactions`, ...) with a tiny hash router (`#/accounts`,
`#/transactions`, `#/budget`). Revisit a framework only if state wiring becomes
painful.
- **Shared pure code** (`src/core/`): money formatting/parsing, date helpers,
validators, balance and budget math. This is where most unit tests live.

## 4. Data model decisions to settle early

These affect every later phase, so decide them before building transactions.

1. **Double-entry invariant.** For every transaction, `SUM(entries.amount_cents)
   = 0`. SQLite can't express this as a simple CHECK across rows, so enforce it
in the worker inside one SQL transaction, and add an integrity-check command
that reports violations.
2. **Sign convention.** Pick one and document it (suggested: positive = debit).
   Then an asset balance is the sum of its entries and a liability balance is
the negated sum. Write this next to `getAccountType`.
3. **Transfers** are simply a transaction with two asset/liability entries. No
   special table.
4. **Everyday income/expense UX over income/expense accounts.** The schema has
   `income`/`expense`/`equity` account types and also `categories`. Choose one
story: categories are what the user sees, and a hidden system account per kind
(or one "Income" and one "Expenses" account) is the balancing side. Otherwise
every expense needs two ledger sides the user has to understand.
5. **Opening balances.** `accounts.opening_date` exists but nothing uses it, and
   it is missing from `AccountRow`/`mapAccount`. Plan: an opening balance is an
ordinary transaction against an `equity` "Opening Balances" account.
6. **Budget semantics.** `entries.budget_id` is required, so budgets behave like
   envelopes or funds, with "Unallocated" as the default. Decide whether
`budget_allocations` are monthly caps per category (a classic budget) or funding
moves between envelopes. This is the largest product decision in the app; check
it against the README goal of "simple, no financial jargon".
7. **Pending/void.** `status` allows `pending` and `void`. Define whether
   balances include pending, and that void entries are excluded from every sum.
8. **Currency.** Single currency (`settings.currency`) for v1. Say so
   explicitly; multi-currency changes the schema.
9. **Indexes.** Add `transactions(occurred_on)` and `budget_allocations(period)`
   when queries appear.

Prior art worth a look before finalizing 4 and 6 (from general knowledge, not
freshly researched): GnuCash and hledger/Beancount for double-entry modelling,
Actual Budget for envelope budgeting in a local-first app, Firefly III for how a
self-hosted tool presents double-entry simply.

## 5. Roadmap

### Phase 0: hygiene (small PRs)

- Gate or remove worker `console.log` calls that print account data (privacy
rule). (Done)
- Fix `package.json` license (ISC vs MIT), `description`, `main`. (Done)
- Replace the `as unknown as AccountRow[]` assertion with a runtime row check.
- Add `opening_date` to row/mapper/types or drop it from the schema while pre-release.
- Add a formatter/linter (decide; keep config minimal).

### Phase 1: accounts complete

- Rename, archive/unarchive, hide/unhide.
- Opening balance entry.
- Balance shown per account and net worth total (computed from entries).

### Phase 2: transactions

- Add expense, income, transfer forms.
- Transaction list per account with running balance, date filter, text search.
- Edit and void (not hard delete).
- `src/core/money.ts`: parse "12.34" to 1234 and format back, with tests for
edge cases (negatives, no decimals, commas).

### Phase 3: categories

- Seed a small default set; user can add, rename, archive, nest one level.
- Category on entries; per-month spending by category.

### Phase 4: budgets

- Per-month allocation per category, with remaining/overspent display.
- Roll-over rule decided in section 4.

### Phase 5: goals and reports

- Goals progress from account or budget balance.
- Simple reports: spending by category, net worth over time, income vs expense.

### Phase 6: data portability and safety

- Export/import the whole database file (OPFS file to download, and back).
- CSV import for bank statements with column mapping and duplicate detection.
- CSV export of transactions.
- Backup reminder in the UI.

### Phase 7: PWA/offline

- Fill in `manifest.webmanifest` and `sw.js` (cache the app shell; the data is
already local).
- Production hosting must send COOP/COEP headers, or OPFS fails.

### Phase 8: optional sync (design first, code later)

- Opt-in only. Start with whole-database snapshot sync to a user-chosen
provider, with a version/device stamp and "keep both" conflict handling, before
anything merge-based.
- Needs its own design doc covering encryption at rest in the cloud, conflict
rules, and recovery.

## 6. UI direction

- Layout: left nav (Accounts, Transactions, Budget, Goals, Reports, Settings),
main panel, status line in the footer as today.
- Fast data entry is the core flow: a quick-add form with keyboard-friendly fields.
- Mobile-first responsive CSS (the existing breakpoint approach is fine).
- Accessibility: labels, focus styles, and `aria-live` status are already
started; keep that habit.
- Keep copy plain-language ("Money in", "Money out", "Move money").

## 7. Testing strategy

- Unit test all pure logic (money, balances, budget math, validators, mappers)
with Vitest.
- Handler logic that needs SQL: investigate running sqlite-wasm in-memory under
Node (`oo1.DB(':memory:')`) so handlers can be tested against the real schema
without OPFS. If that works, it closes the biggest current test gap (no worker
coverage).
- Add an integrity-check test: after any sequence of operations, every
transaction sums to zero and foreign keys hold.
- Optional later: a Playwright smoke test for the OPFS path.

## 8. Risks
<!-- markdownlint-disable MD013 -->

| Risk | Mitigation |
| --- | --- |
| Browser storage cleared or evicted | Request persistent storage (`navigator.storage.persist()`), export/backup (Phase 6) |
| Two tabs open on one OPFS database | Detect and show a clear "already open elsewhere" message; consider Web Locks |
| Schema changes after real users exist | Freeze v1 SQL once shipped; new numbered migration files |
| Budget model too complex for "simple by design" | Decide in section 4 before Phase 4; prototype on paper first |
| Sync data loss | Keep sync last, opt-in, snapshot-first |

<!-- markdownlint-enable MD013 -->
## 9. Suggested next step

Do Phase 0, then settle section 4 items 1, 2, 4 and 5 in a short note, and build
Phase 1 (balances need those decisions).
