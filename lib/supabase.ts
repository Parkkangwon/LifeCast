import { createClient } from '@supabase/supabase-js';

// 환경 변수
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// UUID 생성 함수 (브라우저 호환성)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 조건부로 Supabase 클라이언트 생성
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase 클라이언트가 성공적으로 생성되었습니다.');
  } catch (error) {
    console.warn('⚠️ Supabase 클라이언트 생성 실패:', error);
  }
} else {
  console.log('📱 Supabase 환경 변수가 설정되지 않아 로컬 스토리지 모드로 실행됩니다.');
}

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
  // Check if crypto.subtle is available
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.warn('Web Crypto API failed, using fallback:', error);
    }
  }
  
  // Fallback: Simple hash function for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// 비밀번호 검증
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  console.log('=== PASSWORD VERIFICATION DEBUG ===');
  console.log('Input password:', password);
  console.log('Input password type:', typeof password);
  console.log('Input password length:', password.length);
  console.log('Input password char codes:', Array.from(password).map(c => c.charCodeAt(0)));
  console.log('Stored password:', hashedPassword);
  console.log('Stored password type:', typeof hashedPassword);
  console.log('Stored password length:', hashedPassword.length);
  console.log('Stored password char codes:', Array.from(hashedPassword).map(c => c.charCodeAt(0)));
  
  // 개발용: 평문 비밀번호도 허용 (테스트용)
  const plainTextMatch = hashedPassword === password;
  console.log('Plain text comparison result:', plainTextMatch);
  
  if (plainTextMatch) {
    console.log('✅ Plain text password match');
    return true;
  }
  
  // 일반적인 해시 검증
  const hashedInput = await hashPassword(password);
  console.log('Hashed input:', hashedInput);
  console.log('Hash comparison result:', hashedInput === hashedPassword);
  console.log('=== END PASSWORD VERIFICATION DEBUG ===');
  
  return hashedInput === hashedPassword;
}

// 사용자 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  birth_date?: string;
  gender?: string;
  location?: string;
  nationality?: string;
  is_public?: boolean;
  created_at: string;
}

// AI 데이터 타입들
export interface AIChat {
  id: string;
  user_id: string;
  content: string;
  is_public: boolean;
  created_at: string;
}

export interface AIChatMessage {
  id: string;
  user_id: string;
  character: string;
  message_type: 'user' | 'ai';
  message: string;
  timestamp: string;
  created_at: string;
}

export interface AIFinance {
  id: string;
  user_id: string;
  content: any;
  is_public: boolean;
  created_at: string;
}

export interface FinanceTransaction {
  id: string;
  user_id: string;
  item: string;
  amount: number;
  category: string;
  memo: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
}

export interface AIDiary {
  id: string;
  user_id: string;
  content: string;
  mood: string;
  weather: string;
  is_public: boolean;
  created_at: string;
}

export interface AIAlbum {
  id: string;
  user_id: string;
  image_url: string;
  description: string;
  is_public: boolean;
  created_at: string;
}

export interface AIAutobiography {
  id: string;
  user_id: string;
  content: any;
  image_style: string;
  sections: any;
  is_public: boolean;
  created_at: string;
}

// 사용자 데이터 관리 함수들
const getUsersFromStorage = (): User[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedUsers = localStorage.getItem('users');
      console.log('Raw localStorage users:', storedUsers);
      
      if (storedUsers && storedUsers !== 'null' && storedUsers !== 'undefined') {
        const parsedUsers = JSON.parse(storedUsers);
        console.log('Parsed users from localStorage:', parsedUsers);
        
        // 유효한 배열인지 확인
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          return parsedUsers;
        } else {
          console.log('Parsed users is not a valid array or empty');
        }
      } else {
        console.log('No valid users found in localStorage');
      }
    } catch (error) {
      console.error('Failed to load users from localStorage:', error);
    }
  }
  
  // 기본 사용자 데이터 (첫 실행 시)
  const defaultUsers: User[] = [
    {
      id: '1',
      name: '테스트 사용자',
      email: 'test@example.com',
      password_hash: 'password', // 간단한 테스트용
      birth_date: '1990-01-01',
      gender: '남성',
      location: '서울',
      is_public: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'admin',
      email: 'admin@example.com',
      password_hash: 'password', // 간단한 테스트용
      birth_date: '1985-01-01',
      gender: '남성',
      location: '부산',
      is_public: false,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: '박강원',
      email: 'park@example.com',
      password_hash: 'password', // 간단한 테스트용
      birth_date: '19710121',
      gender: '남성',
      location: '서울',
      is_public: false,
      created_at: new Date().toISOString()
    }
  ];
  
  // 기본 사용자 데이터를 localStorage에 저장
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      console.log('Default users saved to localStorage:', defaultUsers);
    } catch (error) {
      console.error('Failed to save default users to localStorage:', error);
    }
  }
  
  return defaultUsers;
};

const saveUsersToStorage = (users: User[]): void => {
  if (typeof window !== 'undefined') {
    try {
      console.log('Saving users to localStorage:', users);
      
      // 유효성 검사
      if (!Array.isArray(users)) {
        console.error('Users is not an array:', users);
        return;
      }
      
      const usersJson = JSON.stringify(users);
      console.log('Users JSON to save:', usersJson);
      
      localStorage.setItem('users', usersJson);
      console.log('Users saved to localStorage successfully:', users.length, 'users');
      
      // 저장 후 즉시 확인
      const savedUsers = localStorage.getItem('users');
      console.log('Verification - saved users from localStorage:', savedUsers);
      
      // 저장된 데이터와 원본 데이터 비교
      if (savedUsers === usersJson) {
        console.log('✅ Storage verification successful');
      } else {
        console.error('❌ Storage verification failed');
        console.log('Original:', usersJson);
        console.log('Saved:', savedUsers);
      }
    } catch (error) {
      console.error('Failed to save users to localStorage:', error);
    }
  } else {
    console.log('Window is undefined, cannot save to localStorage');
  }
};

// 현재 사용자 목록 (동적으로 로드)
let tempUsers: User[] = [];

// 사용자 데이터를 동적으로 로드하는 함수
const loadUsersFromStorage = (): User[] => {
  const users = getUsersFromStorage();
  console.log('loadUsersFromStorage called, loaded users:', users.length);
  return users;
};

// 초기 로드
tempUsers = loadUsersFromStorage();

// AI 데이터 관리 함수들
const getAIDataFromStorage = (type: string): any[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedData = localStorage.getItem(`ai_${type}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error(`Failed to load AI ${type} from localStorage:`, error);
    }
  }
  return [];
};

const saveAIDataToStorage = (type: string, data: any[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`ai_${type}`, JSON.stringify(data));
      console.log(`AI ${type} saved to localStorage:`, data.length, 'items');
    } catch (error) {
      console.error(`Failed to save AI ${type} to localStorage:`, error);
    }
  }
};

// AI 데이터 (동적으로 로드)
let tempAIChats: AIChat[] = [];
let tempAIFinances: AIFinance[] = [];
let tempAIDiaries: AIDiary[] = [];
let tempAIAlbums: AIAlbum[] = [];
let tempAIAutobiographies: AIAutobiography[] = [];

// AI 데이터를 동적으로 로드하는 함수들
const loadAIDataFromStorage = (): void => {
  tempAIChats = getAIDataFromStorage('chats');
  tempAIFinances = getAIDataFromStorage('finances');
  tempAIDiaries = getAIDataFromStorage('diaries');
  tempAIAlbums = getAIDataFromStorage('albums');
  tempAIAutobiographies = getAIDataFromStorage('autobiographies');
};

// 초기 로드
loadAIDataFromStorage();

// 사용자 등록 (Auth 비활성화 대응)
export async function registerUser(name: string, email: string, password: string, birthDate?: string, gender?: string, location?: string, nationality?: string): Promise<User> {
  try {
    console.log('=== SUPABASE USER REGISTRATION ===');
    console.log('Registering user:', { name, email, birthDate, gender, location, nationality });
    
    // 데이터베이스 연결 테스트
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      throw new Error(`데이터베이스 연결에 실패했습니다: ${connectionTest.error}`);
    }
    
    // 기존 사용자 확인 (이름으로만 확인 - email 컬럼이 없을 수 있음)
    console.log('Checking for existing user with name:', name);
    const { data: existingUserByName, error: checkNameError } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', name)
      .single();
    
    if (checkNameError && checkNameError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkNameError);
      throw new Error(`사용자 확인 중 오류가 발생했습니다: ${checkNameError.message}`);
    }
    
    if (existingUserByName) {
      console.error('User already exists with this name:', existingUserByName);
      throw new Error(`이미 존재하는 사용자명입니다: ${name}`);
    }
    
    console.log('No existing user found with name:', name);
    
    // UUID 생성
    const userId = generateUUID();
    const hashedPassword = await hashPassword(password);
    
    console.log('Attempting to insert user with ID:', userId);
    console.log('User data to insert:', {
      id: userId,
      name: name,
      password_hash: hashedPassword,
      birth_date: birthDate,
      gender: gender,
      location: location,
      is_public: false,
      created_at: new Date().toISOString()
    });
    
    // 사용자 정보를 users 테이블에 직접 저장 (Auth 없이)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: userId, // 직접 UUID 사용
          name: name,
          password_hash: hashedPassword, // 비밀번호 해시 저장
          birth_date: birthDate,
          gender: gender,
          location: location,
          is_public: false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (userError) {
      console.error('User creation error:', userError);
      console.error('Error details:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint
      });
      throw new Error(`사용자 생성 실패: ${userError.message}`);
    }
    
    console.log('User created successfully:', userData);
    
    // User 객체 생성
    const newUser: User = {
      id: userId,
      name: name,
      email: email || `${name}@temp.com`, // 임시 이메일 생성
      password_hash: hashedPassword, // 로컬에서 해시 저장
      birth_date: birthDate,
      gender: gender,
      location: location,
      nationality: nationality,
      is_public: false,
      created_at: new Date().toISOString()
    };
    
    console.log('User registered successfully:', newUser.name, 'ID:', newUser.id);
    console.log('=== END SUPABASE USER REGISTRATION ===');
    
    return newUser;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// 사용자 로그인 (로컬 인증 사용) - 두 테이블 모두 확인
export async function loginUser(name: string, password: string): Promise<User> {
  try {
    console.log('=== SUPABASE USER LOGIN ===');
    console.log('Logging in user:', name);
    
    // 먼저 users 테이블에서 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .single();
    
    if (userData) {
      console.log('User found in users table:', userData);
      
      // 비밀번호 검증 (로컬 해시 비교)
      const hashedInputPassword = await hashPassword(password);
      const isValidPassword = hashedInputPassword === userData.password_hash;
      
      if (!isValidPassword) {
        console.error('Invalid password for user:', name);
        throw new Error('비밀번호가 올바르지 않습니다.');
      }
      
      console.log('Password verified successfully');
      
      // User 객체 생성
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        password_hash: userData.password_hash,
        birth_date: userData.birth_date,
        gender: userData.gender,
        location: userData.location,
        nationality: userData.nationality,
        is_public: userData.is_public || false,
        created_at: userData.created_at
      };
      
      console.log('Login successful:', user.name, 'ID:', user.id);
      console.log('=== END SUPABASE USER LOGIN ===');
      
      return user;
    }
    
    // users 테이블에 없으면 profiles 테이블에서 조회
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('name', name)
      .single();
    
    if (profileData) {
      console.log('User found in profiles table:', profileData);
      
      // 비밀번호 검증 (로컬 해시 비교)
      const hashedInputPassword = await hashPassword(password);
      const isValidPassword = hashedInputPassword === profileData.password_hash;
      
      if (!isValidPassword) {
        console.error('Invalid password for user:', name);
        throw new Error('비밀번호가 올바르지 않습니다.');
      }
      
      console.log('Password verified successfully');
      
      // User 객체 생성 (profiles에서 가져온 데이터)
      const user: User = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        password_hash: profileData.password_hash,
        birth_date: profileData.birth_date,
        gender: profileData.gender,
        location: profileData.location,
        nationality: profileData.nationality,
        is_public: profileData.is_public || false,
        created_at: profileData.created_at
      };
      
      console.log('Login successful (from profiles):', user.name, 'ID:', user.id);
      console.log('=== END SUPABASE USER LOGIN ===');
      
      return user;
    }
    
    console.log('User not found in either table:', name);
    throw new Error('등록되지 않은 사용자입니다. 회원가입을 먼저 해주세요.');
    
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// 사용자 정보 가져오기 (모든 AI 데이터 포함)
export async function getUserData(userId: string): Promise<any> {
  try {
    console.log('Fetching user data for ID:', userId);
    
    // 현재 메모리의 tempUsers에서 사용자 찾기
    let user = tempUsers.find(u => u.id === userId);
    
    // 메모리에 없으면 localStorage에서 로드하여 확인
    if (!user) {
      console.log('User not found in memory, checking localStorage...');
      const loadedUsers = loadUsersFromStorage();
      user = loadedUsers.find(u => u.id === userId);
    }
    if (!user) {
      console.warn('User not found for ID:', userId);
      console.log('Available users:', tempUsers.map(u => ({ id: u.id, name: u.name })));
      return null; // 에러 대신 null 반환
    }
    
    return {
      ...user,
      ai_chat: tempAIChats.filter(chat => chat.user_id === userId),
      ai_finance: tempAIFinances.filter(finance => finance.user_id === userId),
      ai_diary: tempAIDiaries.filter(diary => diary.user_id === userId),
      ai_album: tempAIAlbums.filter(album => album.user_id === userId),
      ai_autobiography: tempAIAutobiographies.filter(autobiography => autobiography.user_id === userId)
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null; // 에러 대신 null 반환
  }
}

// AI 대화 저장
export async function saveAIChat(userId: string, content: string, isPublic: boolean = false): Promise<AIChat> {
  try {
    const newChat: AIChat = {
      id: Date.now().toString(),
      user_id: userId,
      content,
      is_public: isPublic,
      created_at: new Date().toISOString()
    };
    tempAIChats.push(newChat);
    saveAIDataToStorage('chats', tempAIChats);
    
    // 저장 후 AI 데이터를 localStorage에서 다시 로드
    loadAIDataFromStorage();
    
    return newChat;
  } catch (error) {
    console.error('Error saving AI chat:', error);
    throw error;
  }
}

// AI 대화 메시지 저장
export async function saveAIChatMessage(userId: string, character: string, messageType: 'user' | 'ai', message: string): Promise<AIChatMessage> {
  try {
    const newMessage: AIChatMessage = {
      id: Date.now().toString(),
      user_id: userId,
      character: character,
      message_type: messageType,
      message: message,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    // 로컬 스토리지에서 기존 메시지 불러오기
    const existingMessages = getAIDataFromStorage('ai_chat_messages');
    existingMessages.push(newMessage);
    saveAIDataToStorage('ai_chat_messages', existingMessages);
    
    return newMessage;
  } catch (error) {
    console.error('Error saving AI chat message:', error);
    throw error;
  }
}

// AI 대화 메시지 불러오기
export async function getAIChatMessages(userId: string, character: string): Promise<AIChatMessage[]> {
  try {
    const messages = getAIDataFromStorage('ai_chat_messages');
    return messages
      .filter((msg: AIChatMessage) => msg.user_id === userId && msg.character === character)
      .sort((a: AIChatMessage, b: AIChatMessage) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  } catch (error) {
    console.error('Error loading AI chat messages:', error);
    return [];
  }
}

// 사용자의 모든 AI 대화 캐릭터 목록 불러오기
export async function getAIChatCharacters(userId: string): Promise<string[]> {
  try {
    const messages = getAIDataFromStorage('ai_chat_messages');
    const characters = messages
      .filter((msg: AIChatMessage) => msg.user_id === userId)
      .map((msg: AIChatMessage) => msg.character);
    return [...new Set(characters)]; // 중복 제거
  } catch (error) {
    console.error('Error loading AI chat characters:', error);
    return [];
  }
}

// AI 가계부 저장
export async function saveAIFinance(userId: string, content: any, isPublic: boolean = false): Promise<AIFinance> {
  try {
    const newFinance: AIFinance = {
      id: Date.now().toString(),
      user_id: userId,
      content,
      is_public: isPublic,
      created_at: new Date().toISOString()
    };
    tempAIFinances.push(newFinance);
    saveAIDataToStorage('finances', tempAIFinances);
    
    // 저장 후 AI 데이터를 localStorage에서 다시 로드
    loadAIDataFromStorage();
    
    return newFinance;
  } catch (error) {
    console.error('Error saving AI finance:', error);
    throw error;
  }
}

// 가계부 거래 내역 저장
export async function saveFinanceTransaction(userId: string, transaction: {
  item: string;
  amount: number;
  category: string;
  memo: string;
  type: 'income' | 'expense';
}): Promise<FinanceTransaction> {
  try {
    const newTransaction: FinanceTransaction = {
      id: Date.now().toString(),
      user_id: userId,
      item: transaction.item,
      amount: transaction.amount,
      category: transaction.category,
      memo: transaction.memo,
      type: transaction.type,
      date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    // localStorage에 저장
    const existingData = getAIDataFromStorage('finance_transactions');
    existingData.push(newTransaction);
    saveAIDataToStorage('finance_transactions', existingData);
    
    return newTransaction;
  } catch (error) {
    console.error('Error saving finance transaction:', error);
    throw error;
  }
}

// 가계부 거래 내역 불러오기
export async function getFinanceTransactions(userId: string): Promise<FinanceTransaction[]> {
  try {
    const storedData = getAIDataFromStorage('finance_transactions');
    return storedData.filter((item: FinanceTransaction) => item.user_id === userId);
  } catch (error) {
    console.error('Error loading finance transactions:', error);
    return [];
  }
}

// 가계부 거래 내역 삭제
export async function deleteFinanceTransaction(userId: string, transactionId: string): Promise<void> {
  try {
    const storedData = getAIDataFromStorage('finance_transactions');
    const filteredData = storedData.filter((item: FinanceTransaction) => 
      !(item.id === transactionId && item.user_id === userId)
    );
    saveAIDataToStorage('finance_transactions', filteredData);
  } catch (error) {
    console.error('Error deleting finance transaction:', error);
    throw error;
  }
}

// AI 일기 저장
export async function saveAIDiary(userId: string, content: string, mood: string, weather: string, isPublic: boolean = false): Promise<AIDiary> {
  try {
    const newDiary: AIDiary = {
      id: Date.now().toString(),
      user_id: userId,
      content,
      mood,
      weather,
      is_public: isPublic,
      created_at: new Date().toISOString()
    };
    tempAIDiaries.push(newDiary);
    saveAIDataToStorage('diaries', tempAIDiaries);
    
    // 저장 후 AI 데이터를 localStorage에서 다시 로드
    loadAIDataFromStorage();
    
    return newDiary;
  } catch (error) {
    console.error('Error saving AI diary:', error);
    throw error;
  }
}

// AI 앨범 저장
export async function saveAIAlbum(userId: string, imageUrl: string, description: string, isPublic: boolean = false): Promise<AIAlbum> {
  try {
    const newAlbum: AIAlbum = {
      id: Date.now().toString(),
      user_id: userId,
      image_url: imageUrl,
      description,
      is_public: isPublic,
      created_at: new Date().toISOString()
    };
    tempAIAlbums.push(newAlbum);
    saveAIDataToStorage('albums', tempAIAlbums);
    
    // 저장 후 AI 데이터를 localStorage에서 다시 로드
    loadAIDataFromStorage();
    
    return newAlbum;
  } catch (error) {
    console.error('Error saving AI album:', error);
    throw error;
  }
}

// AI 자서전 저장
export async function saveAIAutobiography(userId: string, content: any, imageStyle: string, sections: any, isPublic: boolean = false): Promise<AIAutobiography> {
  try {
    const newAutobiography: AIAutobiography = {
      id: Date.now().toString(),
      user_id: userId,
      content,
      image_style: imageStyle,
      sections,
      is_public: isPublic,
      created_at: new Date().toISOString()
    };
    tempAIAutobiographies.push(newAutobiography);
    saveAIDataToStorage('autobiographies', tempAIAutobiographies);
    
    // 저장 후 AI 데이터를 localStorage에서 다시 로드
    loadAIDataFromStorage();
    
    return newAutobiography;
  } catch (error) {
    console.error('Error saving AI autobiography:', error);
    throw error;
  }
}

// 공개 게시판용 함수들
export async function getPublicContent(contentType: 'chat' | 'finance' | 'diary' | 'album' | 'autobiography') {
  try {
    // 임시 공개 데이터 반환
    const tempData = {
      chat: tempAIChats.filter(item => item.is_public),
      finance: tempAIFinances.filter(item => item.is_public),
      diary: tempAIDiaries.filter(item => item.is_public),
      album: tempAIAlbums.filter(item => item.is_public),
      autobiography: tempAIAutobiographies.filter(item => item.is_public)
    };
    
    return tempData[contentType] || [];
  } catch (error) {
    console.error(`Error fetching public ${contentType}:`, error);
    throw error;
  }
}

// Supabase 연결 테스트
export async function testSupabaseConnection() {
  try {
    console.log('=== TESTING SUPABASE CONNECTION ===');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Anon Key:', supabaseAnonKey ? 'SET' : 'NOT SET');
    console.log('Anon Key length:', supabaseAnonKey?.length || 0);
    
    if (!supabaseAnonKey) {
      console.error('❌ Supabase Anon Key is not set');
      console.log('Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables');
      return { success: false, error: 'Supabase Anon Key is not set' };
    }
    
    // 1. 기본 연결 테스트 (테이블 존재 여부와 관계없이)
    console.log('Testing basic connection...');
    
    // 먼저 간단한 헬스체크
    try {
      const { data: healthData, error: healthError } = await supabase.from('_supabase_migrations').select('*').limit(1);
      console.log('Health check result:', healthData, healthError);
    } catch (healthErr) {
      console.log('Health check failed (expected):', healthErr);
    }
    
    // users 테이블 테스트
    const { data: basicData, error: basicError } = await supabase.from('users').select('*').limit(1);
    
    if (basicError) {
      console.error('❌ Users table access failed:', basicError);
      console.error('Error details:', {
        message: basicError.message,
        details: basicError.details,
        hint: basicError.hint,
        code: basicError.code
      });
      
      // 테이블이 존재하지 않는 경우 생성 안내
      if (basicError.code === 'PGRST116') {
        console.log('💡 Users table does not exist. Please create it in Supabase dashboard.');
        return { success: false, error: 'Users table does not exist. Please create it first.' };
      }
      
      return { success: false, error: basicError.message };
    }
    
    console.log('✅ Basic connection successful');
    console.log('Basic query result:', basicData);
    
    // 2. 테이블 구조 확인
    console.log('Checking table structure...');
    
    // 먼저 테이블이 존재하는지 확인
    const { data: tableExists, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access failed:', tableError);
      
      // 테이블이 존재하지 않는 경우
      if (tableError.code === 'PGRST116') {
        return { 
          success: false, 
          error: 'Users table does not exist. Please run the create-tables.sql script in Supabase dashboard.',
          details: 'Table not found'
        };
      }
      
      return { success: false, error: `Table access error: ${tableError.message}` };
    }
    
    // 테이블이 존재하면 컬럼 구조 확인
    console.log('Checking required columns...');
    
    // 단계별로 컬럼 확인 (필수 컬럼만)
    const requiredColumns = [
      'id', 'name', 'password_hash', 'birth_date', 
      'gender', 'location', 'is_public', 'created_at'
    ];
    
    // 선택적 컬럼 (있으면 좋지만 없어도 됨)
    const optionalColumns = ['email', 'nationality'];
    
    const missingColumns: string[] = [];
    
    // 필수 컬럼 확인
    for (const column of requiredColumns) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select(column)
          .limit(1);
        
        if (error) {
          missingColumns.push(column);
          console.log(`❌ Required column '${column}' missing:`, error.message);
        } else {
          console.log(`✅ Required column '${column}' exists`);
        }
      } catch (err) {
        missingColumns.push(column);
        console.log(`❌ Required column '${column}' error:`, err);
      }
    }
    
    // 선택적 컬럼 확인 (경고만 표시)
    for (const column of optionalColumns) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`⚠️ Optional column '${column}' missing:`, error.message);
        } else {
          console.log(`✅ Optional column '${column}' exists`);
        }
      } catch (err) {
        console.log(`⚠️ Optional column '${column}' error:`, err);
      }
    }
    
    if (missingColumns.length > 0) {
      console.error('❌ Missing columns:', missingColumns);
      return { 
        success: false, 
        error: `Missing required columns: ${missingColumns.join(', ')}`,
        details: 'Table structure incomplete',
        missingColumns
      };
    }
    
    // 모든 컬럼이 존재하면 전체 구조 확인 (필수 컬럼만)
    console.log('Performing final structure check with required columns only...');
    const { data: structureData, error: structureError } = await supabase
      .from('users')
      .select('id, name, password_hash, birth_date, gender, location, is_public, created_at')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Final structure check failed:', structureError);
      console.error('Error details:', {
        code: structureError.code,
        message: structureError.message,
        details: structureError.details,
        hint: structureError.hint
      });
      return { 
        success: false, 
        error: `Final structure check failed: ${structureError.message}`,
        details: 'Unexpected error after column verification',
        errorCode: structureError.code,
        errorHint: structureError.hint
      };
    }
    
    console.log('✅ Table structure check successful');
    console.log('Available columns:', Object.keys(structureData[0] || {}));
    
    console.log('=== END SUPABASE CONNECTION TEST ===');
    return { success: true, data: { basic: basicData, structure: structureData } };
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// 사용자 존재 여부 확인 (Supabase 사용) - 두 테이블 모두 확인
export async function checkUserExists(name: string): Promise<boolean> {
  try {
    console.log(`=== CHECKING USER EXISTS IN SUPABASE: "${name}" ===`);
    
    // 먼저 users 테이블에서 확인
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', name)
      .single();
    
    if (userData) {
      console.log(`User "${name}" found in users table:`, userData);
      console.log(`Result: true`);
      console.log('=== END CHECK ===');
      return true;
    }
    
    // users 테이블에 없으면 profiles 테이블에서 확인
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('name', name)
      .single();
    
    if (profileData) {
      console.log(`User "${name}" found in profiles table:`, profileData);
      console.log(`Result: true (in profiles table)`);
      console.log('=== END CHECK ===');
      return true;
    }
    
    console.log(`User "${name}" not found in either table`);
    console.log(`Result: false`);
    console.log('=== END CHECK ===');
    return false;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

// localStorage 초기화 (테스트용)
export function clearAllData() {
  if (typeof window !== 'undefined') {
    console.log('=== CLEARING ALL LOCALSTORAGE DATA ===');
    localStorage.removeItem('users');
    localStorage.removeItem('ai_chats');
    localStorage.removeItem('ai_finances');
    localStorage.removeItem('ai_diaries');
    localStorage.removeItem('ai_albums');
    localStorage.removeItem('ai_autobiographies');
    console.log('All localStorage data cleared');
    
    // tempUsers도 초기화
    tempUsers = [];
    console.log('tempUsers reset to empty array');
    console.log('=== END CLEAR ===');
  }
}

// 디버깅용: 사용자 등록 상태 확인
export function debugUserRegistration() {
  console.log('=== USER REGISTRATION DEBUG ===');
  
  // localStorage에서 사용자 데이터 확인
  if (typeof window !== 'undefined') {
    const storedUsers = localStorage.getItem('users');
    console.log('localStorage users raw:', storedUsers);
    
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        console.log('Parsed users:', users);
        console.log('User count:', users.length);
        users.forEach((user: any, index: number) => {
          console.log(`User ${index + 1}:`, {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
          });
        });
      } catch (e) {
        console.error('Failed to parse users:', e);
      }
    } else {
      console.log('No users found in localStorage');
    }
  }
  
  // 메모리 상태 확인
  console.log('Memory tempUsers:', tempUsers);
  console.log('Memory tempUsers length:', tempUsers.length);
  
  console.log('=== END USER REGISTRATION DEBUG ===');
}

// 브라우저 콘솔에서 테스트할 수 있는 함수들
if (typeof window !== 'undefined') {
  (window as any).debugUsers = debugUserRegistration;
  (window as any).clearAllData = clearAllData;
  (window as any).checkUserExists = checkUserExists;
  (window as any).testConnection = testSupabaseConnection;
  (window as any).testRegistration = async (name: string, password: string) => {
    try {
      const email = `testuser@gmail.com`;
      const user = await registerUser(name, email, password);
      console.log('Test registration successful:', user);
      debugUserRegistration();
      return user;
    } catch (error) {
      console.error('Test registration failed:', error);
      throw error;
    }
  };
  
  console.log('Debug functions available in console:');
  console.log('- debugUsers(): Show all user data');
  console.log('- clearAllData(): Clear all localStorage data');
  console.log('- checkUserExists(name): Check if user exists');
  console.log('- testConnection(): Test database connection');
  console.log('- testRegistration(name, password): Test user registration');
  console.log('- recoverUser(name, password): Recover lost user');
  console.log('- backupUsers(): Backup all users to localStorage');
  console.log('- restoreUsers(): Restore users from localStorage');
  console.log('- checkTableStructure(): Check database table structure');
  console.log('- createUsersTable(): Create users table automatically');
  console.log('- createSimpleUsersTable(): Create minimal users table');
  console.log('- debugDatabase(): Detailed database debugging');
  
  // 상세한 데이터베이스 디버깅 함수
  (window as any).debugDatabase = async () => {
    try {
      console.log('=== DETAILED DATABASE DEBUG ===');
      
      // 1. Supabase 클라이언트 정보
      console.log('Supabase client info:', {
        hasClient: !!supabase,
        clientType: typeof supabase
      });
      
      // 2. 기본 연결 테스트
      console.log('Testing basic connection...');
      const { data: basicData, error: basicError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      console.log('Basic connection result:', {
        success: !basicError,
        error: basicError?.message,
        errorCode: basicError?.code,
        dataCount: basicData?.length || 0
      });
      
      // 3. 테이블 존재 여부 확인
      console.log('Checking table existence...');
      const { data: tableCheck, error: tableError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      console.log('Table existence check:', {
        exists: !tableError,
        error: tableError?.message,
        errorCode: tableError?.code
      });
      
      // 4. 컬럼별 테스트
      const testColumns = ['id', 'name', 'password_hash', 'birth_date', 'gender', 'location', 'is_public', 'created_at'];
      const columnResults: any = {};
      
      for (const column of testColumns) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select(column)
            .limit(1);
          
          columnResults[column] = {
            exists: !error,
            error: error?.message,
            errorCode: error?.code
          };
        } catch (err) {
          columnResults[column] = {
            exists: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          };
        }
      }
      
      console.log('Column test results:', columnResults);
      
      // 5. RLS 정책 확인
      console.log('Testing RLS policies...');
      const { data: rlsTest, error: rlsError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      console.log('RLS test result:', {
        success: !rlsError,
        error: rlsError?.message,
        errorCode: rlsError?.code,
        dataCount: rlsTest?.length || 0
      });
      
      const result = {
        clientInfo: {
          hasClient: !!supabase,
          clientType: typeof supabase
        },
        basicConnection: {
          success: !basicError,
          error: basicError?.message,
          errorCode: basicError?.code
        },
        tableExists: {
          exists: !tableError,
          error: tableError?.message,
          errorCode: tableError?.code
        },
        columns: columnResults,
        rlsTest: {
          success: !rlsError,
          error: rlsError?.message,
          errorCode: rlsError?.code
        }
      };
      
      console.log('=== END DATABASE DEBUG ===');
      return result;
    } catch (error) {
      console.error('Database debug failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };
  
  // 간단한 테이블 생성 함수 (RPC 없이)
  (window as any).createSimpleUsersTable = async () => {
    try {
      console.log('=== CREATING SIMPLE USERS TABLE ===');
      
      // 1. 테이블이 존재하는지 확인
      const { data: existingData, error: existingError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (!existingError) {
        console.log('✅ Users table already exists');
        return { success: true, message: 'Users table already exists' };
      }
      
      console.log('❌ Users table does not exist, creating...');
      
      // 2. 간단한 테스트 데이터 삽입으로 테이블 생성 시도
      const testUser = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'test_user',
        password_hash: 'test_hash',
        birth_date: '19900101',
        gender: '기타',
        location: '테스트',
        is_public: false,
        created_at: new Date().toISOString()
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([testUser])
        .select();
      
      if (insertError) {
        console.error('❌ Failed to create table via insert:', insertError);
        return { 
          success: false, 
          error: `Table creation failed: ${insertError.message}`,
          details: 'Please run the SQL script in Supabase dashboard'
        };
      }
      
      console.log('✅ Users table created successfully via insert');
      
      // 3. 테스트 데이터 삭제
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.warn('⚠️ Failed to delete test data:', deleteError);
      } else {
        console.log('✅ Test data cleaned up');
      }
      
      return { 
        success: true, 
        message: 'Users table created successfully',
        method: 'insert'
      };
    } catch (error) {
      console.error('Create simple table failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };
  
  // 테이블 자동 생성 함수
  (window as any).createUsersTable = async () => {
    try {
      console.log('=== CREATING USERS TABLE ===');
      
      // 1. 기존 테이블 삭제
      console.log('Dropping existing table...');
      const { error: dropError } = await supabase
        .rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS public.users CASCADE;' });
      
      if (dropError) {
        console.warn('Drop table warning:', dropError);
      }
      
      // 2. 새 테이블 생성
      console.log('Creating new users table...');
      const createTableSQL = `
        CREATE TABLE public.users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT,
          birth_date TEXT,
          gender TEXT,
          location TEXT,
          nationality TEXT,
          is_public BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase
        .rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Create table error:', createError);
        return { success: false, error: createError.message };
      }
      
      // 3. RLS 활성화
      console.log('Enabling RLS...');
      const { error: rlsError } = await supabase
        .rpc('exec_sql', { sql: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;' });
      
      if (rlsError) {
        console.warn('RLS warning:', rlsError);
      }
      
      // 4. 기본 정책 생성
      console.log('Creating policies...');
      const policySQL = `
        DROP POLICY IF EXISTS "Allow all operations" ON public.users;
        CREATE POLICY "Allow all operations" ON public.users FOR ALL USING (true);
      `;
      
      const { error: policyError } = await supabase
        .rpc('exec_sql', { sql: policySQL });
      
      if (policyError) {
        console.warn('Policy warning:', policyError);
      }
      
      console.log('✅ Users table created successfully');
      
      // 5. 테이블 구조 확인
      const structureCheck = await (window as any).checkTableStructure();
      
      return { 
        success: true, 
        message: 'Users table created successfully',
        structure: structureCheck
      };
    } catch (error) {
      console.error('Create table failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };
  
  // 테이블 구조 확인 함수
  (window as any).checkTableStructure = async () => {
    try {
      console.log('=== CHECKING TABLE STRUCTURE ===');
      
      // 1. 테이블 존재 여부 확인
      const tables = ['users', 'autobiographies', 'blog_views'];
      const results: any = {};
      
      for (const tableName of tables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            results[tableName] = { exists: false, error: error.message };
          } else {
            results[tableName] = { exists: true, accessible: true };
          }
        } catch (err) {
          results[tableName] = { exists: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
      }
      
      // 2. users 테이블 컬럼 확인
      if (results.users.exists) {
        try {
          const { data: columns, error: columnError } = await supabase
            .from('users')
            .select('id, name, email, password_hash, birth_date, gender, location, nationality, is_public, created_at')
            .limit(1);
          
          if (columnError) {
            results.users.columns = { error: columnError.message };
          } else {
            results.users.columns = { success: true, available: Object.keys(columns[0] || {}) };
          }
        } catch (err) {
          results.users.columns = { error: err instanceof Error ? err.message : 'Unknown error' };
        }
      }
      
      console.log('Table structure check results:', results);
      return results;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };
  
  // 사용자 백업 함수
  (window as any).backupUsers = async () => {
    try {
      const { data: users, error } = await supabase.from('users').select('*');
      if (error) throw error;
      
      localStorage.setItem('users_backup', JSON.stringify(users));
      console.log('Users backed up successfully:', users.length, 'users');
      return { success: true, count: users.length };
    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };
  
  // 사용자 복원 함수
  (window as any).restoreUsers = async () => {
    try {
      const backup = localStorage.getItem('users_backup');
      if (!backup) {
        console.log('No backup found');
        return { success: false, error: 'No backup found' };
      }
      
      const users = JSON.parse(backup);
      console.log('Restoring users from backup:', users.length, 'users');
      
      // 각 사용자를 다시 등록
      for (const user of users) {
        try {
          await registerUser(user.name, user.email, user.password_hash, user.birth_date, user.gender, user.location, user.nationality);
        } catch (error) {
          console.warn(`Failed to restore user ${user.name}:`, error);
        }
      }
      
      return { success: true, restored: users.length };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };
  
  // 박지은 사용자 복구 함수
  (window as any).recoverUser = async (name: string, password: string) => {
    try {
      console.log(`Attempting to recover user: ${name}`);
      
      // 1. 먼저 사용자가 존재하는지 확인
      const exists = await checkUserExists(name);
      if (exists) {
        console.log(`User ${name} already exists`);
        return { success: true, message: 'User already exists' };
      }
      
      // 2. 새 사용자로 등록
      const email = `${name.toLowerCase()}@recovered.com`;
      const user = await registerUser(name, email, password);
      console.log('User recovery successful:', user);
      
      // 3. localStorage에 사용자 데이터 저장
      if (typeof window !== 'undefined') {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = [...existingUsers, user];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log('User saved to localStorage');
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('User recovery failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };
}
