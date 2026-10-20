/** Apply numbered SQLite migrations through the official SQLite WASM API. */
export interface SqliteDatabase {
  exec(sql: string): void;
  selectValue(sql: string): unknown;
}

export function migrate(db: SqliteDatabase, migrations: readonly string[]): void {
  db.exec('PRAGMA foreign_keys = ON');
  const current = Number(db.selectValue('PRAGMA user_version'));
  if (!Number.isInteger(current) || current < 0) throw new Error('Invalid schema version');
  if (current > migrations.length) throw new Error('Database is newer than this app');

  for (let version = current + 1; version <= migrations.length; version++) {
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(migrations[version - 1]);
      db.exec(`PRAGMA user_version = ${version}`);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}
