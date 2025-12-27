# TODO List Backend

Async FastAPI backend for the TODO list application with support for SQLite, local PostgreSQL, and cloud Supabase databases. Built with async SQLAlchemy and asyncpg for high-performance async operations. Features comprehensive error handling, automatic API documentation, and cloud deployment readiness.

## ✨ Recent Improvements

- ✅ **Async SQLAlchemy with asyncpg** - Full async/await support for better performance and scalability
- ✅ **Supabase Cloud Database Support** - Migrated to cloud-hosted Supabase for multi-environment access
- ✅ **Safe Table Creation** - Protects existing database tables during schema initialization
- ✅ **Migration Script** - Automated data migration from local PostgreSQL to Supabase
- ✅ **Enhanced error handling** - Better error messages and validation
- ✅ **Improved CORS configuration** - Supports multiple development origins
- ✅ **Helper scripts** - `run.sh` for easy startup, `check-backend.sh` for status verification
- ✅ **Better documentation** - Step-by-step guides and troubleshooting tips

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

## Quick Start

```bash
# 1. Create and activate virtual environment
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 3. Initialize database
python init_db.py

# 4. Start server
./run.sh
```

The API will be available at:
- **API**: http://localhost:8173
- **Interactive API Docs**: http://localhost:8173/docs
- **ReDoc**: http://localhost:8173/redoc

## Setup

### 1. Create Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

source .venv/bin/activate
```

**Why virtual environment?**
- Isolates project dependencies
- Prevents conflicts with system Python
- Best practice for Python projects

### 2. Install Dependencies

```bash
# Install production dependencies
pip install -r requirements.txt

# Install development dependencies (testing, linting, etc.)
pip install -r requirements-dev.txt
```

**Dependencies:**
- `fastapi` - Async web framework
- `uvicorn` - ASGI server
- `sqlalchemy[asyncio]` - Async ORM
- `asyncpg` - Async PostgreSQL driver (fastest Python PostgreSQL driver)
- `pydantic` - Data validation
- See `requirements.txt` for full list

### 3. Database Configuration

The application supports three database backends:

#### Option A: SQLite (Default - Local Development)

No configuration needed. The database file is created automatically:

```bash
python3 init_db.py
```

This creates `backend/src/todos.db` (SQLite file).

#### Option B: Local PostgreSQL

1. Ensure PostgreSQL is installed and running
2. Create database and user:
   ```bash
   createdb todo_app
   createuser todo_user --pwprompt
   ```
3. Edit `backend/.env`:
   ```env
   DB_BACKEND=postgresql
   DATABASE_URL="postgresql+asyncpg://todo_user:YOUR_PASSWORD@localhost:5432/todo_app"
   ```
4. Initialize database:
   ```bash
   python3 init_db.py
   ```

#### Option C: Supabase (Cloud Database - Recommended for Deployment)

1. Get Supabase connection string from your Supabase dashboard
2. Edit `backend/.env`:
   ```env
   DB_BACKEND=postgresql
   DATABASE_URL="postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"
   SUPABASE_URL="https://[project-ref].supabase.co"
   SUPABASE_KEY="[your-anon-key]"
   ```
3. Initialize database (creates `todos` table, protects existing tables):
   ```bash
   python3 init_db.py
   ```

**Note:** The `init_db.py` script automatically detects Supabase and uses safe table creation that won't modify existing tables.

### 4. Initialize Database

```bash
# Run database initialization script
python3 init_db.py

# For SQLite: Creates todos.db in backend/src/
# For PostgreSQL/Supabase: Creates todos table in configured database
```

**Important:** 
- For SQLite: Database is created in `backend/src/todos.db` because the server runs from the `src/` directory
- For Supabase: The script detects existing tables and only creates the `todos` table without modifying others

### 5. Start Development Server

```bash
# Option 1: Use the convenience script (RECOMMENDED)
./run.sh

# Option 2: Run from src directory
cd src
uvicorn app.main:app --reload --port 8173

# Option 3: Run from backend directory with PYTHONPATH
PYTHONPATH=src uvicorn app.main:app --reload --port 8173

# Option 4: Using Python module syntax
python -m uvicorn app.main:app --reload --port 8173 --app-dir src
```

**Important**: Make sure your virtual environment is activated before running the server!

**What `--reload` does:**
- Automatically restarts server on code changes
- Great for development

### 6. Verify Backend is Running

```bash
# Quick check script (checks port and health endpoint)
./check-backend.sh

# Or manually test
curl http://localhost:8173/health
# Should return: {"status":"healthy"}

# Or open in browser
open http://localhost:8173/docs
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

## Code Quality

```bash
# Format code
black src/

# Lint code
flake8 src/

# Type check
mypy src/
```

## Project Structure

```
backend/
├── src/
│   └── app/
│       ├── __init__.py
│       ├── main.py              # FastAPI application
│       ├── config.py            # Configuration
│       ├── database.py          # Database setup
│       ├── models.py            # SQLAlchemy models
│       ├── schemas.py           # Pydantic schemas
│       ├── api/
│       │   └── routes/
│       │       └── todos.py     # API endpoints
│       └── services/
│           └── todo_service.py  # Business logic
└── tests/
    ├── conftest.py              # pytest fixtures
    └── test_todos.py            # API tests
```

## API Documentation

When the server is running, visit:
- **Interactive API Docs (Swagger)**: http://localhost:8173/docs
- **ReDoc**: http://localhost:8173/redoc
- **OpenAPI JSON**: http://localhost:8173/openapi.json

## Troubleshooting

### "Cannot connect to backend server"

**Symptoms:** Frontend shows connection errors

**Solutions:**
1. Check if backend is running: `./check-backend.sh`
2. Verify port 8173 is available: `lsof -i :8173`
3. Check virtual environment is activated: `which python` should show `venv/bin/python`

### "no such table: todos"

**Symptoms:** API returns 500 error, logs show "no such table: todos"

**Solutions:**
1. Run database initialization: `python3 init_db.py`
2. For SQLite: Verify database exists: `ls src/todos.db`
3. For SQLite: Check database has tables: `sqlite3 src/todos.db ".tables"`
4. For PostgreSQL/Supabase: Verify connection string in `backend/.env` is correct
5. For Supabase: Check that `todos` table exists in Supabase dashboard

### "ModuleNotFoundError: No module named 'fastapi'"

**Symptoms:** Import errors when starting server

**Solutions:**
1. Activate virtual environment: `source venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Verify installation: `pip list | grep fastapi`

### Port Already in Use

**Symptoms:** "Address already in use" error

**Solutions:**
1. Find process using port: `lsof -i :8173`
2. Kill process: `lsof -ti :8173 | xargs kill -9`
3. Or use different port: `uvicorn app.main:app --reload --port 8001`

### Database Location Issues

**Symptoms:** Database created but server can't find it

**Solutions:**
1. Database must be in `backend/src/todos.db` (not `backend/todos.db`)
2. Run `init_db.py` from `backend/` directory (it handles path correctly)
3. Server runs from `src/` directory, so relative paths resolve there

## Helper Scripts

### `run.sh`
Convenience script to start the development server:
```bash
./run.sh
```
Automatically navigates to `src/` and runs uvicorn.

### `check-backend.sh`
Quick script to verify backend status:
```bash
./check-backend.sh
```
Checks if port 8173 is in use and tests the health endpoint.

## Documentation

- **[Async Migration Guide](ASYNC_MIGRATION.md)** - Complete guide to async SQLAlchemy with asyncpg
- **[FastAPI Setup Guide](../docs/fastapi-setup.md)** - Comprehensive FastAPI implementation details
- **[FastAPI Step-by-Step](../docs/fastapi-step-by-step.md)** - Detailed step-by-step tutorial
- **[API Reference](../docs/api-reference.md)** - Complete API endpoint documentation
- **[FastAPI + React Tips](../docs/fastapi-react-tips.md)** - Development tips and knowledge base
