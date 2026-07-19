/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessage } from './messaging';
import { openDb } from './db';

// Mock the database
vi.mock('./db', () => ({
  openDb: vi.fn(),
}));

describe('messaging.ts', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      run: vi.fn().mockResolvedValue({ lastID: 123 }),
    };
    (openDb as any).mockResolvedValue(mockDb);
    // Suppress console.error if needed
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should create a message and update conversation', async () => {
    const conversationId = 1;
    const text = 'Hello world';
    const sender = 'me';

    const result = await createMessage(conversationId, text, sender);

    expect(mockDb.run).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO messages'),
      conversationId,
      sender,
      text
    );

    expect(mockDb.run).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE conversations SET last_message = ?'),
      text,
      conversationId
    );

    expect(result).toMatchObject({
      id: 123,
      conversation_id: conversationId,
      sender,
      text,
    });
  });

  it('should trigger bot response if sender is "me"', async () => {
    vi.useFakeTimers();
    const conversationId = 1;
    const text = 'Hello world';
    const sender = 'me';

    await createMessage(conversationId, text, sender);

    // Initial message creation calls
    expect(mockDb.run).toHaveBeenCalledTimes(2);

    // Fast-forward timers
    await vi.runAllTimersAsync();

    // Should have called createMessage again for the bot response
    // Which means 2 more calls to db.run (one for INSERT, one for UPDATE)
    expect(mockDb.run).toHaveBeenCalledTimes(4);

    vi.useRealTimers();
  });
});
