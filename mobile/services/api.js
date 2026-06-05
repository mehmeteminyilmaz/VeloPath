import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Backend URL'sini dinamik olarak belirler.
 *
 * Öncelik sırası:
 *  1. Expo Metro debugger host'u (geliştirme: fiziksel cihaz + Expo Go)
 *  2. __DEV__ ortamında localhost (Android emülatör için)
 *  3. Production fallback: localhost
 *
 * ÖNEMLİ: Farklı bir ağa geçerseniz Expo'yu yeniden başlatmanız yeterlidir,
 * fallback IP artık hardcode değildir.
 */
const getBackendURL = () => {
  // 1. Expo Go / Expo Dev Client: Gerçek cihaz veya emülatörde Metro host'u kullan
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5000/api`;
  }

  // 2. Development ortamı fakat hostUri yoksa (örn. bare workflow)
  if (__DEV__) {
    // Android emülatörü için 10.0.2.2, diğerleri için localhost
    return 'http://localhost:5000/api';
  }

  // 3. Production build — gerçek sunucu URL'sini buraya yazın
  // Örnek: return 'https://api.velopath.com/api';
  return 'http://localhost:5000/api';
};

export const API_BASE = getBackendURL();
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Her istekte AsyncStorage'dan token al ve Authorization header'ına ekle
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// ---------- AUTH ----------
export const loginUser = async (username, password) => {
  const res = await api.post('/users/login', { username, password });
  return res.data;
};

export const registerUser = async (username, password) => {
  const res = await api.post('/users/register', { username, password });
  return res.data;
};

export const updateUsername = async (userId, newUsername) => {
  const res = await api.patch(`/users/${userId}`, { username: newUsername });
  return res.data;
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  const res = await api.patch(`/users/password/${userId}`, { currentPassword, newPassword });
  return res.data;
};

// ---------- PROJECTS ----------
// Web ile aynı normalizasyon: backend status/weekIndex → completed/week
export const fetchAllData = async (userId) => {
  if (!userId) return null;
  try {
    const res = await api.get(`/projects/user/${userId}`);
    const normalizedData = res.data.map(project => ({
      ...project,
      id: project._id,
      tasks: (project.tasks || []).map(t => ({
        ...t,
        id: t._id,
        text: t.title,
        completed: t.status === 'done',
        week: t.weekIndex || 1,
        dueDate: t.dueDate || null,
      })),
    }));
    
    // Verileri başarıyla çektik, yerel belleğe yedekle (Offline destek)
    await AsyncStorage.setItem(`offline_projects_${userId}`, JSON.stringify(normalizedData));
    return normalizedData;
  } catch (error) {
    console.error("Veri çekme hatası (API):", error);
    // Backend'e ulaşılamazsa çevrimdışı veriyi getir
    try {
      const cached = await AsyncStorage.getItem(`offline_projects_${userId}`);
      if (cached) {
        console.log("Çevrimdışı veriler kullanılıyor.");
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error("Çevrimdışı veri okuma hatası:", e);
    }
    throw error; // Eğer offline veri de yoksa hatayı fırlat (ör: oturum kapatmak için)
  }
};

export const fetchProjectDetails = async (projectId) => {
  const res = await api.get(`/projects/${projectId}`);
  const project = res.data;
  return {
    ...project,
    id: project._id,
    tasks: (project.tasks || []).map(t => ({
      ...t,
      id: t._id,
      text: t.title,
      completed: t.status === 'done',
      week: t.weekIndex || 1,
    })),
  };
};

export const createProject = async (projectData) => {
  const res = await api.post('/projects', projectData);
  return { ...res.data, id: res.data._id, tasks: [] };
};

export const updateProjectAPI = async (projectId, updateData) => {
  const res = await api.put(`/projects/${projectId}`, updateData);
  return res.data;
};

export const shareProjectAPI = async (projectId, username) => {
  const res = await api.post(`/projects/${projectId}/share`, { username });
  return res.data;
};

export const deleteProjectAPI = async (projectId) => {
  await api.delete(`/projects/${projectId}`);
};

// ---------- TASKS ----------
// projectId: string, taskData: { title, ...diğer alanlar }
export const createTask = async (projectId, taskData) => {
  const res = await api.post('/tasks', {
    ...taskData,
    projectId,   // Task schema projectId bekliyor
  });
  return { ...res.data, id: res.data._id };
};

export const toggleTaskAPI = async (taskId) => {
  const res = await api.put(`/tasks/${taskId}/toggle`);
  return res.data;
};

export const updateTaskAPI = async (taskId, updateData) => {
  const res = await api.put(`/tasks/${taskId}`, updateData);
  return { ...res.data, id: res.data._id };
};

export const deleteTaskAPI = async (taskId) => {
  await api.delete(`/tasks/${taskId}`);
};

// ---------- AI ----------
export const getAISuggestions = async (projectId) => {
  const res = await api.post(`/ai/suggest/${projectId}`);
  return res.data;
};

export const breakTaskByAI = async (taskTitle) => {
  const res = await api.post(`/ai/subtasks`, { taskTitle });
  return res.data;
};

export const summarizeNotesByAI = async (text) => {
  const res = await api.post(`/ai/summarize`, { text });
  return res.data;
};

export const getAIStatsAnalysis = async (statsData) => {
  const res = await api.post(`/ai/analyze-stats`, statsData);
  return res.data;
};
