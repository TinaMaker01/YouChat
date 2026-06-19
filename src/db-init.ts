import { openDb } from './lib/db';

/**
 * Initializes the SQLite database schema and seeds it with initial data.
 * This script is intended to be run manually via `npx tsx src/db-init.ts`.
 */
async function init() {
  const db = await openDb();

  console.log('Dropping existing tables...');
  // Drop old tables to start fresh during development
  await db.exec(`
    DROP TABLE IF EXISTS posts;
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS conversations;
    DROP TABLE IF EXISTS users;
  `);

  console.log('Creating tables...');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT,
      last_message TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender TEXT NOT NULL, -- 'me' or 'them'
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );
  `);

  console.log('Seeding initial data...');
  // Seed data for a better initial experience
  await db.run(`INSERT INTO conversations (name, avatar, last_message) VALUES (?, ?, ?)`,
    'Alice Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', 'Hey! How are you doing?');
  await db.run(`INSERT INTO conversations (name, avatar, last_message) VALUES (?, ?, ?)`,
    'Bob Jones', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', 'Did you see the latest news?');
  await db.run(`INSERT INTO conversations (name, avatar, last_message) VALUES (?, ?, ?)`,
    'Charlie Brown', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', 'Let\'s grab coffee later.');

  // Alice messages
  await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, 1, 'them', 'Hi there!');
  await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, 1, 'me', 'Hey Alice! What\'s up?');
  await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, 1, 'them', 'Hey! How are you doing?');

  // Bob messages
  await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, 2, 'them', 'Did you see the latest news?');

  // Charlie messages
  await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, 3, 'me', 'Hey Charlie');
  await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, 3, 'them', 'Let\'s grab coffee later.');

  console.log('Database initialized with Auth and Messenger schema.');
}

init().catch(console.error);
