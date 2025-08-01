import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 조건부 클래스 유틸리티 함수
export const conditionalClasses = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
}

// 고유 ID 생성 유틸리티 함수
export const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 나이 계산 함수
export const calculateAge = (birthYear: string): number => {
  if (!birthYear || birthYear.length !== 8) return 25; // 기본값
  
  try {
    const year = parseInt(birthYear.substring(0, 4));
    const month = parseInt(birthYear.substring(4, 6));
    const day = parseInt(birthYear.substring(6, 8));
    
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age > 0 ? age : 25; // 유효하지 않은 나이는 기본값 반환
  } catch (error) {
    console.error('나이 계산 오류:', error);
    return 25; // 기본값
  }
};

// 섹션별 나이와 연도 계산 함수
export const getSectionAgeAndYear = (sectionId: string, birthYear: number) => {
  switch (sectionId) {
    case 'childhood':
      return { age: 7, year: birthYear + 7 };
    case 'school':
      return { age: 17, year: birthYear + 17 };
    case 'teen':
      return { age: 16, year: birthYear + 16 };
    case 'college':
      return { age: 20, year: birthYear + 20 };
    case 'work':
      return { age: 25, year: birthYear + 25 };
    case 'love':
      return { age: 28, year: birthYear + 28 };
    case 'present':
      return { age: new Date().getFullYear() - birthYear, year: new Date().getFullYear() };
    default:
      return { age: 7, year: birthYear + 7 };
  }
};

// 에러 처리 유틸리티
export const handleError = (error: any, context: string, showAlert: boolean = false) => {
  const errorMessage = `[${context}] ${error?.message || error || '알 수 없는 오류가 발생했습니다.'}`;
  console.error(errorMessage);
  
  if (showAlert && typeof window !== 'undefined') {
    alert(errorMessage);
  }
  
  return errorMessage;
};

// 성공 메시지 처리 유틸리티
export const showSuccess = (message: string, showAlert: boolean = true) => {
  if (showAlert && typeof window !== 'undefined') {
    alert(message);
  }
  return message;
};

// 로컬 스토리지 유틸리티
export const storage = {
  get: (key: string, defaultValue: any = null) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // JSON으로 파싱을 시도하되, 실패하면 원본 문자열을 반환
      try {
        return JSON.parse(item);
      } catch (parseError) {
        // JSON 파싱 실패 시 원본 문자열 반환 (문자열 값인 경우)
        return item;
      }
    } catch (error) {
      handleError(error, `Storage get error for key: ${key}`);
      return defaultValue;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return false;
    try {
      // 문자열이나 기본 타입인 경우 JSON.stringify 사용하지 않음
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        localStorage.setItem(key, String(value));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      handleError(error, `Storage set error for key: ${key}`);
      return false;
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      handleError(error, `Storage remove error for key: ${key}`);
      return false;
    }
  },
  
  clear: () => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      handleError(error, 'Storage clear error');
      return false;
    }
  }
};

// 날짜 포맷팅 유틸리티
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 파일 크기 포맷팅 유틸리티
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 이미지 URL 검증 유틸리티
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 디바운스 유틸리티
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 스로틀 유틸리티
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
