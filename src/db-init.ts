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
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      last_message TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
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

  // Seed data
  const testUserId = 'test-user-id';
  // Seed a test user. The default password for this user is "password".
  await db.run(
    'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
    testUserId,
    'test@example.com',
    '$2a$10$09Urj.xM6Xe.wGkNZKzASeGa6JlmIqPFPLiRY4Tsa8hT9X0orIFIi' // bcrypt hash for 'password'
  );

  await db.run(`INSERT INTO conversations (user_id, name, avatar, last_message) VALUES (?, ?, ?, ?)`,
    testUserId, 'Alice Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', 'Hey! How are you doing?');
  await db.run(`INSERT INTO conversations (user_id, name, avatar, last_message) VALUES (?, ?, ?, ?)`,
    testUserId, 'Bob Jones', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', 'Did you see the latest news?');
  await db.run(`INSERT INTO conversations (user_id, name, avatar, last_message) VALUES (?, ?, ?, ?)`,
    testUserId, 'Charlie Brown', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', 'Let\'s grab coffee later.');

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
