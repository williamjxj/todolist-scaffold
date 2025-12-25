# Independent Deployment Guide

This guide explains how to deploy the frontend and backend of the TODO List application independently.

## Backend Deployment (e.g., Railway, Render, Fly.io)

### Prerequisites

- A PostgreSQL database (e.g., Supabase, Neon, or a managed cloud database).

### Environment Variables

Configure the following environment variables in your hosting provider:

- `DATABASE_URL`: Your production PostgreSQL connection string.
- `DB_BACKEND`: `postgresql`
- `CORS_ORIGINS`: A comma-separated list of allowed frontend origins (e.g., `https://todo-frontend.vercel.app`).
- `PORT`: The port the backend should listen on (defaults to `8173`).

### Step-by-Step

1. Deploy the `backend/` directory.
2. Ensure the startup command runs `migrate_schema.py` before starting the server:

   ```bash
   python migrate_schema.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

---

## Frontend Deployment (e.g., Vercel, Cloudflare Pages)

### Environment Variables

Configure the following build-time environment variable:

- `VITE_API_URL`: The absolute URL of your deployed backend (e.g., `https://todo-backend.railway.app/api`).

### Step-by-Step

1. Deploy the `frontend/` directory.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.

## Local Development (Independent Mode)

If you want to run the frontend without the Vite proxy:

1. Start the backend as usual.
2. In the `frontend/` directory, create a `.env.local` file:

   ```env
   VITE_API_URL=http://localhost:8173/api
   ```

3. Run `npm run dev`. The frontend will now bypass the proxy and talk directly to `http://localhost:8173/api`.
