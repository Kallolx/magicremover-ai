@echo off
color 0A
cls
echo ================================================
echo   MagicRemover AI - Complete Startup
echo ================================================
echo.
echo Starting Backend and Tunnel...
echo.
echo ================================================
echo.

REM Start backend in new window
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait for backend to start
timeout /t 5 /nobreak

REM Start cloudflared tunnel in new window
echo [2/2] Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:8000"

echo.
echo ================================================
echo   IMPORTANT - READ THIS!
echo ================================================
echo.
echo 1. Look at the "Cloudflare Tunnel" window
echo 2. Find the line with: https://XXXXX.trycloudflare.com
echo 3. Copy that URL
echo.
echo 4. Go to Vercel:
echo    https://vercel.com/settings/environment-variables
echo.
echo 5. Update VITE_BACKEND_URL with your new URL
echo.
echo 6. Redeploy your Vercel app
echo.
echo ================================================
echo.
echo Keep both windows open while using the app!
echo.
pause
