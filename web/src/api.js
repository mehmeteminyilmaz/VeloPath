import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Her istekte JWT token'ı gönder
const getAuthHeader = () => {
  const token = localStorage.getItem('velopath_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Kullanıcıya özel projeleri ve görevleri tek seferde (optimize) getir
export const fetchAllData = async (userId) => {
  if (!userId) return null;
  try {
    const projectsRes = await axios.get(`${API_URL}/projects/user/${userId}`, getAuthHeader());
    const projectsWithTasks = projectsRes.data.map(project => ({
      ...project,
      id: project._id,
      tasks: project.tasks.map(t => ({
        ...t,
        id: t._id,
        text: t.title,
        completed: t.status === 'done',
        week: t.weekIndex || 1,
      }))
    }));
    return projectsWithTasks;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

// Proje API'leri
export const createProject = async (projectData) => {
  const res = await axios.post(`${API_URL}/projects`, projectData, getAuthHeader());
  return { ...res.data, id: res.data._id, tasks: [] };
};

export const updateProject = async (projectId, updateData) => {
  const res = await axios.put(`${API_URL}/projects/${projectId}`, updateData, getAuthHeader());
  return res.data;
};

export const deleteProjectAPI = async (projectId) => {
  await axios.delete(`${API_URL}/projects/${projectId}`, getAuthHeader());
};

export const shareProjectAPI = async (projectId, username) => {
  const res = await axios.post(`${API_URL}/projects/${projectId}/share`, { username }, getAuthHeader());
  return res.data;
};

// Görev API'leri
export const createTask = async (taskData) => {
  const res = await axios.post(`${API_URL}/tasks`, taskData, getAuthHeader());
  return { ...res.data, id: res.data._id };
};

export const updateTaskAPI = async (taskId, updateData) => {
  const res = await axios.put(`${API_URL}/tasks/${taskId}`, updateData, getAuthHeader());
  return { ...res.data, id: res.data._id };
};

export const deleteTaskAPI = async (taskId) => {
  await axios.delete(`${API_URL}/tasks/${taskId}`, getAuthHeader());
};

// Kullanıcı API'leri
export const loginUser = async (username, password) => {
  const res = await axios.post(`${API_URL}/users/login`, { username, password });
  return res.data;
};

export const registerUser = async (username, password) => {
  const res = await axios.post(`${API_URL}/users/register`, { username, password });
  return res.data;
};

// Kullanıcı adı güncelleme (web'de eksikti)
export const updateUsername = async (userId, newUsername) => {
  const res = await axios.patch(`${API_URL}/users/${userId}`, { username: newUsername }, getAuthHeader());
  return res.data;
};
