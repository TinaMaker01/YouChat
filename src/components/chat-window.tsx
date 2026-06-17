'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Phone, Video, Info } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  created_at: string;
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
}

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export function ChatWindow({ conversation, messages, onSendMessage }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Info size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select a chat to start messaging</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-black overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src={conversation.avatar}
            alt={conversation.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{conversation.name}</h3>
            <p className="text-xs text-green-500">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
            <Video size={20} />
          </button>
          <button className="p-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col space-y-1 scroll-smooth"
      >
        <div className="flex flex-col items-center mb-8">
          <Image
            src={conversation.avatar}
            alt={conversation.name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full mb-3 shadow-md"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{conversation.name}</h2>
          <p className="text-sm text-gray-500">Facebook · You&apos;re friends on Facebook</p>
        </div>

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}
