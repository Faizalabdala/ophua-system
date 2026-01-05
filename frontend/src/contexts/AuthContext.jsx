// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Chave específica por sessão para evitar conflito
  const getStorageKey = (key) => {
    return `ophua_${key}`;
  };

  useEffect(() => {
    const token = localStorage.getItem(getStorageKey('token'));
    const storedUser = localStorage.getItem(getStorageKey('user'));
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.defaults.headers.Authorization = `Bearer ${token}`;
        
        // Verificar se o token ainda é válido
        const tokenExpiry = localStorage.getItem(getStorageKey('token_expiry'));
        if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
          // Token expirado, fazer logout
          logout();
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        clearStoredAuth();
      }
    }
    setLoading(false);
  }, []);

  const clearStoredAuth = () => {
    localStorage.removeItem(getStorageKey('token'));
    localStorage.removeItem(getStorageKey('user'));
    localStorage.removeItem(getStorageKey('token_expiry'));
    localStorage.removeItem(getStorageKey('user_role'));
    delete api.defaults.headers.Authorization;
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Calcular expiração (24 horas)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      
      // Armazenar com chaves específicas
      localStorage.setItem(getStorageKey('token'), token);
      localStorage.setItem(getStorageKey('user'), JSON.stringify(user));
      localStorage.setItem(getStorageKey('token_expiry'), expiryDate.toISOString());
      localStorage.setItem(getStorageKey('user_role'), user.role);
      
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(user);
      
      // Redirecionar baseado no papel do usuário
      redirectBasedOnRole(user.role);
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Credenciais inválidas');
    }
  };

  const redirectBasedOnRole = (role) => {
    switch(role) {
      case 'ADMIN':
        navigate('/dashboard');
        break;
      case 'RESELLER':
        navigate('/reseller/dashboard');
        break;
      case 'PRODUCER':
        navigate('/producer/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const logout = (redirectToLogin = true) => {
    clearStoredAuth();
    setUser(null);
    if (redirectToLogin) {
      window.location.href = '/login';
    }
  };

  const getCurrentRole = () => {
    return user?.role || localStorage.getItem(getStorageKey('user_role'));
  };

  // Função para verificar permissões
  const hasPermission = (requiredRole) => {
    const userRole = getCurrentRole();
    if (!userRole) return false;

    // Hierarquia de permissões
    const roleHierarchy = {
      'ADMIN': ['ADMIN', 'PRODUCER', 'RESELLER'],
      'PRODUCER': ['PRODUCER'],
      'RESELLER': ['RESELLER']
    };

    return roleHierarchy[userRole]?.includes(requiredRole) || false;
  };

  // Função para verificar se é um papel específico
  const isRole = (role) => {
    return getCurrentRole() === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      hasPermission,
      isRole,
      getCurrentRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};