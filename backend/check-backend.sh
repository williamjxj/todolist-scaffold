#!/bin/bash
# Quick script to check if backend is running

echo "Checking backend server status..."
echo ""

# Check if port 8173 is in use
if lsof -Pi :8173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Port 8173 is in use (backend might be running)"
    echo ""
    echo "Testing health endpoint..."
    if curl -s http://localhost:8173/health > /dev/null 2>&1; then
        echo "✅ Backend is responding!"
        curl -s http://localhost:8173/health | python3 -m json.tool
    else
        echo "❌ Port 8173 is in use but backend is not responding"
        echo "   Something else might be using port 8173"
    fi
else
    echo "❌ Backend is NOT running on port 8173"
    echo ""
    echo "To start the backend:"
    echo "  1. cd backend"
    echo "  2. source venv/bin/activate  (if using venv)"
    echo "  3. ./run.sh"
    echo ""
    echo "Or manually:"
    echo "  cd backend/src"
    echo "  uvicorn app.main:app --reload --port 8173"
fi
