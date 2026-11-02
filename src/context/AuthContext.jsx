import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agrovercity_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agrovercity_access_token'));
  const [adminRole, setAdminRole] = useState(() => localStorage.getItem('agrovercity_admin_role') || 'superadmin');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!token);

  useEffect(() => {
    setInitializing(false);
  }, []);

  useEffect(() => {
    if (user?.adminRole) {
      setAdminRole(user.adminRole);
      localStorage.setItem('agrovercity_admin_role', user.adminRole);
    }
  }, [user]);

  const login = async (phone, mpin) => {
    setLoading(true);
    try {
      const data = await authApi.login(phone, mpin);
      if (data.accessToken) {
        localStorage.setItem('agrovercity_access_token', data.accessToken);
        localStorage.setItem('agrovercity_refresh_token', data.refreshToken || '');
        localStorage.setItem('agrovercity_user', JSON.stringify(data.user));
        localStorage.setItem('agrovercity_admin_role', data.user.adminRole || 'superadmin');
        
        setToken(data.accessToken);
        setUser(data.user);
        setAdminRole(data.user.adminRole || 'superadmin');
        return { success: true, user: data.user };
      }
      return { success: false, error: 'No access token returned' };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Login failed';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('agrovercity_access_token');
    localStorage.removeItem('agrovercity_refresh_token');
    localStorage.removeItem('agrovercity_user');
    localStorage.removeItem('agrovercity_admin_role');
    setToken(null);
    setUser(null);
  };

  const changeRole = (newRole = 'superadmin') => {
    setAdminRole(newRole);
    localStorage.setItem('agrovercity_admin_role', newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        adminRole,
        changeRole,
        isAuthenticated: !!token,
        initializing,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
