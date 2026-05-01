# SpeakSpace - Real-Time GD & Interview Skill Builder

SpeakSpace is a production-grade MERN stack application designed to help users practice and enhance their communication skills through real-time group discussions (GD) and AI-driven feedback.

## 🚀 Features

- **Real-Time Audio Rooms:** Low-latency peer-to-peer audio communication using WebRTC.
- **AI Moderation:** Mock AI service for sentiment analysis, fluency scoring, and topic generation.
- **Turn-Based System:** Structured speaking turns with "Raise Hand" and queue management.
- **Premium UI/UX:** Custom-designed dark-mode interface with glassmorphism and micro-interactions.
- **Performance Analytics:** Track speaking time, confidence scores, and improvement trends.
- **Role-Based Access:** Support for Students, Moderators, and Admins.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Zustand, Framer Motion, Socket.io-client.
- **Backend:** Node.js, Express.js, Socket.io, Mongoose (MongoDB).
- **Security:** JWT Authentication, Helmet, Rate Limiting, Bcrypt hashing.
- **DevOps:** Docker, Docker Compose, Nginx.

## 📦 Setup & Installation

### Prerequisites
- Docker & Docker Compose installed on your machine.

### Running the Application
1. Clone the repository.
2. Navigate to the root directory.
3. Run the following command:
   ```bash
   docker-compose up --build
   ```
4. Access the application at `http://localhost`.

### Environment Variables
The application comes with default `.env` configurations for local development. For production, update `backend/.env` with your secure credentials.

## 📂 Project Structure

- `frontend/`: React application with Vite.
- `backend/`: Node.js Express server and Socket.io handlers.
- `nginx/`: Nginx configuration for serving the frontend and proxying requests.

## 📄 License
This project is built based on the SpeakSpace SRS for demonstration purposes.
