# Quickstart: Switching from SQLite to PostgreSQL 17 (Local Dev)

This guide explains how to run the FastAPI backend locally using PostgreSQL 17 instead of SQLite on your MacBook Pro.

## Prerequisites

- PostgreSQL 17 installed and running locally (e.g., via Homebrew or Postgres.app).
- This repository checked out and the Python backend dependencies installed.

## 1. Configure PostgreSQL for the app

1. Create a database and user for the todo app (example):

   ```bash
   createdb todo_app
   createuser todo_user --pwprompt
   ```

2. Grant privileges to the user on the database.

## 2. Configure `backend/.env` for PostgreSQL

Create or edit the `backend/.env` file so the backend uses PostgreSQL as the primary database:

```env
DB_BACKEND=postgresql
DATABASE_URL="postgresql+psycopg://todo_user:YOUR_PASSWORD@localhost:5432/todo_app"
```

Notes:

- `backend/src/app/config.py` is wired to always read `backend/.env`, regardless of the current working directory.
- Adjust the URL to match your local PostgreSQL user/password and port.

## 3. Initialize the PostgreSQL schema

From the repository root:

```bash
cd backend
source venv/bin/activate  # if you use a virtualenv
python init_db.py
```

This will:

- Load `backend/.env` and read `DB_BACKEND` / `DATABASE_URL`.
- Create the `todos` table (and any other models) in your PostgreSQL `todo_app` database.

## 4. Migrate existing SQLite data (optional)

If you have existing todos in SQLite (`todos.db` in `backend/src/`) and want to migrate them into PostgreSQL:

1. Ensure `backend/.env` still has `DB_BACKEND=postgresql` and `DATABASE_URL` pointing at your Postgres database.
2. Run the migration flow:

   ```bash
   cd backend
   source venv/bin/activate
   python init_db.py --migrate-from-sqlite
   ```

3. The script will:

   - Read all rows from the existing SQLite `todos` table.
   - Upsert them into the configured PostgreSQL database using the same `TodoItem` model.
   - Print how many todos were found and migrated.

You can run this during a short local "maintenance window" (backend stopped or read-only) to avoid concurrent writes while migrating.

## 5. Run the backend against PostgreSQL

Start the FastAPI backend as usual:

```bash
cd backend
source venv/bin/activate
./run.sh
```

With `backend/.env` set to use PostgreSQL, the app will now connect to your local Postgres `todo_app` database instead of SQLite, while the API surface remains the same.

Verify that creating, listing, updating, and deleting todos still behaves as expected, and that new todos appear in PostgreSQL.
