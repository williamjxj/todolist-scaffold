# TODO List Backend

FastAPI backend for the TODO list application.

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

## Setup

### 1. Create Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
# Install production dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

### 3. Initialize Database

```bash
# Run database initialization script
python init_db.py

# This creates the todos.db file in the backend directory
```

### 4. Start Development Server

```bash
# Option 1: Use the convenience script (easiest)
./run.sh

# Option 2: Run from src directory
cd src
uvicorn app.main:app --reload --port 8000

# Option 3: Run from backend directory with PYTHONPATH
PYTHONPATH=src uvicorn app.main:app --reload --port 8000

# Option 4: Using Python module syntax
python -m uvicorn app.main:app --reload --port 8000 --app-dir src
```

**Important**: Make sure your virtual environment is activated before running the server!

The API will be available at:
- **API**: http://localhost:8000
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 5. Verify Backend is Running

```bash
# Quick check script
./check-backend.sh

# Or manually test
curl http://localhost:8000/health
# Should return: {"status":"healthy"}

# Or open in browser
open http://localhost:8000/docs
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
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Documentation

For detailed FastAPI implementation guidance, see `../docs/fastapi-setup.md`

For API reference, see `../docs/api-reference.md`
