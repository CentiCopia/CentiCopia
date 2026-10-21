import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import schemaV1 from '../../database/schema.sql?raw';
import { migrate } from '../../database/migrate'

type DatabaseReady = {
  type: 'ready';
  version: string;
  schemaVersion: number;
  accountCount: number;
  defaultBudget: string;
};

type DatabaseError = {
  type: 'error';
  message: string;
};

type DatabaseResponse = DatabaseReady | DatabaseError;

async function initializeDatabase(): Promise<void> {
  if (!self.crossOriginIsolated) {
    throw new Error('Cross-origin isolation is required for OPFS.');
  }

  const sqlite3 = await sqlite3InitModule();

  console.log('SQLite initialized:', sqlite3.version.libVersion);

  console.log('OPFS diagnostics:', {
    opfsAvailable: 'opfs' in sqlite3,
    opfsDatabaseAvailable: typeof sqlite3.oo1.OpfsDb,
  });

  const opfsAvailable: boolean =
    Boolean(sqlite3.capi.sqlite3_vfs_find('opfs'));

  console.log('OPFS VFS registered:', opfsAvailable);

  if (!opfsAvailable) {
    throw new Error('SQLite OPFS VFS failed to initialize.');
  }

  const db = new sqlite3.oo1.OpfsDb('/centicopia.sqlite3');

  try {
    migrate(db, [schemaV1]);

    db.exec('DROP TABLE IF EXISTS _startup_test')

    const schemaVersion: number = Number(
      db.selectValue('PRAGMA user_version')
    );

    const accountCount: number = Number(
      db.selectValue('SELECT COUNT(*) FROM accounts')
    );

    const defaultBudget: string = String(
      db.selectValue(
        'SELECT name FROM budgets WHERE is_default = 1'
      )
    );

    self.postMessage({
      type: 'ready',
      version: sqlite3.version.libVersion,
      schemaVersion,
      accountCount,
      defaultBudget,
    });
  } finally {
    db.close();
  }
}

void initializeDatabase().catch((error: unknown): void => {
  const response: DatabaseResponse = {
    type: 'error',
    message: error instanceof Error
      ? error.message
      : String(error),
  };

  self.postMessage(response);
});
