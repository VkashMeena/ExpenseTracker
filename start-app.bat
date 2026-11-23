@echo off
setlocal
echo ===================================================
echo   Room Maintenance & Kharcha Tracker
echo   Vikash Meena ^| Devendra Singh ^| Kamlesh Meena
echo ===================================================
echo.

:: Check if port 5000 is already active
netstat -ano | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] App server pehle se chal raha hai!
    echo Opening browser at http://localhost:5000 ...
    start http://localhost:5000
    echo App open ho gaya hai. Enjoy!
    pause
    exit /b
)

echo Starting Server on http://localhost:5000 ...
start "" http://localhost:5000

cd /d "%~dp0backend"
node dist/index.js
pause
