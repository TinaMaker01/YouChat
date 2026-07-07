'use client';

import { useEffect, useRef, Fragment } from 'react';
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
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-900 rounded-full mx-auto mb-4 flex items-center justify-center">
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
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-zinc-800 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={conversation.avatar}
              alt={conversation.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white leading-tight">{conversation.name}</h3>
            <p className="text-[12px] text-gray-500 font-normal">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <Phone size={20} fill="currentColor" />
          </button>
          <button className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <Video size={22} fill="currentColor" />
          </button>
          <button className="p-2 text-[#0084FF] hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <Info size={22} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col scroll-smooth"
      >
        <div className="flex flex-col items-center mb-10 mt-4">
          <Image
            src={conversation.avatar}
            alt={conversation.name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full mb-3 shadow-sm"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{conversation.name}</h2>
          <p className="text-[13px] text-gray-500">Facebook · You&apos;re friends on Facebook</p>
        </div>

        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const nextMsg = messages[index + 1];
          const isConsecutive = prevMsg?.sender === msg.sender;
          const isLastInGroup = nextMsg?.sender !== msg.sender;

          // Show date if it's the first message or if there's a big time gap (> 1 hour)
          const showDate = !prevMsg ||
            (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 3600000);

          return (
            <Fragment key={msg.id}>
              {showDate && (
                <div className="text-center my-6">
                  <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                    {formatMessageDate(msg.created_at)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                isConsecutive={isConsecutive}
                showAvatar={!isMe(msg) && isLastInGroup}
                avatar={conversation.avatar}
              />
            </Fragment>
          );
        })}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}

function isMe(msg: Message) {
  return msg.sender === 'me';
}
