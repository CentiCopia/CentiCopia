# Ledger Rules

These rules govern how money is recorded. Code in `src/core/ledger.ts` and the
worker must follow them.

## 1. Amounts

- Integer cents only (`amount_cents`). Never floats.
- Never zero (also enforced by the schema CHECK).

## 2. Sign convention

Positive = debit.

- A positive entry increases an asset and decreases a liability.
- Asset balance = sum of its entries.
- Liability balance (amount owed) = negated sum of its entries.

## 3. Balanced transactions

Every transaction has at least two entries and its entries sum to exactly zero.
The worker checks this with `isBalanced()` inside one SQL transaction and
rejects anything unbalanced.

## 4. System accounts

Created by `database/schema.sql` with fixed IDs. Identified by type, never by
name. The UI only lists `asset` and `liability` accounts; `is_hidden` is
reserved for the user's own choice to hide a real account.

<!-- markdownlint-disable MD013 -->

| Account          | Type      | ID constant                   | Purpose                             |
| ---------------- | --------- | ----------------------------- | ----------------------------------- |
| Income           | `income`  | `INCOME_ACCOUNT_ID`           | Balancing side of money coming in   |
| Expenses         | `expense` | `EXPENSES_ACCOUNT_ID`         | Balancing side of money going out   |
| Opening Balances | `equity`  | `OPENING_BALANCES_ACCOUNT_ID` | Balancing side of starting balances |

<!-- markdownlint-enable MD013 -->

Possible later: Balance Adjustments (`equity`), for reconciliation.

Categories live on `entries.category_id`, so one Income and one Expenses account
serve every category.

## 5. Common transactions

| Event                          | Entries (cents)                                |
| ------------------------------ | ---------------------------------------------- |
| Open checking with $500        | checking +50000, Opening Balances -50000       |
| Groceries $42.50 from checking | Expenses +4250 (Groceries), checking -4250     |
| Paycheck $1,000                | checking +100000, Income -100000               |
| $20 on a credit card           | Expenses +2000, Visa -2000 (owed: 2000)        |
| Move $100 checking to savings  | checking -10000, savings +10000                |
| Refund $10 to checking         | checking +1000, Expenses -1000 (category kept) |

## 6. Opening balances

An opening balance is an ordinary transaction dated at the account's
`opening_date`, balanced against Opening Balances.

## 7. Status

- Void transactions are excluded from every balance and report.
- Whether pending transactions count toward balances is not yet decided.

## 8. Budgets

Every entry carries a `budget_id`, defaulting to the seeded "Unallocated"
budget. What budgets mean beyond that is decided in Phase 4.
