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

  /**
   * Effect to fetch messages for the active conversation and establish a polling interval.
   * Polling is used as a lightweight alternative to WebSockets to keep the UI in sync
   * with the server every 3 seconds.
   */
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

  /**
   * Handles sending a new message.
   * Implements optimistic updates:
   * 1. Generates a temporary ID and adds the message to the local state immediately.
   * 2. Calls the server-side `sendMessage` action.
   * 3. If the server call fails, rolls back the local state by removing the optimistic message.
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
