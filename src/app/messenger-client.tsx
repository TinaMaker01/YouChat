'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const fetchMessages = useCallback(async () => {
    if (!activeId) return;
    try {
      const res = await fetch(`/api/messages?conversationId=${activeId}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [activeId]);

  // Fetch messages when activeId changes and set up polling
  useEffect(() => {
    if (activeId) {
      fetchMessages();

      /**
       * Poll for new messages every 3 seconds to provide a "real-time" feel.
       * Uses visibilityState to pause polling when the tab is hidden.
       */
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchMessages();
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activeId, fetchMessages]);

  /**
   * Handles sending a new message.
   * Implements optimistic updates for a snappier UI experience.
   */
  const handleSendMessage = async (text: string) => {
    if (!activeId) return;

    // 1. Create a temporary optimistic message
    // Using a negative ID to avoid collision with DB IDs
    const tempId = -Math.floor(Math.random() * 1000000000);
    const newMessage: Message = {
      id: tempId,
      sender: 'me',
      text,
      created_at: new Date().toISOString()
    };

    // 2. Update UI immediately
    setMessages(prev => [...prev, newMessage]);

    // Also update conversation list last message optimistically
    setConversations(prev => prev.map(c =>
      c.id === activeId ? { ...c, last_message: text, updated_at: new Date().toISOString() } : c
    ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));

    try {
      // 3. Perform the actual server action
      await sendMessage(activeId, text);

      // We don't need to do much here because polling will eventually
      // replace the optimistic message with the real one from DB.
    } catch (error) {
      console.error('Failed to send message:', error);
      // 4. Rollback: Remove the optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      // Revert conversation list update would be complex, let the next poll fix it
    }
  };

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  return (
    <main className="flex flex-col h-screen bg-white dark:bg-black overflow-hidden font-sans">
      <header className="flex justify-between items-center px-4 py-2 border-b dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0084FF] rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.503 3.735 7.158V22l3.414-1.874c.907.251 1.87.39 2.851.39 5.523 0 10-4.145 10-9.258S17.523 2 12 2z" />
            </svg>
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Messenger</span>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm font-medium text-zinc-600 dark:text-zinc-400">{user.email}</span>
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
