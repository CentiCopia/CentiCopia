import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

import schemaV1 from "../../database/schema.sql?raw";
import { migrate } from "../../database/migrate";
import { isIsoDate } from "../core/dates";
import {
  buildOpeningEntries,
  DEFAULT_BUDGET_ID,
  isBalanced,
} from "../core/ledger";

import type { DatabaseRequest, DatabaseResponse } from "./protocol";

import type {
  Account,
  AccountSubtype,
  AccountType,
  CreateAccountInput,
  UpdateAccountInput,
} from "./types";

import { mapAccount, isAccountRow } from "./account.mapper";
import type { AccountRow } from "./account.mapper";
import { normalizeAccountName } from "../core/accounts";

const ACCOUNT_SELECT: string = `
  SELECT
    a.id, a.name, a.type, a.subtype, a.opening_date,
    a.is_hidden, a.is_archived, a.created_at,
    COALESCE(SUM(e.amount_cents), 0) AS balance_cents
  FROM accounts a
  LEFT JOIN (
    SELECT en.account_id, en.amount_cents
    FROM entries en
    JOIN transactions t ON t.id = en.transaction_id
    WHERE t.status != 'void'
  ) e ON e.account_id = a.id
`;

function getAccountType(subtype: AccountSubtype): AccountType {
  switch (subtype) {
    case "credit_card":
    case "loan":
      return "liability";

    default:
      return "asset";
  }
}

async function initializeDatabase(): Promise<void> {
  if (!self.crossOriginIsolated) {
    throw new Error("Cross-origin isolation is required for OPFS.");
  }

  const sqlite3 = await sqlite3InitModule();

  const opfsAvailable: boolean = Boolean(sqlite3.capi.sqlite3_vfs_find("opfs"));

  if (!opfsAvailable) {
    throw new Error("SQLite OPFS VFS failed to initialize.");
  }

  const resetDatabase: boolean =
    import.meta.env.DEV && import.meta.env.VITE_RESET_DATABASE === "true";

  const databasePath: string = resetDatabase
    ? "file:/centicopia.sqlite3?delete-before-open=1"
    : "/centicopia.sqlite3";

  const db = new sqlite3.oo1.OpfsDb(databasePath);

  try {
    migrate(db, [schemaV1]);

    const schemaVersion: number = Number(db.selectValue("PRAGMA user_version"));

    // Register requests only after the database is ready.
    self.onmessage = (event: MessageEvent<DatabaseRequest>): void => {
      const request = event.data;

      try {
        switch (request.type) {
          case "getAccounts": {
            const rows: unknown[] = db.selectObjects(`
            ${ACCOUNT_SELECT}
            GROUP BY a.id
            ORDER BY a.name
            `);

            const accounts: Account[] = rows.map((row: unknown): Account => {
              if (!isAccountRow(row)) {
                throw new Error("Unexpected account row shape.");
              }

              return mapAccount(row);
            });

            const response: DatabaseResponse = {
              id: request.id,
              type: "accounts",
              accounts,
            };

            self.postMessage(response);
            break;
          }

          case "createAccount": {
            const input: CreateAccountInput = request.input;

            const name = normalizeAccountName(input.name);

            if (name.length === 0 || name.length > 100) {
              throw new Error("Account name must be 1-100 characters.");
            }

            const allowedSubtypes: AccountSubtype[] = [
              "checking",
              "savings",
              "cash",
              "gift_card",
              "credit_card",
              "loan",
              "other",
            ];

            if (!allowedSubtypes.includes(input.subtype)) {
              throw new Error("Invalid account subtype.");
            }

            const id = crypto.randomUUID();
            const type = getAccountType(input.subtype);
            const openingBalanceCents: number = input.openingBalanceCents;
            const openingDate: string | null = input.openingDate;

            if (!Number.isSafeInteger(openingBalanceCents)) {
              throw new Error(
                "Opening balance must be a whole number of cents.",
              );
            }

            if (openingDate !== null && !isIsoDate(openingDate)) {
              throw new Error("Opening date must be a valid date.");
            }

            if (openingBalanceCents !== 0 && openingDate === null) {
              throw new Error(
                "An opening date is required with an opening balance.",
              );
            }

            db.transaction((): void => {
              db.exec({
                sql: `
                  INSERT INTO accounts (id, name, type, subtype, opening_date)
                  VALUES ($id, $name, $type, $subtype, $openingDate)
                `,
                bind: {
                  $id: id,
                  $name: name,
                  $type: type,
                  $subtype: input.subtype,
                  $openingDate: openingDate,
                },
              });

              const entries = buildOpeningEntries(
                id,
                type,
                openingBalanceCents,
              );

              if (entries.length === 0) return;

              if (!isBalanced(entries.map((entry) => entry.amountCents))) {
                throw new Error("Opening entries are not balanced.");
              }

              const transactionId: string = crypto.randomUUID();

              db.exec({
                sql: `
                  INSERT INTO transactions (id, occurred_on, memo)
                  VALUES ($id, $occurredOn, 'Opening balance')
                `,
                bind: { $id: transactionId, $occurredOn: openingDate },
              });

              for (const entry of entries) {
                db.exec({
                  sql: `
                    INSERT INTO entries
                      (id, transaction_id, account_id, amount_cents, budget_id)
                    VALUES ($id, $transactionId, $accountId, $amount, $budgetId)
                  `,
                  bind: {
                    $id: crypto.randomUUID(),
                    $transactionId: transactionId,
                    $accountId: entry.accountId,
                    $amount: entry.amountCents,
                    $budgetId: DEFAULT_BUDGET_ID,
                  },
                });
              }
            });

            const row: unknown = db.selectObject(
              `${ACCOUNT_SELECT} WHERE a.id = ? GROUP BY a.id`,
              [id],
            );

            if (!isAccountRow(row)) {
              throw new Error("Account creation failed.");
            }

            const response: DatabaseResponse = {
              id: request.id,
              type: "accountCreated",
              account: mapAccount(row),
            };

            self.postMessage(response);
            break;
          }

          case "updateAccount": {
            const input: UpdateAccountInput = request.input;

            if (
              input.name === undefined &&
              input.isHidden === undefined &&
              input.isArchived === undefined
            ) {
              throw new Error("Nothing to update.");
            }

            const name: string | undefined =
              input.name === undefined
                ? undefined
                : normalizeAccountName(input.name);

            const existing: unknown = db.selectObject(
              `${ACCOUNT_SELECT}
                    WHERE a.id = ? AND a.type IN ('asset', 'liability')
                    GROUP BY a.id`,
              [input.id],
            );

            if (!isAccountRow(existing)) {
              throw new Error("Account not found.");
            }

            if (input.isArchived === true && existing.balance_cents !== 0) {
              throw new Error(
                "Only accounts with a zero balance can be archived.",
              );
            }

            db.transaction((): void => {
              if (name !== undefined) {
                db.exec({
                  sql: "UPDATE accounts SET name = $name WHERE id = $id",
                  bind: { $name: name, $id: input.id },
                });
              }

              if (input.isHidden !== undefined) {
                db.exec({
                  sql: "UPDATE accounts SET is_hidden = $value WHERE id = $id",
                  bind: { $value: input.isHidden ? 1 : 0, $id: input.id },
                });
              }

              if (input.isArchived !== undefined) {
                db.exec({
                  sql: "UPDATE accounts SET is_archived = $value WHERE id = $id",
                  bind: { $value: input.isArchived ? 1 : 0, $id: input.id },
                });
              }
            });

            const updated: unknown = db.selectObject(
              `${ACCOUNT_SELECT} WHERE a.id = ? GROUP BY a.id`,
              [input.id],
            );

            if (!isAccountRow(updated)) {
              throw new Error("Account update failed.");
            }

            const response: DatabaseResponse = {
              id: request.id,
              type: "accountUpdated",
              account: mapAccount(updated),
            };

            self.postMessage(response);
            break;
          }
        }
      } catch (error: unknown) {
        const response: DatabaseResponse = {
          id: request.id,
          type: "error",
          message: error instanceof Error ? error.message : String(error),
        };
        self.postMessage(response);
      }
    };

    const ready: DatabaseResponse = {
      type: "ready",
      sqliteVersion: sqlite3.version.libVersion,
      schemaVersion,
    };

    self.postMessage(ready);

    // Keep the database open for future requests.
  } catch (error) {
    db.close();
    throw error;
  }
}

void initializeDatabase().catch((error: unknown): void => {
  const response: DatabaseResponse = {
    type: "fatal",
    message: error instanceof Error ? error.message : String(error),
  };

  self.postMessage(response);
});
