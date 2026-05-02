require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initSocket } = require('./socket');
const connectDB = require('./config/db');
const passportInit = require('./config/passport');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const analyticsRoutes = require('./routes/analytics');
const scheduleRoutes = require('./routes/schedules');
const adminRoutes = require('./routes/admin');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Security & middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false 
}));
app.use(cors({
  origin: '*', 
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); 
app.use(mongoSanitize()); 

// Serve static frontend files (Production)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Connect DB
connectDB();

// Initialize passport (Google OAuth)
passportInit();
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/admin', adminRoutes);

// For anything else, return index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Initialize WebSocket / Socket.io
initSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`SpeakSpace backend listening on port ${PORT}`);
});
