import { describe, it, expect } from 'vitest';
import { createMessageSchema, getMessagesSchema } from './validations';

describe('Validation Schemas', () => {
  describe('createMessageSchema', () => {
    it('should validate valid message data with numeric ID', () => {
      const data = { conversationId: 1, text: 'Hello world' };
      const result = createMessageSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.conversationId).toBe(1);
        expect(result.data.text).toBe('Hello world');
      }
    });

    it('should validate and transform string ID to number', () => {
      const data = { conversationId: '123', text: 'Hello' };
      const result = createMessageSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.conversationId).toBe(123);
      }
    });

    it('should fail if text is empty', () => {
      const data = { conversationId: 1, text: '' };
      const result = createMessageSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail if text is too long', () => {
      const data = { conversationId: 1, text: 'a'.repeat(2001) };
      const result = createMessageSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('getMessagesSchema', () => {
    it('should validate valid conversationId', () => {
      const data = { conversationId: '123' };
      const result = getMessagesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if conversationId is missing', () => {
      const data = {};
      const result = getMessagesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
