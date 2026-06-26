'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
}

/**
 * MessageBubble component for displaying an individual chat message.
 *
 * Styles the message differently based on whether it was sent by the current user
 * ('me') or another participant ('them').
 * Uses Framer Motion for a subtle entry animation.
 *
 * @param props - Component properties.
 * @param props.message - The message object containing sender and text.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === 'me';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-2",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
          isMe
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
        )}
      >
        {message.text}
      </div>
    </motion.div>
  );
}
