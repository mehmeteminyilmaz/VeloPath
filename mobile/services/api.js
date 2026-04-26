import axios from 'axios';

// Geliştirme için: bilgisayarının yerel IP adresini kullan
// Emülatör: Android için 10.0.2.2, iOS için localhost
// Gerçek cihaz: ipconfig ile IP'ni bul (örn: 192.168.1.x)
export const API_BASE = 'http://10.0.2.2:5000/api'; // Android emülatör varsayılanı

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// ---------- AUTH ----------
export const loginUser = async (username, password) => {
  const res = await api.post('/users/login', { username, password });
  return res.data; // { _id, username }
};

export const registerUser = async (username, password) => {
  const res = await api.post('/users/register', { username, password });
  return res.data;
};

// ---------- PROJECTS ----------
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

export const createProject = async (projectData) => {
  const res = await api.post('/projects', projectData);
  return { ...res.data, id: res.data._id, tasks: [] };
};

export const updateProject = async (projectId, updateData) => {
  const res = await api.put(`/projects/${projectId}`, updateData);
  return res.data;
};

export const deleteProjectAPI = async (projectId) => {
  await api.delete(`/projects/${projectId}`);
};

// ---------- TASKS ----------
export const createTask = async (taskData) => {
  const res = await api.post('/tasks', taskData);
  return { ...res.data, id: res.data._id };
};

export const updateTaskAPI = async (taskId, updateData) => {
  const res = await api.put(`/tasks/${taskId}`, updateData);
  return { ...res.data, id: res.data._id };
};

export const deleteTaskAPI = async (taskId) => {
  await api.delete(`/tasks/${taskId}`);
};
