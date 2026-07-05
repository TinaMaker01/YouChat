import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessage } from './messaging';
import { openDb } from './db';

// Mock the database
vi.mock('./db', () => ({
  openDb: vi.fn(),
}));

describe('Messaging Library', () => {
  let mockDb: { run: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      run: vi.fn().mockResolvedValue({ lastID: 123 }),
    };
    vi.mocked(openDb).mockResolvedValue(mockDb as unknown as any);
    vi.useFakeTimers();
  });

  describe('createMessage', () => {
    it('should insert a message and update the conversation', async () => {
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
        expect.stringContaining('UPDATE conversations'),
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
      const conversationId = 1;
      const text = 'Hello world';
      const sender = 'me';

      await createMessage(conversationId, text, sender);

      // Verify initial message was sent
      expect(mockDb.run).toHaveBeenCalledTimes(2); // 1 insert, 1 update

      // Fast-forward time for the chatbot response
      await vi.runAllTimersAsync();

      // Verify chatbot response was triggered
      // 2 more calls for the chatbot message: 1 insert, 1 update
      expect(mockDb.run).toHaveBeenCalledTimes(4);
    });

    it('should NOT trigger a chatbot response when sender is "them"', async () => {
      const conversationId = 1;
      const text = 'Hello back';
      const sender = 'them';

      await createMessage(conversationId, text, sender);

      await vi.runAllTimersAsync();

      // Only the initial message calls
      expect(mockDb.run).toHaveBeenCalledTimes(2);
    });
  });
});
