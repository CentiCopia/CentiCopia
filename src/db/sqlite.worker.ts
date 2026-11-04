import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

import schemaV1 from "../../database/schema.sql?raw";
import { migrate } from "../../database/migrate";

import type { DatabaseRequest, DatabaseResponse } from "./protocol";

import type {
  Account,
  AccountSubtype,
  AccountType,
  CreateAccountInput,
} from "./types";

import { mapAccount, isAccountRow } from "./account.mapper";
import type { AccountRow } from "./account.mapper";

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
              SELECT
                id, name, type, subtype, opening_date, is_hidden, is_archived, created_at
              FROM accounts
              WHERE is_hidden = 0
                AND type IN ('asset', 'liability')
              ORDER BY name
            `);

            const accounts: Account[] = rows.map((row: unknown): Account => {
              if (!isAccountRow(row)) {
                throw new Error("Unexpected account row shape.");
              }

              // TODO: calculate the account balance here
              const balance: number = 0;
              return mapAccount(row, balance);
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

            const name = input.name.trim();

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

            db.exec({
              sql: `
                INSERT INTO accounts
                  (id, name, type, subtype)
                VALUES ($id, $name, $type, $subtype)
              `,
              bind: {
                $id: id,
                $name: name,
                $type: type,
                $subtype: input.subtype,
              },
            });

            const row: unknown = db.selectObject(
              `SELECT
                id, name, type, subtype, opening_date, is_hidden, is_archived, created_at
              FROM accounts WHERE id = ?`,
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
