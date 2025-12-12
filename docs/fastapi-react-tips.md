# FastAPI + React.js Development Tips & Knowledge Base

**Last Updated**: 2025-12-12  
**Purpose**: Practical tips, common patterns, and troubleshooting for FastAPI + React.js development

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Workflow](#development-workflow)
3. [API Integration Patterns](#api-integration-patterns)
4. [CORS Configuration](#cors-configuration)
5. [Error Handling](#error-handling)
6. [State Management](#state-management)
7. [Type Safety](#type-safety)
8. [Testing Strategies](#testing-strategies)
9. [Performance Optimization](#performance-optimization)
10. [Common Issues & Solutions](#common-issues--solutions)
11. [Best Practices](#best-practices)
12. [Deployment Considerations](#deployment-considerations)

---

## Architecture Overview

### Stack Components

```
┌─────────────────┐
│   React.js      │  Frontend (TypeScript, Vite, Tailwind)
│   Frontend      │  Port: 5173
└────────┬────────┘
         │ HTTP/REST
         │ (via Vite Proxy)
         ▼
┌─────────────────┐
│   FastAPI       │  Backend (Python, SQLAlchemy, Pydantic)
│   Backend       │  Port: 8000
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SQLite        │  Database (File-based)
│   Database      │  Location: backend/src/todos.db
└─────────────────┘
```

### Communication Flow

1. **Frontend Request**: React component calls API service
2. **Vite Proxy**: Development proxy forwards `/api/*` to `http://localhost:8000`
3. **FastAPI Route**: Receives request, validates with Pydantic
4. **Service Layer**: Business logic processes request
5. **Database**: SQLAlchemy executes query
6. **Response**: JSON response sent back through chain

---

## Development Workflow

### Starting Both Services

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
./run.sh
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Verify Both Running:**
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:5173
```

### Hot Reload

- **Backend**: FastAPI with `--reload` flag auto-restarts on code changes
- **Frontend**: Vite HMR (Hot Module Replacement) updates without full page reload

### Development Tips

1. **Keep API docs open**: http://localhost:8000/docs for testing endpoints
2. **Use browser DevTools**: Network tab to inspect API calls
3. **Check console logs**: Both browser console and terminal for errors
4. **Test API independently**: Use `curl` or Postman before frontend integration

---

## API Integration Patterns

### Frontend API Client Setup

**`frontend/src/services/api.ts`:**
```typescript
import axios from 'axios'

// Use relative URL for Vite proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Error interceptor for better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to backend server')
    }
    throw error
  }
)
```

**Key Points:**
- Relative URLs (`/api`) work with Vite proxy
- Environment variables for production
- Error interceptors for consistent error handling

### Vite Proxy Configuration

**`frontend/vite.config.ts`:**
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

**Why Proxy?**
- Avoids CORS issues in development
- Single origin (frontend) makes requests
- Automatic path rewriting

### React Hook Pattern

**`frontend/src/hooks/useTodos.ts`:**
```typescript
export const useTodos = () => {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTodos = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await todoApi.getAll()
      setTodos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  // Load on mount
  useEffect(() => {
    loadTodos()
  }, [])

  return { todos, loading, error, loadTodos, ... }
}
```

**Pattern Benefits:**
- Encapsulates API logic
- Reusable across components
- Consistent error handling
- Loading state management

---

## CORS Configuration

### Backend CORS Setup

**`backend/src/app/main.py`:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # All HTTP methods
    allow_headers=["*"],  # All headers
)
```

**Configuration:**
```python
CORS_ORIGINS: list[str] = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # Alternative port
    "http://127.0.0.1:5173",   # IP variant
]
```

### CORS Troubleshooting

**Error: "Access to XMLHttpRequest blocked by CORS policy"**

**Solutions:**
1. Check `CORS_ORIGINS` includes frontend URL
2. Verify exact URL (including port, http vs https)
3. Use Vite proxy in development (avoids CORS entirely)
4. Check browser console for exact origin being blocked

**Development vs Production:**
- **Development**: Use Vite proxy (no CORS issues)
- **Production**: Configure exact origins (security)

---

## Error Handling

### Backend Error Handling

**FastAPI HTTP Exceptions:**
```python
from fastapi import HTTPException, status

@router.get("/{todo_id}")
async def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = service.get_by_id(todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TODO item with id {todo_id} not found"
        )
    return todo
```

**Pydantic Validation Errors:**
- Automatically handled by FastAPI
- Returns 422 status with validation details
- Frontend receives structured error response

### Frontend Error Handling

**Component Error Display:**
```typescript
const { todos, error, loading } = useTodos()

{error && (
  <div className="error-banner">
    {error}
    <button onClick={() => dismissError()}>Dismiss</button>
  </div>
)}
```

**Connection Error Detection:**
```typescript
const isConnectionError = error?.toLowerCase().includes('cannot connect') || 
                         error?.toLowerCase().includes('network error')

{isConnectionError && (
  <div className="connection-warning">
    Backend server may not be running. Check http://localhost:8000
  </div>
)}
```

**Error Recovery:**
- Retry failed requests
- Show user-friendly messages
- Log errors for debugging
- Graceful degradation

---

## State Management

### Simple State (This Project)

**React Hooks:**
- `useState` - Component state
- `useEffect` - Side effects (API calls)
- Custom hooks - Reusable state logic

**Pattern:**
```typescript
// Custom hook encapsulates state
const useTodos = () => {
  const [todos, setTodos] = useState<TodoItem[]>([])
  // ... API calls, mutations
  return { todos, loading, error, createTodo, ... }
}

// Component uses hook
const App = () => {
  const { todos, createTodo } = useTodos()
  // ...
}
```

### When to Use State Management Libraries

**Use React Context/Redux/Zustand when:**
- State shared across many components
- Complex state updates
- Need time-travel debugging
- Large application

**For this project:**
- Simple state (todos list)
- Limited component tree
- React hooks sufficient

---

## Type Safety

### Backend Type Safety

**Pydantic Schemas:**
```python
class TodoItemCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=500)
```

**Benefits:**
- Automatic validation
- Type checking
- API documentation
- Error messages

### Frontend Type Safety

**TypeScript Types:**
```typescript
interface TodoItem {
  id: number
  description: string
  completed: boolean
  created_at: string
  updated_at: string
}
```

**API Client Typing:**
```typescript
const api = {
  getAll: async (): Promise<TodoItem[]> => {
    const response = await axios.get<TodoItem[]>('/todos')
    return response.data
  }
}
```

**Benefits:**
- Compile-time error checking
- IDE autocomplete
- Refactoring safety
- Documentation

### Type Synchronization

**Keep Types in Sync:**
1. Backend Pydantic schemas define API contract
2. Frontend TypeScript types match schemas
3. Update both when API changes
4. Consider code generation (OpenAPI → TypeScript)

---

## Testing Strategies

### Backend Testing

**Test Structure:**
```python
# tests/conftest.py - Fixtures
@pytest.fixture
def client(db):
    # Test client with test database
    yield TestClient(app)

# tests/test_todos.py - Tests
def test_create_todo(client):
    response = client.post("/api/todos/", json={"description": "Test"})
    assert response.status_code == 201
```

**Testing Levels:**
1. **Unit Tests** - Service layer logic
2. **Integration Tests** - API endpoints
3. **E2E Tests** - Full request/response cycle

### Frontend Testing

**Component Testing:**
```typescript
import { render, screen } from '@testing-library/react'

test('renders todo list', () => {
  render(<TodoList todos={mockTodos} />)
  expect(screen.getByText('Test TODO')).toBeInTheDocument()
})
```

**API Mocking:**
```typescript
vi.mock('../services/api', () => ({
  todoApi: {
    getAll: vi.fn(() => Promise.resolve(mockTodos))
  }
}))
```

---

## Performance Optimization

### Backend Optimization

**Database Queries:**
```python
# Bad: N+1 queries
for todo in todos:
    user = get_user(todo.user_id)  # Query per todo

# Good: Eager loading
todos = db.query(TodoItem).options(joinedload(TodoItem.user)).all()
```

**Response Caching:**
```python
from fastapi_cache import FastAPICache

@router.get("/")
@cache(expire=60)  # Cache for 60 seconds
async def list_todos():
    return service.get_all()
```

### Frontend Optimization

**React.memo:**
```typescript
export const TodoItem = React.memo(({ todo, onToggle }) => {
  // Only re-renders if props change
})
```

**Code Splitting:**
```typescript
const TodoList = lazy(() => import('./components/TodoList'))
```

**API Request Optimization:**
- Debounce search inputs
- Paginate large lists
- Cache API responses
- Use React Query for advanced caching

---

## Common Issues & Solutions

### Issue 1: Network Error / Cannot Connect

**Symptoms:**
- Frontend shows "Network Error"
- API calls fail

**Solutions:**
1. Verify backend running: `curl http://localhost:8000/health`
2. Check port conflicts: `lsof -i :8000`
3. Verify Vite proxy config
4. Check CORS settings

### Issue 2: CORS Errors

**Symptoms:**
- Browser console: "CORS policy blocked"
- Preflight requests fail

**Solutions:**
1. Use Vite proxy in development
2. Add frontend URL to `CORS_ORIGINS`
3. Check exact URL (port, protocol)
4. Verify `allow_credentials` setting

### Issue 3: Database Not Found

**Symptoms:**
- "no such table: todos"
- 500 errors on API calls

**Solutions:**
1. Run `python init_db.py`
2. Verify database location: `backend/src/todos.db`
3. Check database has tables: `sqlite3 src/todos.db ".tables"`
4. Restart backend after creating database

### Issue 4: Type Mismatches

**Symptoms:**
- TypeScript errors
- Runtime type errors

**Solutions:**
1. Keep Pydantic schemas and TypeScript types in sync
2. Use type assertions carefully
3. Validate API responses
4. Consider code generation

### Issue 5: Port Already in Use

**Symptoms:**
- "Address already in use"
- Server won't start

**Solutions:**
```bash
# Find process
lsof -i :8000

# Kill process
lsof -ti :8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --reload --port 8001
```

---

## Best Practices

### Backend Best Practices

1. **Separation of Concerns**
   - Routes: HTTP handling
   - Services: Business logic
   - Models: Database schema
   - Schemas: API validation

2. **Error Handling**
   - Use HTTPException for API errors
   - Return appropriate status codes
   - Provide helpful error messages

3. **Validation**
   - Validate all inputs with Pydantic
   - Use Field constraints
   - Return 422 for validation errors

4. **Database**
   - Use transactions for multi-step operations
   - Handle database errors gracefully
   - Use connection pooling

### Frontend Best Practices

1. **Component Structure**
   - Small, focused components
   - Props for data flow
   - Custom hooks for logic

2. **Error Handling**
   - User-friendly error messages
   - Retry mechanisms
   - Loading states

3. **Type Safety**
   - Use TypeScript strictly
   - Type API responses
   - Avoid `any` types

4. **Performance**
   - Memoize expensive computations
   - Lazy load components
   - Optimize re-renders

### API Design Best Practices

1. **RESTful Conventions**
   - GET for reads
   - POST for creates
   - PUT for full updates
   - PATCH for partial updates
   - DELETE for deletes

2. **Status Codes**
   - 200: Success
   - 201: Created
   - 204: No Content (delete)
   - 400: Bad Request
   - 404: Not Found
   - 422: Validation Error
   - 500: Server Error

3. **Response Format**
   - Consistent JSON structure
   - Include metadata when needed
   - Error responses with details

---

## Deployment Considerations

### Backend Deployment

**Production Server:**
```bash
# Use production ASGI server
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Environment Variables:**
```bash
DATABASE_URL=postgresql://user:pass@host/db
CORS_ORIGINS=https://yourdomain.com
```

**Database Migration:**
- Use Alembic for migrations
- Don't use `init_db()` in production
- Backup database before migrations

### Frontend Deployment

**Build for Production:**
```bash
cd frontend
npm run build
# Output in dist/
```

**Serve Static Files:**
- Nginx
- Vercel
- Netlify
- AWS S3 + CloudFront

**Environment Variables:**
```bash
VITE_API_URL=https://api.yourdomain.com
```

### Full-Stack Deployment

**Options:**
1. **Separate Deployments**
   - Backend: Railway, Render, Fly.io
   - Frontend: Vercel, Netlify

2. **Monorepo Deployment**
   - Docker containers
   - Kubernetes
   - Docker Compose

3. **Serverless**
   - Backend: AWS Lambda + API Gateway
   - Frontend: Vercel/Netlify

---

## Additional Resources

### FastAPI Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

### React Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

### Integration Resources
- [Axios Documentation](https://axios-http.com/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [REST API Design](https://restfulapi.net/)

---

## Quick Reference

### Start Development
```bash
# Terminal 1
cd backend && source venv/bin/activate && ./run.sh

# Terminal 2
cd frontend && npm run dev
```

### Test API
```bash
curl http://localhost:8000/api/todos/
curl -X POST http://localhost:8000/api/todos/ \
  -H "Content-Type: application/json" \
  -d '{"description": "Test"}'
```

### Check Status
```bash
# Backend
cd backend && ./check-backend.sh

# Database
sqlite3 backend/src/todos.db ".tables"
```

---

**Last Updated**: 2025-12-12  
**Maintained By**: Development Team
