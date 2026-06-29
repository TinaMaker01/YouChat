import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessage } from './messaging';
import { openDb } from './db';
import type { Database } from 'sqlite';

// Mock the database
vi.mock('./db', () => ({
  openDb: vi.fn(),
}));

describe('Messaging Utilities', () => {
  let mockDb: Record<string, unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      run: vi.fn().mockResolvedValue({ lastID: 1 }),
      all: vi.fn(),
      get: vi.fn(),
    };
    vi.mocked(openDb).mockResolvedValue(mockDb as unknown as Database);
  });

  describe('createMessage', () => {
    it('should insert a message and update the conversation', async () => {
      const conversationId = 123;
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
        expect.stringContaining('UPDATE conversations'),
        text,
        conversationId
      );

      expect(result).toMatchObject({
        conversation_id: conversationId,
        sender,
        text,
      });
    });
  });
});
