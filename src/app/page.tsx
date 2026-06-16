'use client';

import { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatWindow } from '@/components/chat-window';
import { sendMessage } from '@/lib/actions';

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

export default function MessengerPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations on mount
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/conversations');
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeId) {
          setActiveId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      id: Date.now(),
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="flex h-screen bg-white dark:bg-black overflow-hidden">
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
    </main>
  );
}
