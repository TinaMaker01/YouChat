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

- **Framework:** [Next.js 16](https://nextjs.org/) - Chosen for its cutting-edge App Router features, enhanced performance, and native support for React 19.
- **UI Library:** [React 19](https://react.dev/) - Utilizes the latest React features like Server Components, Actions, and improved hooks.
- **Database:** **SQLite** (via `sqlite3` and `sqlite` packages) - Selected for its simplicity, zero-configuration setup, and excellent performance for local-first or small-to-medium scale applications.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) - Leveraging the Oxide engine for lightning-fast builds and CSS-first configuration.
- **Components:** [Radix UI](https://www.radix-ui.com/) & [lucide-react](https://lucide.dev/) - Ensuring accessible, high-quality UI primitives and a comprehensive icon set.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) - Providing fluid, declarative animations for a premium feel.
- **Authentication:** Custom JWT sessions using `jose` and `bcryptjs` - A robust, stateless authentication system.

## Getting Started

### Prerequisites

- **Node.js:** 22.22.1 (Required for Next.js 16 compatibility)
- **npm:** 11.17.0

### Test Credentials

For development and testing, you can use the following default account after initializing the database:

- **Email:** `test@example.com`
- **Password:** `password`

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
    npm run db:init
    ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing

Run the test suite using Vitest:

```bash
npm run test
```

For more details on specific tests, refer to the `src/lib/messaging.test.ts` file.

## User Guide

### Authentication
- **Login:** Use the test credentials provided above or register a new account.
- **Registration:** New accounts can be created on the `/register` page.
- **Logout:** Use the logout button in the header to end your session.

### Messaging
- **Conversation List:** The left sidebar displays all your active conversations.
- **Selecting a Chat:** Click on a conversation in the sidebar to load the message history.
- **Sending Messages:** Type your message in the bottom input field and press Enter or click the send icon.
- **Real-time Updates:** The application automatically polls for new messages every 3 seconds.
- **Optimistic UI:** When you send a message, it appears immediately in the chat window, with a background process handling the actual delivery.

## Troubleshooting

- **Database Issues:** If you encounter errors related to the database, try re-initializing it with `npm run db:init`. Note that this will clear all existing data.
- **Environment Variables:** Ensure `JWT_SECRET` is set in `.env.local`. If it's missing or too short, the application may fail to start or sessions may be invalid.
- **Next.js 16 Compatibility:** If you face issues during installation, ensure your Node.js and npm versions match the prerequisites. Use `npm install --legacy-peer-deps` if there are dependency resolution conflicts.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Core logic including authentication, database utilities, and messaging.
- `src/db-init.ts`: Database schema initialization and seeding script.
- `src/proxy.ts`: Custom middleware for route protection.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
