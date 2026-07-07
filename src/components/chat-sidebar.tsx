'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatRelativeTime } from '@/lib/utils';
import Image from 'next/image';
import { SquarePen, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-90 flex flex-col border-r border-gray-200 dark:border-zinc-800 h-full bg-white dark:bg-black overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
          <button className="p-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <SquarePen size={20} className="text-gray-900 dark:text-white" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Messenger"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-zinc-900 rounded-full text-[15px] outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <motion.div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors",
                activeConversationId === conv.id && "bg-blue-50 dark:bg-blue-900/10"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={conv.avatar}
                  alt={conv.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-[3px] border-white dark:border-black rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">{conv.name}</h3>
                  <span className="text-[13px] text-gray-500 whitespace-nowrap ml-2">
                    {formatRelativeTime(conv.updated_at)}
                  </span>
                </div>
                <p className={cn(
                  "text-[14px] truncate",
                  activeConversationId === conv.id ? "text-gray-900 dark:text-gray-200 font-medium" : "text-gray-500"
                )}>
                  {conv.last_message}
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
