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

  // Fetch messages when activeId changes
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

      // Poll for new messages every 3 seconds (lightweight "real-time")
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeId]);

  const handleSendMessage = async (text: string) => {
    if (!activeId) return;

    // Optimistic update
    const newMessage: Message = {
      id: Math.floor(Math.random() * 1000000000), // Temporary numeric ID for optimistic update
      sender: 'me',
      text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      await sendMessage(activeId, text);
      // Update conversations list with last message
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, last_message: text } : c
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }
  };

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  return (
    <main className="flex flex-col h-screen bg-white dark:bg-black overflow-hidden">
      <header className="flex justify-between items-center p-4 border-b dark:border-zinc-800">
        <h1 className="text-xl font-bold">Messenger</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</span>
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
        />
      </div>
    </main>
  );
}
