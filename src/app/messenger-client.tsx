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

/**
 * Main client component for the Messenger interface.
 * Handles conversation state, message fetching, polling, and optimistic updates.
 */
export function MessengerClient({ initialConversations, initialUser }: MessengerClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<number | null>(initialConversations[0]?.id || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user] = useState<User>(initialUser);
  const [searchTerm, setSearchTerm] = useState('');

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

      /**
       * Poll for new messages every 3 seconds to provide a "real-time" feel
       * without the complexity of WebSockets.
       */
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeId]);

  /**
   * Handles sending a new message.
   * Implements optimistic updates for a snappier UI experience.
   */
  const handleSendMessage = async (text: string) => {
    if (!activeId) return;

    // 1. Create a temporary optimistic message
    const newMessage: Message = {
      id: Math.floor(Math.random() * 1000000000), // Temporary numeric ID
      sender: 'me',
      text,
      created_at: new Date().toISOString()
    };

    // 2. Update UI immediately
    setMessages(prev => [...prev, newMessage]);

    try {
      // 3. Perform the actual server action
      await sendMessage(activeId, text);

      // 4. Update conversations list with the new last message
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, last_message: text } : c
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      // 5. Rollback: Remove the optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }
  };

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex flex-col h-screen bg-white dark:bg-black overflow-hidden">
      <header className="flex justify-between items-center px-4 py-2 border-b dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0084FF] rounded-full flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <h1 className="text-xl font-bold tracking-tight">Messenger</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hidden sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        )}
      </header>
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          conversations={filteredConversations}
          activeConversationId={activeId}
          onSelectConversation={setActiveId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
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
