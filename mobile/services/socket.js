import { io } from 'socket.io-client';
import { API_BASE } from './api';

// Socket URL: API_BASE'den port kısmını al
const SOCKET_URL = API_BASE.replace('/api', '');

let socket = null;

export const connectSocket = (userId, onDataUpdated) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'], // React Native için zorunlu
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    console.log('[Socket] Bağlandı:', socket.id);
    // Kullanıcı odasına katıl (backend'deki join_user_room eventi)
    socket.emit('join_user_room', userId);
  });

  socket.on('data_updated', () => {
    console.log('[Socket] Veri güncellendi — yenileniyor...');
    if (onDataUpdated) onDataUpdated();
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Bağlantı kesildi');
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Bağlantı hatası:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
