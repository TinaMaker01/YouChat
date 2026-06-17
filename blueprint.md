# Chatbot Application Blueprint

## Overview

This document outlines the plan for creating a chatbot application. The application allows users to register and log in, and then have a conversation with a chatbot. The application is built using Next.js 16, SQLite, and custom JWT authentication.

## Project Outline

*   **Authentication:** Users can register and log in using their email and password. (COMPLETED)
*   **Chat Interface:** A modern messenger-style interface for real-time conversation. (COMPLETED)
*   **Database:** SQLite database stores user information, conversations, and message history. (COMPLETED)
*   **Chatbot Integration:** AI-powered responses (PLANNED - OpenAI integration).

## Current Implementation Details

- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite (local `db.sqlite`)
- **Authentication:** Custom JWT sessions stored in cookies.
- **Styling:** Tailwind CSS 4 & Lucide icons.

## Plan & Progress

1.  **Set up the database:** (DONE) Configured SQLite with tables for users, conversations, and messages.
2.  **Set up authentication:** (DONE) Implemented secure login/register routes and session middleware.
3.  **Build the UI:** (DONE) Created responsive chat sidebar, message window, and auth pages.
4.  **Implement the chat functionality:** (PARTIAL) Basic peer-to-peer messaging implemented. OpenAI integration is the next major step.
5.  **Audit and Optimization:** (IN PROGRESS) Cleaning up unused resources and improving code quality.
