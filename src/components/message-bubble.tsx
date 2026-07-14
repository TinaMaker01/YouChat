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
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  avatar?: string;
}

export function MessageBubble({
  message,
  showAvatar,
  isFirstInGroup,
  isLastInGroup,
  avatar
}: MessageBubbleProps) {
  const isMe = message.sender === 'me';

  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full",
        isMe ? "justify-end" : "justify-start items-end gap-2",
        isFirstInGroup ? "mt-4" : "mt-0.5",
        isLastInGroup ? "mb-2" : "mb-0"
      )}
    >
      {!isMe && (
        <div className="w-8 h-8 flex-shrink-0">
          {showAvatar && avatar && (
            <Image
              src={avatar}
              alt="Avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 object-cover"
            />
          )}
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] px-3.5 py-2 text-[15px] leading-snug shadow-sm",
          isMe
            ? "bg-[#0084FF] text-white"
            : "bg-[#E4E6EB] dark:bg-[#303030] text-black dark:text-white",

          // Border radius logic for grouping
          isMe ? (
            cn(
              "rounded-[1.25rem]",
              isFirstInGroup && !isLastInGroup && "rounded-br-md",
              !isFirstInGroup && !isLastInGroup && "rounded-r-md",
              !isFirstInGroup && isLastInGroup && "rounded-tr-md"
            )
          ) : (
            cn(
              "rounded-[1.25rem]",
              isFirstInGroup && !isLastInGroup && "rounded-bl-md ml-0",
              !isFirstInGroup && !isLastInGroup && "rounded-l-md ml-0",
              !isFirstInGroup && isLastInGroup && "rounded-tl-md ml-0"
            )
          )
        )}
      >
        {message.text}
      </div>
    </motion.div>
  );
}
