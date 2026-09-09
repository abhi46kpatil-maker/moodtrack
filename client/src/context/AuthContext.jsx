import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('moodtrack_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState([]);

  // Load demo users for role switcher
  const fetchDemoUsers = async () => {
    try {
      const res = await api.get('/auth/demo-users');
      setDemoUsers(res.users || []);
    } catch (e) {
      console.warn('Could not fetch demo users', e);
    }
  };

  // Verify existing token on mount
  useEffect(() => {
    fetchDemoUsers();
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.user);
          setStudent(res.student);
          setMentor(res.mentor);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email, password, expectedRole = null) => {
    const res = await api.post('/auth/login', { email, password, expectedRole });
    localStorage.setItem('moodtrack_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setStudent(res.student);
    setMentor(res.mentor);
    return res;
  };

  const switchDemoUser = async (userId) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/demo-switch', { userId });
      localStorage.setItem('moodtrack_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setStudent(res.student);
      setMentor(res.mentor);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('moodtrack_token');
    setToken(null);
    setUser(null);
    setStudent(null);
    setMentor(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      student,
      mentor,
      token,
      isLoading,
      demoUsers,
      login,
      logout,
      switchDemoUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
