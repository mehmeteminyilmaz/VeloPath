import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Axios instance with auto refresh ──────────────────────────────────────
const axiosAuth = axios.create({ baseURL: API_URL });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

// Request interceptor: her istege Authorization header ekle
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem('velopath_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

// Response interceptor: 401 gelirse token yenile
axiosAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('velopath_refresh_token');
      if (!refreshToken) {
        // Refresh token yok — logout
        localStorage.clear();
        window.location.reload();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axiosAuth(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(API_URL + '/users/refresh', { refreshToken });
        const { token, refreshToken: newRefreshToken } = res.data;
        localStorage.setItem('velopath_token', token);
        localStorage.setItem('velopath_refresh_token', newRefreshToken);
        processQueue(null, token);
        originalRequest.headers.Authorization = 'Bearer ' + token;
        return axiosAuth(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.reload();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth header helper (legacy, bazi yerlerde hala kullaniliyor) ──────────
const getAuthHeader = () => {
  const token = localStorage.getItem('velopath_token');
  return token ? { headers: { Authorization: 'Bearer ' + token } } : {};
};

// ── Kullaniciya ozel projeleri ve gorevleri getir ─────────────────────────
export const fetchAllData = async (userId) => {
  if (!userId) return null;
  try {
    const projectsRes = await axiosAuth.get('/projects/user/' + userId);
    const projectsWithTasks = projectsRes.data.map(project => ({
      ...project,
      id: project._id,
      tasks: project.tasks.map(t => ({
        ...t,
        id: t._id,
        text: t.title,
        completed: t.status === 'done',
        week: t.weekIndex || 1,
        dueDate: t.dueDate || null,
      }))
    }));
    localStorage.setItem('velopath_offline_data_' + userId, JSON.stringify(projectsWithTasks));
    return projectsWithTasks;
  } catch (error) {
    console.error('Error fetching data, trying offline cache:', error);
    const cached = localStorage.getItem('velopath_offline_data_' + userId);
    if (cached) {
      console.log('Cevrimdisi veri kullaniliyor.');
      return JSON.parse(cached);
    }
    return null;
  }
};

// ── Proje API'leri ────────────────────────────────────────────────────────
export const createProject = async (projectData) => {
  const res = await axiosAuth.post('/projects', projectData);
  return { ...res.data, id: res.data._id, tasks: [] };
};

export const updateProject = async (projectId, updateData) => {
  const res = await axiosAuth.put('/projects/' + projectId, updateData);
  return res.data;
};

export const deleteProjectAPI = async (projectId) => {
  await axiosAuth.delete('/projects/' + projectId);
};

export const shareProjectAPI = async (projectId, username) => {
  const res = await axiosAuth.post('/projects/' + projectId + '/share', { username });
  return res.data;
};

// ── Gorev API'leri ────────────────────────────────────────────────────────
export const createTask = async (taskData) => {
  const res = await axiosAuth.post('/tasks', taskData);
  return { ...res.data, id: res.data._id };
};

export const updateTaskAPI = async (taskId, updateData) => {
  const res = await axiosAuth.put('/tasks/' + taskId, updateData);
  return { ...res.data, id: res.data._id };
};

export const toggleTaskAPI = async (taskId) => {
  const res = await axiosAuth.put('/tasks/' + taskId + '/toggle', {});
  return { ...res.data, id: res.data._id };
};

export const resetRecurringTaskAPI = async (taskId) => {
  const res = await axiosAuth.put('/tasks/' + taskId + '/reset-recurring', {});
  return { ...res.data, id: res.data._id };
};

export const deleteTaskAPI = async (taskId) => {
  await axiosAuth.delete('/tasks/' + taskId);
};

export const addCommentAPI = async (taskId, text) => {
  const res = await axiosAuth.post('/tasks/' + taskId + '/comments', { text });
  return res.data;
};

export const deleteCommentAPI = async (taskId, commentId) => {
  await axiosAuth.delete('/tasks/' + taskId + '/comments/' + commentId);
};

// ── Yapay Zeka API'leri ───────────────────────────────────────────────────
export const getAISuggestions = async (projectId) => {
  const res = await axiosAuth.post('/ai/suggest/' + projectId, {});
  return res.data;
};

export const breakTaskByAI = async (taskTitle) => {
  const res = await axiosAuth.post('/ai/subtasks', { taskTitle });
  return res.data;
};

export const summarizeNotesByAI = async (text) => {
  const res = await axiosAuth.post('/ai/summarize', { text });
  return res.data;
};

export const analyzeStatsByAI = async (statsData) => {
  const res = await axiosAuth.post('/ai/analyze-stats', statsData);
  return res.data;
};

export const getWeeklyPlanByAI = async (tasks) => {
  const res = await axiosAuth.post('/ai/weekly-plan', { tasks });
  return res.data;
};

export const prioritizeTasksByAI = async (projectId) => {
  const res = await axiosAuth.post('/ai/prioritize/' + projectId, {});
  return res.data;
};

// ── Kullanici API'leri ────────────────────────────────────────────────────
export const loginUser = async (username, password) => {
  const res = await axios.post(API_URL + '/users/login', { username, password });
  return res.data;
};

export const registerUser = async (username, password, email) => {
  const body = { username, password };
  if (email) body.email = email;
  const res = await axios.post(API_URL + '/users/register', body);
  return res.data;
};

export const logoutUser = async () => {
  try { await axiosAuth.post('/users/logout'); } catch (_) {}
};

export const updateUsername = async (userId, newUsername) => {
  const res = await axiosAuth.patch('/users/' + userId, { username: newUsername });
  return res.data;
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  const res = await axiosAuth.patch('/users/password/' + userId, { currentPassword, newPassword });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axios.post(API_URL + '/users/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await axios.post(API_URL + '/users/reset-password', { token, newPassword });
  return res.data;
};
