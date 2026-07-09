import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { GET, POST } from './route';
import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { createMessage } from '@/lib/messaging';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  openDb: vi.fn(),
}));

vi.mock('@/lib/messaging', () => ({
  createMessage: vi.fn(),
}));

interface MockDb {
  get: Mock;
  all: Mock;
}

describe('API Route: /api/messages', () => {
  let mockDb: MockDb;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      get: vi.fn(),
      all: vi.fn(),
    };
    (openDb as Mock).mockResolvedValue(mockDb);
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (getSession as Mock).mockResolvedValue(null);
      const request = new Request('http://localhost/api/messages?conversationId=1');
      const response = await GET(request);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if conversationId is missing', async () => {
      (getSession as Mock).mockResolvedValue({ userId: 'user-1' });
      const request = new Request('http://localhost/api/messages');
      const response = await GET(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('conversationId is required');
    });

    it('should return 404 if conversation does not belong to user', async () => {
      (getSession as Mock).mockResolvedValue({ userId: 'user-1' });
      mockDb.get.mockResolvedValue(null); // Conversation not found for this user
      const request = new Request('http://localhost/api/messages?conversationId=99');
      const response = await GET(request);
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Conversation not found or access denied');
    });

    it('should return messages for a valid conversation', async () => {
      (getSession as Mock).mockResolvedValue({ userId: 'user-1' });
      mockDb.get.mockResolvedValue({ id: 1 });
      const mockMessages = [{ id: 1, text: 'Hello' }];
      mockDb.all.mockResolvedValue(mockMessages);

      const request = new Request('http://localhost/api/messages?conversationId=1');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockMessages);
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM messages'),
        '1'
      );
    });
  });

  describe('POST', () => {
    it('should return 401 if not authenticated', async () => {
      (getSession as Mock).mockResolvedValue(null);
      const request = new Request('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: 1, text: 'Hi' }),
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should return 404 if conversation does not belong to user', async () => {
      (getSession as Mock).mockResolvedValue({ userId: 'user-1' });
      mockDb.get.mockResolvedValue(null);
      const request = new Request('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: 99, text: 'Hi' }),
      });
      const response = await POST(request);
      expect(response.status).toBe(404);
    });

    it('should create a message for a valid conversation', async () => {
      (getSession as Mock).mockResolvedValue({ userId: 'user-1' });
      mockDb.get.mockResolvedValue({ id: 1 });
      const mockResult = { id: 123, text: 'Hi', sender: 'me' };
      (createMessage as Mock).mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: 1, text: 'Hi' }),
      });
      const response = await POST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockResult);
      expect(createMessage).toHaveBeenCalledWith(1, 'Hi', 'me');
    });
  });
});
