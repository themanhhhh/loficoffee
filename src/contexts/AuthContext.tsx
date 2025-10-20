'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, removeToken, setToken, getToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (taiKhoan: string, matKhau: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await authApi.verifyToken();
          setUser(response.user);
        } catch (error) {
          // Token is invalid, remove it
          removeToken();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (taiKhoan: string, matKhau: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authApi.login({ taiKhoan, matKhau });
      
      // Store token
      setToken(response.token);
      
      // Set user data
      setUser(response.user);
      
    } catch (error: any) {
      const errorMessage = error.body?.message || error.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
