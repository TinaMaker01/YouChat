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
   * Effect to manage message fetching and polling.
   *
   * When the active conversation changes:
   * 1. Fetches the initial set of messages for that conversation.
   * 2. Sets up a 3-second interval to poll for new messages.
   * 3. Cleans up the interval when the component unmounts or activeId changes.
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
   * Handles sending a new message with optimistic UI updates.
   *
   * Flow:
   * 1. Generates a temporary "optimistic" message object.
   * 2. Immediately updates the local `messages` state to show the message in the UI.
   * 3. Calls the `sendMessage` Server Action to persist the message in the database.
   * 4. Updates the `conversations` list to reflect the new last message for the active chat.
   * 5. If the server request fails, it catches the error and removes the optimistic message
   *    from the UI (rollback) to maintain data consistency.
   *
   * @param text - The content of the message to be sent.
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

    // 2. Update UI immediately (Optimistic Update)
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
