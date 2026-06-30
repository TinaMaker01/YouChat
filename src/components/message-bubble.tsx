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
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  showAvatar?: boolean;
  avatar?: string;
}

export function MessageBubble({
  message,
  isFirstInGroup,
  isLastInGroup,
  showAvatar,
  avatar
}: MessageBubbleProps) {
  const isMe = message.sender === 'me';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex w-full group",
        isMe ? "justify-end" : "justify-start",
        isFirstInGroup ? "mt-4" : "mt-0.5",
        isLastInGroup ? "mb-1" : "mb-0"
      )}
    >
      <div className={cn(
        "flex max-w-[75%] items-end gap-2",
        isMe ? "flex-row-reverse" : "flex-row"
      )}>
        {!isMe && (
          <div className="w-8 flex-shrink-0">
            {showAvatar && avatar && (
              <Image
                src={avatar}
                alt="Avatar"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 object-cover"
              />
            )}
          </div>
        )}

        <div
          className={cn(
            "px-4 py-2 text-[15px] shadow-sm",
            isMe
              ? "bg-[#0084ff] text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            // Dynamic rounding based on position in group
            isMe
              ? cn(
                  "rounded-2xl rounded-tr-sm",
                  !isFirstInGroup && "rounded-tr-sm",
                  !isLastInGroup && "rounded-br-sm"
                )
              : cn(
                  "rounded-2xl rounded-tl-sm",
                  !isFirstInGroup && "rounded-tl-sm",
                  !isLastInGroup && "rounded-bl-sm"
                )
          )}
        >
          {message.text}
        </div>
      </div>
    </motion.div>
  );
}
