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
    npm run db:init
    ```

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
- `src/proxy.ts`: Custom middleware for route protection.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
