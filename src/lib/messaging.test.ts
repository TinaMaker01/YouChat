import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessage } from './messaging';
import { openDb } from './db';

// Mock the database
vi.mock('./db', () => ({
  openDb: vi.fn(),
}));

describe('createMessage', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      get: vi.fn(),
      run: vi.fn().mockResolvedValue({ lastID: 123 }),
    };
    (openDb as any).mockResolvedValue(mockDb);
  });

  it('should create a message successfully when ownership is verified', async () => {
    mockDb.get.mockResolvedValue({ id: 1 }); // Mock conversation exists and belongs to user

    const result = await createMessage(1, 'Hello', 'me', 'user-123');

    expect(mockDb.get).toHaveBeenCalledWith(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      1, 'user-123'
    );
    expect(mockDb.run).toHaveBeenCalledWith(
      'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
      1, 'me', 'Hello'
    );
    expect(result.text).toBe('Hello');
    expect(result.sender).toBe('me');
  });

  it('should throw an error if userId is missing when sender is "me"', async () => {
    await expect(createMessage(1, 'Hello', 'me')).rejects.toThrow('User ID is required for sending messages');
  });

  it('should throw an error if conversation is not found or access denied', async () => {
    mockDb.get.mockResolvedValue(null); // Mock conversation not found

    await expect(createMessage(1, 'Hello', 'me', 'user-123')).rejects.toThrow('Conversation not found or access denied');
  });

  it('should allow "them" sender without userId (chatbot responses)', async () => {
    const result = await createMessage(1, 'Hello', 'them');

    expect(mockDb.get).not.toHaveBeenCalled();
    expect(mockDb.run).toHaveBeenCalledWith(
      'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
      1, 'them', 'Hello'
    );
    expect(result.sender).toBe('them');
  });
});
