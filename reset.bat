@echo off
setlocal

cd /d "%~dp0"

echo ===================================
echo   CentiCopia Database Reset
echo ===================================
echo.
echo WARNING: Existing database data will be deleted.
echo Close any other CentiCopia browser tabs first.
echo.

choice /C YN /M "Reset the database"

if errorlevel 2 exit /b 0

set "VITE_RESET_DATABASE=true"

echo.
echo Starting CentiCopia in database reset mode...
echo Open http://localhost:5173 to reset the database.
echo Press Ctrl+C to stop the server afterward.
echo.

call npm run dev

endlocal
