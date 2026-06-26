'use client';

import { useState, useRef } from 'react';
import { SendHorizonal, Plus, Smile, Image as ImageIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

/**
 * ChatInput component providing a text input field for sending messages.
 *
 * Features:
 * - Controlled input state for the message text.
 * - Submit handler that prevents default form behavior and calls `onSendMessage`.
 * - Placeholder buttons for adding attachments and emojis.
 *
 * @param props - Component properties.
 * @param props.onSendMessage - Callback triggered when the user submits a message.
 */
export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-4xl mx-auto">
        <button type="button" className="p-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
          <Plus size={20} />
        </button>
        <button type="button" className="p-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
          <ImageIcon size={20} />
        </button>
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Aa"
            className="w-full py-2 px-4 pr-10 bg-gray-100 dark:bg-gray-900 rounded-full text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button type="button" className="absolute right-2 text-blue-600 hover:text-blue-700">
            <Smile size={20} />
          </button>
        </div>
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-2 text-blue-600 disabled:text-gray-300 dark:disabled:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <SendHorizonal size={20} />
        </button>
      </form>
    </div>
  );
}
