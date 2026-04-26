import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Projeleri ve ilgili görevleri getirip frontend'in beklediği formata (projects[].tasks[]) çevirir
export const fetchAllData = async () => {
  try {
    const projectsRes = await axios.get(`${API_URL}/projects`);
    const projects = projectsRes.data;

    // Her proje için görevleri getir (Gerçek bir uygulamada backend'de populate/aggregate ile tek seferde yapmak daha verimlidir)
    const projectsWithTasks = await Promise.all(projects.map(async (project) => {
      const tasksRes = await axios.get(`${API_URL}/tasks/project/${project._id}`);
      // Frontend şu an görevlerde `id` (sayı) kullanıyor, MongoDB `_id` kullanıyor.
      // Uyum için mapping yapabiliriz veya şimdilik doğrudan atayabiliriz.
      return {
        ...project,
        id: project._id, // Frontend uyumluluğu için
        tasks: tasksRes.data.map(t => ({ ...t, id: t._id }))
      };
    }));

    return projectsWithTasks;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

// Proje API'leri
export const createProject = async (projectData) => {
  const res = await axios.post(`${API_URL}/projects`, projectData);
  return { ...res.data, id: res.data._id, tasks: [] };
};

export const updateProject = async (projectId, updateData) => {
  const res = await axios.put(`${API_URL}/projects/${projectId}`, updateData);
  return res.data;
};

export const deleteProjectAPI = async (projectId) => {
  await axios.delete(`${API_URL}/projects/${projectId}`);
};

// Görev API'leri
export const createTask = async (taskData) => {
  const res = await axios.post(`${API_URL}/tasks`, taskData);
  return { ...res.data, id: res.data._id };
};

export const updateTaskAPI = async (taskId, updateData) => {
  const res = await axios.put(`${API_URL}/tasks/${taskId}`, updateData);
  return { ...res.data, id: res.data._id };
};

export const deleteTaskAPI = async (taskId) => {
  await axios.delete(`${API_URL}/tasks/${taskId}`);
};

// Kullanıcı API'leri
export const loginUser = async (username) => {
  const res = await axios.post(`${API_URL}/users/login`, { username });
  return res.data;
};
