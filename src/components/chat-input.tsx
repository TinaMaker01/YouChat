'use client';

import { useState, useRef } from 'react';
import { Plus, Smile, Image as ImageIcon, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

const COMMON_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍', '🙏', '🔥'];

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleLike = () => {
    onSendMessage('👍');
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-zinc-800">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto relative">
        <div className="flex items-center gap-1">
          <button type="button" className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <Plus size={22} />
          </button>
          <button type="button" className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <ImageIcon size={22} />
          </button>
        </div>

        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setShowEmojiPicker(false)}
            placeholder="Aa"
            className="w-full py-2 px-4 pr-10 bg-gray-100 dark:bg-zinc-900 rounded-full text-[15px] outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          <div className="absolute right-2 flex items-center">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 text-[#0084FF] hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <Smile size={20} />
            </button>
          </div>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: -50, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 bottom-full mb-2 p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 flex gap-1"
              >
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-xl transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {message.trim() ? (
          <button
            type="submit"
            className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-0">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </motion.div>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLike}
            className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            <ThumbsUp size={22} fill="currentColor" />
          </button>
        )}
      </form>
    </div>
  );
}
