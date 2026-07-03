import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMessage } from './messaging';
import { openDb } from './db';

// Mock the db module
vi.mock('./db', () => ({
  openDb: vi.fn(),
}));

describe('messaging logic', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      run: vi.fn().mockResolvedValue({ lastID: 123 }),
      get: vi.fn(),
      all: vi.fn(),
    };
    (openDb as any).mockResolvedValue(mockDb);
  });

  it('should create a message and update conversation', async () => {
    const conversationId = 1;
    const text = 'Hello world';
    const sender = 'me';

    const result = await createMessage(conversationId, text, sender);

    expect(mockDb.run).toHaveBeenCalledWith(
      'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
      conversationId,
      sender,
      text
    );

    expect(mockDb.run).toHaveBeenCalledWith(
      'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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

  it('should trigger a chatbot response when sender is "me"', async () => {
    vi.useFakeTimers();
    const conversationId = 1;
    const text = 'Hello chatbot';
    const sender = 'me';

    await createMessage(conversationId, text, sender);

    // Initial message call
    expect(mockDb.run).toHaveBeenCalledTimes(2); // INSERT message + UPDATE conversation

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    // After timer, it should call createMessage again (which calls db.run 2 more times)
    // Wait for the async chatbot response to finish
    await vi.runAllTimersAsync();

    expect(mockDb.run).toHaveBeenCalledTimes(4);
    vi.useRealTimers();
  });
});
