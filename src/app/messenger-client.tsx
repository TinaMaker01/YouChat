'use client';

import { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatWindow } from '@/components/chat-window';
import { sendMessage } from '@/lib/actions';
import { LogoutButton } from '@/components/logout-button';

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  last_message: string;
  updated_at: string;
}

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  created_at: string;
}

interface User {
  email: string;
}

interface MessengerClientProps {
  initialConversations: Conversation[];
  initialUser: User;
}

export function MessengerClient({ initialConversations, initialUser }: MessengerClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<number | null>(initialConversations[0]?.id || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user] = useState<User>(initialUser);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch messages when activeId changes and set up polling
  useEffect(() => {
    if (activeId) {
      async function fetchMessages() {
        try {
          const res = await fetch(`/api/messages?conversationId=${activeId}`);
          const data = await res.json();
          setMessages(data);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      }
      fetchMessages();

      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeId]);

  const handleSendMessage = async (text: string) => {
    if (!activeId) return;

    const newMessage: Message = {
      id: Math.floor(Math.random() * 1000000000),
      sender: 'me',
      text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate typing indicator for the bot
    setTimeout(() => setIsTyping(true), 600);

    try {
      await sendMessage(activeId, text);

      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, last_message: text, updated_at: new Date().toISOString() } : c
      ));

      // Hide typing indicator after a while (it will be replaced by the actual message via polling)
      setTimeout(() => setIsTyping(false), 2500);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
      setIsTyping(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  return (
    <main className="flex flex-col h-screen bg-white dark:bg-black overflow-hidden">
      <header className="flex justify-between items-center p-4 border-b dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md z-20">
        <h1 className="text-xl font-bold tracking-tight">Messenger</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{user.email}</span>
            <LogoutButton />
          </div>
        )}
      </header>
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeId}
          onSelectConversation={setActiveId}
        />
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
        />
      </div>
    </main>
  );
}
