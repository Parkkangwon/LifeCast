import { useState, useEffect } from 'react';
import { storage, handleError, showSuccess } from '@/lib/utils';

export interface User {
  id: string;
  name: string;
  email?: string;
  birthYear?: string;
  gender?: string;
  nationality?: string;
  imageStyle?: string;
  location?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false
  });

  const [credentials, setCredentials] = useState({
    name: '',
    password: '',
    rememberCredentials: false
  });

  // 자동 로그인 확인
  useEffect(() => {
    const savedUser = storage.get('tempUser');
    const savedCredentials = storage.get('savedUsername');
    const savedPassword = storage.get('savedPassword');
    const rememberCredentials = storage.get('rememberCredentials');

    if (savedUser) {
      setAuthState(prev => ({
        ...prev,
        user: savedUser,
        isAuthenticated: true
      }));
    }

    if (savedCredentials && savedPassword && rememberCredentials) {
      setCredentials({
        name: savedCredentials,
        password: savedPassword,
        rememberCredentials: true
      });
    }
  }, []);

  const login = async (name: string, password: string, rememberCredentials: boolean = false) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 임시 로그인 로직 (실제로는 서버 인증이 필요함)
      const tempUser: User = {
        id: generateUniqueId(),
        name: name.trim(),
        birthYear: '',
        gender: '',
        nationality: '',
        imageStyle: '동화',
        location: ''
      };

      // 사용자 정보를 저장
      storage.set('tempUser', tempUser);
      
      // 자동 로그인 정보를 저장
      if (rememberCredentials) {
        storage.set('savedUsername', name);
        storage.set('savedPassword', password);
        storage.set('rememberCredentials', true);
      } else {
        storage.remove('savedUsername');
        storage.remove('savedPassword');
        storage.remove('rememberCredentials');
      }

      setAuthState({
        user: tempUser,
        isLoading: false,
        error: null,
        isAuthenticated: true
      });

      setCredentials({
        name,
        password,
        rememberCredentials
      });

      showSuccess('로그인되었습니다!');
      return true;
    } catch (error) {
      const errorMessage = handleError(error, 'Login error', true);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false
      }));
      return false;
    }
  };

  const logout = () => {
    try {
      // 사용자 데이터만 삭제 (AI 채팅 데이터는 보존)
      storage.remove('tempUser');
      storage.remove('userSections');
      storage.remove('userEditedSections');
      storage.remove('userSectionAutobiographies');
      storage.remove('userAutobiography');
      storage.remove('userInfo');

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false
      });

      showSuccess('로그아웃되었습니다.');
    } catch (error) {
      handleError(error, 'Logout error');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };
    storage.set('tempUser', updatedUser);
    
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  const clearCredentials = () => {
    storage.remove('savedUsername');
    storage.remove('savedPassword');
    storage.remove('rememberCredentials');
    
    setCredentials(prev => ({
      ...prev,
      rememberCredentials: false
    }));
  };

  return {
    ...authState,
    credentials,
    login,
    logout,
    updateUser,
    clearCredentials,
    setCredentials
  };
};

// 유틸리티 함수
const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}; 