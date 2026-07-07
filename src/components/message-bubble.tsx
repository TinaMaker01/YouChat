'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  avatar?: string;
}

export function MessageBubble({ message, showAvatar, isConsecutive, avatar }: MessageBubbleProps) {
  const isMe = message.sender === 'me';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full",
        isMe ? "justify-end" : "justify-start",
        isConsecutive ? "mb-1" : "mb-3"
      )}
    >
      <div className={cn(
        "flex items-end gap-2 max-w-[70%]",
        isMe ? "flex-row-reverse" : "flex-row"
      )}>
        {!isMe && (
          <div className="w-8 flex-shrink-0">
            {showAvatar && avatar && (
              <Image
                src={avatar}
                alt="Avatar"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"
              />
            )}
          </div>
        )}
        <div
          className={cn(
            "px-4 py-2 rounded-2xl text-sm",
            isMe
              ? "bg-[#0084FF] text-white"
              : "bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-gray-100",
            // Rounded corner refinements for grouping
            isMe ? (
              isConsecutive ? "rounded-tr-lg rounded-br-lg" : "rounded-br-lg"
            ) : (
              isConsecutive ? "rounded-tl-lg rounded-bl-lg" : "rounded-bl-lg"
            )
          )}
        >
          {message.text}
        </div>
      </div>
    </motion.div>
  );
}
