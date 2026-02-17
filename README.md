# BrainBolt

BrainBolt is an **adaptive infinite quiz platform** built with a React + Vite client and an Express + TypeScript server. It adjusts question difficulty based on performance, tracks streaks and score, and includes authentication + leaderboards.

## Features

- **Adaptive difficulty** (difficulty shifts based on correctness and recent momentum)
- **Infinite quiz loop** (fetch next question, submit answer)
- **Streaks + scoring** (with streak decay)
- **Leaderboards** (score and max streak)
- **Authentication** (email/password + server sessions)

## Tech Stack

- **Client**: React, Vite, Tailwind CSS, Radix UI
- **Server**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Auth**: `express-session` with Mongo-backed sessions (`connect-mongo`)

## Getting Started (Local)

### Prerequisites

- Node.js 20+
- A MongoDB connection string (Atlas or local)

### 1) Install dependencies

```bash
npm install
```

### 2) Start the dev server

```bash
PORT=3000 npm run dev
```

The app will be served on `http://localhost:3000` by default.


## Running with Docker

This repo includes a `Dockerfile` and `docker-compose.yml`.

1) Set `MONGODB_URI` and `SESSION_SECRET` in your environment (or in an `.env` file used by Docker Compose).

2) Start services:

```bash
docker compose up --build
```

The app is exposed on `http://localhost:3000`.

## Project Structure

```text
.
├─ client/          # React UI (Vite)
├─ server/          # Express API + auth + quiz logic
├─ shared/          # Shared Zod schemas + shared types
├─ script/          # Build script (client + server bundle)
├─ dist/            # Production output (generated)
└─ vite.config.ts   # Vite config (client root is ./client)
```

## API (Quick Reference)

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/user`
- **Quiz**
  - `GET /api/quiz/next`
  - `GET /api/quiz/leaderboard`
  - `GET /api/quiz/metrics`
  - `POST /api/quiz/answer`
    

