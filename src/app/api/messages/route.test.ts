import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { createMessage } from '@/lib/messaging';
import { NextResponse } from 'next/server';

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

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

describe('/api/messages route', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      get: vi.fn(),
      all: vi.fn(),
    };
    (openDb as any).mockResolvedValue(mockDb);
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (getSession as any).mockResolvedValue(null);
      const request = new Request('http://localhost/api/messages?conversationId=1');

      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });

    it('should return 400 if conversationId is missing', async () => {
      (getSession as any).mockResolvedValue({ userId: 'user-1' });
      const request = new Request('http://localhost/api/messages');

      const response = await GET(request);

      expect(response.status).toBe(400);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    });

    it('should return 404 if conversation does not belong to user', async () => {
      (getSession as any).mockResolvedValue({ userId: 'user-1' });
      mockDb.get.mockResolvedValue(null); // Not found

      const request = new Request('http://localhost/api/messages?conversationId=1');
      const response = await GET(request);

      expect(response.status).toBe(404);
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM conversations WHERE id = ? AND user_id = ?'),
        '1',
        'user-1'
      );
    });

    it('should return messages if authorized', async () => {
      (getSession as any).mockResolvedValue({ userId: 'user-1' });
      mockDb.get.mockResolvedValue({ id: 1 });
      const mockMessages = [{ id: 1, text: 'Hello' }];
      mockDb.all.mockResolvedValue(mockMessages);

      const request = new Request('http://localhost/api/messages?conversationId=1');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockMessages);
    });
  });

  describe('POST', () => {
    it('should create a message if authorized', async () => {
      (getSession as any).mockResolvedValue({ userId: 'user-1' });
      mockDb.get.mockResolvedValue({ id: 1 });
      const mockResult = { id: 10, text: 'New message' };
      (createMessage as any).mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: 1, text: 'New message' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockResult);
      expect(createMessage).toHaveBeenCalledWith(1, 'New message', 'me');
    });
  });
});
