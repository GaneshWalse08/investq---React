#!/bin/bash
# Start both backend and frontend

echo "Starting InvestIQ..."

# Backend
cd backend
pip install -r requirements.txt -q
python app.py &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID) on http://localhost:5000"

# Frontend
cd ../frontend
npm install -q
npm start &
FRONTEND_PID=$!
echo "Frontend started (PID $FRONTEND_PID) on http://localhost:3000"

echo ""
echo "InvestIQ running at http://localhost:3000"
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM
wait
