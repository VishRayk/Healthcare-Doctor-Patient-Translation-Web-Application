# Healthcare Doctor–Patient Translation Web Application

A full-stack web application serving as a real-time translation bridge between doctors and patients.

## Features Completed
- **Real-Time Translation**: Simultaneous views for Doctor (English) and Patient (Spanish) with instant translation using **Llama 3.1 (via Groq API)**.
- **Audio Support**: Record voice messages directly in the browser; audio is preserved and playable.
- **Conversation Logging**: All chats are persisted locally (LocalStorage) and preserved between sessions.
- **Search**: Filter conversations by keywords, summary content, or date.
- **AI Summary**: Generate medical summaries (symptoms, diagnosis, plan) with a single click.
- **Clean UI**: High-contrast, strictly organized "Doctor" vs "Patient" columns.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Groq API (Llama 3.1-8b-instant) - *Free Open Source Model*
- **Persistence**: LocalStorage & Base64 Audio (Client-side persistence)

## Setup & Running locally

1.  **Clone/Download** the repository.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure API Key**:
    - Create a `.env.local` file in the root directory.
    - Add your Groq API Key:
      ```env
      GROQ_API_KEY=gsk_your_key_here
      ```
    - Get a free key from [Groq Console](https://console.groq.com/keys).
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
5.  **Open Browser**:
    - Navigate to `http://localhost:3000`.

## Deployment Guide (Vercel)

1.  Push this code to a **GitHub Repository**.
2.  Go to **Vercel** and "Add New Project".
3.  Import your repository.
4.  in **Environment Variables** settings on Vercel:
    - Add `GROQ_API_KEY` with your actual key key.
5.  Click **Deploy**.

## Provenance
Created as part of a coding assignment to demonstrate full-stack architecture, AI integration, and rapid UI development.
