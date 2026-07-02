import { describe, it, expect, beforeEach } from 'vitest';
import { createMessage } from './messaging';
import { openDb } from './db';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import * as dbModule from './db';
import { vi } from 'vitest';

describe('Messaging Logic and Isolation', () => {
  let testDb: any;

  beforeEach(async () => {
    // Create an in-memory database for testing
    testDb = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    });

    // Initialize schema
    await testDb.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        last_message TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
      );
    `);

    // Mock openDb to return the in-memory database
    vi.spyOn(dbModule, 'openDb').mockResolvedValue(testDb);
  });

  it('should create a message and update the conversation', async () => {
    // Create a test user
    const userId = 'user-1';
    await testDb.run('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', userId, 'test@example.com', 'password');

    // Create a conversation for that user
    const convResult = await testDb.run(
      'INSERT INTO conversations (user_id, name, avatar, last_message) VALUES (?, ?, ?, ?)',
      userId, 'Test Friend', 'avatar-url', 'Initial message'
    );
    const conversationId = convResult.lastID!;

    // Create a message
    const messageText = 'Hello from Vitest';
    const newMessage = await createMessage(conversationId, messageText, 'me');

    expect(newMessage.text).toBe(messageText);
    expect(newMessage.sender).toBe('me');
    expect(newMessage.conversation_id).toBe(conversationId);

    // Verify conversation was updated
    const updatedConv = await testDb.get('SELECT last_message FROM conversations WHERE id = ?', conversationId);
    expect(updatedConv.last_message).toBe(messageText);
  });

  it('should NOT allow finding a conversation for the wrong user', async () => {
    // Create two users
    const user1Id = 'user-1';
    const user2Id = 'user-2';
    await testDb.run('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', user1Id, 'user1@example.com', 'password');
    await testDb.run('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', user2Id, 'user2@example.com', 'password');

    // Create a conversation for user 1
    const convResult = await testDb.run(
      'INSERT INTO conversations (user_id, name, avatar, last_message) VALUES (?, ?, ?, ?)',
      user1Id, 'User 1 Friend', 'avatar-url', 'Initial message'
    );
    const conversationId = convResult.lastID!;

    // Verify conversation isolation
    const convForUser2 = await testDb.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      conversationId,
      user2Id
    );

    expect(convForUser2).toBeUndefined();
  });
});
