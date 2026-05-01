require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
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

const app = express();
const server = http.createServer(app);

// Security & middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

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

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Initialize WebSocket / Socket.io
initSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`SpeakSpace backend listening on port ${PORT}`);
});
