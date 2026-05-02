@echo off
echo Starting InvestIQ...

:: Backend
start "InvestIQ Backend" cmd /k "cd backend && pip install -r requirements.txt && python app.py"

:: Wait a moment
timeout /t 3 /nobreak > nul

:: Frontend
start "InvestIQ Frontend" cmd /k "cd frontend && npm install && npm start"

echo.
echo InvestIQ launching...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
