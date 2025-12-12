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

### Step 3: Start the Server
```bash
# Easiest way - use the script:
./run.sh

# OR manually:
cd src
uvicorn app.main:app --reload --port 8000
```

## Verify It's Working

Once started, you should see:
```
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

## Next Steps

Once the backend is running:
1. Go back to your frontend (http://localhost:5173)
2. Refresh the page
3. The connection error should disappear!
