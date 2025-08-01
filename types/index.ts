// 기본 유틸리티 타입
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 관련 타입
export interface User extends BaseEntity {
  name: string;
  email?: string;
  birthYear?: string;
  gender?: string;
  nationality?: string;
  imageStyle?: string;
  location?: string;
}

// 자서전 관련 타입
export interface StorySection {
  id: string;
  title: string;
  icon: string;
  color: string;
  questions: string[];
  answers: string[];
  illustration?: string;
  editedAutobiography?: string;
  _usedPatternsSet?: Set<number>;
}

export interface AutobiographyData extends BaseEntity {
  userId: string;
  sections: StorySection[];
  generatedImages: string[];
  selectedImages: { [sectionId: string]: string };
  progress: number;
}

// AI 챗봇 관련 타입
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

export interface CharacterInfo {
  name: string;
  emoji: string;
  personality: string;
  greeting: string;
  responses: {
    general: string[];
    happy: string[];
    sad: string[];
    angry: string[];
    question: string[];
  };
}

// AI 그림일기 관련 타입
export interface DiaryEntry extends BaseEntity {
  date: string;
  content: string;
  mood: string;
  weather: string;
  images: string[];
}

export interface DiaryChatContext {
  currentTopic: string;
  collectedInfo: {
    mood?: string;
    weather?: string;
    activities?: string[];
    feelings?: string[];
  };
  conversationStep: 'greeting' | 'mood' | 'weather' | 'activities' | 'feelings' | 'summary' | 'complete';
}

// AI 가계부 관련 타입
export interface FinanceTransaction extends BaseEntity {
  userId: string;
  item: string;
  amount: number;
  category: string;
  memo: string;
  type: 'income' | 'expense';
  source?: string;
}

export interface FinanceChatMessage extends BaseEntity {
  userId: string;
  type: 'user' | 'ai';
  message: string;
}

export interface FinanceAnalysis {
  monthlyTotal: number;
  monthlyExpense: number;
  monthlyIncome: number;
  categoryBreakdown: Record<string, number>;
  savingsGoal: number;
  currentSavings: number;
  recommendations: string[];
}

export interface BudgetGoal extends BaseEntity {
  userId: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
}

// AI 앨범 관련 타입
export interface AIAlbum extends BaseEntity {
  userId: string;
  imageUrl: string;
  title: string;
  description: string;
  style: string;
  textDescription: string;
  isPublic: boolean;
}

// 블로그 관련 타입
export interface Blog extends BaseEntity {
  userId: string;
  title: string;
  description: string;
  customUrl: string;
  isPublic: boolean;
  views: number;
  sections: StorySection[];
}

// Notion 관련 타입
export interface NotionDatabase {
  id: string;
  title: string;
  description?: string;
}

// 음성 인식 관련 타입
export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal?: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// UI 컴포넌트 관련 타입
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  [key: string]: any;
}

export interface ProgressProps {
  value?: number;
  className?: string;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 이미지 생성 관련 타입
export interface ImageGenerationRequest {
  prompt: string;
  n?: number;
  size?: string;
}

export interface ImageGenerationResponse {
  data: Array<{
    url: string;
  }>;
}

// 실시간 정보 관련 타입
export interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

export interface NewsData {
  articles: Array<{
    title: string;
    description: string;
    url: string;
    publishedAt: string;
  }>;
}

export interface StockData {
  name: string;
  price: string;
  change: string;
  volume: string;
}

export interface ExchangeRateData {
  USD: { rate: string; change: string };
  EUR: { rate: string; change: string };
  JPY: { rate: string; change: string };
  CNY: { rate: string; change: string };
}

// 상태 관리 관련 타입
export interface AppState {
  isStarted: boolean;
  showMenuPage: boolean;
  showRegisterPage: boolean;
  currentStage: string | null;
  currentQuestionIndex: number;
  progress: number;
  showAutobiography: boolean;
  showSectionAutobiography: string | null;
}

export interface AIFeaturesState {
  showAIChat: boolean;
  showAIDiary: boolean;
  showAIFinance: boolean;
  showAIAlbum: boolean;
  showAIAlbumBoard: boolean;
  showBlog: boolean;
  showBlogManagement: boolean;
  showAccountManagement: boolean;
  showUserInfoEdit: boolean;
  showProfileSettings: boolean;
}

// 에러 처리 관련 타입
export interface ErrorState {
  message: string;
  context: string;
  timestamp: Date;
  showAlert: boolean;
}

// 로딩 상태 관련 타입
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
} 