# TODO List Frontend

React + TypeScript frontend for the TODO list application.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
```

### 2. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:5173

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   └── ErrorMessage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── todo.ts
│   ├── hooks/
│   │   └── useTodos.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
└── public/
    └── index.html
```

## Components

- **TodoForm**: Form for creating new TODO items with validation
- **TodoList**: Displays all TODO items, separated into pending and completed sections
- **TodoItem**: Individual TODO item with edit, delete, and toggle complete functionality
- **ErrorMessage**: Displays user-friendly error messages

## Hooks

- **useTodos**: Custom React hook managing TODO state and API operations

## Configuration

The API base URL is configured via the `VITE_API_URL` environment variable in `src/services/api.ts`.

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

**For local development:**
```bash
VITE_API_URL=/api
```
This uses Vite's proxy (configured in `vite.config.ts`) which forwards requests to `http://localhost:8173`.

**For production:**
```bash
VITE_API_URL=https://todolist-scaffold.onrender.com/api
```

**Default (if not set):** The app defaults to `https://todolist-scaffold.onrender.com/api` (production URL).

### Troubleshooting Network Errors

If you see "Network Error" or "Cannot connect to backend server":

**Local Development:**
1. **Check backend is running**: 
   ```bash
   curl http://localhost:8173/health
   ```
   Should return: `{"status":"healthy"}`

2. **Verify backend is on correct port**: Backend should be on port 8173

3. **Check CORS configuration**: Backend allows `http://localhost:5173` in CORS settings

4. **Try direct API call**: Open http://localhost:8173/docs in browser to verify backend is accessible

**Production:**
1. **Check Render.com backend**: Visit https://todolist-scaffold.onrender.com/health
2. **Verify CORS**: Ensure your frontend domain is allowed in backend CORS settings
3. **Check network tab**: Verify API requests are going to the correct URL
