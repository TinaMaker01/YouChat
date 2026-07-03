# Messenger Application

A modern, real-time Messenger-like chat application built with **Next.js 16 (App Router)**, **React 19**, and **SQLite**.

## Features

- **User Authentication:** Custom JWT-based authentication system with secure session management.
- **Real-time Messaging:** Smooth chat experience using lightweight client-side polling (every 3 seconds).
- **Optimistic Updates:** Immediate UI feedback when sending messages, with automatic error handling.
- **Responsive Design:** A beautiful, responsive two-column layout styled with **Tailwind CSS v4** and **Radix UI**.
- **Smooth Transitions:** Powered by **Framer Motion** for a fluid user experience.
- **Modern Tech Stack:** Leveraging the latest features of Next.js 16 and React 19.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Database:** SQLite (via `sqlite3` and `sqlite` packages)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** [Radix UI](https://www.radix-ui.com/) & [lucide-react](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Authentication:** Custom JWT sessions using `jose` and `bcryptjs`

## Getting Started

### Prerequisites

- Node.js 22.22.1
- npm 11.17.0

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd messenger-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add a `JWT_SECRET`:
    ```env
    JWT_SECRET=your_super_secret_random_string_at_least_32_chars
    ```

4.  **Initialize the database:**
    This will create the SQLite database and seed it with initial data.
    ```bash
    npx tsx src/db-init.ts
    ```

    **Test User Credentials:**
    - **Email:** `test@example.com`
    - **Password:** `password`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Core logic including authentication, database utilities, and messaging.
- `src/db-init.ts`: Database schema initialization and seeding script.
- `src/proxy.ts`: Custom middleware for route protection (Next.js 16 convention).

## Middleware & Session Protection

This project leverages Next.js 16's `proxy.ts` for centralized session management:
- **JWT Verification:** All protected routes verify the `session` cookie using the `jose` library.
- **Route Guards:** Automatically redirects unauthenticated users to `/login` and authenticated users away from auth pages.
- **Protected Paths:** Root (`/`) and any `/dashboard` routes (if present) are secured by default.

## API Reference

The application provides several API endpoints for data management:

### Conversations
- **GET `/api/conversations`**: Retrieves all conversations for the authenticated user.

### Messages
- **GET `/api/messages?conversationId=<id>`**: Fetches all messages for a specific conversation.
- **POST `/api/messages`**: Sends a new message (requires `conversationId` and `text` in the request body).

*Note: The application also uses Next.js Server Actions (e.g., `sendMessage`) for primary UI interactions.*

## User Guide

### Usage
1. **Login:** Use the provided test credentials or register a new account.
2. **Select a Chat:** Click on a contact in the sidebar to view your message history.
3. **Messaging:** Type a message in the input field at the bottom and press Enter or click the Send icon.
4. **Mock Chatbot:** Notice that sending a message will trigger an automated response from our mock chatbot after a short delay.

### Troubleshooting
- **Database Errors:** If you encounter issues with data, try re-initializing the database using `npx tsx src/db-init.ts`. *Warning: This will clear all existing data.*
- **Session Expired:** If you are redirected to the login page unexpectedly, your JWT session may have expired (7-day duration).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
