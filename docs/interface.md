# Deployment & Interface Configuration

This document compares the configurations for different deployment and development scenarios of the Todo List Scaffold.

## Configuration Comparison

| Feature | 1. Full Local | 2. Local + Supabase | 3. Local UI + Cloud Backend | 4. Full Cloud |
| :--- | :--- | :--- | :--- | :--- |
| **UI Environment** | Local (Vite) | Local (Vite) | Local (Vite) | Vercel |
| **API Environment** | Local (FastAPI) | Local (FastAPI) | Render.com | Render.com |
| **Database** | Local PostgreSQL | Supabase | Supabase | Supabase |
| **Frontend `VITE_API_URL`** | `http://localhost:8173/api` | `http://localhost:8173/api` | `https://todolist-scaffold.onrender.com/api` | `https://todolist-scaffold.onrender.com/api` |
| **Backend `DATABASE_URL`** | `postgresql+asyncpg://...` (Local) | `postgresql+asyncpg://...` (Supabase) | `postgresql+asyncpg://...` (Supabase) | `postgresql+asyncpg://...` (Supabase) |
| **Backend `CORS_ORIGINS`** | `http://localhost:5173` | `http://localhost:5173` | `http://localhost:5173` | `https://todolist-scaffold.vercel.app` |

## Architecture Diagram

```mermaid
graph TD
    subgraph "Scenario 1 & 2: Local Development"
        LUI[Local UI - localhost:5173] --> LB[Local Backend - localhost:8173]
        LB --> LDB[(Local DB / Supabase)]
    end

    subgraph "Scenario 3: Hybrid"
        HUI[Local UI - localhost:5173] --> RB[Render Backend]
        RB --> SDB[(Supabase DB)]
    end

    subgraph "Scenario 4: Production"
        VUI[Vercel UI] --> RB2[Render Backend]
        RB2 --> SDB2[(Supabase DB)]
    end
```

## Setup Notes

### 1. Local PostgreSQL (Scenario 1)

Ensure your local PostgreSQL is running and the database exists:

- **URL**: `postgresql+asyncpg://user:password@localhost:5432/todo_app`

### 2. Supabase Integration (Scenarios 2, 3, 4)

When using Supabase, ensure the following in your `DATABASE_URL`:

- Use the `postgresql+asyncpg://` prefix.
- Append `?sslmode=require` if required by your network (our `database.py` handles stripping this for the driver but uses it for configuration).
- Our system automatically disables statement caching for Supabase/PgBouncer compatibility.

### 3. Render & Vercel (Scenario 4)

- **Render Environment**: Set `CORS_ORIGINS` to `https://todolist-scaffold.vercel.app`.
- **Vercel Environment**: Set `VITE_API_URL` to `https://todolist-scaffold.onrender.com/api`.
