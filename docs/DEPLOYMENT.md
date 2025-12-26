# Independent Deployment Guide

This guide explains how to deploy the frontend and backend of the TODO List application independently.

## Backend Deployment (e.g., Railway, Render, Fly.io)

### Prerequisites

- A Supabase project (recommended) or other PostgreSQL database (e.g., Neon, Railway PostgreSQL)

### Environment Variables

Configure the following environment variables in your hosting provider:

**Required:**
- `DATABASE_URL`: Your Supabase connection string (or PostgreSQL connection string)
  - Format: `postgresql+psycopg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require`
- `DB_BACKEND`: `postgresql`
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins (e.g., `https://todo-frontend.vercel.app,https://yourdomain.com`)
- `PORT`: The port the backend should listen on (Render provides this automatically via `$PORT`)

**Optional:**
- `SUPABASE_URL`: Your Supabase project URL (for future features)
- `SUPABASE_KEY`: Your Supabase anon key (for future features)

### Step-by-Step for Render

1. **Create a new Web Service** in Render dashboard
2. **Connect your repository** (GitHub/GitLab)
3. **Configure build settings:**
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend/src && python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Set environment variables** (see above)
5. **Deploy**

**Note:** The application will automatically:
- Connect to Supabase on startup
- Verify database connection
- Log connection status

### Health Checks

After deployment, verify the application:

```bash
# Basic health check
curl https://your-app.onrender.com/health

# Database connectivity check
curl https://your-app.onrender.com/health/db
```

### Migration Before Deployment

If you have existing data in local PostgreSQL:

1. **Before deploying**, run the migration script locally:
   ```bash
   export LOCAL_POSTGRES_URL="postgresql+psycopg://user:password@localhost:5432/database"
   python3 backend/migrate_to_supabase.py
   ```
2. **Verify** the migration was successful
3. **Deploy** with Supabase `DATABASE_URL` configured

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
