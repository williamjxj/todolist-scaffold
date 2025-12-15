# Quick Start: Backend Server

## The Problem

Your frontend is showing "Network Error" because the backend server is not running.

## Quick Fix (3 Steps)

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Activate Virtual Environment

```bash
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

**Note**: If you don't have a virtual environment yet, create one first:

```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Step 3: Configure the Database Backend

By default the app uses a local SQLite file. To switch to PostgreSQL 17 running on this MacBook Pro:

1. Ensure PostgreSQL is installed and running.
2. Create a database and user (example):

   ```bash
   createdb todo_app
   createuser todo_user --pwprompt
   ```

3. Edit `backend/.env` so it looks like:

   ```env
   DB_BACKEND=postgresql
   DATABASE_URL="postgresql+psycopg://todo_user:YOUR_PASSWORD@localhost:5432/todo_app"
   ```

   - `backend/src/app/config.py` always reads `backend/.env`, so this will apply whether you run `./run.sh` or `uvicorn` manually.

4. Initialize the database schema (PostgreSQL or SQLite, depending on `.env`):

   ```bash
   cd backend
   source venv/bin/activate
   python init_db.py
   ```

   - For PostgreSQL, this creates the `todos` table in your `todo_app` database.
   - For SQLite, it creates `todos.db` in `backend/src/`.

5. (Optional) Migrate existing SQLite todos into PostgreSQL:

   ```bash
   cd backend
   source venv/bin/activate
   python init_db.py --migrate-from-sqlite
   ```

   - This reads from `sqlite:///./todos.db` and upserts rows into the configured `DATABASE_URL` (recommended when moving long-lived local data).

### Step 4: Start the Server

```bash
# Easiest way - use the script:
./run.sh

# OR manually:
cd src
uvicorn app.main:app --reload --port 8000
```

## Verify It's Working

Once started, you should see:

```text
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Then test:

```bash
# In another terminal:
curl http://localhost:8000/health
# Should return: {"status":"healthy"}

# Or open in browser:
open http://localhost:8000/docs
```

If you're using PostgreSQL, you can also connect with psql to inspect data:

```bash
psql -U todo_user -d todo_app
select * from todos;
```

## Keep It Running

**Important**: Keep the terminal window with the backend server open! The server needs to stay running for the frontend to connect.

## Troubleshooting

### "Port 8000 already in use"

```bash
# Find what's using the port:
lsof -i :8000

# Kill it or use a different port:
uvicorn app.main:app --reload --port 8001
```

### "ModuleNotFoundError: No module named 'fastapi'"

```bash
# Make sure venv is activated and dependencies are installed:
source venv/bin/activate
pip install -r requirements.txt
```

### "No such file or directory: run.sh"

```bash
# Make sure you're in the backend directory:
cd backend
chmod +x run.sh
./run.sh
```

### "ModuleNotFoundError: No module named 'psycopg'" when using PostgreSQL

```bash
cd backend
source venv/bin/activate
pip install "psycopg[binary]"
# Optionally add psycopg[binary] to backend/requirements.txt and reinstall
```

## Next Steps

Once the backend is running:

1. Go back to your frontend (`http://localhost:5173`)
2. Refresh the page
3. The connection error should disappear!
