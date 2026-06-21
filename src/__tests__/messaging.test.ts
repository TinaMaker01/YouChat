import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getConversations, getMessages } from '../lib/messaging';
import { openDb } from '../lib/db';

vi.mock('../lib/db', () => ({
  openDb: vi.fn(),
}));

describe('Messaging Library', () => {
  const mockDb = {
    all: vi.fn(),
    get: vi.fn(),
    run: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (openDb as Mock).mockResolvedValue(mockDb);
  });

  describe('getConversations', () => {
    it('should fetch conversations for a user', async () => {
      const userId = 'user-123';
      const mockConvs = [{ id: 1, name: 'Alice' }];
      mockDb.all.mockResolvedValue(mockConvs);

      const result = await getConversations(userId);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM conversations WHERE user_id = ?'),
        userId
      );
      expect(result).toEqual(mockConvs);
    });
  });

  describe('getMessages', () => {
    it('should fetch messages if conversation belongs to user', async () => {
      const userId = 'user-123';
      const convId = 1;
      const mockMsgs = [{ id: 1, text: 'Hi' }];

      mockDb.get.mockResolvedValue({ id: convId });
      mockDb.all.mockResolvedValue(mockMsgs);

      const result = await getMessages(convId, userId);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM conversations WHERE id = ? AND user_id = ?'),
        convId,
        userId
      );
      expect(result).toEqual(mockMsgs);
    });

    it('should throw error if conversation does not belong to user', async () => {
      const userId = 'user-123';
      const convId = 1;

      mockDb.get.mockResolvedValue(null);

      await expect(getMessages(convId, userId)).rejects.toThrow('Unauthorized or conversation not found');
    });
  });
});
