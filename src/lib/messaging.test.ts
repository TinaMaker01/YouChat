import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessage } from './messaging';
import { openDb } from './db';

vi.mock('./db', () => ({
  openDb: vi.fn(),
}));

describe('Messaging Utilities', () => {
  const mockDb = {
    run: vi.fn(),
    get: vi.fn(),
    all: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (openDb as any).mockResolvedValue(mockDb);
  });

  it('should create a message and update conversation', async () => {
    mockDb.run.mockResolvedValue({ lastID: 1 });

    const conversationId = 123;
    const text = 'Hello world';
    const sender = 'me';

    const result = await createMessage(conversationId, text, sender);

    expect(mockDb.run).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO messages'),
      conversationId, sender, text
    );
    expect(mockDb.run).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE conversations'),
      text, conversationId
    );
    expect(result.text).toBe(text);
    expect(result.sender).toBe(sender);
  });

  it('should enforce data isolation when userId is provided', async () => {
    const userId = 'user_1';
    const conversationId = 123;

    // Scenario: Conversation does NOT belong to user
    mockDb.get.mockResolvedValue(null);

    await expect(createMessage(conversationId, 'hi', 'me', userId))
      .rejects.toThrow('Unauthorized: Conversation does not belong to user');

    // Scenario: Conversation DOES belong to user
    mockDb.get.mockResolvedValue({ id: conversationId });
    mockDb.run.mockResolvedValue({ lastID: 1 });

    const result = await createMessage(conversationId, 'hi', 'me', userId);
    expect(result.text).toBe('hi');
    expect(mockDb.get).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id FROM conversations WHERE id = ? AND user_id = ?'),
      conversationId,
      userId
    );
  });
});
