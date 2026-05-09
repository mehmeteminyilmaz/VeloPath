import axios from 'axios';

import Constants from 'expo-constants';

const getBackendIP = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  return 'http://10.197.185.133:5000/api';
};

export const API_BASE = getBackendIP();
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

// ---------- PROJECTS ----------
// Web ile aynı normalizasyon: backend status/weekIndex → completed/week
export const fetchAllData = async (userId) => {
  if (!userId) return null;
  const res = await api.get(`/projects/user/${userId}`);
  return res.data.map(project => ({
    ...project,
    id: project._id,
    tasks: (project.tasks || []).map(t => ({
      ...t,
      id: t._id,
      text: t.title,
      completed: t.status === 'done',
      week: t.weekIndex || 1,
    })),
  }));
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
