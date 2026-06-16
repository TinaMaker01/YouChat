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

export default function MessengerPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [convRes, userRes] = await Promise.all([
          fetch('/api/conversations'),
          fetch('/api/auth/me')
        ]);

        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData);
          if (convData.length > 0 && !activeId) {
            setActiveId(convData[0].id);
          }
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [activeId]);

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
      id: Date.now(),
      sender: 'me',
      text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      await sendMessage(activeId, text);
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, last_message: text } : c
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }
  };

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
      <div className="flex flex-1 overflow-hidden">
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
