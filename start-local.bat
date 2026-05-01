@echo off
echo =======================================================
echo     Starting SpeakSpace Locally (Windows)
echo =======================================================
echo.
echo Please ensure that:
echo 1. You have MongoDB running locally on port 27017
echo    (or change MONGO_URI in backend/.env to your cluster)
echo 2. You have run 'npm install' in both backend and frontend folders.
echo.

echo Starting Backend server...
start "SpeakSpace Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend server...
start "SpeakSpace Frontend" cmd /k "cd frontend && npm run dev"

echo Both services are opening in separate terminal windows!
echo You can close this window now.
pause
