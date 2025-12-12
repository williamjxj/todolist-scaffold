# Quick Start Guide

**Feature**: TODO List Application  
**Date**: 2025-01-27

This guide will help you get the TODO list application up and running quickly.

## Prerequisites

### Backend Prerequisites
- Python 3.11 or higher
- pip (Python package manager)

### Frontend Prerequisites
- Node.js 18 or higher
- npm or yarn (package manager)

### Verify Installation

```bash
# Check Python version
python --version  # Should be 3.11+

# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
# Install production dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

### 4. Initialize Database

```bash
# Run database initialization script
python init_db.py

# This creates the todos.db file in the backend directory
```

### 5. Start Backend Server

```bash
# Option 1: Run from src directory (recommended)
cd src
uvicorn app.main:app --reload --port 8000

# Option 2: Run from backend directory with PYTHONPATH
PYTHONPATH=src uvicorn app.main:app --reload --port 8000

# Option 3: Using Python module syntax
python -m uvicorn app.main:app --reload --port 8000 --app-dir src
```

The backend API will be available at:
- **API**: http://localhost:8000
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 6. Verify Backend

Open http://localhost:8000/docs in your browser. You should see the interactive API documentation.

Test the API:
```bash
# Create a TODO item
curl -X POST "http://localhost:8000/api/todos" \
  -H "Content-Type: application/json" \
  -d '{"description": "Test TODO item"}'

# List all TODOs
curl http://localhost:8000/api/todos
```

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure API Endpoint (if needed)

Check `src/services/api.ts` and ensure the API base URL is correct:
```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The frontend will be available at:
- **Application**: http://localhost:5173 (Vite default port)

### 5. Verify Frontend

Open http://localhost:5173 in your browser. You should see the TODO list application.

## Running Both Services

### Option 1: Separate Terminals

**Terminal 1 (Backend)**:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
cd src
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### Option 2: Using a Process Manager

Install `concurrently`:
```bash
npm install -g concurrently
```

Create a `start.sh` script in the project root:
```bash
#!/bin/bash
concurrently \
  "cd backend && source venv/bin/activate && cd src && uvicorn app.main:app --reload --port 8000" \
  "cd frontend && npm run dev"
```

Run:
```bash
chmod +x start.sh
./start.sh
```

## Testing

### Backend Tests

```bash
cd backend
pytest

# With coverage
pytest --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm test
# or
yarn test
```

## Common Issues

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Make sure virtual environment is activated and dependencies are installed

**Issue**: `Port 8000 already in use`
- **Solution**: Change port: `uvicorn app.main:app --reload --port 8001`

**Issue**: Database file not found
- **Solution**: Run database initialization script

### Frontend Issues

**Issue**: `Cannot connect to API`
- **Solution**: 
  1. Verify backend is running on port 8000
  2. Check CORS configuration in backend
  3. Verify API base URL in `src/services/api.ts`

**Issue**: `Port 5173 already in use`
- **Solution**: Vite will automatically use the next available port, or specify: `npm run dev -- --port 5174`

**Issue**: `npm install` fails
- **Solution**: 
  1. Clear npm cache: `npm cache clean --force`
  2. Delete `node_modules` and `package-lock.json`
  3. Run `npm install` again

### CORS Issues

If you see CORS errors in the browser console, ensure the backend has CORS middleware configured:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs to see interactive API documentation
2. **Read Implementation Details**: Check `docs/fastapi-setup.md` for FastAPI-specific implementation details
3. **Review Code Structure**: See `plan.md` for project structure and architecture
4. **Run Tests**: Execute test suites to verify everything works

## Development Workflow

1. **Make Changes**: Edit code in `backend/src/` or `frontend/src/`
2. **Auto-Reload**: Both servers support hot-reload (changes appear automatically)
3. **Test Changes**: Use the interactive API docs or frontend UI
4. **Run Tests**: Execute test suites before committing

## Production Build (Optional)

### Backend

```bash
cd backend
# Install production dependencies only
pip install -r requirements.txt

# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
# Build for production
npm run build

# Preview production build
npm run preview
```

The production build will be in `frontend/dist/` and can be served by any static file server.

## Getting Help

- **API Documentation**: http://localhost:8000/docs (when backend is running)
- **Implementation Details**: See `docs/fastapi-setup.md`
- **Architecture**: See `plan.md`
- **Data Model**: See `data-model.md`
- **API Contracts**: See `contracts/openapi.yaml`

## Summary

You should now have:
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:5173
- ✅ Interactive API docs accessible
- ✅ TODO list application functional

Happy coding! 🚀
