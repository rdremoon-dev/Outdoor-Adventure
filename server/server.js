const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const httpServer = http.createServer(app);
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: false,
  },
});
app.set('io', io);

// Only authenticated administrators may join the live booking notification room.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin')
      return next(new Error('Admin access required'));
    socket.data.admin = { email: payload.email };
    next();
  } catch {
    next(new Error('Invalid or expired admin session'));
  }
});
io.on('connection', socket => {
  socket.join('admins');
  socket.emit('notifications:ready', { connected: true });
});

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS'));
    },
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(
  '/api/bookings',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  }),
);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/tips', require('./routes/tipRoutes'));
app.use(
  '/api/payments',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use((err, req, res, next) => {
  console.error(err.message);
  if (res.headersSent) return next(err);
  res
    .status(err.status || 500)
    .json({
      message: err.status
        ? err.message
        : 'Server error. Please try again later.',
    });
});
const port = process.env.PORT || 5000;
async function start() {
  if (!process.env.MONGODB_URI)
    throw new Error('MONGODB_URI is missing. Configure server/.env.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw new Error('JWT_SECRET must be at least 32 characters.');
  await mongoose.connect(process.env.MONGODB_URI);
  httpServer.listen(port, () =>
    console.log(`Outdoor Adventure API listening on port ${port}`),
  );
}
start().catch(err => {
  console.error(err.message);
  process.exit(1);
});
