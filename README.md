# SpeakSpace – Real-Time GD & Interview Skill Builder

SpeakSpace is a scalable, real-time platform where users can practice group discussions (GD) and interview communication skills using voice-based interaction, AI moderation, and performance analytics.

## 🚀 Architecture

The application is built using the MERN stack with WebSockets and WebRTC:
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Real-Time:** Socket.io + WebRTC
- **Database:** MongoDB (Mongoose)
- **AI Processing:** OpenAI API (GPT for analysis)

## 📁 Repository Structure

- `/` - Backend Node.js codebase
- `/frontend` - React Frontend application
- `/sample_data` - Mock user test data

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or MongoDB Atlas connection string
- OpenAI API Key

### Backend Setup

1. Open the root folder (`Project AWt`) in your terminal.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root based on `.env.example`:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/speakspace
   JWT_SECRET=your_jwt_secret_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🧩 Key Features Implemented

- **Backend:** JWT Authentication, MongoDB Schemas (User, Room, Session, Message, Analytics), and complete API routes.
- **WebSockets:** Room management, real-time chat, AI feedback relay, and WebRTC signaling.
- **AI Moderator:** OpenAI integration for topic generation and speech feedback (in `src/services/aiService.js`).
- **Frontend UI:** Modern responsive dashboard, room creation/joining interface, and a placeholder active voice room UI built with Tailwind CSS.

## 📝 License
MIT
