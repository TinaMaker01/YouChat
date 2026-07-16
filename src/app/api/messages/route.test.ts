import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { createMessage } from '@/lib/messaging';

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  openDb: vi.fn(),
}));

vi.mock('@/lib/messaging', () => ({
  createMessage: vi.fn(),
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
    it('should return 401 if unauthorized', async () => {
      (getSession as any).mockResolvedValue(null);
      const req = new Request('http://localhost/api/messages?conversationId=1');
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it('should return 400 if conversationId is missing', async () => {
      (getSession as any).mockResolvedValue({ userId: 'u1' });
      const req = new Request('http://localhost/api/messages');
      const res = await GET(req);
      expect(res.status).toBe(400);
    });

    it('should return 404 if conversation does not belong to user', async () => {
      (getSession as any).mockResolvedValue({ userId: 'u1' });
      mockDb.get.mockResolvedValue(null);
      const req = new Request('http://localhost/api/messages?conversationId=1');
      const res = await GET(req);
      expect(res.status).toBe(404);
    });

    it('should return messages if authorized', async () => {
      (getSession as any).mockResolvedValue({ userId: 'u1' });
      mockDb.get.mockResolvedValue({ id: 1 });
      const mockMessages = [{ id: 1, text: 'hello' }];
      mockDb.all.mockResolvedValue(mockMessages);

      const req = new Request('http://localhost/api/messages?conversationId=1');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockMessages);
    });
  });

  describe('POST', () => {
    it('should return 401 if unauthorized', async () => {
      (getSession as any).mockResolvedValue(null);
      const req = new Request('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: 1, text: 'hi' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('should create message if authorized', async () => {
      (getSession as any).mockResolvedValue({ userId: 'u1' });
      mockDb.get.mockResolvedValue({ id: 1 });
      const mockResult = { id: 99, text: 'hi', sender: 'me' };
      (createMessage as any).mockResolvedValue(mockResult);

      const req = new Request('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId: 1, text: 'hi' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(createMessage).toHaveBeenCalledWith(1, 'hi', 'me');
    });
  });
});
