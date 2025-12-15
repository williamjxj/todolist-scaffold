# How to Restart Frontend and Backend Services

Quick guide for restarting both services.

## Quick Restart (Automated)

### Option 1: Use the Restart Script

```bash
# From project root
./restart-services.sh
```

This script will:
1. Stop any running services on ports 8000 and 5173
2. Start the backend server
3. Start the frontend server
4. Show you the process IDs

**Note**: The script runs services in the background. To stop them:
```bash
# Find and kill processes
lsof -ti :8000 | xargs kill -9
lsof -ti :5173 | xargs kill -9
```

---

## Manual Restart

### Step 1: Stop Running Services

**Stop Backend:**
```bash
# Find process on port 8000
lsof -i :8000

# Kill the process
lsof -ti :8000 | xargs kill -9

# Or find and kill manually
ps aux | grep uvicorn
kill <PID>
```

**Stop Frontend:**
```bash
# Find process on port 5173
lsof -i :5173

# Kill the process
lsof -ti :5173 | xargs kill -9

# Or find and kill manually
ps aux | grep vite
kill <PID>
```

**Stop Both at Once:**
```bash
lsof -ti :8000 :5173 | xargs kill -9 2>/dev/null
```

### Step 2: Start Services

**Start Backend (Terminal 1):**
```bash
cd backend
source venv/bin/activate  # If using venv
./run.sh
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

---

## Verify Services Are Running

### Check Backend
```bash
# Health check
curl http://localhost:8000/health
# Should return: {"status":"healthy"}

# Or use the check script
cd backend
./check-backend.sh
```

### Check Frontend
```bash
# Check if port is in use
lsof -i :5173

# Or open in browser
open http://localhost:5173
```

---

## Common Scenarios

### Scenario 1: Services Won't Start (Port in Use)

**Problem**: Port already in use error

**Solution**:
```bash
# Kill processes on ports
lsof -ti :8000 :5173 | xargs kill -9

# Wait a moment
sleep 2

# Start services again
```

### Scenario 2: Services Running but Not Responding

**Problem**: Services are running but API calls fail

**Solution**:
```bash
# Restart backend
cd backend
lsof -ti :8000 | xargs kill -9
source venv/bin/activate
./run.sh

# Restart frontend
cd frontend
lsof -ti :5173 | xargs kill -9
npm run dev
```

### Scenario 3: Database Issues After Restart

**Problem**: "no such table" errors after restart

**Solution**:
```bash
# Reinitialize database
cd backend
source venv/bin/activate
python init_db.py

# Restart backend
./run.sh
```

### Scenario 4: Need to Restart After Code Changes

**Backend**: 
- FastAPI with `--reload` auto-restarts on code changes
- If not working, manually restart: `./run.sh`

**Frontend**:
- Vite HMR (Hot Module Replacement) updates automatically
- If not working, refresh browser or restart: `npm run dev`

---

## Quick Reference Commands

### Stop All Services
```bash
lsof -ti :8000 :5173 | xargs kill -9 2>/dev/null
```

### Start Backend
```bash
cd backend && source venv/bin/activate && ./run.sh
```

### Start Frontend
```bash
cd frontend && npm run dev
```

### Check Status
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:5173
```

### View Logs
```bash
# Backend logs appear in terminal where you ran ./run.sh
# Frontend logs appear in terminal where you ran npm run dev
```

---

## Troubleshooting

### "Port already in use" Error

```bash
# Find what's using the port
lsof -i :8000
lsof -i :5173

# Kill specific process
kill <PID>

# Or kill all on port
lsof -ti :8000 | xargs kill -9
```

### Services Start but Don't Work

1. **Check virtual environment** (backend):
   ```bash
   cd backend
   source venv/bin/activate
   which python  # Should show venv/bin/python
   ```

2. **Check dependencies**:
   ```bash
   # Backend
   cd backend && pip list | grep fastapi
   
   # Frontend
   cd frontend && npm list | grep react
   ```

3. **Check database**:
   ```bash
   cd backend
   ls src/todos.db  # Should exist
   sqlite3 src/todos.db ".tables"  # Should show 'todos'
   ```

### Services Keep Crashing

1. **Check logs** in terminal output
2. **Verify Python/Node versions**:
   ```bash
   python --version  # Should be 3.11+
   node --version    # Should be 18+
   ```
3. **Reinstall dependencies**:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

---

## Tips

1. **Use separate terminals** for backend and frontend to see logs clearly
2. **Keep API docs open** (http://localhost:8000/docs) to test backend
3. **Use browser DevTools** Network tab to debug API calls
4. **Check both terminals** for error messages
5. **Use the restart script** for quick restarts during development

---

**Last Updated**: 2025-12-12
