import axios from 'axios';

export const API_BASE = 'http://192.168.1.165:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
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
export const fetchAllData = async (userId) => {
  if (!userId) return null;
  const res = await api.get(`/projects/user/${userId}`);
  return res.data;
};

export const fetchProjectDetails = async (projectId) => {
  const res = await api.get(`/projects/${projectId}`);
  return res.data;
};

export const createProject = async (projectData) => {
  const res = await api.post('/projects', projectData);
  return res.data;
};

export const deleteProjectAPI = async (projectId) => {
  await api.delete(`/projects/${projectId}`);
};

// ---------- TASKS ----------
export const createTask = async (projectId, taskData) => {
  // Backend beklenen format: { title, project }
  const res = await api.post('/tasks', { ...taskData, project: projectId });
  return res.data;
};

export const toggleTaskAPI = async (taskId) => {
  // Backend'deki toggle endpoint'ine göre (Genelde PUT /tasks/:id/toggle)
  // Eğer yoksa mevcut status'u tersine çevirerek update etmeliyiz.
  // Varsayılan olarak status güncellemesi:
  const res = await api.put(`/tasks/${taskId}/toggle`);
  return res.data;
};

export const deleteTaskAPI = async (taskId) => {
  await api.delete(`/tasks/${taskId}`);
};
