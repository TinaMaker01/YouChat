# Messenger Application

A modern, real-time Messenger-like chat application built with **Next.js 16 (App Router)**, **React 19**, and **SQLite**.

## Features

- **User Authentication:** Custom JWT-based authentication system with secure session management and Bcrypt password hashing.
- **Real-time Messaging:** Smooth chat experience using lightweight client-side polling (every 3 seconds).
- **Optimistic Updates:** Immediate UI feedback when sending messages, with automatic error handling and rollback.
- **Data Isolation:** Secure database queries ensuring users only access their own conversations and messages.
- **Responsive Design:** A beautiful, responsive two-column layout styled with **Tailwind CSS v4** and **Radix UI**.
- **Smooth Transitions:** Powered by **Framer Motion** (Motion v12) for a fluid user experience.
- **Modern Tech Stack:** Leveraging the latest features of Next.js 16 (React Compiler, Server Actions, `use cache`) and React 19.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions)
- **UI Library:** [React 19](https://react.dev/) (React Compiler, `use` hook)
- **Database:** [SQLite](https://www.sqlite.org/) (Local file-based database via `sqlite3` and `sqlite` packages)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Oxide engine, CSS-first configuration)
- **Components:** [Radix UI](https://www.radix-ui.com/) & [lucide-react](https://lucide.dev/)
- **Animations:** [Motion v12](https://www.framer.com/motion/) (formerly Framer Motion)
- **Authentication:** Custom JWT sessions using [jose](https://github.com/panva/jose) and [bcryptjs](https://github.com/dcodeIO/bcrypt.js)

## Getting Started

### Prerequisites

- **Node.js:** 22.22.1
- **npm:** 11.17.0

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd messenger-app
    ```

2.  **Install dependencies:**
    The project strictly uses `npm`.
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory. You **must** provide a `JWT_SECRET` for session security.
    ```env
    JWT_SECRET=your_super_secret_random_string_at_least_32_chars
    ```
    *Note: In production, the application will throw an error if `JWT_SECRET` is missing.*

4.  **Initialize the database:**
    This script creates the `db.sqlite` file, sets up the schema (users, conversations, messages), and seeds initial test data.
    ```bash
    npx tsx src/db-init.ts
    ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## User Guide

### 1. Registration & Login
- Navigate to `/register` to create a new account. Emails must be valid formats, and passwords must be at least 8 characters.
- Once registered, you are automatically logged in.
- Use `/login` to sign in with existing credentials.
- Test account seeded by default: `test@example.com` / `password123`.

### 2. Messaging
- Select a conversation from the sidebar on the left.
- Type your message in the input field at the bottom of the chat window and press Enter or click the send icon.
- Messages appear instantly thanks to **Optimistic Updates**.
- A mock chatbot will respond to your messages with a randomized delay to simulate a real conversation.

### 3. Logout
- Click the "Logout" button in the header to clear your session and return to the login page.

## Project Structure

- `src/app`: Next.js App Router.
  - `src/app/api`: Backend API routes for messages, conversations, and auth.
  - `src/app/page.tsx`: Main Messenger page (Server Component).
  - `src/app/messenger-client.tsx`: Interactive Messenger UI (Client Component).
- `src/components`: React components (UI elements, layouts).
  - `src/components/ui`: Low-level UI primitives (buttons, etc.).
- `src/lib`: Core application logic.
  - `src/lib/auth.ts`: Session management and password hashing.
  - `src/lib/db.ts`: SQLite database connection.
  - `src/lib/messaging.ts`: Messaging business logic and mock chatbot.
  - `src/lib/actions.ts`: Next.js Server Actions.
- `src/proxy.ts`: Custom middleware for route protection.
- `src/db-init.ts`: Database initialization and seeding script.

## Troubleshooting

- **Database Errors:** If you encounter issues with the database, you can reset it by deleting `db.sqlite` and running `npx tsx src/db-init.ts` again.
- **JWT Errors:** Ensure `JWT_SECRET` is set in `.env.local`. If you change the secret, existing sessions will become invalid.
- **Polling Lag:** The app uses a 3-second polling interval. If messages don't appear immediately, wait a few seconds or check the network tab.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
