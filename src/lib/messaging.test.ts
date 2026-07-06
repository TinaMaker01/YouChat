import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessage } from './messaging';
import { openDb } from './db';

// Mock the db module
vi.mock('./db', () => ({
  openDb: vi.fn(),
}));

describe('Messaging Logic', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      run: vi.fn().mockResolvedValue({ lastID: 123 }),
    };
    (openDb as any).mockResolvedValue(mockDb);
    // Mock setTimeout to execute immediately
    vi.useFakeTimers();
  });

  it('should create a message and update the conversation', async () => {
    const conversationId = 1;
    const text = 'Hello world';
    const sender = 'me';

    const result = await createMessage(conversationId, text, sender);

    expect(mockDb.run).toHaveBeenCalledWith(
      'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
      conversationId, sender, text
    );

    expect(mockDb.run).toHaveBeenCalledWith(
      'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      text, conversationId
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
    const text = 'Hello bot';
    const sender = 'me';

    await createMessage(conversationId, text, sender);

    // Initial message calls
    expect(mockDb.run).toHaveBeenCalledTimes(2);

    // Advance timers to trigger the chatbot response
    vi.runAllTimers();
    // Use vi.waitFor or a small flush to ensure the async callback inside setTimeout is executed
    await vi.waitFor(() => {
      if (mockDb.run.mock.calls.length < 4) throw new Error('Not yet called');
    });

    // Check if another message was created
    // It should call createMessage recursively, so mockDb.run should be called again (INSERT + UPDATE)
    // Total should be 4 calls
    expect(mockDb.run).toHaveBeenCalledTimes(4);

    // Verify the second insert was from 'them'
    expect(mockDb.run).toHaveBeenCalledWith(
      'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
      conversationId, 'them', expect.any(String)
    );
  });
});
