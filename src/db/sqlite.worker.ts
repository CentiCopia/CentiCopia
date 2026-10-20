import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

type DatabaseReady = {
  type: 'ready';
  version: string;
  count: number;
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
    db.exec(`
            CREATE TABLE IF NOT EXISTS _startup_test (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                count INTEGER NOT NULL DEFAULT 0
            );
        `);

    db.exec(`
            INSERT INTO _startup_test (id, count)
            VALUES (1, 1)
            ON CONFLICT(id)
            DO UPDATE SET count = count + 1;
        `);

    const count: number = Number(
      db.selectValue(
        'SELECT count FROM _startup_test WHERE id = 1'
      )
    );

    const response: DatabaseResponse = {
      type: 'ready',
      version: sqlite3.version.libVersion,
      count,
    };

    self.postMessage(response);
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
