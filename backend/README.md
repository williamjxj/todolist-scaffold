# TODO List Backend

FastAPI backend for the TODO list application with SQLite database, comprehensive error handling, and automatic API documentation.

## ✨ Recent Improvements

- ✅ **Fixed database initialization** - Database now created in correct location (`src/todos.db`)
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
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM
- `pydantic` - Data validation
- See `requirements.txt` for full list

### 3. Initialize Database

```bash
# Run database initialization script
python init_db.py

# This creates the todos.db file in backend/src/todos.db
# (where the server expects it)
```

**Important:** The database is created in `backend/src/todos.db` because the server runs from the `src/` directory. The `init_db.py` script handles this automatically.

### 4. Start Development Server

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

### 5. Verify Backend is Running

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
1. Run database initialization: `python init_db.py`
2. Verify database exists: `ls src/todos.db`
3. Check database has tables: `sqlite3 src/todos.db ".tables"`

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

- **[FastAPI Setup Guide](../docs/fastapi-setup.md)** - Comprehensive FastAPI implementation details
- **[FastAPI Step-by-Step](../docs/fastapi-step-by-step.md)** - Detailed step-by-step tutorial
- **[API Reference](../docs/api-reference.md)** - Complete API endpoint documentation
- **[FastAPI + React Tips](../docs/fastapi-react-tips.md)** - Development tips and knowledge base
