#!/bin/bash
# Script to restart both frontend and backend services
# Usage: ./restart-services.sh

echo "🛑 Stopping services..."

# Stop backend (port 8000)
if lsof -ti :8000 > /dev/null 2>&1; then
    echo "Stopping backend on port 8000..."
    lsof -ti :8000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Stop frontend (port 5173)
if lsof -ti :5173 > /dev/null 2>&1; then
    echo "Stopping frontend on port 5173..."
    lsof -ti :5173 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ Services stopped"
echo ""
echo "🚀 Starting services..."
echo ""

# Start backend
echo "Starting backend..."
cd "$(dirname "$0")/backend"
if [ -d "venv" ]; then
    source venv/bin/activate 2>/dev/null || true
fi
./run.sh &
BACKEND_PID=$!
cd - > /dev/null

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "Starting frontend..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!
cd - > /dev/null

echo ""
echo "✅ Services started!"
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop services, press Ctrl+C or run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"

# Wait for user interrupt
wait
