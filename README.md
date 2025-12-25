# TODO List Application

A full-stack TODO list application demonstrating modern web development practices with **React.js** (TypeScript) frontend and **Python FastAPI** backend, using **SQLite** for data persistence.

## 🚀 Features

- ✅ Create, read, update, and delete TODO items
- ✅ Toggle completion status
- ✅ Real-time error handling and user feedback
- ✅ Responsive, accessible UI with Tailwind CSS
- ✅ Automatic API documentation (Swagger/OpenAPI)
- ✅ Comprehensive test coverage
- ✅ Type-safe development with TypeScript and Pydantic

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [Documentation](#documentation)
- [Recent Improvements](#recent-improvements)

## Quick Start

### Prerequisites

- **Python 3.11+** with pip
- **Node.js 18+** with npm/yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
python init_db.py
./run.sh  # Or see backend/README.md for other options
```

Backend will be available at:
- **API**: http://localhost:8173
- **API Docs**: http://localhost:8173/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:5173

### Verify Everything Works

1. Check backend health: `curl http://localhost:8173/health`
2. Open frontend: http://localhost:5173
3. Create a TODO item and verify it appears

## Project Structure

```
demo1/
├── backend/              # FastAPI backend
│   ├── src/app/         # Application code
│   │   ├── api/         # API routes
│   │   ├── services/    # Business logic
│   │   ├── models.py    # SQLAlchemy models
│   │   ├── schemas.py   # Pydantic schemas
│   │   └── main.py      # FastAPI app
│   ├── tests/           # Backend tests
│   ├── init_db.py       # Database initialization
│   └── run.sh           # Development server script
│
├── frontend/            # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API client
│   │   └── types/      # TypeScript types
│   └── tests/          # Frontend tests
│
├── docs/                # Documentation
│   ├── fastapi-setup.md           # FastAPI implementation guide
│   ├── fastapi-step-by-step.md    # Step-by-step FastAPI tutorial
│   ├── api-reference.md           # API reference
│   └── fastapi-react-tips.md      # Development tips & KB
│
└── specs/               # Feature specifications
    └── 001-todo-list-example/
```

## Technology Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - Python ORM for database operations
- **Pydantic** - Data validation using Python type hints
- **SQLite** - Lightweight, file-based database
- **pytest** - Testing framework

### Frontend
- **React 18+** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Vitest** - Testing framework

## Development

### Running Both Services

**Option 1: Separate Terminals**
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
./run.sh

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option 2: Check Backend Status**
```bash
cd backend
./check-backend.sh
```

### Testing

**Backend Tests:**
```bash
cd backend
pytest
pytest --cov=app --cov-report=html
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

### Code Quality

**Backend:**
```bash
cd backend
black src/          # Format code
flake8 src/         # Lint code
mypy src/           # Type check
```

**Frontend:**
```bash
cd frontend
npm run lint        # Lint code
npm run format      # Format code
```

## Documentation

### For Developers

- **[FastAPI Setup Guide](docs/fastapi-setup.md)** - Comprehensive FastAPI implementation details
- **[FastAPI Step-by-Step](docs/fastapi-step-by-step.md)** - Detailed step-by-step tutorial
- **[API Reference](docs/api-reference.md)** - Complete API endpoint documentation
- **[FastAPI + React Tips](docs/fastapi-react-tips.md)** - Development tips and knowledge base

### For Backend Developers

- **[Backend README](backend/README.md)** - Backend-specific setup and usage
- **[FastAPI Setup](docs/fastapi-setup.md)** - Deep dive into FastAPI implementation

### For Frontend Developers

- **[Frontend README](frontend/README.md)** - Frontend-specific setup and usage

## Recent Improvements

### Network & Connection Fixes
- ✅ Fixed API client to use relative URLs with Vite proxy (eliminates CORS issues)
- ✅ Enhanced error handling with user-friendly connection error messages
- ✅ Added connection status banner in UI when backend is unavailable
- ✅ Improved CORS configuration for development environment

### Database & Initialization
- ✅ Fixed database initialization to create tables correctly
- ✅ Database now created in correct location (`backend/src/todos.db`)
- ✅ `init_db.py` properly imports models before table creation
- ✅ Added database verification in startup process

### Developer Experience
- ✅ Added `run.sh` script for easy backend startup
- ✅ Added `check-backend.sh` script to verify backend status
- ✅ Created `START-BACKEND.md` quick reference guide
- ✅ Enhanced error messages with actionable instructions
- ✅ Improved documentation with troubleshooting sections

### Code Quality
- ✅ Comprehensive test coverage for both backend and frontend
- ✅ Type safety with TypeScript and Pydantic
- ✅ Code formatting and linting configured
- ✅ Proper error handling throughout the stack

## Troubleshooting

### Backend Issues

**"Cannot connect to backend server"**
- Ensure backend is running: `cd backend && ./check-backend.sh`
- Check port 8173 is available: `lsof -i :8173`
- Verify database is initialized: `ls backend/src/todos.db`

**"no such table: todos"**
- Run database initialization: `cd backend && python init_db.py`
- Ensure you're in the correct directory when running init_db.py

**"ModuleNotFoundError"**
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### Frontend Issues

**"Network Error" or CORS errors**
- Verify backend is running on http://localhost:8173
- Check Vite proxy configuration in `vite.config.ts`
- Ensure CORS origins include `http://localhost:5173`

**Port already in use**
- Backend: Change port in `run.sh` or use `--port 8001`
- Frontend: Vite will auto-select next available port

## Contributing

This is a demo/learning project. For questions or improvements:
1. Check the documentation in `docs/`
2. Review the specification in `specs/001-todo-list-example/`
3. See implementation details in respective README files

## License

This is a demonstration project for educational purposes.
