#!/bin/bash

# SpeakSpace AWS Deployment / Recovery Script
# This script ensures the frontend is built and the backend is running via PM2.

echo "🚀 Starting SpeakSpace Deployment..."

# 1. Update code (optional, assumes you've already pulled)
# git pull origin main

# 2. Setup Environment
# Ensure you have your .env files configured!

# 5. Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "🐳 Docker could not be found, installing..."
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# 6. Run Deployment with Docker Compose
echo "🔄 Rebuilding and restarting containers..."
# This will build the images if they don't exist and restart the services
docker-compose down
docker-compose up --build -d

echo "✅ Containerized Deployment Complete!"
echo "Check status with: docker-compose ps"
echo "Check logs with: docker-compose logs -f"

