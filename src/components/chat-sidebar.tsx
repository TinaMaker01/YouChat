'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  last_message: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
}

export function ChatSidebar({ conversations, activeConversationId, onSelectConversation }: ChatSidebarProps) {
  return (
    <div className="w-full md:w-80 flex flex-col border-r border-gray-200 dark:border-gray-800 h-full bg-white dark:bg-black overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search Messenger"
            className="w-full p-2 bg-gray-100 dark:bg-gray-900 rounded-full text-sm outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <motion.div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={cn(
              "flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors",
              activeConversationId === conv.id && "bg-blue-50 dark:bg-blue-900/20"
            )}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <Image
                src={conv.avatar}
                alt={conv.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{conv.name}</h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">1m</span>
              </div>
              <p className={cn(
                "text-sm truncate",
                activeConversationId === conv.id ? "text-gray-900 dark:text-gray-200" : "text-gray-500"
              )}>
                {conv.last_message}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
