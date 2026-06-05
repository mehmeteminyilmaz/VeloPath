require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);

// ── 1. Güvenlik katmanları (en üstte olmalı) ──────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Production'da gerçek URL'nizi verin (örn. https://velopath.com)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// -- Rate Limiting: JWT userId bazli, yoksa IP ---
const jwt = require('jsonwebtoken');
const { ipKeyGenerator } = require('express-rate-limit');
const JWT_SECRET = process.env.JWT_SECRET || 'velopath_super_secret_key_2026';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: (req) => {
    try {
      const auth = req.headers.authorization;
      if (auth && auth.startsWith('Bearer ')) {
        const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        if (decoded.userId) return 'user_' + decoded.userId;
      }
    } catch (_) {}
    return ipKeyGenerator(req);
  },
  message: { error: 'Cok fazla istek gonderdiniz. Lutfen daha sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => false,
});
app.use('/api', limiter);

// ── 2. İstek logger ────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ── 3. Socket.io ────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Socket instance'ını route'lara aktar
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ── 4. API Route'ları ───────────────────────────────────────
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// ── 5. MongoDB Bağlantısı ve Sunucu Başlatma ───────────────
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      server.listen(PORT, () => console.log(`Server running on port ${PORT} with Socket.io`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('No MONGODB_URI provided. Server waiting for configuration...');
}
