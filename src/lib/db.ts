import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * Opens a connection to the SQLite database.
 * @returns A promise that resolves to the database instance.
 */
export async function openDb() {
  return open({
    filename: './db.sqlite',
    driver: sqlite3.Database
  });
}
