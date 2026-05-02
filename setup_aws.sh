#!/bin/bash

# SpeakSpace AWS Sandbox - One-Click Setup & Deploy
# This script handles everything from cloning to running the containers.

echo "🌟 SpeakSpace AWS Initialization Starting..."

# 1. Setup Swap Space (CRITICAL for AWS Free Tier / 1GB RAM)
echo "🧠 Configuring Swap Space to prevent memory crashes..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap Space (2GB) enabled."
fi

# 2. Update and Install Prerequisites
echo "🛠 Installing dependencies (Docker, Docker Compose, Git)..."
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin git

# 2. Start and Enable Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 3. Clone Repository
# If the current directory isn't a git repo, clone it.
if [ ! -d ".git" ]; then
    read -p "Enter your GitHub Repository URL: " REPO_URL
    git clone "$REPO_URL" temp_repo
    cd temp_repo
fi

# 4. Environment Configuration
if [ ! -f ".env" ]; then
    echo "📝 Configuring your environment..."
    read -p "Enter your GEMINI_API_KEY: " GEMINI_KEY
    read -p "Enter MongoDB URI (Press ENTER to use local Docker database): " MONGO_URI
    
    if [ -z "$MONGO_URI" ]; then
        MONGO_URI="mongodb://mongodb:27017/speakspace"
    fi

    read -p "Enter JWT_SECRET (Press ENTER for random): " JWT_SEC
    if [ -z "$JWT_SEC" ]; then
        JWT_SEC=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
    fi
    
    cat <<EOF > .env
PORT=4000
MONGO_URI=$MONGO_URI
JWT_SECRET=$JWT_SEC
GEMINI_API_KEY=$GEMINI_KEY
NODE_ENV=production
EOF

    # Also create frontend .env
    cat <<EOF > frontend/.env
VITE_API_URL=/api
EOF
fi

# 5. Build and Launch
echo "🚀 Launching SpeakSpace via Docker Compose..."
if command -v docker-compose &> /dev/null; then
    sudo docker-compose up --build -d
else
    sudo docker compose up --build -d
fi

echo "✅ SETUP COMPLETE!"
echo "------------------------------------------------"
echo "Your app is now running in the background."
echo "Access it via your EC2 Public IP on Port 80."
echo "To see logs: sudo docker-compose logs -f"
echo "To stop: sudo docker-compose down"
echo "------------------------------------------------"
