import { useState } from 'react';
import * as api from '../api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('velopath_authenticated') === 'true'
  );
  const [username, setUsername] = useState(() =>
    localStorage.getItem('velopath_username') || ''
  );
  const [userId, setUserId] = useState(() =>
    localStorage.getItem('velopath_userid') || ''
  );

  const persistUser = (user) => {
    setUsername(user.username);
    setUserId(user._id);
    setIsAuthenticated(true);
    localStorage.setItem('velopath_username', user.username);
    localStorage.setItem('velopath_userid', user._id);
    localStorage.setItem('velopath_authenticated', 'true');
    if (user.token) localStorage.setItem('velopath_token', user.token);
    if (user.refreshToken) localStorage.setItem('velopath_refresh_token', user.refreshToken);
  };

  const onLogin = async (name, password) => {
    try {
      const user = await api.loginUser(name, password);
      persistUser(user);
      return user;
    } catch (error) {
      const msg = error.response?.data?.error || 'Kullanici adi veya sifre hatali.';
      throw new Error(msg);
    }
  };

  const onRegister = async (name, password) => {
    try {
      const user = await api.registerUser(name, password);
      persistUser(user);
      return user;
    } catch (error) {
      const msg = error.response?.data?.error || 'Kayit sirasinda bir hata olustu.';
      throw new Error(msg);
    }
  };

  const onLogout = async () => {
    try { await api.logoutUser(); } catch (_) {}
    setIsAuthenticated(false);
    setUsername('');
    setUserId('');
    localStorage.removeItem('velopath_authenticated');
    localStorage.removeItem('velopath_userid');
    localStorage.removeItem('velopath_username');
    localStorage.removeItem('velopath_token');
    localStorage.removeItem('velopath_refresh_token');
  };

  return { isAuthenticated, username, setUsername, userId, onLogin, onRegister, onLogout };
}
