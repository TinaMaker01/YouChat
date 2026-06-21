# Messenger Application Blueprint

## Overview

A real-time Messenger-like chat application built with Next.js 16 (App Router), React 19, and SQLite. The application features user authentication, private messaging, and a modern, responsive UI.

## Project Outline

*   **Authentication:** Custom JWT-based authentication system. Users can register with email and password and log in to access their chats. Sessions are stored in secure HttpOnly cookies.
*   **Chat Interface:** A responsive two-column layout. The sidebar lists active conversations, and the main window displays messages and allows for sending new ones.
*   **Database:** Uses SQLite for local data persistence.
    *   `users`: Stores user credentials and profile information.
    *   `conversations`: Stores metadata about chat groups or direct messages.
    *   `messages`: Stores individual chat messages linked to conversations.
*   **Interactivity:** Uses `framer-motion` for smooth UI transitions and `lucide-react` for iconography. Styled with Tailwind CSS and Radix UI components.

## Technical Implementation Details

- **Framework:** Next.js 16 (App Router)
- **State Management:** React hooks (`useState`, `useEffect`) and optimistic updates for messaging.
- **Data Mutation:** Server Actions for sending messages.
- **Real-time:** Lightweight polling (every 3 seconds) for new messages.
- **Security:** API routes are protected by session verification. Passwords are hashed using `bcryptjs`.

## Plan (Completed & Ongoing Improvements)

1.  **Set up Database & Auth:** Initialized SQLite schema and implemented custom JWT session management.
2.  **Build Messenger UI:** Created `ChatSidebar`, `ChatWindow`, and `MessageBubble` components.
3.  **Implement Messaging:** Integrated Server Actions and API routes for message handling.
4.  **Security Hardening:** COMPLETED. Implemented data isolation by linking conversations to specific users and securing all API routes.
5.  **Performance Optimization:** COMPLETED. Moved initial data fetching to Server Components (SSR) in `src/app/page.tsx`.
6.  **Chatbot Integration:** COMPLETED. Integrated mock chatbot responses in `src/lib/messaging.ts`.
