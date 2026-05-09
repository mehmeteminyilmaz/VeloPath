require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

// ── 1. Güvenlik katmanları (en üstte olmalı) ──────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

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
