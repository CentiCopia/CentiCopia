PRAGMA foreign_keys = ON;
PRAGMA user_version = 1;

CREATE TABLE IF NOT EXISTS accounts (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 type TEXT NOT NULL CHECK(type IN ('asset','liability','income','expense','equity')),
 subtype TEXT NOT NULL DEFAULT 'other',
 opening_date TEXT,
 is_hidden INTEGER NOT NULL DEFAULT 0 CHECK(is_hidden IN (0,1)),
 is_archived INTEGER NOT NULL DEFAULT 0 CHECK(is_archived IN (0,1)),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS transactions (
 id TEXT PRIMARY KEY,
 occurred_on TEXT NOT NULL,
 payee TEXT,
 memo TEXT,
 status TEXT NOT NULL DEFAULT 'posted' CHECK(status IN ('pending','posted','void')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS categories (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('income','expense')),
 parent_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
 is_archived INTEGER NOT NULL DEFAULT 0 CHECK(is_archived IN (0,1))
);
CREATE TABLE IF NOT EXISTS budgets (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 is_default INTEGER NOT NULL DEFAULT 0 CHECK(is_default IN (0,1)),
 is_archived INTEGER NOT NULL DEFAULT 0 CHECK(is_archived IN (0,1))
);
CREATE UNIQUE INDEX IF NOT EXISTS one_default_budget ON budgets(is_default) WHERE is_default = 1;
CREATE TABLE IF NOT EXISTS entries (
 id TEXT PRIMARY KEY,
 transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
 account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
 amount_cents INTEGER NOT NULL CHECK(amount_cents != 0),
 category_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
 budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS entries_by_transaction ON entries(transaction_id);
CREATE INDEX IF NOT EXISTS entries_by_account ON entries(account_id);
CREATE INDEX IF NOT EXISTS entries_by_budget ON entries(budget_id);
CREATE TABLE IF NOT EXISTS budget_allocations (
 id TEXT PRIMARY KEY,
 budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE RESTRICT,
 category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
 period TEXT NOT NULL CHECK(length(period) = 7 AND substr(period,5,1) = '-'),
 amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0),
 UNIQUE(budget_id, category_id, period)
);
CREATE TABLE IF NOT EXISTS goals (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 budget_id TEXT REFERENCES budgets(id) ON DELETE RESTRICT,
 account_id TEXT REFERENCES accounts(id) ON DELETE RESTRICT,
 target_cents INTEGER NOT NULL CHECK(target_cents > 0),
 target_date TEXT,
 starting_cents INTEGER NOT NULL DEFAULT 0,
 is_completed INTEGER NOT NULL DEFAULT 0 CHECK(is_completed IN (0,1))
);
CREATE TABLE IF NOT EXISTS settings (
 key TEXT PRIMARY KEY,
 value TEXT NOT NULL
);
INSERT OR IGNORE INTO budgets(id,name,is_default) VALUES ('00000000-0000-4000-8000-000000000001','Unallocated',1);
INSERT OR IGNORE INTO settings(key,value) VALUES ('currency','USD');
