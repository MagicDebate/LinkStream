import { useState, useEffect } from 'react';
import { mockApi } from '@/lib/mockApi';
import { User } from '@shared/schema';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await mockApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const authData = await mockApi.login(email, password);
    setUser(authData.user);
    return authData;
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const authData = await mockApi.register(email, password, firstName, lastName);
    setUser(authData.user);
    return authData;
  };

  const logout = async () => {
    await mockApi.logout();
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await mockApi.changePassword(currentPassword, newPassword);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    changePassword,
  };
}
