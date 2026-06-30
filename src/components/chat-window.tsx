'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Phone, Video, Info } from 'lucide-react';
import Image from 'next/image';
import { formatMessageDate } from '@/lib/utils';

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
  isTyping?: boolean;
}

export function ChatWindow({ conversation, messages, onSendMessage, isTyping }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={conversation.avatar}
              alt={conversation.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{conversation.name}</h3>
            <p className="text-[11px] text-gray-500 font-medium">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-[#0084ff] hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
            <Phone size={20} fill="currentColor" />
          </button>
          <button className="p-2 text-[#0084ff] hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
            <Video size={20} fill="currentColor" />
          </button>
          <button className="p-2 text-[#0084ff] hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
            <Info size={20} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col scroll-smooth"
      >
        <div className="flex flex-col items-center mb-8 mt-4">
          <Image
            src={conversation.avatar}
            alt={conversation.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full mb-3 shadow-sm object-cover"
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{conversation.name}</h2>
          <p className="text-xs text-gray-500 mt-1">Facebook · You&apos;re friends on Facebook</p>
        </div>

        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const nextMsg = messages[index + 1];

          const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender;
          const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender;

          const showDateSeparator = !prevMsg ||
            new Date(prevMsg.created_at).toDateString() !== new Date(msg.created_at).toDateString();

          return (
            <div key={msg.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-6">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {formatMessageDate(msg.created_at)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                showAvatar={!isMe(msg) && isLastInGroup}
                avatar={conversation.avatar}
              />
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-end gap-2 mt-1 mb-4">
            <div className="w-8 flex-shrink-0">
              <Image
                src={conversation.avatar}
                alt="Avatar"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 object-cover"
              />
            </div>
            <div className="bg-gray-200 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}

function isMe(msg: Message) {
  return msg.sender === 'me';
}
