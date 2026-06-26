import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import api from '../api/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializa o estado de autenticação a partir do localStorage no carregamento da página
  useEffect(() => {
    const storedToken = localStorage.getItem('educonnect_token');
    const storedUser = localStorage.getItem('educonnect_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Efetua login e persiste os dados da sessão, incluindo o refresh token.
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        const { token: jwtToken, refreshToken, user: userData } = response.data;
        
        localStorage.setItem('educonnect_token', jwtToken);
        localStorage.setItem('educonnect_refresh_token', refreshToken);
        localStorage.setItem('educonnect_user', JSON.stringify(userData));
        
        setToken(jwtToken);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Erro ao efetuar login.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove a sessão do usuário e limpa o localStorage, invalidando o token no backend.
   */
  const logout = async () => {
    const refreshToken = localStorage.getItem('educonnect_refresh_token');
    if (refreshToken) {
      try {
        // Envia requisição de logout assíncrona ao backend
        await api.post('/auth/logout', { refreshToken });
      } catch (err) {
        console.error('Erro ao revogar refresh token durante o logout:', err.message);
      }
    }

    localStorage.removeItem('educonnect_token');
    localStorage.removeItem('educonnect_refresh_token');
    localStorage.removeItem('educonnect_user');
    setToken(null);
    setUser(null);
  };

  /**
   * Registra um novo usuário.
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Erro ao efetuar registro.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retorna se o usuário está logado.
   */
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
        isAuthenticated,
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
