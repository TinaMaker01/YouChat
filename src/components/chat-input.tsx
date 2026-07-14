'use client';

import { useState, useRef } from 'react';
import { SendHorizonal, Plus, Smile, Image as ImageIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

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
    <div className="px-4 py-3 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto">
        <div className="flex items-center">
          <button type="button" className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Plus size={20} />
          </button>
          <button type="button" className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hidden sm:block">
            <ImageIcon size={20} />
          </button>
        </div>

        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Aa"
            className="w-full py-2 px-4 pr-10 bg-[#F0F2F5] dark:bg-[#242526] rounded-full text-[15px] outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button type="button" className="absolute right-2.5 text-[#0084FF] hover:opacity-80 transition-opacity">
            <Smile size={20} />
          </button>
        </div>

        {message.trim() ? (
          <button
            type="submit"
            className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all animate-in fade-in zoom-in duration-200"
          >
            <SendHorizonal size={22} fill="currentColor" className="rotate-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSendMessage('👍')}
            className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
          >
            <span className="text-2xl leading-none">👍</span>
          </button>
        )}
      </form>
    </div>
  );
}
