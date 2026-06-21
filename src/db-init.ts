import { openDb } from './lib/db';
import { hashPassword } from './lib/auth';

async function init() {
  const db = await openDb();

  console.log('Resetting database...');

  // Drop old tables to start fresh
  await db.exec(`
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS conversations;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS posts;
  `);

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

  // Create a default test user
  const testUserId = 'test-user-id';
  const hashedPassword = await hashPassword('password123');
  await db.run(
    'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
    testUserId, 'test@example.com', hashedPassword
  );

  // Seed conversations for the test user
  const convs = [
    { name: 'Alice Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', last: 'Hey! How are you doing?' },
    { name: 'Bob Jones', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', last: 'Did you see the latest news?' },
    { name: 'Charlie Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', last: 'Let\'s grab coffee later.' }
  ];

  for (const c of convs) {
    const result = await db.run(
      `INSERT INTO conversations (user_id, name, avatar, last_message) VALUES (?, ?, ?, ?)`,
      testUserId, c.name, c.avatar, c.last
    );
    const convId = result.lastID;

    // Add some initial messages
    if (c.name === 'Alice Smith') {
      await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, convId, 'them', 'Hi there!');
      await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, convId, 'me', 'Hey Alice! What\'s up?');
      await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, convId, 'them', 'Hey! How are you doing?');
    } else if (c.name === 'Bob Jones') {
      await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, convId, 'them', 'Did you see the latest news?');
    } else {
      await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, convId, 'me', 'Hey Charlie');
      await db.run(`INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)`, convId, 'them', 'Let\'s grab coffee later.');
    }
  }

  console.log('Database initialized with Secure Messenger schema.');
}

init().catch(console.error);
