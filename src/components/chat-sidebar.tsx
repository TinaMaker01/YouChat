'use client';

import { motion } from 'framer-motion';
import { cn, formatRelativeTime } from '@/lib/utils';
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
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  searchTerm,
  onSearchChange
}: ChatSidebarProps) {
  return (
    <div className="w-full md:w-80 flex flex-col border-r border-gray-200 dark:border-gray-800 h-full bg-white dark:bg-black overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search Messenger"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full p-2 bg-gray-100 dark:bg-gray-900 rounded-full text-sm outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <motion.div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={cn(
                "flex items-center gap-3 p-3 mx-2 my-1 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                activeConversationId === conv.id && "bg-blue-50 dark:bg-blue-900/20"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={conv.avatar}
                  alt={conv.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 object-cover"
                />
                <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className={cn(
                    "font-semibold text-gray-900 dark:text-white truncate",
                    !conv.last_message && "font-bold"
                  )}>
                    {conv.name}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatRelativeTime(conv.updated_at)}
                  </span>
                </div>
                <p className={cn(
                  "text-sm truncate",
                  activeConversationId === conv.id ? "text-gray-900 dark:text-gray-200" : "text-gray-500"
                )}>
                  {conv.last_message || 'Start a conversation'}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            No conversations found
          </div>
        )}
      </div>
    </div>
  );
}
