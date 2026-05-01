@echo off
echo =======================================================
echo     Starting SpeakSpace with Docker
echo =======================================================
echo.
echo This will build and start the Backend, Frontend, and MongoDB 
echo containers based on the docker-compose.yml file.
echo.

docker-compose up --build

pause
