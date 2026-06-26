import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessage } from './messaging';
import { openDb } from './db';

vi.mock('./db', () => ({
  openDb: vi.fn(),
}));

describe('messaging', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      run: vi.fn().mockResolvedValue({ lastID: 1 }),
      get: vi.fn(),
      all: vi.fn(),
    };
    (openDb as any).mockResolvedValue(mockDb);
  });

  it('should create a message and update the conversation', async () => {
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
