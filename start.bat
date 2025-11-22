@echo off
echo ========================================
echo   Employee Salary System Launcher
echo ========================================
echo.
echo Starting servers...
echo.

REM Start Flask Backend
start "Flask Backend Server" cmd /k "cd server && python app.py"

REM Wait 2 seconds for Flask to start
timeout /t 2 /nobreak >nul

REM Start React Frontend
start "React Frontend Server" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Flask Backend:  http://localhost:5000
echo React Frontend: http://localhost:5173
echo.
echo Two new windows have opened.
echo Close this window after both servers start.
echo.
pause
