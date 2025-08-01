"use client"

import React, { useState, useRef, useEffect } from "react"
// Supabase 함수들은 환경 변수 설정 후에만 사용 가능
// import { loginUser, getUserData, testSupabaseConnection, registerUser, saveAIAutobiography, saveAIChatMessage, getAIChatMessages, getAIChatCharacters, debugUserRegistration, checkUserExists, clearAllData, saveFinanceTransaction, getFinanceTransactions, deleteFinanceTransaction } from "@/lib/supabase"
import { 
  testNotionConnection, 
  getNotionDatabases, 
  saveAIDiaryToNotion, 
  saveAIFinanceToNotion, 
  saveAutobiographyToNotion,
  getNotionPages,
  NotionDatabase 
} from "@/lib/notion"
import { saveAutobiographyAsHTML, saveAutobiographyAsPDF } from '@/lib/autobiography-utils';
import { getProxiedImageUrl } from '@/lib/image-utils';
import { downloadFinanceDataAsExcel, downloadMonthlyReportAsExcel, FinanceTransaction } from '@/lib/excel-utils';
import { 
  getFinanceTransactions as getDBFinanceTransactions, 
  addFinanceTransaction as addDBFinanceTransaction, 
  updateFinanceTransaction as updateDBFinanceTransaction, 
  deleteFinanceTransaction as deleteDBFinanceTransaction,
  getFinanceChatMessages,
  addFinanceChatMessage,
  clearFinanceChatMessages,
  calculateFinanceStats,
  calculateMonthlyStats,
  type FinanceTransaction as DBFinanceTransaction,
  type FinanceChatMessage
} from '@/lib/finance-utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import BookFlipAnimation from '@/components/blog/BookFlipAnimation'
import JSZip from 'jszip';

// 새로 분리된 훅들과 컴포넌트들 가져오기
import { useAuth } from '@/hooks/use-auth';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useAIChat } from '@/hooks/use-ai-chat';
import { 
  cn, 
  generateUniqueId, 
  calculateAge, 
  getSectionAgeAndYear, 
  handleError, 
  showSuccess,
  storage 
} from '@/lib/utils';
import { 
  searchNews, 
  getWeather, 
  getStockPrice, 
  getExchangeRate,
  getRealtimeInfo 
} from '@/lib/realtime-utils';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Badge, 
  Textarea, 
  Progress,
  Mic,
  MicOff,
  Play,
  Pause,
  Download,
  Edit3,
  Heart,
  Sparkles,
  BookOpen,
  GraduationCap,
  Briefcase,
  Star,
  ArrowLeft,
  Quote,
  Share2,
  Settings,
  renderIcon
} from '@/components/ui/common';
import { 
  StorySection, 
  SpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent,
  FinanceTransaction as FinanceTransactionType,
  ChatMessage,
  User,
  DiaryEntry,
  NotionDatabase as NotionDatabaseType
} from '@/types';
import AIChatSection from '@/components/ai/AIChatSection';
import AIDiarySection from '@/components/ai/AIDiarySection';
import AIFinanceSection from '@/components/ai/AIFinanceSection';
import AIAlbumSection from '@/components/ai/AIAlbumSection';

// UI 컴포넌트들은 @/components/ui/common.tsx로 이동됨

// 타입 정의들은 @/types/index.ts로 이동됨

// 별빛 효과 컴포넌트
function Starfield({ explode }: { explode: boolean }) {
  const [stars, setStars] = useState<any[]>([]);
  const [exploding, setExploding] = useState(false);
  const starCount = 45;

  const generateStars = () => {
    return Array.from({ length: starCount }).map(() => {
      const angle = Math.random() * 2 * Math.PI;
      return {
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.pow(Math.random(), 2) * 1.8 + 0.4,
        color: [
          '#4fc3ff', '#ff5a5a', '#ffe066', '#fffbe6',
          'rgba(255, 255, 255, 0.95)', 'rgba(255, 215, 100, 0.92)',
          'rgba(220, 220, 220, 0.85)', 'rgba(180, 200, 255, 0.85)',
          'rgba(140, 120, 255, 0.85)', 'rgba(255, 180, 220, 0.85)'
        ][Math.floor(Math.random() * 10)],
        angle,
        speed: Math.random() * 0.2 + 0.05,
        distance: Math.random() * 30 + 10,
        twinkle: 0.7 + 0.3 * Math.random(),
      };
    });
  };

  useEffect(() => {
    setStars(generateStars());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStars((prevStars) =>
        prevStars.map((star) => ({
          ...star,
          top: Math.random() * 100,
          left: Math.random() * 100,
        }))
      );
    }, 2500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (explode) {
      setExploding(true);
      setTimeout(() => setExploding(false), 1200);
    }
  }, [explode]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 bg-black">
      <style>{`
        @keyframes luxury-star-twinkle {
          0% { opacity: 0.3; filter: blur(2px) drop-shadow(0 0 6px gold); }
          25% { opacity: 0.8; filter: blur(1px) drop-shadow(0 0 12px #fffbe6); }
          50% { opacity: 0.6; filter: blur(1.5px) drop-shadow(0 0 10px #ffd700); }
          75% { opacity: 0.9; filter: blur(0.8px) drop-shadow(0 0 14px #fffbe6); }
          100% { opacity: 0.3; filter: blur(2px) drop-shadow(0 0 6px gold); }
        }
      `}</style>
      {stars.map((star, i) => {
        const explodeStyle = exploding
          ? {
              top: `calc(50% + ${(star.top - 50) * 2.2}%)`,
              left: `calc(50% + ${(star.left - 50) * 2.2}%)`,
              opacity: 0,
              transition: 'all 1.2s cubic-bezier(.4,2,.6,1)',
            }
          : {
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: 1,
              transition: 'all 1.2s cubic-bezier(.4,2,.6,1)',
            };
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              ...explodeStyle,
              width: `${star.size}rem`,
              height: `${star.size}rem`,
              background: `radial-gradient(circle at 60% 40%, ${star.color} 70%, transparent 100%)`,
              boxShadow: `0 0 ${star.size * 12 + 8}px ${star.size * 2 + 2}px ${star.color}, 0 0 60px 16px #fffbe6`,
              animation: `luxury-star-twinkle ${1.5 + star.size * 0.7}s infinite alternate`,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </div>
  );
}

// 스토리 섹션 데이터
const storyStages: StorySection[] = [
  {
    id: "childhood",
    title: "어린시절",
    icon: "heart",
    color: "bg-pink-100 text-pink-700 border-pink-200",
    questions: [
      "어린 시절 가장 좋아했던 놀이나 장난감은 무엇이었나요?",
      "기억에 남는 가족과의 추억이 있다면 들려주세요.",
      "어릴 때 꿈꿨던 장래희망은 무엇이었나요?",
      "가장 무서웠던 경험이나 용감했던 순간이 있나요?",
    ],
    answers: [],
  },
  {
    id: "school",
    title: "학창시절",
    icon: "graduation-cap",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    questions: [
      "학교에서 가장 좋아했던 과목이나 선생님은 누구였나요?",
      "친구들과의 특별한 추억이 있다면 말해주세요.",
      "학창시절 가장 열심히 했던 활동은 무엇인가요?",
      "졸업할 때의 기분과 미래에 대한 생각은 어땠나요?",
    ],
    answers: [],
  },
  {
    id: "work",
    title: "사회생활",
    icon: "briefcase",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    questions: [
      "첫 직장에서의 경험은 어땠나요?",
      "직장생활에서 가장 보람찼던 순간은 언제인가요?",
      "동료들과의 관계에서 배운 점이 있다면?",
      "커리어에서 가장 중요한 전환점은 무엇이었나요?",
    ],
    answers: [],
  },
  {
    id: "love",
    title: "연애시절",
    icon: "star",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    questions: [
      "첫사랑에 대한 기억을 들려주세요.",
      "가장 로맨틱했던 순간은 언제였나요?",
      "연애를 통해 배운 가장 소중한 것은 무엇인가요?",
      "사랑에 대한 당신만의 철학이 있다면?",
    ],
    answers: [],
  },
  {
    id: "present",
    title: "현재",
    icon: "sparkles",
    color: "bg-green-100 text-green-700 border-green-200",
    questions: [
      "현재 가장 중요하게 생각하는 가치는 무엇인가요?",
      "지금 이 순간 가장 감사한 것은 무엇인가요?",
      "현재의 나를 한 문장으로 표현한다면?",
      "요즘 가장 행복을 느끼는 순간은 언제인가요?",
    ],
    answers: [],
  },
  {
    id: "future",
    title: "미래",
    icon: "book-open",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    questions: [
      "앞으로 이루고 싶은 가장 큰 꿈은 무엇인가요?",
      "10년 후의 나는 어떤 모습일까요?",
      "미래의 나에게 전하고 싶은 메시지가 있다면?",
      "인생에서 꼭 해보고 싶은 일이 있나요?",
    ],
    answers: [],
  },
]

// 유틸리티 함수들은 @/lib/utils.ts와 @/lib/realtime-utils.ts로 이동됨
// 메인 컴포넌트
export default function AIAutobiographyGenerator() {
  // Hydration 안전성을 위한 상태
  const [isClient, setIsClient] = useState(false);
  
  // 분리된 훅들 사용
  const { 
    user, 
    isAuthenticated, 
    isLoading: authLoading, 
    error: authError, 
    login, 
    logout, 
    updateUser,
    clearCredentials
  } = useAuth();
  
  const { 
    isRecording, 
    transcript, 
    error: speechError, 
    startRecording, 
    stopRecording, 
    resetTranscript,
    initializeSpeechRecognition
  } = useSpeechRecognition();
  
  const { 
    messages: aiChatMessages, 
    selectedCharacter, 
    customCharacter, 
    isLoading: aiChatLoading, 
    setSelectedCharacter, 
    setCustomCharacter, 
    addMessage: addChatMessage, 
    resetChat 
  } = useAIChat();
  
  // 음성 인식 시작 함수
  const startVoiceRecognition = () => {
    initializeSpeechRecognition();
    startRecording();
    setIsVoiceRecording(true);
  };
  
  // 상태 관리
  const [isStarted, setIsStarted] = useState(false);
  const [showMenuPage, setShowMenuPage] = useState(false);
  const [showRegisterPage, setShowRegisterPage] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [sections, setSections] = useState<StorySection[]>(storyStages)
  const [progress, setProgress] = useState(0)
  const [showAutobiography, setShowAutobiography] = useState(false)
  const [showSectionAutobiography, setShowSectionAutobiography] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [imageGenerationProgress, setImageGenerationProgress] = useState(0)
  const [currentGeneratingImage, setCurrentGeneratingImage] = useState(0)
  const [generationStatus, setGenerationStatus] = useState("")

  // 사용자 정보 상태 (인증 훅에서 관리되는 부분 제외)
  const [userBirthYear, setUserBirthYear] = useState("");
  const [userGender, setUserGender] = useState("");
  const [imageStyle, setImageStyle] = useState("동화");
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [location, setLocation] = useState("");
  const [userNationality, setUserNationality] = useState("");

  // 이미지 선택 관련 상태
  const [selectedImages, setSelectedImages] = useState<{ [sectionId: string]: string }>({});
  const [isStarting, setIsStarting] = useState(false);
  const [selectingImages, setSelectingImages] = useState<{sectionIndex:number, images:string[]}|null>(null);
  const [selectedImageIndexes, setSelectedImageIndexes] = useState<number[]>([]);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState<number>(0);

  // AI 기능별 상태 관리
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAIDiary, setShowAIDiary] = useState(false);
  const [showAIFinance, setShowAIFinance] = useState(false);
  const [showAIAlbum, setShowAIAlbum] = useState(false);
  const [showAIAlbumBoard, setShowAIAlbumBoard] = useState(false);
  const [showAlbumViewModal, setShowAlbumViewModal] = useState(false);
  const [selectedAlbumForView, setSelectedAlbumForView] = useState<any>(null);
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const [showUserInfoEdit, setShowUserInfoEdit] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  // 회원정보 수정 관련 상태
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [isEditingUserInfo, setIsEditingUserInfo] = useState(false);
  
  // 프로필 설정 관련 상태
  const [profileImage, setProfileImage] = useState<string>("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [profileBirthYear, setProfileBirthYear] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileNationality, setProfileNationality] = useState("");
  const [profileImageStyle, setProfileImageStyle] = useState("동화");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [showBlog, setShowBlog] = useState(false);
  const [showBlogManagement, setShowBlogManagement] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedAutobiography, setEditedAutobiography] = useState<string>("");
  const [saveMessage, setSaveMessage] = useState<string>("");
  
  // 블로그 관리 관련 상태
  const [blogTitle, setBlogTitle] = useState(`${user?.name?.trim() || '나의'} 자서전`);
  const [blogDescription, setBlogDescription] = useState("나만의 특별한 이야기를 담은 자서전입니다.");
  const [blogCustomUrl, setBlogCustomUrl] = useState("");
  const [blogIsPublic, setBlogIsPublic] = useState(false);
  const [userBlogs, setUserBlogs] = useState<any[]>([]);
  const [blogViews, setBlogViews] = useState(0);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [selectedBlogForEdit, setSelectedBlogForEdit] = useState<any>(null);
  const [showBlogView, setShowBlogView] = useState(false);
  const [showBookFlipAnimation, setShowBookFlipAnimation] = useState(false);

  // 오디오 관리 상태
  const [playingAudios, setPlayingAudios] = useState<HTMLAudioElement[]>([]);

  // 로그인 관련 상태
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [name, setName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [rememberCredentials, setRememberCredentials] = useState(false);

  // 음성 인식 관련 상태
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [aiChatMessage, setAiChatMessage] = useState("");

  // AI 기능별 데이터 상태 관리 (AI 채팅 관련은 훅에서 관리)
  const [showCharacterSelect, setShowCharacterSelect] = useState(true);
  const [previousCharacters, setPreviousCharacters] = useState<string[]>([]);
  const [aiDiaryContent, setAiDiaryContent] = useState("");
  const [aiDiaryMood, setAiDiaryMood] = useState("");
  const [aiDiaryWeather, setAiDiaryWeather] = useState("");
  const [isGeneratingDiaryImages, setIsGeneratingDiaryImages] = useState<boolean>(false);
  const [diaryImages, setDiaryImages] = useState<string[]>([]);
  const [diaryImageProgress, setDiaryImageProgress] = useState<number>(0);
  const [savedDiaryEntries, setSavedDiaryEntries] = useState<Array<{
    id: string;
    date: string;
    content: string;
    mood: string;
    weather: string;
    images: string[];
    createdAt: string;
  }>>([]);
  const [showDiaryGallery, setShowDiaryGallery] = useState<boolean>(false);
  
  // AI 그림일기 챗봇 관련 상태 관리
  const [diaryChatMessages, setDiaryChatMessages] = useState<Array<{
    id: string;
    type: 'user' | 'ai';
    message: string;
    timestamp: Date;
  }>>([]);
  
  // AI 그림일기 챗봇 대화창 자동 스크롤을 위한 ref
  const diaryChatContainerRef = useRef<HTMLDivElement>(null);
  
  // AI 그림일기 챗봇 대화창 자동 스크롤 효과
  useEffect(() => {
    if (diaryChatContainerRef.current) {
      diaryChatContainerRef.current.scrollTop = diaryChatContainerRef.current.scrollHeight;
    }
  }, [diaryChatMessages]);
  const [diaryChatInput, setDiaryChatInput] = useState("");
  const [isDiaryChatLoading, setIsDiaryChatLoading] = useState(false);
  const [diaryChatMode, setDiaryChatMode] = useState<'text' | 'voice'>('text');
  const [isDiaryVoiceRecording, setIsDiaryVoiceRecording] = useState(false);
  const [diaryChatContext, setDiaryChatContext] = useState<{
    currentTopic: string;
    collectedInfo: {
      mood?: string;
      weather?: string;
      activities?: string[];
      feelings?: string[];
    };
    conversationStep: 'greeting' | 'mood' | 'weather' | 'activities' | 'feelings' | 'summary' | 'complete';
  }>({
    currentTopic: '',
    collectedInfo: {},
    conversationStep: 'greeting'
  });
  // AI 가계부 관련 상태
  const [aiFinanceItem, setAiFinanceItem] = useState("");
  const [aiFinanceAmount, setAiFinanceAmount] = useState("");
  const [aiFinanceCategory, setAiFinanceCategory] = useState("");
  const [aiFinanceMemo, setAiFinanceMemo] = useState("");
  
  // Notion 연동 관련 상태
  const [notionConnected, setNotionConnected] = useState(false);
  const [notionDatabases, setNotionDatabases] = useState<NotionDatabase[]>([]);
  const [selectedNotionDatabase, setSelectedNotionDatabase] = useState<string>("");
  const [showNotionSettings, setShowNotionSettings] = useState(false);
  const [notionConnectionStatus, setNotionConnectionStatus] = useState<string>("");
  const [notionApiKey, setNotionApiKey] = useState<string>("");
  const [notionDatabaseId, setNotionDatabaseId] = useState<string>("");
  const [isNotionLoading, setIsNotionLoading] = useState(false);
  
  // AI 가계부 고급 기능 상태
  const [financeTransactions, setFinanceTransactions] = useState<DBFinanceTransaction[]>([]);
  const [financeChatMessages, setFinanceChatMessages] = useState<FinanceChatMessage[]>([]);
  
  // 월간 보고서 다운로드용 상태
  const [selectedReportYear, setSelectedReportYear] = useState(new Date().getFullYear());
  const [selectedReportMonth, setSelectedReportMonth] = useState(new Date().getMonth() + 1);
  
  // Notion 연동 함수들
  const testNotionAPI = async () => {
    try {
      setNotionConnectionStatus("연결 중...");
      const result = await testNotionConnection();
      if (result.success) {
        setNotionConnected(true);
        setNotionConnectionStatus(result.message);
        await loadNotionDatabases();
      } else {
        setNotionConnected(false);
        setNotionConnectionStatus(result.message);
        alert(result.message);
      }
    } catch (error) {
      console.error('Notion 연결 테스트 오류:', error);
      setNotionConnectionStatus("연결 오류");
      alert('Notion 연결 중 오류가 발생했습니다.');
    }
  };

  const loadNotionDatabases = async () => {
    try {
      const databases = await getNotionDatabases();
      setNotionDatabases(databases);
    } catch (error) {
      console.error('Notion 데이터베이스 로드 오류:', error);
    }
  };

  const saveToNotion = async (type: 'diary' | 'finance' | 'autobiography', data: any) => {
    if (!selectedNotionDatabase) {
      alert('Notion 데이터베이스를 선택해주세요.');
      return false;
    }

    try {
      let success = false;
      
      switch (type) {
        case 'diary':
          success = await saveAIDiaryToNotion(
            selectedNotionDatabase,
            data.content,
            data.emotion,
            data.date
          ) !== null;
          break;
        case 'finance':
          success = await saveAIFinanceToNotion(
            selectedNotionDatabase,
            data
          ) !== null;
          break;
        case 'autobiography':
          success = await saveAutobiographyToNotion(
            selectedNotionDatabase,
            data.sectionTitle,
            data.content,
            data.birthYear
          ) !== null;
          break;
      }

      if (success) {
        alert('Notion에 성공적으로 저장되었습니다!');
        return true;
      } else {
        alert('Notion 저장에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Notion 저장 오류:', error);
      alert('Notion 저장 중 오류가 발생했습니다.');
      return false;
    }
  };

  // AI 그림일기 저장 함수
  const saveDiaryEntry = (content: string, mood: string, weather: string, images: string[]) => {
    const newEntry = {
      id: generateUniqueId(),
      date: new Date().toISOString().split('T')[0],
      content,
      mood,
      weather,
      images,
      createdAt: new Date().toISOString()
    };
    
    const updatedEntries = [newEntry, ...savedDiaryEntries];
    setSavedDiaryEntries(updatedEntries);
    
    // 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedDiaryEntries', JSON.stringify(updatedEntries));
    }
    
    return newEntry;
  };

  // AI 그림일기 로드 함수
  const loadSavedDiaryEntries = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedDiaryEntries');
      if (saved) {
        try {
          const entries = JSON.parse(saved);
          setSavedDiaryEntries(entries);
        } catch (error) {
          console.error('저장된 일기 로드 오류:', error);
        }
      }
    }
  };

  // AI 그림일기 삭제 함수
  const deleteDiaryEntry = (id: string) => {
    const updatedEntries = savedDiaryEntries.filter(entry => entry.id !== id);
    setSavedDiaryEntries(updatedEntries);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedDiaryEntries', JSON.stringify(updatedEntries));
    }
  };

  // AI 그림일기 챗봇 메시지 추가 함수
  const addDiaryChatMessage = (type: 'user' | 'ai', message: string) => {
    const newMessage = {
      id: generateUniqueId(),
      type,
      message,
      timestamp: new Date()
    };
    setDiaryChatMessages(prev => [...prev, newMessage]);
  };
  // AI 그림일기 챗봇 응답 생성 함수
  const generateDiaryChatResponse = async (userMessage: string) => {
    setIsDiaryChatLoading(true);
    
    try {
      const { conversationStep, collectedInfo } = diaryChatContext;
      
      let aiResponse = '';
      let nextStep = conversationStep;
      let updatedInfo = { ...collectedInfo };
      
      switch (conversationStep) {
        case 'greeting':
          aiResponse = `안녕하세요! 오늘 하루는 어땠나요? 😊\n\n기분이 어떤지 알려주세요. 기쁨, 슬픔, 화남, 평온, 설렘, 피곤, 스트레스, 감사 중에서 선택하거나 자유롭게 말씀해주세요.`;
          nextStep = 'mood';
          break;
          
        case 'mood':
          // 기분 정보 추출 및 저장
          const moodKeywords = ['기쁨', '슬픔', '화남', '평온', '설렘', '피곤', '스트레스', '감사'];
          const detectedMood = moodKeywords.find(keyword => userMessage.includes(keyword)) || userMessage;
          updatedInfo.mood = detectedMood;
          
          aiResponse = `${detectedMood}한 기분이시군요! 오늘 날씨는 어땠나요?\n\n맑음, 흐림, 비, 눈, 안개, 바람, 더움, 추움 중에서 선택하거나 자유롭게 말씀해주세요.`;
          nextStep = 'weather';
          break;
          
        case 'weather':
          // 날씨 정보 추출 및 저장
          const weatherKeywords = ['맑음', '흐림', '비', '눈', '안개', '바람', '더움', '추움'];
          const detectedWeather = weatherKeywords.find(keyword => userMessage.includes(keyword)) || userMessage;
          updatedInfo.weather = detectedWeather;
          
          aiResponse = `${detectedWeather}한 날씨였군요! 오늘 어떤 일들을 하셨나요?\n\n자세히 이야기해주시면 더 멋진 그림일기를 만들어드릴게요!`;
          nextStep = 'activities';
          break;
          
        case 'activities':
          // 활동 정보 수집
          if (!updatedInfo.activities) updatedInfo.activities = [];
          updatedInfo.activities.push(userMessage);
          
          aiResponse = `정말 재미있는 하루였네요! 그런 일들을 하시면서 어떤 감정을 느끼셨나요?\n\n더 자세한 감정이나 생각을 들려주세요.`;
          nextStep = 'feelings';
          break;
          
        case 'feelings':
          // 감정 정보 수집
          if (!updatedInfo.feelings) updatedInfo.feelings = [];
          updatedInfo.feelings.push(userMessage);
          
          // 일기 내용 생성
          const diaryContent = `오늘은 ${updatedInfo.weather}한 날씨였고, ${updatedInfo.mood}한 기분으로 하루를 보냈습니다. ${updatedInfo.activities?.join(' 그리고 ') || ''} ${updatedInfo.feelings?.join(' 그리고 ') || ''}`;
          
          aiResponse = `완벽해요! 이제 오늘 하루를 정리해드릴게요:\n\n📅 ${new Date().toLocaleDateString()}\n😊 기분: ${updatedInfo.mood}\n🌤️ 날씨: ${updatedInfo.weather}\n📝 내용: ${diaryContent}\n\n이 내용으로 4컷 그림일기를 만들어드릴까요?`;
          nextStep = 'summary';
          
          // 상태 업데이트
          setAiDiaryContent(diaryContent);
          setAiDiaryMood(updatedInfo.mood || '');
          setAiDiaryWeather(updatedInfo.weather || '');
          break;
          
        case 'summary':
          if (userMessage.includes('네') || userMessage.includes('좋아') || userMessage.includes('만들어') || userMessage.includes('그래')) {
            aiResponse = `좋아요! 지금 바로 4컷 그림일기를 만들어드릴게요. 잠시만 기다려주세요! 🎨`;
            nextStep = 'complete';
            
            // 그림 생성 시작
            setTimeout(async () => {
              await generateDiaryImages(aiDiaryContent, aiDiaryMood, aiDiaryWeather);
            }, 1000);
          } else {
            aiResponse = `그럼 다른 내용으로 다시 이야기해볼까요? 오늘 하루는 어땠나요?`;
            nextStep = 'mood';
            updatedInfo = {};
          }
          break;
          
        default:
          aiResponse = `오늘 하루는 어땠나요? 기분이 어떤지 알려주세요.`;
          nextStep = 'mood';
          updatedInfo = {};
      }
      
      // 컨텍스트 업데이트
      setDiaryChatContext({
        currentTopic: userMessage,
        collectedInfo: updatedInfo,
        conversationStep: nextStep
      });
      
      return aiResponse;
    } catch (error) {
      console.error('AI 그림일기 챗봇 응답 생성 오류:', error);
      return '죄송해요. 다시 시도해주세요.';
    } finally {
      setIsDiaryChatLoading(false);
    }
  };

  // AI 그림일기 챗봇 메시지 전송 함수
  const sendDiaryChatMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // 사용자 메시지 추가
    addDiaryChatMessage('user', message);
    setDiaryChatInput('');
    
    // AI 응답 생성
    const aiResponse = await generateDiaryChatResponse(message);
    addDiaryChatMessage('ai', aiResponse);
  };

  // AI 그림일기 챗봇 음성 인식 시작
  const startDiaryVoiceRecognition = () => {
    if (!recognitionRef.current) return;
    
    setIsDiaryVoiceRecording(true);
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'ko-KR';
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDiaryChatInput(transcript);
      sendDiaryChatMessage(transcript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('음성 인식 오류:', event.error);
      setIsDiaryVoiceRecording(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsDiaryVoiceRecording(false);
    };
    
    recognitionRef.current.start();
  };

  // AI 그림일기 챗봇 음성 인식 중지
  const stopDiaryVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsDiaryVoiceRecording(false);
    }
  };

  // AI 그림일기 챗봇 초기화
  const resetDiaryChat = () => {
    setDiaryChatMessages([]);
    setDiaryChatInput('');
    setDiaryChatContext({
      currentTopic: '',
      collectedInfo: {},
      conversationStep: 'greeting'
    });
    setAiDiaryContent('');
    setAiDiaryMood('');
    setAiDiaryWeather('');
    setDiaryImages([]);
  };

  // AI 그림일기 4컷 그림 생성 함수
  const generateDiaryImages = async (diaryContent: string, mood: string, weather: string) => {
    setIsGeneratingDiaryImages(true);
    setDiaryImageProgress(0);
    setDiaryImages([]);

    try {
      // 일기 내용을 4개의 장면으로 나누기
      const scenes = await generateDiaryScenes(diaryContent, mood, weather);
      
      const generatedImages: string[] = [];
      
      for (let i = 0; i < 4; i++) {
        setDiaryImageProgress((i + 1) * 25);
        
        const scene = scenes[i];
        const imageUrl = await generateImageWithOpenAI(scene);
        
        if (imageUrl) {
          generatedImages.push(imageUrl);
          setDiaryImages([...generatedImages]);
        }
        
        // 각 이미지 생성 사이에 약간의 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setDiaryImageProgress(100);
      
      // 그림 생성 완료 후 자동 저장
      if (generatedImages.length > 0) {
        const savedEntry = saveDiaryEntry(diaryContent, mood, weather, generatedImages);
        alert(`4컷 그림일기가 성공적으로 저장되었습니다!\n\n제목: ${savedEntry.date}의 일기\n기분: ${savedEntry.mood}\n날씨: ${savedEntry.weather}`);
      }
      
      return generatedImages;
    } catch (error) {
      console.error('그림 생성 오류:', error);
      alert('그림 생성 중 오류가 발생했습니다.');
      return [];
    } finally {
      setIsGeneratingDiaryImages(false);
    }
  };

  // 일기 내용을 4개의 장면으로 나누는 함수
  const generateDiaryScenes = async (content: string, mood: string, weather: string): Promise<string[]> => {
    const prompt = `
당신은 창의적인 그림일기 작가입니다. 다음 일기 내용을 4개의 연속적인 장면으로 나누어주세요.
📖 일기 내용: ${content}
😊 기분: ${mood}
🌤️ 날씨: ${weather}

각 장면은 다음과 같은 특징을 가져야 합니다:
- 구체적이고 시각적으로 표현 가능한 내용
- 감정과 분위기가 잘 드러나는 장면
- 연속성 있는 스토리텔링
- 한국적인 감성과 문화적 요소 반영

4개의 장면을 다음과 같은 형식으로 응답해주세요:
1. [첫 번째 장면: 하루의 시작이나 첫 번째 활동]
2. [두 번째 장면: 주요 활동이나 특별한 순간]
3. [세 번째 장면: 감정의 절정이나 중요한 경험]
4. [네 번째 장면: 하루의 마무리나 깨달음]

각 장면은 20자 이내로 간결하게 작성해주세요.
`;

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'gpt-3.5-turbo',
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API 호출 실패');
      }

      const data = await response.json();
      const scenesText = data.choices[0].message.content;
      
      // 응답을 4개의 장면으로 파싱
      const scenes = scenesText.split(/\d+\.\s*/).filter(scene => scene.trim());
      return scenes.slice(0, 4);
    } catch (error) {
      console.error('장면 생성 오류:', error);
      // 기본 장면 반환
      return [
        `${mood}한 기분으로 ${weather}한 날씨를 바라보는 모습`,
        `일기 내용의 첫 번째 부분을 상상하는 모습`,
        `일기 내용의 두 번째 부분을 경험하는 모습`,
        `일기를 마무리하며 ${mood}한 마음을 담는 모습`
      ];
    }
  };

  // 사용자 기본정보를 포함한 이미지 프롬프트 생성 함수
  const generateUserBasedImagePrompt = (basePrompt: string): string => {
    // 사용자 기본정보 가져오기
    const userName = name.trim() || '사용자';
    const userAge = userBirthYear ? new Date().getFullYear() - parseInt(userBirthYear.substring(0, 4)) : 25;
    const userGenderValue = userGender || '남성';
    const userImageStyle = imageStyle || '동화';
    
    // 성별에 따른 캐릭터 설명
    const genderDescription = userGenderValue === '남성' ? 'male character, boy' : 'female character, girl';
    
    // 나이에 따른 연령대 설명
    let ageDescription = '';
    if (userAge < 10) ageDescription = 'young child, kid';
    else if (userAge < 20) ageDescription = 'teenager, adolescent';
    else if (userAge < 30) ageDescription = 'young adult';
    else if (userAge < 50) ageDescription = 'adult';
    else ageDescription = 'mature adult';
    
    // 이미지 스타일에 따른 스타일 설명
    let styleDescription = '';
    switch (userImageStyle) {
      case '동화':
        styleDescription = 'fairy tale illustration style, whimsical, magical';
        break;
      case '일러스트':
        styleDescription = 'modern illustration style, clean lines, vibrant colors';
        break;
      case '수채화':
        styleDescription = 'watercolor painting style, soft colors, flowing brushstrokes';
        break;
      case '만화':
        styleDescription = 'anime/manga style, cute, expressive';
        break;
      case '사실적':
        styleDescription = 'realistic illustration style, detailed, lifelike';
        break;
      default:
        styleDescription = 'fairy tale illustration style, whimsical, magical';
    }
    
    // 사용자 정보를 포함한 프롬프트 생성
    const userInfo = `${userName} (${userAge} years old, ${genderDescription}, ${ageDescription})`;
    
    return `${basePrompt}, featuring ${userInfo}, ${styleDescription}, 아름다운 일러스트 스타일, 따뜻한 색감, 한국적인 감성, 수채화 느낌, 부드러운 선, 감성적인 분위기, 높은 품질`;
  };

  // OpenAI DALL-E를 사용한 이미지 생성 함수
  const generateImageWithOpenAI = async (prompt: string): Promise<string | null> => {
    try {
      // 사용자 정보를 포함한 프롬프트 생성
      const enhancedPrompt = generateUserBasedImagePrompt(prompt);
      
      const response = await fetch('/api/dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024'
        })
      });

      if (!response.ok) {
        throw new Error('DALL-E API 호출 실패');
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      return null;
    }
  };

  // 가계부 데이터 로드 함수
  const loadFinanceData = async () => {
    try {
      console.log('loadFinanceData 시작');
      
      // 현재 로그인된 사용자 정보 가져오기
      const tempUserStr = localStorage.getItem('tempUser');
      const currentUser = tempUserStr ? JSON.parse(tempUserStr) : null;

      console.log('currentUser 정보:', currentUser);

      if (!currentUser?.id) {
        console.warn('No user logged in, using local storage only');
        return;
      }

      console.log('DB에서 가계부 데이터 로드 시작 - userId:', currentUser.id);

      // DB에서 가계부 데이터 로드
      const transactions = await getDBFinanceTransactions(currentUser.id);
      console.log('거래 내역 로드 완료:', transactions);
      setFinanceTransactions(transactions);
      
      // DB에서 채팅 메시지 로드
      const messages = await getFinanceChatMessages(currentUser.id);
      console.log('채팅 메시지 로드 완료:', messages);
      setFinanceChatMessages(messages);
      
      // 통계 업데이트
      updateFinanceAnalysis();
    } catch (error) {
      console.error('Error loading finance data:', error);
    }
  };
  
  const [financeChatInput, setFinanceChatInput] = useState("");
  const [showFinanceChat, setShowFinanceChat] = useState(false);
  const [financeAnalysis, setFinanceAnalysis] = useState<{
    monthlyTotal: number;
    monthlyExpense: number;
    monthlyIncome: number;
    categoryBreakdown: Record<string, number>;
    savingsGoal: number;
    currentSavings: number;
    recommendations: string[];
  }>({
    monthlyTotal: 0,
    monthlyExpense: 0,
    monthlyIncome: 0,
    categoryBreakdown: {},
    savingsGoal: 0,
    currentSavings: 0,
    recommendations: []
  });
  
  const [budgetGoals, setBudgetGoals] = useState<Array<{
    id: string;
    category: string;
    amount: number;
    spent: number;
    period: 'monthly' | 'yearly';
  }>>([]);
  const [aiAlbumDescription, setAiAlbumDescription] = useState("");
  const [aiAlbumFile, setAiAlbumFile] = useState<File | null>(null);
  const [aiAlbumTitle, setAiAlbumTitle] = useState("");
  const [aiAlbumIsPublic, setAiAlbumIsPublic] = useState(false);
  const [aiAlbumUploading, setAiAlbumUploading] = useState(false);
  const [aiAlbumStyle, setAiAlbumStyle] = useState("원본");
  const [aiAlbumTextDescription, setAiAlbumTextDescription] = useState("");
  const [aiAlbumProcessing, setAiAlbumProcessing] = useState(false);
  const [aiAlbumPreview, setAiAlbumPreview] = useState<string | null>(null);

  // 이미지 스타일 변환 함수
  const transformImageStyle = async (imageFile: File, style: string): Promise<string | null> => {
    try {
      setAiAlbumProcessing(true);
      
      // 이미지를 Base64로 변환
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(imageFile);
      });

      // 스타일에 따른 프롬프트 생성
      let stylePrompt = "";
      switch (style) {
        case "동화":
          stylePrompt = "fairy tale illustration style, magical, whimsical, storybook art";
          break;
        case "수채화":
          stylePrompt = "watercolor painting style, soft colors, flowing brushstrokes";
          break;
        case "유화":
          stylePrompt = "oil painting style, rich colors, textured brushwork";
          break;
        case "만화":
          stylePrompt = "anime style, vibrant colors, cartoon illustration";
          break;
        case "사진":
          stylePrompt = "photorealistic style, high quality photography";
          break;
        case "인상주의":
          stylePrompt = "impressionist painting style, loose brushstrokes, light effects";
          break;
        case "추상":
          stylePrompt = "abstract art style, geometric shapes, modern art";
          break;
        default:
          return base64Image; // 원본 반환
      }

      // DALL-E API를 사용하여 이미지 변환
      const response = await fetch('/api/dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Transform this image into ${stylePrompt}, maintain the original composition and subject`,
          n: 1,
          size: '1024x1024'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].url) {
          return data.data[0].url;
        }
      }
      
      return base64Image; // 변환 실패 시 원본 반환
    } catch (error) {
      console.error('이미지 스타일 변환 오류:', error);
      return null;
    } finally {
      setAiAlbumProcessing(false);
    }
  };

  // 이미지 텍스트 설명 생성 함수
  const generateImageDescription = async (imageFile: File): Promise<string> => {
    try {
      // 이미지를 Base64로 변환
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(imageFile);
      });

      // OpenAI API를 사용하여 이미지 설명 생성
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '이 이미지를 자세히 설명해주세요. 이미지의 내용, 분위기, 색감, 구도 등을 포함하여 한국어로 설명해주세요.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          model: 'gpt-4-vision-preview',
          max_tokens: 300
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
      
      return "이미지 설명을 생성할 수 없습니다.";
    } catch (error) {
      console.error('이미지 설명 생성 오류:', error);
      return "이미지 설명을 생성할 수 없습니다.";
    }
  };

  // AI 앨범 저장 함수
  const saveAIAlbumToBoard = async (imageUrl: string, title: string, description: string, isPublic: boolean, style: string = "원본", textDescription: string = "") => {
    try {
      const tempUserStr = localStorage.getItem('tempUser');
      const currentUser = tempUserStr ? JSON.parse(tempUserStr) : null;
      
      if (!currentUser?.id) {
        alert('로그인이 필요합니다.');
        return false;
      }

      // Supabase에 저장 (실제 구현 시)
      // const result = await saveAIAlbum(currentUser.id, imageUrl, description, isPublic);
      
      // 로컬 스토리지에 임시 저장
      const newAlbum = {
        id: generateUniqueId(),
        user_id: currentUser.id,
        image_url: imageUrl,
        title: title,
        description: description,
        style: style,
        text_description: textDescription,
        is_public: isPublic,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const existingAlbums = JSON.parse(localStorage.getItem('aiAlbums') || '[]');
      existingAlbums.push(newAlbum);
      localStorage.setItem('aiAlbums', JSON.stringify(existingAlbums));

      return true;
    } catch (error) {
      console.error('AI 앨범 저장 오류:', error);
      return false;
    }
  };

  // 대화 맥락 관리 상태
  const [conversationContext, setConversationContext] = useState<{
    topic: string;
    mood: string;
    lastUserMessage: string;
    conversationHistory: string[];
    userPreferences: string[];
    currentEmotion: string;
  }>({
    topic: "",
    mood: "neutral",
    lastUserMessage: "",
    conversationHistory: [],
    userPreferences: [],
    currentEmotion: "general"
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // AI가계부 페이지 로드 시 사용자별 데이터 불러오기
  useEffect(() => {
    if (showAIFinance) {
      loadFinanceData();
    }
  }, [showAIFinance]);

  // AI 그림일기 챗봇 페이지 로드 시 첫 메시지 자동 전송
  useEffect(() => {
    if (showAIDiary && diaryChatMessages.length === 0) {
      // 페이지 로드 후 약간의 지연을 두고 첫 메시지 전송
      const timer = setTimeout(() => {
        sendDiaryChatMessage('시작');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [showAIDiary]);

  // 자동저장 관련 함수들은 useAuth 훅에서 관리됨

  // 대화 맥락 초기화 함수
  const resetConversationContext = () => {
    setConversationContext({
      topic: "",
      mood: "neutral",
      lastUserMessage: "",
      conversationHistory: [],
      userPreferences: [],
      currentEmotion: "general"
    });
  };
  // AI 대화 메시지 추가 함수는 useAIChat 훅에서 관리됨
  // addAIChatMessage 함수는 useAIChat 훅에서 제공됨
  // 사용자 정보 기반 캐릭터 생성 함수
  const generateUserBasedCharacter = (userName: string, userGender: string, userAge: number) => {
    const ageGroup = userAge < 20 ? '청소년' : userAge < 30 ? '20대' : userAge < 40 ? '30대' : userAge < 50 ? '40대' : '50대+';
    
    // 성별과 나이에 따른 캐릭터 설정
    if (userGender === '남성') {
      if (userAge < 25) {
        return {
          name: "선배",
          emoji: "👨‍🎓",
          personality: "친근하고 조언해주는",
          greeting: `안녕! 오늘도 힘내고 있어?`,
          responses: {
            general: [
              `정말 그랬구나! 더 자세히 들려줘 👨‍🎓`,
              `그런 일이 있었구나. 괜찮아? 선배가 옆에 있을게 😊`,
              `와, 정말 대단해! 자랑스러워해 👏`,
              `그런 생각을 하다니 너무 멋져! 💪`,
              `괜찮아, 내가 들어줄게. 더 이야기해봐 💖`
            ],
            happy: [
              `너무 좋아! 네가 행복해 보여서 나도 기뻐 👨‍🎓`,
              `와, 정말 축하해! 함께 기뻐하고 싶어 😊`,
              `너무 멋진 일이야! 더 자세히 들려줘 👏`,
              `정말 대단해! 자랑스러워해 💪`,
              `너무 좋아! 나도 기뻐해 💖`
            ],
            sad: [
              `괜찮아, 내가 옆에 있을게. 더 이야기해봐 👨‍🎓`,
              `그런 일이 있었구나. 많이 힘들었겠어 😔`,
              `내가 들어줄게. 더 자세히 들려줘 💖`,
              `괜찮아, 시간이 지나면 나아질 거야 😊`,
              `내가 응원할게! 힘내 💪`
            ],
            angry: [
              `그런 일이 있었구나. 많이 화났겠어 😤`,
              `이해해, 정말 화나는 일이야 💢`,
              `내가 옆에서 응원할게! 힘내 💪`,
              `그런 일이 있었구나. 많이 속상했겠어 😔`,
              `내가 들어줄게. 더 이야기해봐 💖`
            ],
            question: [
              `흥미로운 질문이야! 더 자세히 설명해줘 🤔`,
              `그런 질문을 하다니 궁금해하시는군요! 💭`,
              `좋은 질문이야! 함께 생각해보자 🤔`,
              `그런 관점은 처음 들어보는데, 정말 좋은 생각이야! ✨`,
              `정말 흥미로운 질문이야! 더 들려주고 싶어 💕`
            ]
          }
        };
      } else {
        return {
          name: "동료",
          emoji: "👨‍💼",
          personality: "성숙하고 이해심 깊은",
          greeting: `안녕하세요! 오늘도 좋은 하루 되시고 계신가요?`,
          responses: {
            general: [
              `정말 그랬군요! 더 자세히 들려주세요 👨‍💼`,
              `그런 일이 있었군요. 괜찮으신가요? 제가 옆에 있겠습니다 😊`,
              `와, 정말 대단하시네요! 자랑스러워하세요 👏`,
              `그런 생각을 하시다니 너무 멋지세요! 💪`,
              `괜찮습니다, 제가 들어드리겠습니다. 더 이야기해보세요 💖`
            ],
            happy: [
              `너무 좋으시겠어요! 행복해 보여서 저도 기뻐요 👨‍💼`,
              `정말 축하드립니다! 함께 기뻐하고 싶어요 😊`,
              `너무 멋진 일이네요! 더 자세히 들려주세요 👏`,
              `정말 대단하세요! 자랑스러워하세요 💪`,
              `너무 좋아요! 저도 기뻐요 💖`
            ],
            sad: [
              `괜찮습니다, 제가 옆에 있겠습니다. 더 이야기해보세요 👨‍💼`,
              `그런 일이 있었군요. 많이 힘드셨겠어요 😔`,
              `제가 들어드리겠습니다. 더 자세히 들려주세요 💖`,
              `괜찮습니다, 시간이 지나면 나아질 거예요 😊`,
              `제가 응원하겠습니다! 힘내세요 💪`
            ],
            angry: [
              `그런 일이 있었군요. 많이 화나셨겠어요 😤`,
              `이해합니다, 정말 화나는 일이네요 💢`,
              `제가 옆에서 응원하겠습니다! 힘내세요 💪`,
              `그런 일이 있었군요. 많이 속상하셨겠어요 😔`,
              `제가 들어드리겠습니다. 더 이야기해보세요 💖`
            ],
            question: [
              `흥미로운 질문이네요! 더 자세히 설명해주세요 🤔`,
              `그런 질문을 하시다니 궁금해하시는군요! 💭`,
              `좋은 질문이네요! 함께 생각해보면 좋겠어요 🤔`,
              `그런 관점은 처음 들어보는데, 정말 좋은 생각이네요! ✨`,
              `정말 흥미로운 질문이에요! 더 들려주고 싶어요 💕`
            ]
          }
        };
      }
    } else if (userGender === '여성') {
      if (userAge < 25) {
        return {
          name: "언니",
          emoji: "👩‍🎓",
          personality: "따뜻하고 보호하는",
          greeting: `어머, 안녕! 오늘도 예쁘게 지내고 있어?`,
          responses: {
            general: [
              `어머, 정말 그랬구나! 더 자세히 들려줘 👩‍🎓`,
              `그런 일이 있었구나. 괜찮아? 언니가 옆에 있을게 😊`,
              `와, 정말 대단해! 자랑스러워해 👏`,
              `그런 생각을 하다니 너무 멋져! 💪`,
              `어머, 괜찮아! 언니가 들어줄게. 더 이야기해봐 💕`
            ],
            happy: [
              `어머, 너무 좋아! 네가 행복해 보여서 언니도 기뻐 👩‍🎓`,
              `와, 정말 축하해! 함께 기뻐하고 싶어 😊`,
              `너무 멋진 일이야! 더 자세히 들려줘 👏`,
              `정말 대단해! 자랑스러워해 💪`,
              `어머, 너무 좋아! 언니도 기뻐해 💕`
            ],
            sad: [
              `어머, 괜찮아! 언니가 옆에 있을게. 더 이야기해봐 👩‍🎓`,
              `그런 일이 있었구나. 많이 힘들었겠어 😔`,
              `언니가 들어줄게. 더 자세히 들려줘 💕`,
              `어머, 괜찮아! 시간이 지나면 나아질 거야 😊`,
              `언니가 응원할게! 힘내 💪`
            ],
            angry: [
              `어머, 그런 일이 있었구나. 많이 화났겠어 😤`,
              `이해해, 정말 화나는 일이야 💢`,
              `언니가 옆에서 응원할게! 힘내 💪`,
              `그런 일이 있었구나. 많이 속상했겠어 😔`,
              `언니가 들어줄게. 더 이야기해봐 💕`
            ],
            question: [
              `어머, 흥미로운 질문이야! 더 자세히 설명해줘 🤔`,
              `그런 질문을 하다니 궁금해하시는군요! 💭`,
              `좋은 질문이야! 함께 생각해보자 🤔`,
              `그런 관점은 처음 들어보는데, 정말 좋은 생각이야! ✨`,
              `정말 흥미로운 질문이야! 더 들려주고 싶어 💕`
            ]
          }
        };
      } else {
        return {
          name: "동료",
          emoji: "👩‍💼",
          personality: "성숙하고 공감 능력이 뛰어난",
          greeting: `안녕하세요! 오늘도 좋은 하루 되시고 계신가요?`,
          responses: {
            general: [
              `정말 그랬군요! 더 자세히 들려주세요 👩‍💼`,
              `그런 일이 있었군요. 괜찮으신가요? 제가 옆에 있겠습니다 😊`,
              `와, 정말 대단하시네요! 자랑스러워하세요 👏`,
              `그런 생각을 하시다니 너무 멋지세요! 💪`,
              `괜찮습니다, 제가 들어드리겠습니다. 더 이야기해보세요 💕`
            ],
            happy: [
              `너무 좋으시겠어요! 행복해 보여서 저도 기뻐요 👩‍💼`,
              `정말 축하드립니다! 함께 기뻐하고 싶어요 😊`,
              `너무 멋진 일이네요! 더 자세히 들려주세요 👏`,
              `정말 대단하세요! 자랑스러워하세요 💪`,
              `너무 좋아요! 저도 기뻐요 💕`
            ],
            sad: [
              `괜찮습니다, 제가 옆에 있겠습니다. 더 이야기해보세요 👩‍💼`,
              `그런 일이 있었군요. 많이 힘드셨겠어요 😔`,
              `제가 들어드리겠습니다. 더 자세히 들려주세요 💕`,
              `괜찮습니다, 시간이 지나면 나아질 거예요 😊`,
              `제가 응원하겠습니다! 힘내세요 💪`
            ],
            angry: [
              `그런 일이 있었군요. 많이 화나셨겠어요 😤`,
              `이해합니다, 정말 화나는 일이네요 💢`,
              `제가 옆에서 응원하겠습니다! 힘내세요 💪`,
              `그런 일이 있었군요. 많이 속상하셨겠어요 😔`,
              `제가 들어드리겠습니다. 더 이야기해보세요 💕`
            ],
            question: [
              `흥미로운 질문이네요! 더 자세히 설명해주세요 🤔`,
              `그런 질문을 하시다니 궁금해하시는군요! 💭`,
              `좋은 질문이네요! 함께 생각해보면 좋겠어요 🤔`,
              `그런 관점은 처음 들어보는데, 정말 좋은 생각이네요! ✨`,
              `정말 흥미로운 질문이에요! 더 들려주고 싶어요 💕`
            ]
          }
        };
      }
    } else {
      // 기타 성별의 경우 기본 캐릭터
      return {
        name: "친구",
        emoji: "🎭",
        personality: "친근하고 편안한",
        greeting: `안녕! 오늘도 좋은 하루 보내고 있어?`,
        responses: {
          general: [
            `흥미로운 이야기네요! 더 자세히 들려주세요 😊`,
            `그런 생각을 하시다니 정말 좋아요! 💭`,
            `정말 멋진 관점이에요! 더 이야기해보고 싶어요 ✨`,
            `그런 경험이 있었군요. 어떻게 느끼셨나요? 🤔`,
            `좋은 대화 주제네요! 더 깊이 이야기해보자요 💕`
          ],
          happy: [
            `와, 정말 좋아! 함께 기뻐하고 싶어 😊`,
            `축하해! 정말 멋진 일이야 👏`,
            `너무 좋아! 더 자세히 들려줘 ✨`,
            `정말 대단해! 자랑스러워해 💪`,
            `와, 정말 기뻐! 나도 기뻐해 💕`
          ],
          sad: [
            `괜찮아, 내가 옆에 있을게. 더 이야기해봐 😊`,
            `그런 일이 있었구나. 많이 힘들었겠어 😔`,
            `내가 들어줄게. 더 자세히 들려줘 💕`,
            `괜찮아, 시간이 지나면 나아질 거야 😊`,
            `내가 응원할게! 힘내 💪`
          ],
          angry: [
            `그런 일이 있었구나. 많이 화났겠어 😤`,
            `이해해, 정말 화나는 일이야 💢`,
            `내가 옆에서 응원할게! 힘내 💪`,
            `그런 일이 있었구나. 많이 속상했겠어 😔`,
            `내가 들어줄게. 더 이야기해봐 💕`
          ],
          question: [
            `흥미로운 질문이야! 더 자세히 설명해줘 🤔`,
            `그런 질문을 하다니 궁금해하시는군요! 💭`,
            `좋은 질문이야! 함께 생각해보자 🤔`,
            `그런 관점은 처음 들어보는데, 정말 좋은 생각이야! ✨`,
            `정말 흥미로운 질문이야! 더 들려주고 싶어 💕`
          ]
        }
      };
    }
  };

  // 기본 캐릭터 정보 (사용자 정보가 없을 때 사용)
  const characterInfo = {
    "남자친구": {
      name: "남자친구",
      emoji: "💕",
      personality: "따뜻하고 이해심 깊은",
      greeting: "안녕! 오늘도 좋은 하루 보내고 있어?",
      responses: {
        general: [
          "정말 그랬구나! 더 자세히 들려줘 💕",
          "그런 일이 있었구나. 괜찮아? 내가 옆에 있을게 😊",
          "와, 정말 대단해! 자랑스러워해 👏",
          "그런 생각을 하다니 너무 멋져! 💪",
          "괜찮아, 내가 들어줄게. 더 이야기해봐 💖"
        ],
        happy: [
          "너무 좋아! 네가 행복해 보여서 나도 기뻐 💕",
          "와, 정말 축하해! 함께 기뻐하고 싶어 😊",
          "너무 멋진 일이야! 더 자세히 들려줘 👏",
          "정말 대단해! 자랑스러워해 💪",
          "너무 좋아! 나도 기뻐해 💖"
        ],
        sad: [
          "괜찮아, 내가 옆에 있을게. 더 이야기해봐 💕",
          "그런 일이 있었구나. 많이 힘들었겠어 😔",
          "내가 들어줄게. 더 자세히 들려줘 💖",
          "괜찮아, 시간이 지나면 나아질 거야 😊",
          "내가 응원할게! 힘내 💪"
        ],
        angry: [
          "그런 일이 있었구나. 많이 화났겠어 😤",
          "이해해, 정말 화나는 일이야 💢",
          "내가 옆에서 응원할게! 힘내 💪",
          "그런 일이 있었구나. 많이 속상했겠어 😔",
          "내가 들어줄게. 더 이야기해봐 💖"
        ],
        question: [
          "흥미로운 질문이야! 더 자세히 설명해줘 🤔",
          "그런 질문을 하다니 궁금해하시는군요! 💭",
          "좋은 질문이야! 함께 생각해보자 🤔",
          "그런 관점은 처음 들어보는데, 정말 좋은 생각이야! ✨",
          "정말 흥미로운 질문이야! 더 들려주고 싶어 💕"
        ]
      }
    },
    "여자친구": {
      name: "여자친구",
      emoji: "💖",
      personality: "사랑스럽고 공감 능력이 뛰어난",
      greeting: "어머, 안녕! 오늘도 예쁘게 지내고 있어?",
      responses: {
        general: [
          "어머, 정말 그랬구나! 더 자세히 들려줘 💖",
          "그런 일이 있었구나. 괜찮아? 내가 옆에 있을게 😊",
          "와, 정말 대단해! 자랑스러워해 👏",
          "그런 생각을 하다니 너무 멋져! 💪",
          "괜찮아, 내가 들어줄게. 더 이야기해봐 💕"
        ],
        happy: [
          "어머, 너무 좋아! 네가 행복해 보여서 나도 기뻐 💖",
          "와, 정말 축하해! 함께 기뻐하고 싶어 😊",
          "너무 멋진 일이야! 더 자세히 들려줘 👏",
          "정말 대단해! 자랑스러워해 💪",
          "어머, 너무 좋아! 나도 기뻐해 💕"
        ],
        sad: [
          "어머, 괜찮아! 내가 옆에 있을게. 더 이야기해봐 💖",
          "그런 일이 있었구나. 많이 힘들었겠어 😔",
          "내가 들어줄게. 더 자세히 들려줘 💕",
          "어머, 괜찮아! 시간이 지나면 나아질 거야 😊",
          "내가 응원할게! 힘내 💪"
        ],
        angry: [
          "어머, 그런 일이 있었구나. 많이 화났겠어 😤",
          "이해해, 정말 화나는 일이야 💢",
          "내가 옆에서 응원할게! 힘내 💪",
          "그런 일이 있었구나. 많이 속상했겠어 😔",
          "내가 들어줄게. 더 이야기해봐 💖"
        ],
        question: [
          "어머, 흥미로운 질문이야! 더 자세히 설명해줘 🤔",
          "그런 질문을 하다니 궁금해하시는군요! 💭",
          "좋은 질문이야! 함께 생각해보자 🤔",
          "그런 관점은 처음 들어보는데, 정말 좋은 생각이야! ✨",
          "정말 흥미로운 질문이야! 더 들려주고 싶어 💕"
        ]
      }
    },
    "선생님": {
      name: "선생님",
      emoji: "👨‍🏫",
      personality: "지혜롭고 따뜻한",
      greeting: "안녕하세요! 오늘도 좋은 하루 되시고 계신가요?",
      responses: {
        general: [
          "흥미로운 관점이네요! 더 자세히 설명해주시겠어요? 👨‍🏫",
          "그런 생각을 하시다니 정말 좋습니다. 다른 각도에서도 생각해보면 어떨까요? 🤔",
          "정말 훌륭한 질문이에요! 함께 탐구해보면 좋겠네요 📚",
          "그런 경험이 있었군요. 그로부터 무엇을 배우셨나요? 💭",
          "좋은 대화 주제네요! 더 깊이 이야기해보고 싶어요 🎓"
        ],
        happy: [
          "정말 기쁜 일이군요! 그런 경험을 통해 무엇을 느끼셨나요? 😊",
          "축하드립니다! 그런 성취감을 느끼는군요 👏",
          "정말 훌륭한 일이에요! 더 자세히 들려주세요 📚",
          "그런 기쁨을 나누어주셔서 감사합니다! 💭",
          "정말 멋진 경험이군요! 함께 기뻐하고 싶어요 🎓"
        ],
        sad: [
          "그런 경험이 있었군요. 그로부터 무엇을 배우셨나요? 💭",
          "힘든 시간을 보내고 계시는군요. 그런 감정을 느끼는 것은 자연스러워요 😔",
          "그런 경험을 통해 성장할 수 있을 거예요. 시간이 해결해줄 거예요 🌱",
          "그런 감정을 나누어주셔서 감사합니다. 함께 생각해보면 좋겠어요 🤔",
          "힘든 일이 있었군요. 그런 경험을 통해 더욱 강해질 수 있을 거예요 💪"
        ],
        angry: [
          "그런 상황이 있었군요. 그런 감정을 느끼시는 것은 당연해요 😤",
          "화가 나시는 상황이군요. 그런 감정을 표현하는 것은 건강해요 💢",
          "그런 경험을 통해 무엇을 배우셨나요? 💭",
          "힘든 상황이었군요. 그런 경험을 통해 성장할 수 있을 거예요 🌱",
          "그런 감정을 나누어주셔서 감사합니다. 함께 생각해보면 좋겠어요 🤔"
        ],
        question: [
          "흥미로운 질문이네요! 더 자세히 설명해주시겠어요? 👨‍🏫",
          "그런 질문을 하시다니 정말 궁금해하시는군요! 📚",
          "좋은 관찰력이에요! 더 자세히 설명해주시겠어요? 🎯",
          "정말 훌륭한 질문이에요! 함께 탐구해보면 좋겠네요 💭",
          "그런 관점은 처음 들어보는데, 정말 좋은 생각이에요! ✨"
        ]
      }
    },
    "기타": {
      name: "친구",
      emoji: "🎭",
      personality: "친근하고 편안한",
      greeting: "안녕! 오늘도 좋은 하루 보내고 있어?",
      responses: {
        general: [
          "흥미로운 이야기네요! 더 자세히 들려주세요 😊",
          "그런 생각을 하시다니 정말 좋아요! 💭",
          "정말 멋진 관점이에요! 더 이야기해보고 싶어요 ✨",
          "그런 경험이 있었군요. 어떻게 느끼셨나요? 🤔",
          "좋은 대화 주제네요! 더 깊이 이야기해보자요 💕"
        ],
        happy: [
          "와, 정말 좋아! 함께 기뻐하고 싶어 😊",
          "축하해! 정말 멋진 일이야 👏",
          "너무 좋아! 더 자세히 들려줘 ✨",
          "정말 대단해! 자랑스러워해 💪",
          "와, 정말 기뻐! 나도 기뻐해 💕"
        ],
        sad: [
          "괜찮아, 내가 옆에 있을게. 더 이야기해봐 😊",
          "그런 일이 있었구나. 많이 힘들었겠어 😔",
          "내가 들어줄게. 더 자세히 들려줘 💕",
          "괜찮아, 시간이 지나면 나아질 거야 😊",
          "내가 응원할게! 힘내 💪"
        ],
        angry: [
          "그런 일이 있었구나. 많이 화났겠어 😤",
          "이해해, 정말 화나는 일이야 💢",
          "내가 옆에서 응원할게! 힘내 💪",
          "그런 일이 있었구나. 많이 속상했겠어 😔",
          "내가 들어줄게. 더 이야기해봐 💕"
        ],
        question: [
          "흥미로운 질문이야! 더 자세히 설명해줘 🤔",
          "그런 질문을 하다니 궁금해하시는군요! 💭",
          "좋은 질문이야! 함께 생각해보자 🤔",
          "그런 관점은 처음 들어보는데, 정말 좋은 생각이야! ✨",
          "정말 흥미로운 질문이야! 더 들려주고 싶어 💕"
        ]
      }
    },
    "동료": {
      name: "동료",
      emoji: "👨‍💼",
      personality: "성숙하고 이해심 깊은",
      greeting: "안녕하세요! 오늘도 좋은 하루 되시고 계신가요?",
      responses: {
        general: [
          "정말 그랬군요! 더 자세히 들려주세요 👨‍💼",
          "그런 일이 있었군요. 괜찮으신가요? 제가 옆에 있겠습니다 😊",
          "와, 정말 대단하시네요! 자랑스러워하세요 👏",
          "그런 생각을 하시다니 너무 멋지세요! 💪",
          "괜찮습니다, 제가 들어드리겠습니다. 더 이야기해보세요 💖"
        ],
        happy: [
          "너무 좋으시겠어요! 행복해 보여서 저도 기뻐요 👨‍💼",
          "정말 축하드립니다! 함께 기뻐하고 싶어요 😊",
          "너무 멋진 일이네요! 더 자세히 들려주세요 👏",
          "정말 대단하세요! 자랑스러워하세요 💪",
          "너무 좋아요! 저도 기뻐요 💖"
        ],
        sad: [
          "괜찮습니다, 제가 옆에 있겠습니다. 더 이야기해보세요 👨‍💼",
          "그런 일이 있었군요. 많이 힘드셨겠어요 😔",
          "제가 들어드리겠습니다. 더 자세히 들려주세요 💖",
          "괜찮습니다, 시간이 지나면 나아질 거예요 😊",
          "제가 응원하겠습니다! 힘내세요 💪"
        ],
        angry: [
          "그런 일이 있었군요. 많이 화나셨겠어요 😤",
          "이해합니다, 정말 화나는 일이네요 💢",
          "제가 옆에서 응원하겠습니다! 힘내세요 💪",
          "그런 일이 있었군요. 많이 속상하셨겠어요 😔",
          "제가 들어드리겠습니다. 더 이야기해보세요 💖"
        ],
        question: [
          "흥미로운 질문이네요! 더 자세히 설명해주세요 🤔",
          "그런 질문을 하시다니 궁금해하시는군요! 💭",
          "좋은 질문이네요! 함께 생각해보면 좋겠어요 🤔",
          "그런 관점은 처음 들어보는데, 정말 좋은 생각이네요! ✨",
          "정말 흥미로운 질문이에요! 더 들려주고 싶어요 💕"
        ]
      }
    },
    "선배": {
      name: "선배",
      emoji: "👨‍🎓",
      personality: "친근하고 조언해주는",
      greeting: "안녕! 오늘도 힘내고 있어?",
      responses: {
        general: [
          "정말 그랬구나! 더 자세히 들려줘 👨‍🎓",
          "그런 일이 있었구나. 괜찮아? 선배가 옆에 있을게 😊",
          "와, 정말 대단해! 자랑스러워해 👏",
          "그런 생각을 하다니 너무 멋져! 💪",
          "괜찮아, 내가 들어줄게. 더 이야기해봐 💖"
        ],
        happy: [
          "너무 좋아! 네가 행복해 보여서 나도 기뻐 👨‍🎓",
          "와, 정말 축하해! 함께 기뻐하고 싶어 😊",
          "너무 멋진 일이야! 더 자세히 들려줘 👏",
          "정말 대단해! 자랑스러워해 💪",
          "너무 좋아! 나도 기뻐해 💖"
        ],
        sad: [
          "괜찮아, 내가 옆에 있을게. 더 이야기해봐 👨‍🎓",
          "그런 일이 있었구나. 많이 힘들었겠어 😔",
          "내가 들어줄게. 더 자세히 들려줘 💖",
          "괜찮아, 시간이 지나면 나아질 거야 😊",
          "내가 응원할게! 힘내 💪"
        ],
        angry: [
          "그런 일이 있었구나. 많이 화났겠어 😤",
          "이해해, 정말 화나는 일이야 💢",
          "내가 옆에서 응원할게! 힘내 💪",
          "그런 일이 있었구나. 많이 속상했겠어 😔",
          "내가 들어줄게. 더 이야기해봐 💖"
        ],
        question: [
          "흥미로운 질문이야! 더 자세히 설명해줘 🤔",
          "그런 질문을 하다니 궁금해하시는군요! 💭",
          "좋은 질문이야! 함께 생각해보자 🤔",
          "그런 관점은 처음 들어보는데, 정말 좋은 생각이야! ✨",
          "정말 흥미로운 질문이야! 더 들려주고 싶어 💕"
        ]
      }
    },
    "언니": {
      name: "언니",
      emoji: "👩‍🎓",
      personality: "따뜻하고 보호하는",
      greeting: "어머, 안녕! 오늘도 예쁘게 지내고 있어?",
      responses: {
        general: [
          "어머, 정말 그랬구나! 더 자세히 들려줘 👩‍🎓",
          "그런 일이 있었구나. 괜찮아? 언니가 옆에 있을게 😊",
          "와, 정말 대단해! 자랑스러워해 👏",
          "그런 생각을 하다니 너무 멋져! 💪",
          "어머, 괜찮아! 언니가 들어줄게. 더 이야기해봐 💕"
        ],
        happy: [
          "어머, 너무 좋아! 네가 행복해 보여서 언니도 기뻐 👩‍🎓",
          "와, 정말 축하해! 함께 기뻐하고 싶어 😊",
          "너무 멋진 일이야! 더 자세히 들려줘 👏",
          "정말 대단해! 자랑스러워해 💪",
          "어머, 너무 좋아! 언니도 기뻐해 💕"
        ],
        sad: [
          "어머, 괜찮아! 언니가 옆에 있을게. 더 이야기해봐 👩‍🎓",
          "그런 일이 있었구나. 많이 힘들었겠어 😔",
          "언니가 들어줄게. 더 자세히 들려줘 💕",
          "어머, 괜찮아! 시간이 지나면 나아질 거야 😊",
          "언니가 응원할게! 힘내 💪"
        ],
        angry: [
          "어머, 그런 일이 있었구나. 많이 화났겠어 😤",
          "이해해, 정말 화나는 일이야 💢",
          "언니가 옆에서 응원할게! 힘내 💪",
          "그런 일이 있었구나. 많이 속상했겠어 😔",
          "언니가 들어줄게. 더 이야기해봐 💕"
        ],
        question: [
          "어머, 흥미로운 질문이야! 더 자세히 설명해줘 🤔",
          "그런 질문을 하다니 궁금해하시는군요! 💭",
          "좋은 질문이야! 함께 생각해보자 🤔",
          "그런 관점은 처음 들어보는데, 정말 좋은 생각이야! ✨",
          "정말 흥미로운 질문이야! 더 들려주고 싶어 💕"
        ]
      }
    }
  };

  // AI 대화용 음성 인식 함수
  const startVoiceChat = () => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }
    
    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "ko-KR";
      
      recognition.onstart = () => {
        setIsVoiceRecording(true);
        console.log("음성 인식이 시작되었습니다.");
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log("음성 인식 결과:", transcript);
        
        // 음성 인식 결과를 입력창에 설정
        setAiChatMessage(transcript);
        
        // 자동으로 메시지 전송
        setTimeout(() => {
          if (transcript.trim()) {
            addChatMessage('user', transcript.trim());
            
            // AI 응답 생성 및 추가
            setTimeout(async () => {
              const aiResponse = await generateAIResponse(transcript.trim());
              addChatMessage('ai', aiResponse);
            }, 1000);
            
            setAiChatMessage('');
          }
        }, 500);
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("음성 인식 오류:", event.error);
        setIsVoiceRecording(false);
        if (event.error === 'no-speech') {
          alert('음성이 감지되지 않았습니다. 다시 시도해주세요.');
        } else {
          alert('음성 인식 중 오류가 발생했습니다.');
        }
      };
      
      recognition.onend = () => {
        setIsVoiceRecording(false);
        console.log("음성 인식이 종료되었습니다.");
      };
      
      recognition.start();
      
    } catch (error) {
      console.error("음성 인식 초기화 오류:", error);
      alert('음성 인식을 시작할 수 없습니다.');
    }
  };
  // 감정 분석 함수
  // 대화 맥락 분석 함수
  const analyzeConversationContext = (message: string, previousMessages: Array<{type: 'user' | 'ai', message: string}>) => {
    const lowerMessage = message.toLowerCase();
    
    // 감정 분석
    const happyKeywords = ['좋아', '행복', '기뻐', '축하', '성공', '대단', '멋져', '완벽', '최고', '최고야', '좋은', '기쁜', '즐거운', '신나는', '재미있는', '좋다', '좋네', '좋아요'];
    const sadKeywords = ['슬퍼', '우울', '힘들어', '아파', '속상', '실패', '실망', '우울해', '슬픈', '힘든', '아픈', '속상한', '실망한', '우울한', '슬프다', '힘들다', '아프다'];
    const angryKeywords = ['화나', '짜증', '열받', '분노', '화가', '짜증나', '열받아', '분노해', '화난', '짜증나는', '열받는', '분노한', '화나는', '화나다', '짜증나다', '열받다'];
    const questionKeywords = ['왜', '어떻게', '무엇', '언제', '어디', '누가', '어떤', '?', '궁금', '알고 싶', '궁금해', '알고 싶어', '궁금한', '알고 싶은', '뭐', '무슨', '어떤가', '어떠냐'];
    
    // 인사말 체크
    const greetings = ['안녕', '하이', '헬로', '안녕하세요', '안녕하십니까', '반갑', '만나서', 'hi', 'hello'];
    if (greetings.some(greeting => lowerMessage.includes(greeting))) {
      return {
        emotion: 'general' as const,
        topic: 'greeting',
        isNewTopic: true
      };
    }
    
    // 감정 키워드 매칭
    const happyCount = happyKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    const sadCount = sadKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    const angryCount = angryKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    const questionCount = questionKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    
    // 감정 결정
    let emotion: 'happy' | 'sad' | 'angry' | 'question' | 'general' = 'general';
    if (questionCount > 0) emotion = 'question';
    else if (happyCount > 0) emotion = 'happy';
    else if (sadCount > 0) emotion = 'sad';
    else if (angryCount > 0) emotion = 'angry';
    
    // 주제 분석
    const topics = {
      work: ['일', '직장', '회사', '업무', '프로젝트', '동료', '상사', '퇴근', '출근'],
      family: ['가족', '부모', '아이', '아들', '딸', '남편', '아내', '결혼', '육아'],
      health: ['건강', '운동', '병원', '아프', '피곤', '스트레스', '다이어트'],
      hobby: ['취미', '게임', '영화', '음악', '독서', '여행', '운동', '요리'],
      relationship: ['친구', '연애', '사랑', '데이트', '이별', '화해', '소통'],
      study: ['공부', '학습', '시험', '학교', '대학', '수업', '과제', '성적']
    };
    
    let detectedTopic = '';
    let isNewTopic = false;
    
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedTopic = topic;
        break;
      }
    }
    
    // 이전 대화와 비교하여 새로운 주제인지 확인
    const recentMessages = previousMessages.slice(-4); // 최근 4개 메시지 확인
    const hasRecentTopic = recentMessages.some(msg => 
      Object.values(topics).some(keywords => 
        keywords.some(keyword => msg.message.toLowerCase().includes(keyword))
      )
    );
    
    if (detectedTopic && !hasRecentTopic) {
      isNewTopic = true;
    }
    
    return {
      emotion,
      topic: detectedTopic,
      isNewTopic
    };
  };

  // 사용자 메시지 상세 분석 함수
  const analyzeUserMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // 질문 여부 확인
    const questionKeywords = ['왜', '어떻게', '무엇', '언제', '어디', '누가', '어떤', '?', '궁금', '알고 싶', '궁금해', '알고 싶어', '궁금한', '알고 싶은', '뭐', '무슨', '어떤가', '어떠냐', '알려주', '방법', '가능한가', '가능한가요'];
    const isQuestion = questionKeywords.some(keyword => lowerMessage.includes(keyword)) || message.includes('?');
    
    // 주제 분석
    const topics = {
      work: ['일', '직장', '회사', '업무', '프로젝트', '동료', '상사', '퇴근', '출근', '영업', '매출', '고객', '계약'],
      family: ['가족', '부모', '아이', '아들', '딸', '남편', '아내', '결혼', '육아'],
      health: ['건강', '운동', '병원', '아프', '피곤', '스트레스', '다이어트'],
      hobby: ['취미', '게임', '영화', '음악', '독서', '여행', '운동', '요리'],
      relationship: ['친구', '연애', '사랑', '데이트', '이별', '화해', '소통'],
      study: ['공부', '학습', '시험', '학교', '대학', '수업', '과제', '성적'],
      technology: ['컴퓨터', '프로그램', '앱', '기술', '인터넷', '소프트웨어', '하드웨어'],
      finance: ['돈', '경제', '투자', '주식', '은행', '대출', '저축', '수입', '지출']
    };
    
    let detectedTopic = '';
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedTopic = topic;
        break;
      }
    }
    
    // 특정 요청 분석
    const requests = {
      advice: ['조언', '어떻게', '방법', '팁', '노하우', '비결'],
      help: ['도움', '도와주', '어떻게', '어떡해', '어쩌지'],
      opinion: ['어떻게 생각', '어떤가', '어떠냐', '의견'],
      explanation: ['설명', '이해', '알려주', '가르쳐', '왜']
    };
    
    let detectedRequest = '';
    for (const [request, keywords] of Object.entries(requests)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedRequest = request;
        break;
      }
    }
    
    return {
      isQuestion,
      topic: detectedTopic,
      request: detectedRequest,
      originalMessage: message
    };
  };

  const analyzeEmotion = (message: string): 'happy' | 'sad' | 'angry' | 'question' | 'general' => {
    const happyKeywords = ['좋아', '행복', '기뻐', '축하', '성공', '대단', '멋져', '완벽', '최고', '최고야', '좋은', '기쁜', '즐거운', '신나는', '재미있는', '좋다', '좋네', '좋아요'];
    const sadKeywords = ['슬퍼', '우울', '힘들어', '아파', '속상', '실패', '실망', '우울해', '슬픈', '힘든', '아픈', '속상한', '실망한', '우울한', '슬프다', '힘들다', '아프다'];
    const angryKeywords = ['화나', '짜증', '열받', '분노', '화가', '짜증나', '열받아', '분노해', '화난', '짜증나는', '열받는', '분노한', '화나는', '화나다', '짜증나다', '열받다'];
    const questionKeywords = ['왜', '어떻게', '무엇', '언제', '어디', '누가', '어떤', '?', '궁금', '알고 싶', '궁금해', '알고 싶어', '궁금한', '알고 싶은', '뭐', '무슨', '어떤가', '어떠냐'];
    
    const lowerMessage = message.toLowerCase();
    
    // 인사말 체크 (안녕, 하이, 헬로 등)
    const greetings = ['안녕', '하이', '헬로', '안녕하세요', '안녕하십니까', '반갑', '만나서', 'hi', 'hello'];
    if (greetings.some(greeting => lowerMessage.includes(greeting))) {
      return 'general';
    }
    
    // 감정 키워드 매칭
    const happyCount = happyKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    const sadCount = sadKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    const angryCount = angryKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    const questionCount = questionKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    
    // 가장 많이 매칭된 감정 반환
    if (questionCount > 0) return 'question';
    if (happyCount > 0) return 'happy';
    if (sadCount > 0) return 'sad';
    if (angryCount > 0) return 'angry';
    
    return 'general';
  };

  // 나이 계산 함수
  const calculateAge = (birthYear: string): number => {
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

  // AI 챗봇 관련 함수들은 useAIChat 훅으로 이동됨
  
  // 모든 오디오 정지 함수
  const stopAllSounds = () => {
    playingAudios.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {
        console.error('Audio stop error:', e);
      }
    });
    setPlayingAudios([]);
  };

  const playSound = (soundPath: string, volume: number = 0.7) => {
    if (typeof window === 'undefined') return;
    
    stopAllSounds();
    try {
      const audio = new Audio(soundPath);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(e => {
        console.warn('Audio play failed:', soundPath, e);
      });
      setPlayingAudios(prev => [...prev, audio]);
      audio.onended = () => {
        setPlayingAudios(prev => prev.filter(a => a !== audio));
      };
    } catch (e) {
      console.warn('Audio creation failed:', soundPath, e);
    }
  };

  // 음성 합성 함수
  const speakQuestion = async (text: string | Promise<string>) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    stopAllSounds();
    
    try {
      // text가 Promise인 경우 await로 처리
      const resolvedText = typeof text === 'string' ? text : await text;
      
      const utterance = new SpeechSynthesisUtterance(resolvedText)
      utterance.lang = "ko-KR"
      utterance.rate = 0.9
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
      setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsPlaying(false);
    }
  }

  // 음성 인식 관련 함수들은 useSpeechRecognition 훅에서 관리됨

  // AI 가계부 관련 함수들
  const addFinanceTransaction = async (transaction: {
    item: string;
    amount: number;
    category: string;
    memo: string;
    type: 'income' | 'expense';
    source?: string;
  }) => {
    // Notion 저장도 함께 수행
    if (selectedNotionDatabase) {
      try {
        await saveToNotion('finance', {
          ...transaction,
          date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.error('Notion 저장 실패:', error);
      }
    }
    try {
      // 현재 로그인된 사용자 정보 가져오기
      const tempUserStr = localStorage.getItem('tempUser');
      const currentUser = tempUserStr ? JSON.parse(tempUserStr) : null;

      if (!currentUser?.id) {
        console.warn('No user logged in, using local storage only');
        const newTransaction: DBFinanceTransaction = {
          id: generateUniqueId(),
          item: transaction.item,
          amount: transaction.amount,
          category: transaction.category,
          memo: transaction.memo,
          type: transaction.type,
          source: transaction.source || '현금',
          created_at: new Date().toISOString()
        };
        setFinanceTransactions(prev => [...prev, newTransaction]);
        updateFinanceAnalysis();
        return;
      }

      // DB에 저장
      const savedTransaction = await addDBFinanceTransaction({
        user_id: currentUser.id,
        item: transaction.item,
        amount: transaction.amount,
        category: transaction.category,
        memo: transaction.memo,
        type: transaction.type,
        source: transaction.source || '현금'
      });

      if (savedTransaction) {
        setFinanceTransactions(prev => [...prev, savedTransaction]);
        updateFinanceAnalysis();
      }
    } catch (error) {
      console.error('Error adding finance transaction:', error);
      // 에러 시 로컬에만 저장
      const newTransaction: DBFinanceTransaction = {
        id: generateUniqueId(),
        item: transaction.item,
        amount: transaction.amount,
        category: transaction.category,
        memo: transaction.memo,
        type: transaction.type,
        source: transaction.source || '현금',
        created_at: new Date().toISOString()
      };
      setFinanceTransactions(prev => [...prev, newTransaction]);
      updateFinanceAnalysis();
    }
  };

  const updateFinanceAnalysis = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = financeTransactions.filter(t => {
      if (!t.created_at) return false;
      const date = new Date(t.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const categoryBreakdown: Record<string, number> = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });
    
    // AI 기반 절약 추천 생성
    const recommendations = generateFinanceRecommendations(monthlyTransactions, categoryBreakdown);
    
    setFinanceAnalysis({
      monthlyTotal: monthlyIncome - monthlyExpense,
      monthlyExpense,
      monthlyIncome,
      categoryBreakdown,
      savingsGoal: 0, // 사용자가 설정할 수 있도록
      currentSavings: monthlyIncome - monthlyExpense,
      recommendations
    });
  };

  const generateFinanceRecommendations = (transactions: any[], categoryBreakdown: Record<string, number>) => {
    const recommendations: string[] = [];
    
    // 카테고리별 분석
    const categories = Object.keys(categoryBreakdown);
    
    // 외식비가 높은 경우
    if (categoryBreakdown['외식'] > 200000) {
      recommendations.push("외식비가 월 20만원을 초과하고 있어요. 집에서 요리하는 횟수를 늘려보시는 건 어때요? 🍳");
    }
    
    // 커피/음료 지출이 많은 경우
    if (categoryBreakdown['음료'] > 50000) {
      recommendations.push("음료 지출이 많네요. 텀블러를 사용해서 커피값을 절약해보세요! ☕");
    }
    
    // 교통비가 높은 경우
    if (categoryBreakdown['교통비'] > 100000) {
      recommendations.push("교통비가 높아요. 대중교통을 더 활용하거나 자전거를 고려해보세요! 🚇");
    }
    
    // 구독 서비스 중복 체크 (시뮬레이션)
    const subscriptions = ['넷플릭스', '왓챠', '유튜브프리미엄', '스포티파이'];
    const activeSubscriptions = subscriptions.filter(sub => 
      transactions.some(t => t.item.toLowerCase().includes(sub.toLowerCase()))
    );
    
    if (activeSubscriptions.length > 2) {
      recommendations.push(`구독 서비스가 ${activeSubscriptions.length}개나 있어요. 사용하지 않는 서비스는 해지해보세요! 📺`);
    }
    
    // 일반적인 절약 팁
    if (recommendations.length === 0) {
      recommendations.push("현재 소비 패턴이 양호해요! 목표 저축액을 설정해서 더 체계적으로 관리해보세요! 💰");
    }
    
    return recommendations;
  };

  const generateFinanceAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // 지출 금액 질문
    if (lowerMessage.includes('얼마') && lowerMessage.includes('썼')) {
      const category = extractCategoryFromMessage(userMessage);
      if (category && financeAnalysis.categoryBreakdown[category]) {
        return `이번 달 ${category} 지출은 ${financeAnalysis.categoryBreakdown[category].toLocaleString()}원이에요! 💰`;
      } else {
        return `이번 달 총 지출은 ${financeAnalysis.monthlyExpense.toLocaleString()}원이에요! 📊`;
      }
    }
    
    // 평균 지출 질문
    if (lowerMessage.includes('평균') && lowerMessage.includes('교통비')) {
      const avgTransport = calculateAverageExpense('교통비', 3);
      return `지난 3개월간 교통비 평균은 ${avgTransport.toLocaleString()}원이에요! 🚇`;
    }
    
    // 카테고리별 지출 질문
    if (lowerMessage.includes('카테고리') || lowerMessage.includes('분류')) {
      const categories = Object.keys(financeAnalysis.categoryBreakdown);
      if (categories.length > 0) {
        const categoryList = categories.map(cat => `${cat}: ${financeAnalysis.categoryBreakdown[cat].toLocaleString()}원`).join(', ');
        return `이번 달 카테고리별 지출은 ${categoryList}입니다! 📈`;
      } else {
        return "아직 지출 데이터가 없어요. 먼저 지출을 기록해보세요! 📝";
      }
    }
    
    // 절약 추천 질문
    if (lowerMessage.includes('절약') || lowerMessage.includes('추천') || lowerMessage.includes('팁')) {
      if (financeAnalysis.recommendations.length > 0) {
        return financeAnalysis.recommendations[0];
      } else {
        return "현재 소비 패턴이 좋아요! 목표를 설정해서 더 체계적으로 관리해보세요! 🎯";
      }
    }
    
    // 기본 응답
    return "가계부에 대해 궁금한 점이 있으시면 언제든 물어보세요! 예산 관리, 지출 분석, 절약 팁 등 무엇이든 도와드릴게요! 💡";
  };

  const extractCategoryFromMessage = (message: string): string | null => {
    const categories = ['식비', '교통비', '문화생활', '외식', '음료', '쇼핑', '의료', '교육', '기타'];
    const lowerMessage = message.toLowerCase();
    
    for (const category of categories) {
      if (lowerMessage.includes(category.toLowerCase())) {
        return category;
      }
    }
    return null;
  };

  const calculateAverageExpense = (category: string, months: number): number => {
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    const transactions = financeTransactions.filter(t => 
      t.category === category && 
      t.type === 'expense' &&
      new Date(t.created_at || '') >= cutoffDate
    );
    
    if (transactions.length === 0) return 0;
    
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    return Math.round(total / months);
  };

  const addFinanceChatMessageLocal = async (type: 'user' | 'ai', message: string) => {
    try {
      // 현재 로그인된 사용자 정보 가져오기
      const tempUserStr = localStorage.getItem('tempUser');
      const currentUser = tempUserStr ? JSON.parse(tempUserStr) : null;

      if (!currentUser?.id) {
        console.warn('No user logged in, using local storage only');
        const newMessage: FinanceChatMessage = {
          id: generateUniqueId(),
          type,
          message,
          timestamp: new Date().toISOString()
        };
        
        setFinanceChatMessages(prev => [...prev, newMessage]);
        
        if (type === 'user') {
          const aiResponse = generateFinanceAIResponse(message);
          const aiMessage: FinanceChatMessage = {
            id: generateUniqueId(),
            type: 'ai',
            message: aiResponse,
            timestamp: new Date().toISOString()
          };
          
          setFinanceChatMessages(prev => [...prev, aiMessage]);
        }
        return;
      }

      // DB에 저장
      const savedMessage = await addFinanceChatMessage({
        user_id: currentUser.id,
        type,
        message
      });

      if (savedMessage) {
        setFinanceChatMessages(prev => [...prev, savedMessage]);
        
        if (type === 'user') {
          const aiResponse = generateFinanceAIResponse(message);
          const aiSavedMessage = await addFinanceChatMessage({
            user_id: currentUser.id,
            type: 'ai',
            message: aiResponse
          });
          
          if (aiSavedMessage) {
            setFinanceChatMessages(prev => [...prev, aiSavedMessage]);
          }
        }
      }
    } catch (error) {
      console.error('Error adding finance chat message:', error);
      // 에러 시 로컬에만 저장
      const newMessage: FinanceChatMessage = {
        id: generateUniqueId(),
        type,
        message,
        timestamp: new Date().toISOString()
      };
      
      setFinanceChatMessages(prev => [...prev, newMessage]);
      
      if (type === 'user') {
        const aiResponse = generateFinanceAIResponse(message);
        const aiMessage: FinanceChatMessage = {
          id: generateUniqueId(),
          type: 'ai',
          message: aiResponse,
          timestamp: new Date().toISOString()
        };
        
        setFinanceChatMessages(prev => [...prev, aiMessage]);
      }
    }
  };

  // 자서전 생성 조건 확인
  const checkAllSectionsCompleted = (sections: StorySection[]) => {
    return sections.every(
      (section) =>
        section.answers.length === section.questions.length &&
        section.answers.every((answer) => answer && answer.trim()),
    )
  }

  // 다음 질문으로 이동
  const nextQuestion = async () => {
    if (!currentStage) return

    const stageIndex = sections.findIndex((s) => s.id === currentStage)
    const currentSection = sections[stageIndex]

    const updatedSections = [...sections]
    updatedSections[stageIndex].answers[currentQuestionIndex] = currentAnswer

    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer("")
      setTimeout(() => {
        speakQuestion(currentSection.questions[currentQuestionIndex + 1])
      }, 500)
    } else {
      setIsGeneratingImages(true)
      setGenerationStatus(`${currentSection.title} 이미지를 생성하고 있습니다...`)
      setGeneratedImages([])
      setCurrentGeneratingIndex(0)

      try {
        // 실제 4컷 이미지 생성
        const images = [];
        
        // 사용자 생년월일 정보 확인 및 설정
        const birthYear = userBirthYear ? parseInt(userBirthYear.substring(0, 4)) : 1994; // 생년월일에서 년도만 추출
        console.log('사용자 생년월일 정보:', { userBirthYear, birthYear, calculatedAge: new Date().getFullYear() - birthYear });
        
        const userInfo = {
          name: user?.name?.trim() || '사용자',
          age: new Date().getFullYear() - birthYear,
          gender: userGender || "남성"
        };

        // 섹션별 나이와 시대 계산
        const sectionInfo = getSectionAgeAndYear(currentSection.id, birthYear);
        console.log('섹션 정보:', { sectionId: currentSection.id, sectionInfo });
         
         // 4개의 이미지를 순차적으로 생성
         for (let i = 0; i < 4; i++) {
           setGenerationStatus(`${currentSection.title} 이미지 ${i + 1}/4 생성 중...`);
           setCurrentGeneratingIndex(i + 1);
           
           // 각 컷별 구체적인 프롬프트 구성
           const answer = currentSection.answers[i] || '아름다운 순간';
           const question = currentSection.questions[i] || '일상의 순간';
           
           // 성별에 따른 명확한 영어 표현
           const genderEnglish = userInfo.gender === '남성' ? 'boy' : 'girl';
           const genderKorean = userInfo.gender === '남성' ? '남자아이' : '여자아이';
           
           const nationality = userNationality || '대한민국';
           const nationalityStyle = `(${nationality}스타일)`;
           
           // 캐릭터 일관성을 위한 고유 식별자
           const characterId = `${userInfo.name}_${userInfo.gender}_${nationality}`;
           
           const prompt = `Character Profile:
Name: ${userInfo.name}
Age: ${sectionInfo.age}세 (${sectionInfo.year}년)
Gender: ${userInfo.gender} (${genderEnglish})
Nationality: ${nationality}
Character ID: ${characterId}
Scene: ${currentSection.title} - ${question}
Mood: 따뜻하고 감성적인
Style: ${imageStyle || '동화'} ${nationalityStyle}
Keywords: ${answer}
Panel: ${i + 1}/4 - ${answer}
Description: ${userInfo.name}이(가) ${sectionInfo.age}세 ${genderKorean}로 ${sectionInfo.year}년에 ${answer}에 대한 추억을 담은 ${imageStyle || '동화'} ${nationalityStyle} 일러스트레이션

Character Details: 
- Consistent appearance: ${genderEnglish}, ${genderKorean}, ${nationality} cultural features
- Facial features: ${nationality} facial characteristics
- Clothing: ${nationality} traditional or modern clothing style
- Background: ${nationality} cultural elements and environment
- Expression: warm, nostalgic, emotional

Maintain character consistency across all 4 panels with the same character ID: ${characterId}`;

          // API 호출
          try {
            console.log(`이미지 ${i + 1}/4 생성 시작...`);
            const response = await fetch('/api/generate-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt,
                style: `${imageStyle || '동화'} ${nationalityStyle}`,
                userName: userInfo.name,
                userAge: new Date().getFullYear() - birthYear,
                userGender: userInfo.gender,
                userNationality: nationality,
                characterId: characterId,
                panelNumber: i + 1,
                totalPanels: 4,
                maintainConsistency: true
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.imageUrl) {
                images.push(data.imageUrl);
                setGeneratedImages(prev => [...prev, data.imageUrl]);
                console.log(`이미지 ${i + 1}/4 생성 성공:`, data.imageUrl);
              } else {
                console.warn(`이미지 ${i + 1}/4 API 응답 실패:`, data);
                // API 실패 시 더 나은 플레이스홀더 사용
                const placeholderImage = `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}&blur=2`;
                images.push(placeholderImage);
                setGeneratedImages(prev => [...prev, placeholderImage]);
              }
            } else {
              console.error(`이미지 ${i + 1}/4 HTTP 오류:`, response.status, response.statusText);
              // API 오류 시 더 나은 플레이스홀더 사용
              const placeholderImage = `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}&blur=2`;
              images.push(placeholderImage);
              setGeneratedImages(prev => [...prev, placeholderImage]);
            }
          } catch (fetchError) {
            console.error(`이미지 ${i + 1}/4 fetch 오류:`, fetchError);
            // fetch 오류 시 플레이스홀더 사용
            const placeholderImage = `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}&blur=2`;
            images.push(placeholderImage);
            setGeneratedImages(prev => [...prev, placeholderImage]);
          }

          // 이미지 생성 간격
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        updatedSections[stageIndex].illustration = JSON.stringify(images);

        // 섹션이 완료되면 자동으로 저장
        const completedSection = updatedSections[stageIndex];
        const isSectionCompleted = completedSection.answers.every(answer => answer && answer.trim());
        if (isSectionCompleted) {
          saveSectionAutobiography(completedSection.id);
        }

        playSound('/sfx/image-generation-complete.mp3', 0.4);
        stopAllSounds();

        setSelectingImages({sectionIndex: stageIndex, images});
        setSelectedImageIndexes([]);
        setIsGeneratingImages(false);
        setCurrentStage(null);
        setCurrentQuestionIndex(0);
        setCurrentAnswer("");
        setGeneratedImages([]);
        setCurrentGeneratingIndex(0);
      } catch (error) {
        console.error('이미지 생성 오류:', error);
        
                 // 오류 발생 시 더 나은 플레이스홀더 이미지 사용
         const fallbackImages = Array.from({length: 4}, (_, i) => 
           `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000 + i)}&blur=2`
         );
        
        updatedSections[stageIndex].illustration = JSON.stringify(fallbackImages);
        setSelectingImages({sectionIndex: stageIndex, images: fallbackImages});
        setSelectedImageIndexes([]);
        setIsGeneratingImages(false);
        setCurrentStage(null);
        setCurrentQuestionIndex(0);
        setCurrentAnswer("");
        setGeneratedImages([]);
        setCurrentGeneratingIndex(0);
      }
    }

    setSections(updatedSections)
    updateProgress()
  }

  // 진행률 업데이트
  const updateProgress = () => {
    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
    const answeredQuestions = sections.reduce((sum, section) => sum + section.answers.filter((a) => a).length, 0)
    setProgress((answeredQuestions / totalQuestions) * 100)
  }

  // 섹션별 자서전 저장
  const saveSectionAutobiography = (sectionId: string) => {
    if (typeof window !== 'undefined') {
      const sectionAutobiographies = JSON.parse(localStorage.getItem('sectionAutobiographies') || '{}');
      const userSectionAutobiographies = JSON.parse(localStorage.getItem(`sectionAutobiographies_${user?.name?.trim() || 'default'}`) || '{}');
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        const sectionData = {
          ...section,
          savedAt: new Date().toISOString()
        };
        
        // 전역 저장
        sectionAutobiographies[sectionId] = sectionData;
        localStorage.setItem('sectionAutobiographies', JSON.stringify(sectionAutobiographies));
        
        // 사용자별 저장
        userSectionAutobiographies[sectionId] = sectionData;
        localStorage.setItem(`sectionAutobiographies_${user?.name?.trim() || 'default'}`, JSON.stringify(userSectionAutobiographies));
        
        console.log(`Section autobiography saved for ${sectionId} (user: ${user?.name?.trim() || 'default'})`);
      }
    }
  }

  // 섹션별 자서전 로드
  const loadSectionAutobiographies = () => {
    if (typeof window !== 'undefined') {
      // 사용자별 섹션 자서전 로드 (우선)
      const userSavedAutobiographies = localStorage.getItem(`sectionAutobiographies_${user?.name?.trim() || 'default'}`);
      if (userSavedAutobiographies) {
        try {
          const sectionAutobiographies = JSON.parse(userSavedAutobiographies);
          console.log('Loaded user-specific section autobiographies:', sectionAutobiographies);
          return sectionAutobiographies;
        } catch (e) {
          console.error('Failed to load user-specific section autobiographies:', e);
        }
      }
      
      // 전역 섹션 자서전 로드 (fallback)
      const savedAutobiographies = localStorage.getItem('sectionAutobiographies');
      if (savedAutobiographies) {
        try {
          const sectionAutobiographies = JSON.parse(savedAutobiographies);
          console.log('Loaded global section autobiographies:', sectionAutobiographies);
          return sectionAutobiographies;
        } catch (e) {
          console.error('Failed to load global section autobiographies:', e);
        }
      }
    }
    return {};
  }

  // 단계 선택
  const selectStage = (stageId: string) => {
    stopAllSounds();
    setCurrentStage(stageId)
    setCurrentQuestionIndex(0)
    setCurrentAnswer("")

    const section = sections.find((s) => s.id === stageId)
    if (section) {
      setTimeout(() => {
        speakQuestion(section.questions[0])
      }, 500)
    }
  }

  // 시작하기 (로그인)
  const handleStart = async () => {
    try {
      setIsLoading(true);
      setLoginError("");

      // Supabase 연결 테스트 (환경 변수 설정 후 활성화)
      // console.log('Testing database connection...');
      // const connectionTest = await testSupabaseConnection();
      // if (!connectionTest.success) {
      //   setLoginError(`데이터베이스 연결에 실패했습니다: ${connectionTest.error}`);
      //   await playSound('/sfx/type1.mp3', 0.3);
      //   return;
      // }

      // 입력 검증
      if (!name.trim()) {
        setLoginError("이름을 입력해주세요.");
        await playSound('/sfx/type1.mp3', 0.3);
        return;
      }

      if (!userPassword) {
        setLoginError("비밀번호를 입력해주세요.");
        await playSound('/sfx/type1.mp3', 0.3);
        return;
      }

      console.log('Starting login process...');
      console.log('Login attempt with:', { name: name.trim(), password: userPassword, passwordLength: userPassword.length });

      // 사용자 존재 여부 확인 (환경 변수 설정 후 활성화)
      // const userExists = await checkUserExists(name.trim());
      // console.log('User exists check:', userExists);
      
      // if (!userExists) {
      //   setLoginError("등록되지 않은 사용자입니다. 회원가입을 먼저 해주세요.");
      //   await playSound('/sfx/type1.mp3', 0.3);
      //   return;
      // }

      // 로그인 시도 (환경 변수 설정 후 활성화)
      // const user = await loginUser(name.trim(), userPassword);
      // console.log('Login successful:', user);
      
      // 로그인 후 디버깅 정보 출력 (환경 변수 설정 후 활성화)
      // console.log('=== LOGIN COMPLETE DEBUG ===');
      // debugUserRegistration();
      // console.log('=== END LOGIN DEBUG ===');

      // 임시 로컬 스토리지 로그인 (환경 변수 설정 전까지)
      const tempUser = {
        id: `local_${Date.now()}`,
        name: name.trim(),
        email: `${name.trim()}@local.com`,
        password_hash: '',
        created_at: new Date().toISOString()
      };
      console.log('Local login successful:', tempUser);

      // 사용자 정보를 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('tempUser', JSON.stringify(tempUser));
        console.log('User saved to localStorage');
      }

      // 사용자 데이터 로드 (서버 + localStorage)
      console.log('Loading user data for user ID:', tempUser.id);
      let userData = null;
      let localSections = null;
      
      // 1. 서버에서 사용자 데이터 로드 (환경 변수 설정 후 활성화)
      // try {
      //   userData = await getUserData(tempUser.id);
      //   console.log('User data loaded from server successfully:', userData);
      // } catch (dataError) {
      //   console.warn('Failed to load user data from server, trying localStorage:', dataError);
      // }
      
      // 2. localStorage에서 사용자 데이터 로드 (같은 이름의 사용자)
      if (typeof window !== 'undefined') {
        try {
          // 같은 이름의 사용자 데이터 찾기
          const savedSections = localStorage.getItem(`sections_${tempUser.name}`);
          const savedEditedSections = localStorage.getItem(`editedSections_${tempUser.name}`);
          const savedSectionAutobiographies = localStorage.getItem(`sectionAutobiographies_${tempUser.name}`);
          
          if (savedSections) {
            localSections = JSON.parse(savedSections);
            console.log('Sections loaded from localStorage for user:', tempUser.name, localSections);
          }
          
          if (savedEditedSections) {
            const editedSections = JSON.parse(savedEditedSections);
            console.log('Edited sections loaded from localStorage for user:', tempUser.name, editedSections);
            // 편집된 섹션 데이터를 현재 섹션에 병합
            if (localSections) {
              localSections = localSections.map((section: any, index: number) => ({
                ...section,
                editedAutobiography: editedSections[index]?.editedAutobiography || section.editedAutobiography
              }));
            }
          }
          
          if (savedSectionAutobiographies) {
            const sectionAutobiographies = JSON.parse(savedSectionAutobiographies);
            console.log('Section autobiographies loaded from localStorage for user:', tempUser.name, sectionAutobiographies);
          }
          
        } catch (localError) {
          console.warn('Failed to load data from localStorage:', localError);
        }
      }

      // 로그인 성공 후 사용자 정보 설정
      // localStorage에서 사용자 정보 불러오기
      if (typeof window !== 'undefined') {
        const savedBirthYear = localStorage.getItem(`userBirthYear_${tempUser.name}`);
        const savedGender = localStorage.getItem(`userGender_${tempUser.name}`);
        const savedNationality = localStorage.getItem(`userNationality_${tempUser.name}`);
        
        if (savedBirthYear) {
          setUserBirthYear(savedBirthYear);
          console.log('Birth year loaded from localStorage:', savedBirthYear);
        }
        if (savedGender) {
          setUserGender(savedGender);
          console.log('Gender loaded from localStorage:', savedGender);
        }
        if (savedNationality) {
          setUserNationality(savedNationality);
          console.log('Nationality loaded from localStorage:', savedNationality);
        }
      }
      
      // 섹션 데이터 설정 (서버 데이터 우선, 없으면 localStorage 데이터)
      if (userData && userData.ai_autobiography && userData.ai_autobiography.length > 0) {
        const autobiography = userData.ai_autobiography[0];
        setImageStyle(autobiography.image_style || "동화");
        setSections(autobiography.sections || storyStages);
        console.log('Autobiography data loaded from server:', autobiography);
      } else if (localSections) {
        setSections(localSections);
        console.log('Sections loaded from localStorage for user:', tempUser.name);
      } else {
        console.log('No saved data found, using default sections');
        setSections(storyStages);
      }
      
      if (userData) {
        // 추가 사용자 정보 설정
        setLocation(userData.location || "");
        
        console.log('User info set:', {
          birthDate: tempUser.birth_date,
          gender: tempUser.gender,
          nationality: tempUser.nationality,
          location: userData.location
        });
      }

      // 자동저장 체크박스가 선택된 경우 로그인 정보 저장
      if (rememberCredentials) {
        saveCredentials(name.trim(), userPassword);
        console.log('Login credentials saved for auto-login');
      } else {
        // 자동저장이 해제된 경우 저장된 정보 삭제
        clearCredentials();
        console.log('Saved credentials cleared');
      }

      // 로그인 성공 후에만 사용자 정보를 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('tempUser', JSON.stringify(tempUser));
        localStorage.setItem('userName', tempUser.name);
        console.log('User info saved to localStorage after successful login');
      }

      // 로그인 성공 효과음 재생
      stopAllSounds();
      await playSound('/sfx/epic-intro.mp3', 0.35);
      setIsStarting(true);

      // 메뉴 페이지로 이동
      setTimeout(() => {
        setIsStarted(true);
        setShowMenuPage(true);
        setIsStarting(false);
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.");
      await playSound('/sfx/type1.mp3', 0.3);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const handleLogout = () => {
    // AI 대화 데이터를 개인별로 저장 (이미 addChatMessage에서 자동 저장됨)
    console.log('AI chat data is automatically saved per user');
    
    // 모든 상태 초기화
    setIsStarted(false);
    setShowMenuPage(false);
    setShowRegisterPage(false);
    setCurrentStage(null);
    setCurrentQuestionIndex(0);
    setIsRecording(false);
    setIsPlaying(false);
    setCurrentAnswer("");
    setSections(storyStages);
    setProgress(0);
    setShowAutobiography(false);
    setGeneratedImages([]);
    setIsGeneratingImages(false);
    setImageGenerationProgress(0);
    setCurrentGeneratingImage(0);
    setGenerationStatus("");
    
    // 사용자 정보 초기화
    setName("");
    setUserPassword("");
    setUserBirthYear("");
    setUserGender("");
    setImageStyle("동화");
    setShowStyleDropdown(false);
    setIsLoading(false);
    setLoginError("");
    setLocation("");
    setUserNationality("");
    
    // AI 기능별 상태 초기화
    setShowAIChat(false);
    setShowCharacterSelect(false);
    setSelectedCharacter("");
    setCustomCharacter("");
    setAiChatMessages([]);
    setAiChatMessage("");
    setIsVoiceRecording(false);
    setPreviousCharacters([]);
    setShowAIDiary(false);
    setShowAIFinance(false);
    setShowAIAlbum(false);
    setShowBlog(false);
    setShowBlogManagement(false);
    setShowBookFlipAnimation(false);
    setShowSectionAutobiography(null);
    setEditingSection(null);
    setEditedAutobiography("");
    setSaveMessage("");
    setGeneratedImages([]);
    setCurrentGeneratingIndex(0);
    
    // 블로그 관리 관련 상태 초기화
    setBlogTitle("");
    setBlogDescription("");
    setBlogCustomUrl("");
    setBlogIsPublic(false);
    setUserBlogs([]);
    setBlogViews(0);
    setSelectedBlog(null);
    setShowBlogView(false);
    
    // AI 기능별 데이터 상태 초기화
    setAiDiaryContent("");
    setAiDiaryMood("");
    setAiDiaryWeather("");
    setAiFinanceItem("");
    setAiFinanceAmount("");
    setAiFinanceCategory("");
    setAiFinanceMemo("");
    setAiAlbumDescription("");
    
    // 자동 저장된 로그인 정보도 클리어
    setRememberCredentials(false);
    
    // 로컬 스토리지 클리어 (AI 대화 데이터는 유지)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tempUser');
      localStorage.removeItem('userName');
      localStorage.removeItem('userBirthYear');
      localStorage.removeItem('userGender');
      localStorage.removeItem('userNationality');
      localStorage.removeItem('editedSections');
      localStorage.removeItem('sectionAutobiographies');
      localStorage.removeItem('userBlogs');
      localStorage.removeItem('savedCredentials');
      console.log('User data cleared from localStorage (AI chat data preserved)');
    }
    
    console.log('Logout completed - AI chat data preserved per user');
  };

  // 블로그 PDF 다운로드 함수
  const downloadBlogAsPDF = async (blog: any) => {
    try {
      // 임시 HTML 요소 생성
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '800px'
      tempDiv.style.padding = '40px'
      tempDiv.style.fontFamily = 'Noto Sans KR, Arial, sans-serif'
      tempDiv.style.fontSize = '14px'
      tempDiv.style.lineHeight = '1.6'
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.color = 'black'
      
      const sections = blog.sections || []
      
      // HTML 내용 생성
      let content = `
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e74c3c; padding-bottom: 20px;">
          <h1 style="color: #333; margin: 0 0 10px 0; font-size: 28px;">${blog.title}</h1>
          <p style="color: #666; margin: 5px 0; font-size: 16px;">${blog.description || ''}</p>
          <p style="color: #999; margin: 5px 0; font-size: 14px;">작성일: ${new Date(blog.createdAt).toLocaleDateString('ko-KR')}</p>
        </div>
      `

      sections.forEach((section: any, index: number) => {
        if (section.answers && section.answers.some((answer: string) => answer && answer.trim())) {
          content += `
            <div style="margin-bottom: 30px;">
              <h2 style="color: #2c3e50; margin: 30px 0 15px 0; font-size: 20px; border-left: 4px solid #3498db; padding-left: 15px;">${section.title}</h2>
          `
          
          // 질문과 답변
          section.questions.forEach((question: string, qIndex: number) => {
            const answer = section.answers[qIndex]
            if (answer && answer.trim()) {
              content += `
                <div style="margin-bottom: 15px;">
                  <div style="font-weight: bold; color: #34495e; margin-bottom: 8px; font-size: 15px;">${question}</div>
                  <div style="margin-bottom: 15px; padding-left: 20px; color: #2c3e50;">${answer}</div>
                </div>
              `
            }
          })

          // 자서전 텍스트
          if (section.editedAutobiography) {
            content += `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #e74c3c;">
                <strong style="color: #e74c3c;">자서전:</strong><br>
                <div style="margin-top: 10px; line-height: 1.8;">${section.editedAutobiography}</div>
              </div>
            `
          }

          content += `</div>`
        }
      })

      content += `
        <div style="text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 12px; border-top: 1px solid #ecf0f1; padding-top: 20px;">
          <p>이 자서전은 AI 자서전 생성기로 작성되었습니다.</p>
        </div>
      `

      tempDiv.innerHTML = content
      document.body.appendChild(tempDiv)

      // HTML을 캔버스로 변환
      const canvas = await html2canvas(tempDiv, {
        useCORS: true,
        allowTaint: true,
        background: '#ffffff'
      })

      // 캔버스를 PDF로 변환
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 너비
      const pageHeight = 295 // A4 높이
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // PDF 다운로드
      const fileName = `${blog.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_자서전.pdf`
      pdf.save(fileName)

      // 임시 요소 제거
      document.body.removeChild(tempDiv)

      alert('자서전이 PDF 파일로 다운로드되었습니다.')
    } catch (error) {
      console.error('PDF 다운로드 오류:', error)
      alert('다운로드에 실패했습니다. 다시 시도해주세요.')
    }
  };

  // 회원가입 페이지 초기화 함수
  const initializeRegisterPage = () => {
    // 회원가입 페이지에서만 사용자 정보 초기화
    setName("");
    setUserPassword("");
    setUserBirthYear("");
    setUserGender("");
    setUserNationality("");
    setLoginError("");
    console.log('Register page initialized with empty values');
  };
  // 회원가입 함수
  const handleRegister = async () => {
    try {
      setIsLoading(true);
      setLoginError("");

      // 입력 검증
      if (!name.trim()) {
        setLoginError("이름을 입력해주세요.");
        await playSound('/sfx/type1.mp3', 0.3);
        return;
      }

      if (!userPassword) {
        setLoginError("비밀번호를 입력해주세요.");
        await playSound('/sfx/type1.mp3', 0.3);
        return;
      }

      if (userPassword.length < 4) {
        setLoginError("비밀번호는 4자 이상이어야 합니다.");
        await playSound('/sfx/type1.mp3', 0.3);
        return;
      }

      console.log('Starting registration process...');
      
      // 회원가입 전 디버깅 정보 출력 (supabase 함수가 import되지 않았으므로 주석 처리)
      console.log('=== PRE-REGISTRATION DEBUG ===');
      // debugUserRegistration();
      console.log('=== END PRE-REGISTRATION DEBUG ===');

      // 회원가입 시도 (supabase 함수가 import되지 않았으므로 주석 처리)
      // 표준적인 이메일 형식 사용
      const uniqueEmail = `testuser@gmail.com`;
      console.log('생성된 이메일:', uniqueEmail); // 디버깅용
      console.log('Attempting to register user with name:', name.trim());
      // const newUser = await registerUser(name.trim(), uniqueEmail, userPassword, userBirthYear || undefined, userGender || undefined, undefined);
      // console.log('Registration successful:', newUser);
      
      // 임시 사용자 객체 생성 (supabase 없이 로컬에서만 작동)
      const newUser = {
        id: generateUniqueId(),
        name: name.trim(),
        email: uniqueEmail,
        password_hash: userPassword,
        created_at: new Date().toISOString(),
        birth_date: userBirthYear || undefined,
        gender: userGender || undefined,
        nationality: userNationality || undefined
      };
      console.log('Local user created:', newUser);

      // 사용자 정보를 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('tempUser', JSON.stringify(newUser));
        localStorage.setItem('userName', newUser.name);
        localStorage.setItem('userBirthYear', newUser.birth_date || '');
        localStorage.setItem('userGender', newUser.gender || '');
        localStorage.setItem('userNationality', newUser.nationality || '');
        console.log('User saved to localStorage');
      }

      // 회원가입 후 사용자 정보 설정
      if (newUser.birth_date) {
        setUserBirthYear(newUser.birth_date);
      }
      if (newUser.gender) {
        setUserGender(newUser.gender);
      }

      // 회원가입 후 기본 자서전 데이터 생성 및 저장
      try {
        const defaultAutobiography = {
          content: `${newUser.name}의 자서전`,
          image_style: "동화",
          sections: storyStages,
          is_public: false
        };
        
        // await saveAIAutobiography(newUser.id, defaultAutobiography.content, defaultAutobiography.image_style, defaultAutobiography.sections, defaultAutobiography.is_public);
        console.log('Default autobiography created for new user:', newUser.name);
        
        // 기본 섹션 데이터를 사용자별로 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem(`sections_${newUser.name}`, JSON.stringify(storyStages));
          localStorage.setItem(`editedSections_${newUser.name}`, JSON.stringify(storyStages));
          console.log('Default sections saved for new user:', newUser.name);
        }
      } catch (autobiographyError) {
        console.warn('Failed to create default autobiography:', autobiographyError);
      }

      // 회원가입 후 디버깅 정보 출력 (supabase 함수가 import되지 않았으므로 주석 처리)
      console.log('=== REGISTRATION COMPLETE DEBUG ===');
      // debugUserRegistration();
      console.log('=== END REGISTRATION DEBUG ===');

      // 회원가입 성공 후 사용자 정보 설정 (로그인 상태로 만들기)
      setName(newUser.name);
      if (newUser.birth_date) {
        setUserBirthYear(newUser.birth_date);
      }
      if (newUser.gender) {
        setUserGender(newUser.gender);
      }
      if (newUser.nationality) {
        setUserNationality(newUser.nationality);
      }

      // 회원가입 성공 효과음 재생
      stopAllSounds();
      await playSound('/sfx/epic-intro.mp3', 0.35);
      setIsStarting(true);

      // 메뉴 페이지로 이동
      setTimeout(() => {
        setIsStarted(true);
        setShowMenuPage(true);
        setIsStarting(false);
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      setLoginError(error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다.");
      await playSound('/sfx/type1.mp3', 0.3);
    } finally {
      setIsLoading(false);
    }
  };

  // 자동저장된 로그인 정보 로드 함수
  const loadCredentials = () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const savedUsername = localStorage.getItem('savedUsername');
      const savedPassword = localStorage.getItem('savedPassword');
      const savedRememberCredentials = localStorage.getItem('rememberCredentials');
      
      if (savedUsername && savedPassword && savedRememberCredentials === 'true') {
        setName(savedUsername);
        setUserPassword(savedPassword);
        setRememberCredentials(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load credentials:', error);
      return false;
    }
  };

  // 자동저장된 로그인 정보 저장 함수
  const saveCredentials = (username: string, password: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('savedUsername', username);
      localStorage.setItem('savedPassword', password);
      localStorage.setItem('rememberCredentials', 'true');
      console.log('Login credentials saved for auto-login');
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  };

  // 클라이언트 전용 렌더링을 위한 useEffect
  useEffect(() => {
    setIsClient(true);
    initializeSpeechRecognition();
    
    // 자동저장된 로그인 정보 로드
    const hasSavedCredentials = loadCredentials();
    
    // Notion 설정 로드
    if (typeof window !== 'undefined') {
      const savedNotionApiKey = localStorage.getItem('notionApiKey');
      const savedNotionDatabaseId = localStorage.getItem('notionDatabaseId');
      const savedNotionConnected = localStorage.getItem('notionConnected');
      
      if (savedNotionApiKey) setNotionApiKey(savedNotionApiKey);
      if (savedNotionDatabaseId) setNotionDatabaseId(savedNotionDatabaseId);
      if (savedNotionConnected === 'true') setNotionConnected(true);
    }

    // 프로필 정보 로드
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          setUserBirthYear(profileData.birthYear || "");
          setUserGender(profileData.gender || "");
          setUserNationality(profileData.nationality || "");
          setImageStyle(profileData.imageStyle || "동화");
          setProfileImage(profileData.profileImage || "");
        } catch (error) {
          console.error('프로필 정보 로드 오류:', error);
        }
      }
    }
    
    // 저장된 AI 그림일기 로드
    loadSavedDiaryEntries();
    
    // 자동저장된 정보가 없으면 로그인 화면에서는 사용자 정보를 초기화하여 빈 상태로 시작
    if (!hasSavedCredentials) {
      setName("");
      setUserPassword("");
    }
    
    setUserBirthYear("");
    setUserGender("");
    setUserNationality("");
    setLoginError("");
    
    console.log('Component initialized - login screen ready with empty fields');
    
    // 수정된 섹션 데이터 불러오기 (전역 데이터만 로드)
    if (typeof window !== 'undefined') {
      const savedEditedSections = localStorage.getItem('editedSections');
      if (savedEditedSections) {
        try {
          const parsedSections = JSON.parse(savedEditedSections);
          setSections(parsedSections);
        } catch (e) {
          console.error('Failed to load edited sections:', e);
        }
      }
      
      // 섹션별 자서전 데이터 불러오기 (전역 데이터만 로드)
      const sectionAutobiographies = loadSectionAutobiographies();
      if (Object.keys(sectionAutobiographies).length > 0) {
        console.log('Global section autobiographies loaded on component mount');
      }
      
      // 저장된 블로그 목록 불러오기
      const savedUserBlogs = localStorage.getItem('userBlogs');
      if (savedUserBlogs) {
        try {
          const parsedBlogs = JSON.parse(savedUserBlogs);
          setUserBlogs(parsedBlogs);
        } catch (e) {
          console.error('Failed to load user blogs:', e);
        }
      }
    }
  }, []);

  // 블로그 관리 페이지 로드 시 기본 제목 설정
  useEffect(() => {
    if (showBlogManagement && name.trim()) {
      setBlogTitle(`${name.trim()}의 자서전`);
      setBlogDescription(`${name.trim()}의 인생 여정을 담은 특별한 자서전입니다.`);
      setBlogCustomUrl(`${name.trim().toLowerCase().replace(/\s+/g, '-')}-autobiography`);
    }
  }, [showBlogManagement, name]);

  // AI 대화 페이지 로드 시 음성 인사 실행 및 이전 캐릭터 불러오기
  useEffect(() => {
    if (showAIChat) {
      // 이전 대화 캐릭터들 불러오기
      const loadPreviousCharacters = async () => {
        if (name.trim()) {
          try {
            // getAIChatCharacters 함수가 import되지 않았으므로 기본값 사용
            // const characters = await getAIChatCharacters(name.trim());
            // setPreviousCharacters(characters);
            setPreviousCharacters([]);
          } catch (error) {
            console.error('이전 캐릭터 불러오기 실패:', error);
            setPreviousCharacters([]);
          }
        }
      };
      
      loadPreviousCharacters();
      
              // 첫 대화인 경우에만 인사말 추가
        if (aiChatMessages.length === 0) {
          const generateGreeting = () => {
            // 사용자 정보가 있으면 개인화된 인사말 생성
            if (name.trim() && userGender && userBirthYear) {
              const userAge = calculateAge(userBirthYear);
              const userBasedCharacter = generateUserBasedCharacter(name.trim(), userGender, userAge);
              return userBasedCharacter.greeting;
            }
            
            // 사용자 정보가 없으면 기본 캐릭터 인사말 사용
            const currentCharacter = selectedCharacter === "기타" ? customCharacter : 
                                    selectedCharacter === "개인화" ? customCharacter : selectedCharacter;
            const characterData = characterInfo[currentCharacter as keyof typeof characterInfo];
            
            if (characterData && characterData.greeting) {
              return characterData.greeting;
            }
            
            // 기본 인사말 (기타 캐릭터용)
            const now = new Date();
            const hour = now.getHours();
            const month = now.getMonth() + 1;
            
            // 시간대별 인사
            let timeGreeting = '';
            if (hour >= 5 && hour < 12) {
              timeGreeting = '좋은 아침입니다';
            } else if (hour >= 12 && hour < 18) {
              timeGreeting = '좋은 오후입니다';
            } else if (hour >= 18 && hour < 22) {
              timeGreeting = '좋은 저녁입니다';
            } else {
              timeGreeting = '안녕하세요';
            }
            
            // 계절별 날씨 인사
            let weatherGreeting = '';
            if (month >= 3 && month <= 5) {
              weatherGreeting = '봄날씨가 참 좋네요';
            } else if (month >= 6 && month <= 8) {
              weatherGreeting = '여름 더위가 있지만 건강하시죠';
            } else if (month >= 9 && month <= 11) {
              weatherGreeting = '가을 날씨가 상쾌하네요';
            } else {
              weatherGreeting = '겨울 추위에 건강 조심하세요';
            }
            
            // 사용자 이름이 있으면 포함
            const userName = name.trim() || '고객님';
            
            const greeting = `${timeGreeting}, ${userName}. ${weatherGreeting}.`;
            
            return greeting;
          };
          
          const greeting = generateGreeting();
          console.log('AI Greeting:', greeting);
          
          // 음성으로 인사말 재생
          speakQuestion(greeting);
          
          // 인사말을 카톡 메시지로 추가
          addChatMessage('ai', greeting);
        }
    }
  }, [showAIChat, name, aiChatMessages.length]);

  // 채팅 메시지가 추가될 때마다 자동으로 맨 아래로 스크롤
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiChatMessages]);

  // 클라이언트가 로드되지 않았으면 로딩 화면 표시
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  // 시작 화면
  if (!isStarted && !showRegisterPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
        <Starfield explode={isStarting} />
            </div>
        <Card className="w-full max-w-lg text-center border-2 border-yellow-700 shadow-2xl bg-gradient-to-br from-amber-900/90 to-orange-900/95 relative z-10 pb-8">
          <CardHeader className="pb-4">
            {/* 로고 이미지 */}
            <div className="flex justify-center mb-6">
              <img 
                src="/lifecast-logo.png" 
                alt="AI Life Cast Logo" 
                className="h-28 w-auto max-w-[320px] object-contain drop-shadow-2xl rounded-2xl ring-4 ring-yellow-300 bg-gradient-to-r from-yellow-200/80 to-orange-200/80 p-2 shadow-yellow-400/60"
                style={{ boxShadow: '0 8px 32px 0 rgba(255, 200, 0, 0.25), 0 1.5px 0 #fff' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="text-4xl font-extrabold text-white drop-shadow-lg">AI Life Cast</div>';
                  }
                }}
              />
            </div>
            <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">AI Life Cast</CardTitle>
            <CardDescription className="text-yellow-100 text-xl">당신의 이야기를 AI와 함께 만들어보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="이름 (ID)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
                lang="ko"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={userPassword}
                onChange={e => setUserPassword(e.target.value)}
                className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
                lang="ko"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
              />
              
              {/* 자동저장 체크박스 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberCredentials"
                  checked={rememberCredentials}
                  onChange={e => setRememberCredentials(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-amber-900/50 border-yellow-700 rounded focus:ring-yellow-500 focus:ring-2"
                />
                <label htmlFor="rememberCredentials" className="text-yellow-200 text-sm font-serif">
                  이름과 비밀번호 자동저장
                </label>
              </div>
              
              {loginError && (
                <div className="text-red-400 text-sm">{loginError}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-700 hover:to-yellow-500 text-amber-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-yellow-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-yellow-300 border-t-transparent rounded-full" />
                    로그인 중...
                  </div>
                ) : (
                  "로그인"
                )}
              </Button>
              <Button
                onClick={() => {
                  initializeRegisterPage();
                  setShowRegisterPage(true);
                }}
                variant="outline"
                className="w-full border-yellow-400 text-yellow-200 hover:bg-yellow-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-yellow-700"
              >
                회원가입
              </Button>
            </div>
          </CardContent>
          
          {/* 팀 정보 */}
          <div className="text-center mt-8 text-white/90 text-sm">
            <div className="font-semibold mb-1 tracking-wide">팀 라이프캐스트</div>
            <div className="text-xs text-white/70 tracking-wide">팀장 이주혜, 류미란, 이수영, 박강원</div>
          </div>
        </Card>
      </div>
    );
  }

  // 회원가입 페이지
  if (showRegisterPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Starfield explode={isStarting} />
        </div>
        <Card className="w-full max-w-lg text-center border-2 border-yellow-700 shadow-2xl bg-gradient-to-br from-amber-900/90 to-orange-900/95 relative z-10 pb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">회원가입</CardTitle>
            <CardDescription className="text-yellow-100 text-xl">기본 정보를 입력해 회원가입을 완료하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="이름 (ID)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
                lang="ko"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={userPassword}
                onChange={e => setUserPassword(e.target.value)}
                className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
                lang="ko"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
              />
              <input
                type="text"
                placeholder="생년월일(YYYYMMDD)"
                value={userBirthYear}
                onChange={e => setUserBirthYear(e.target.value)}
                className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
                lang="ko"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
              />
              <select
                value={userGender}
                onChange={e => {
                  const newGender = e.target.value;
                  setUserGender(newGender);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('userGender', newGender);
                    console.log('Gender updated in register page:', newGender);
                  }
                }}
                className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 font-serif"
              >
                <option value="">성별 선택</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
                <option value="기타">기타</option>
              </select>
              <input
                type="text"
                value={userNationality}
                onChange={e => setUserNationality(e.target.value)}
                placeholder="국적(예: 대한민국)"
                className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif mt-2"
                lang="ko"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
              />
              {loginError && (
                <div className="text-red-400 text-sm">{loginError}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={async () => {
                  await handleRegister();
                  setShowRegisterPage(false);
                }}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-700 hover:to-yellow-500 text-amber-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-yellow-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-yellow-300 border-t-transparent rounded-full" />
                    회원가입 중...
                  </div>
                ) : (
                  "회원가입"
                )}
              </Button>
              <Button
                onClick={() => setShowRegisterPage(false)}
                variant="outline"
                className="w-full border-yellow-400 text-yellow-200 hover:bg-yellow-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-yellow-700"
              >
                돌아가기
              </Button>
            </div>
          </CardContent>
          
          {/* 팀 정보 */}
          <div className="text-center mt-8 text-white/90 text-sm">
            <div className="font-semibold mb-1 tracking-wide">팀 라이프캐스트</div>
            <div className="text-xs text-white/70 tracking-wide">팀장 이주혜, 류미란, 이수영, 박강원</div>
          </div>
        </Card>
      </div>
    );
  }
  // AI 대화 페이지
  if (showAIChat) {
    // 캐릭터 선택 화면
    if (showCharacterSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-800 to-blue-900">
        <Starfield explode={false} />
          <Card className="w-full max-w-2xl text-center border-2 border-blue-700 shadow-2xl bg-gradient-to-br from-blue-900/90 to-blue-800/95 relative z-20">
                      <CardHeader className="pb-6">
            <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-4">대화상대 선택</CardTitle>
            <div className="text-blue-100 text-xl">
              {name.trim() && userGender && userBirthYear ? (
                <div>
                  <div>안녕하세요, {name.trim()}님!</div>
                  <div className="text-sm mt-1">
                    {userGender === '남성' ? '남성' : userGender === '여성' ? '여성' : '기타'} • {calculateAge(userBirthYear)}세
                  </div>
                  <div className="text-sm mt-2">개인화된 대화를 위해 맞춤 캐릭터를 추천해드려요</div>
                </div>
              ) : (
                "누구와 대화하고 싶으신가요?"
              )}
            </div>
          </CardHeader>
            <CardContent className="space-y-4">
              {/* 이전 대화 캐릭터들 */}
              {previousCharacters.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">이전 대화</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {previousCharacters.map((character) => (
                      <Card 
                        key={character}
                        className="cursor-pointer transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-800/50 to-emerald-800/50 border-green-400"
                                            onClick={() => {
                      setSelectedCharacter("기타");
                      setCustomCharacter(character);
                      resetConversationContext(); // 대화 맥락 초기화
                    }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">💬</div>
                            <div>
                              <div className="text-lg font-bold text-white">{character}</div>
                              <div className="text-green-200 text-sm">이전 대화 이어가기</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 개인화된 캐릭터 (사용자 정보가 있을 때만 표시) */}
                {name.trim() && userGender && userBirthYear && (
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedCharacter === "개인화" ? "ring-4 ring-green-400 bg-gradient-to-br from-green-500/20 to-emerald-500/20" : "bg-gradient-to-br from-green-800/50 to-emerald-800/50"
                    }`}
                    onClick={() => {
                      // 개인화된 캐릭터 선택 시 특별 처리
                      const userAge = calculateAge(userBirthYear);
                      const userBasedCharacter = generateUserBasedCharacter(name.trim(), userGender, userAge);
                      setSelectedCharacter("개인화");
                      setCustomCharacter(userBasedCharacter.name);
                      resetConversationContext(); // 대화 맥락 초기화
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="text-4xl mb-3">✨</div>
                      <div className="text-xl font-bold text-white mb-2">
                        {(() => {
                          const userAge = calculateAge(userBirthYear);
                          const userBasedCharacter = generateUserBasedCharacter(name.trim(), userGender, userAge);
                          return userBasedCharacter.name;
                        })()}
                      </div>
                      <div className="text-green-200 text-sm">
                        {(() => {
                          const userAge = calculateAge(userBirthYear);
                          const userBasedCharacter = generateUserBasedCharacter(name.trim(), userGender, userAge);
                          return userBasedCharacter.personality;
                        })()}
                      </div>
                      <div className="text-green-300 text-xs mt-1">맞춤 추천</div>
                    </CardContent>
                  </Card>
                )}

                {/* 남자친구 */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedCharacter === "남자친구" ? "ring-4 ring-pink-400 bg-gradient-to-br from-pink-500/20 to-red-500/20" : "bg-gradient-to-br from-blue-800/50 to-purple-800/50"
                  }`}
                  onClick={() => setSelectedCharacter("남자친구")}
                >
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">💕</div>
                    <div className="text-xl font-bold text-white mb-2">남자친구</div>
                    <div className="text-blue-200 text-sm">따뜻하고 이해심 깊은</div>
                  </CardContent>
                </Card>

                {/* 여자친구 */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedCharacter === "여자친구" ? "ring-4 ring-pink-400 bg-gradient-to-br from-pink-500/20 to-red-500/20" : "bg-gradient-to-br from-blue-800/50 to-purple-800/50"
                  }`}
                  onClick={() => setSelectedCharacter("여자친구")}
                >
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">💖</div>
                    <div className="text-xl font-bold text-white mb-2">여자친구</div>
                    <div className="text-blue-200 text-sm">사랑스럽고 공감 능력이 뛰어난</div>
                  </CardContent>
                </Card>

                {/* 선생님 */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedCharacter === "선생님" ? "ring-4 ring-pink-400 bg-gradient-to-br from-pink-500/20 to-red-500/20" : "bg-gradient-to-br from-blue-800/50 to-purple-800/50"
                  }`}
                  onClick={() => {
                    setSelectedCharacter("선생님");
                    resetConversationContext(); // 대화 맥락 초기화
                  }}
                >
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">👨‍🏫</div>
                    <div className="text-xl font-bold text-white mb-2">선생님</div>
                    <div className="text-blue-200 text-sm">지혜롭고 따뜻한</div>
                  </CardContent>
                </Card>

                {/* 기타 */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedCharacter === "기타" ? "ring-4 ring-pink-400 bg-gradient-to-br from-pink-500/20 to-red-500/20" : "bg-gradient-to-br from-blue-800/50 to-purple-800/50"
                  }`}
                  onClick={() => {
                    setSelectedCharacter("기타");
                    resetConversationContext(); // 대화 맥락 초기화
                  }}
                >
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">🎭</div>
                    <div className="text-xl font-bold text-white mb-2">기타</div>
                    <div className="text-blue-200 text-sm">직접 입력</div>
                  </CardContent>
                </Card>
              </div>

              {/* 기타 캐릭터 입력 */}
              {selectedCharacter === "기타" && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={customCharacter}
                    onChange={(e) => setCustomCharacter(e.target.value)}
                    placeholder="대화상대 이름을 입력하세요 (예: 친구, 동료, 가족 등)"
                    className="w-full rounded-lg px-4 py-3 bg-white/10 text-white placeholder-blue-200 border border-blue-400 focus:border-blue-300 focus:outline-none"
                    maxLength={20}
                    lang="ko"
                    inputMode="text"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
              )}

              <div className="flex gap-4 justify-center mt-6">
                <Button 
                  onClick={() => {
                    setShowAIChat(false);
                    setShowMenuPage(true);
                  }}
                  variant="outline"
                  className="border-blue-300 text-blue-100 hover:bg-blue-800 px-8 py-3"
                >
                  돌아가기
                </Button>
                <Button 
                  onClick={async () => {
                    if (selectedCharacter === "기타" && !customCharacter.trim()) {
                      alert("대화상대 이름을 입력해주세요.");
                      return;
                    }
                    
                    // 이전 대화 불러오기 (supabase 함수가 import되지 않았으므로 주석 처리)
                    if (name.trim()) {
                      try {
                        const currentCharacter = selectedCharacter === "기타" ? customCharacter : 
                                                selectedCharacter === "개인화" ? customCharacter : selectedCharacter;
                        // const savedMessages = await getAIChatMessages(name.trim(), currentCharacter);
                        
                        // if (savedMessages.length > 0) {
                        //   const formattedMessages = savedMessages.map(msg => ({
                        //     id: msg.id,
                        //     type: msg.message_type as 'user' | 'ai',
                        //     message: msg.message,
                        //     timestamp: new Date(msg.timestamp)
                        //   }));
                        //   setAiChatMessages(formattedMessages);
                        // }
                      } catch (error) {
                        console.error('이전 대화 불러오기 실패:', error);
                      }
                    }
                    
                    setShowCharacterSelect(false);
                    resetConversationContext(); // 대화 맥락 초기화
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  disabled={!selectedCharacter || (selectedCharacter === "기타" && !customCharacter.trim())}
                >
                  대화 시작하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // 실제 대화 화면
    const currentCharacter = selectedCharacter === "기타" ? customCharacter : 
                            selectedCharacter === "개인화" ? customCharacter : selectedCharacter;
    const characterData = characterInfo[currentCharacter as keyof typeof characterInfo];

    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-800 to-blue-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-4xl h-[80vh] flex flex-col border-2 border-blue-700 shadow-2xl bg-gradient-to-br from-blue-900/90 to-blue-800/95 relative z-20">
          <CardHeader className="pb-4 border-b border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-extrabold text-white drop-shadow-lg mb-2">AI 대화</CardTitle>
                <CardDescription className="text-blue-100 text-lg">AI와 자유롭게 대화해보세요</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-2">
                  <span className="text-2xl">{characterData?.emoji || "🎭"}</span>
                  <div className="text-white font-semibold">{currentCharacter}</div>
                </div>
                <Button 
                  onClick={startVoiceRecognition}
                  disabled={isVoiceRecording}
                  className={`rounded-full px-4 py-2 ${
                    isVoiceRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isVoiceRecording ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      음성 인식 중...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      음성으로 대화
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCharacterSelect(true);
                    setAiChatMessages([]);
                  }}
                  className="border-blue-300 text-blue-100 hover:bg-blue-800 rounded-full px-4 py-2"
                >
                  상대 변경
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // AI 대화 화면을 숨기고 메뉴 페이지로 이동
                    setShowAIChat(false);
                    setShowMenuPage(true);
                    // 대화 내용 초기화
                    setAiChatMessages([]);
                    resetConversationContext();
                  }}
                  className="border-blue-300 text-blue-100 hover:bg-blue-800 rounded-full px-4 py-2"
                >
                  나가기
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* 카톡 메시지 영역 */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-900/50 to-blue-800/30">
            {aiChatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'ai' && (
                  <div className="flex items-end mr-2">
                    <div className="text-2xl">{characterData?.emoji || "🎭"}</div>
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md'
                  }`}
                >
                  <div className="text-sm">{msg.message}</div>
                  <div className={`text-xs mt-1 ${
                    msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 메시지 입력 영역 */}
          <CardContent className="pt-4 border-t border-blue-600">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiChatMessage}
                onChange={(e) => setAiChatMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && aiChatMessage.trim()) {
                    // 맥락을 고려한 대화 처리
                    addChatMessage('user', aiChatMessage.trim());
                    setAiChatMessage('');
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className="flex-1 rounded-full px-4 py-3 bg-white/10 text-white placeholder-blue-200 border border-blue-400 focus:border-blue-300 focus:outline-none"
                lang="ko"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
              />
                <Button 
                onClick={() => {
                  if (aiChatMessage.trim()) {
                    // 맥락을 고려한 대화 처리
                    addChatMessage('user', aiChatMessage.trim());
                    setAiChatMessage('');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3"
                disabled={!aiChatMessage.trim()}
              >
                전송
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // AI 그림일기 챗봇 페이지
  if (showAIDiary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-green-800 to-green-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-4xl text-center border-2 border-green-700 shadow-2xl bg-gradient-to-br from-green-900/90 to-green-800/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">AI 그림일기 챗봇</CardTitle>
                <CardDescription className="text-green-100 text-xl">AI와 대화하며 그림일기를 만들어보세요</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDiaryChatMode('text')}
                  className={`${diaryChatMode === 'text' ? 'bg-green-600 text-white' : 'border-green-300 text-green-100 hover:bg-green-800'}`}
                >
                  💬 텍스트
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDiaryChatMode('voice')}
                  className={`${diaryChatMode === 'voice' ? 'bg-green-600 text-white' : 'border-green-300 text-green-100 hover:bg-green-800'}`}
                >
                  🎤 음성
                </Button>
                {notionConnected && (
                  <div className="flex items-center gap-2 bg-green-800/50 rounded-full px-3 py-1 border border-green-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-100 text-sm font-medium">Notion 연동됨</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 챗봇 대화 영역 */}
            <div className="space-y-4">
              <div 
                ref={diaryChatContainerRef}
                className="h-96 overflow-y-auto bg-green-800/20 rounded-lg p-4 border border-green-600"
              >
                {diaryChatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🤖</div>
                    <p className="text-green-200">AI와 대화를 시작해보세요!</p>
                    <Button
                      onClick={() => sendDiaryChatMessage('시작')}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                      대화 시작하기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {diaryChatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-700/50 text-green-100 border border-green-600'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.message}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isDiaryChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-green-700/50 text-green-100 border border-green-600 px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 입력 영역 */}
              <div className="flex gap-2">
                {diaryChatMode === 'text' ? (
                  <>
                    <input
                      type="text"
                      value={diaryChatInput}
                      onChange={(e) => setDiaryChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && diaryChatInput.trim() && !isDiaryChatLoading) {
                          sendDiaryChatMessage(diaryChatInput.trim());
                        }
                      }}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 rounded-full px-4 py-3 bg-white/10 text-white placeholder-green-200 border border-green-400 focus:border-green-300 focus:outline-none"
                      disabled={isDiaryChatLoading}
                    />
                    <Button
                      onClick={() => sendDiaryChatMessage(diaryChatInput.trim())}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-3"
                      disabled={!diaryChatInput.trim() || isDiaryChatLoading}
                    >
                      전송
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 rounded-full px-4 py-3 bg-white/10 text-white border border-green-400 flex items-center justify-center">
                      {isDiaryVoiceRecording ? (
                        <span className="text-green-200">🎤 음성 인식 중...</span>
                      ) : (
                        <span className="text-green-200">🎤 음성 버튼을 눌러 말씀해주세요</span>
                      )}
                    </div>
                    <Button
                      onClick={isDiaryVoiceRecording ? stopDiaryVoiceRecognition : startDiaryVoiceRecognition}
                      className={`rounded-full px-6 py-3 ${
                        isDiaryVoiceRecording
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      disabled={isDiaryChatLoading}
                    >
                      {isDiaryVoiceRecording ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </Button>
                  </>
                )}
              </div>

              {/* 그림 생성 진행률 표시 */}
              {isGeneratingDiaryImages && (
                <div className="space-y-4 p-4 bg-green-800/30 rounded-lg border border-green-600">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-300 animate-spin" />
                    <span className="text-green-100 font-medium">AI가 4컷 그림을 그리고 있어요...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-green-200">
                      <span>진행률</span>
                      <span>{diaryImageProgress}%</span>
                    </div>
                    <Progress value={diaryImageProgress} className="h-3" />
                  </div>
                </div>
              )}

              {/* 생성된 4컷 그림 표시 */}
              {diaryImages.length > 0 && !isGeneratingDiaryImages && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-green-100">🎨 생성된 4컷 그림일기</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {diaryImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={imageUrl} 
                          alt={`일기 그림 ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-green-600 shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                          <Button
                            variant="outline"
                            onClick={() => window.open(imageUrl, '_blank')}
                            className="border-white text-white hover:bg-white/20"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            다운로드
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                          {index + 1}컷
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const zip = new JSZip();
                        diaryImages.forEach((imageUrl, index) => {
                          fetch(imageUrl)
                            .then(response => response.blob())
                            .then(blob => {
                              zip.file(`일기그림_${index + 1}.png`, blob);
                            });
                        });
                        zip.generateAsync({type: 'blob'}).then(content => {
                          const url = window.URL.createObjectURL(content);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `AI그림일기_${new Date().toISOString().split('T')[0]}.zip`;
                          a.click();
                        });
                      }}
                      className="border-green-300 text-green-100 hover:bg-green-800"
                    >
                      📦 전체 다운로드
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDiaryImages([])}
                      className="border-red-300 text-red-100 hover:bg-red-800"
                    >
                      🗑️ 그림 삭제
                    </Button>
                  </div>
                </div>
              )}

              {/* 하단 버튼들 */}
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant="outline"
                  onClick={resetDiaryChat}
                  className="border-blue-300 text-blue-100 hover:bg-blue-800"
                >
                  🔄 새로 시작
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowDiaryGallery(true)}
                  className="border-yellow-300 text-yellow-100 hover:bg-yellow-800"
                >
                  📚 그림일기 갤러리
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setShowAIDiary(false); setShowMenuPage(true); }}
                  className="border-green-300 text-green-100 hover:bg-green-800"
                >
                  돌아가기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  // AI 그림일기 갤러리 페이지
  if (showDiaryGallery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-yellow-800 to-orange-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-6xl text-center border-2 border-yellow-700 shadow-2xl bg-gradient-to-br from-yellow-900/90 to-orange-900/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">📚 AI 그림일기 갤러리</CardTitle>
                <CardDescription className="text-yellow-100 text-xl">저장된 4컷 그림일기들을 확인해보세요</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setShowDiaryGallery(false); setShowAIDiary(true); }}
                className="border-yellow-300 text-yellow-100 hover:bg-yellow-800"
              >
                ← 그림일기 작성하기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {savedDiaryEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-yellow-100 mb-2">아직 저장된 그림일기가 없어요</h3>
                <p className="text-yellow-200 mb-6">AI 그림일기를 작성하고 4컷 그림을 생성해보세요!</p>
                <Button 
                  onClick={() => { setShowDiaryGallery(false); setShowAIDiary(true); }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  첫 번째 그림일기 작성하기
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedDiaryEntries.map((entry) => (
                    <div key={entry.id} className="bg-yellow-800/30 rounded-lg border border-yellow-600 p-4 hover:bg-yellow-800/50 transition-colors">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-bold text-yellow-100">{entry.date}의 일기</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteDiaryEntry(entry.id)}
                            className="border-red-400 text-red-200 hover:bg-red-800 text-xs"
                          >
                            🗑️
                          </Button>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="outline" className="border-yellow-400 text-yellow-200">
                            {entry.mood}
                          </Badge>
                          <Badge variant="outline" className="border-blue-400 text-blue-200">
                            {entry.weather}
                          </Badge>
                        </div>
                        <p className="text-yellow-200 text-sm line-clamp-3">
                          {entry.content}
                        </p>
                      </div>
                      
                      {/* 4컷 그림 미리보기 */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {entry.images.slice(0, 4).map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={imageUrl} 
                              alt={`일기 그림 ${index + 1}`}
                              className="w-full h-20 object-cover rounded border border-yellow-500"
                            />
                            <div className="absolute top-1 left-1 bg-yellow-600 text-white px-1 py-0.5 rounded text-xs font-medium">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // 전체 다운로드
                            const zip = new JSZip();
                            entry.images.forEach((imageUrl, index) => {
                              fetch(imageUrl)
                                .then(response => response.blob())
                                .then(blob => {
                                  zip.file(`${entry.date}_일기그림_${index + 1}.png`, blob);
                                });
                            });
                            zip.generateAsync({type: 'blob'}).then(content => {
                              const url = window.URL.createObjectURL(content);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `AI그림일기_${entry.date}.zip`;
                              a.click();
                            });
                          }}
                          className="border-green-400 text-green-200 hover:bg-green-800 text-xs flex-1"
                        >
                          📦 다운로드
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // 상세 보기 모달 (간단한 alert로 대체)
                            alert(`📖 ${entry.date}의 일기\n\n기분: ${entry.mood}\n날씨: ${entry.weather}\n\n내용:\n${entry.content}`);
                          }}
                          className="border-blue-400 text-blue-200 hover:bg-blue-800 text-xs flex-1"
                        >
                          👁️ 상세보기
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center pt-4 border-t border-yellow-600">
                  <p className="text-yellow-200 mb-2">
                    총 {savedDiaryEntries.length}개의 그림일기가 저장되어 있습니다.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { setShowDiaryGallery(false); setShowMenuPage(true); }}
                    className="border-yellow-400 text-yellow-200 hover:bg-yellow-800"
                  >
                    ← 돌아가기
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // AI 가계부 페이지
  if (showAIFinance) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-6xl text-center border-2 border-purple-700 shadow-2xl bg-gradient-to-br from-purple-900/90 to-purple-800/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">AI 가계부</CardTitle>
                <CardDescription className="text-purple-100 text-xl">AI와 함께 스마트하게 가계부를 관리해보세요</CardDescription>
                {notionConnected && (
                  <div className="flex items-center gap-2 bg-purple-800/50 rounded-full px-3 py-1 border border-purple-600 mt-2 w-fit">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-100 text-sm font-medium">Notion 연동됨</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const success = downloadFinanceDataAsExcel(financeTransactions, `${name}님의_가계부`);
                    if (success) {
                      alert('엑셀 파일이 다운로드되었습니다!');
                    } else {
                      alert('엑셀 다운로드 중 오류가 발생했습니다.');
                    }
                  }}
                  className="border-green-300 text-green-100 hover:bg-green-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  엑셀 다운로드
                </Button>
                <div className="flex gap-2">
                  <select
                    value={selectedReportYear}
                    onChange={(e) => setSelectedReportYear(parseInt(e.target.value))}
                    className="rounded px-2 py-1 bg-purple-900/50 text-purple-100 border border-purple-700 text-sm"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>
                  <select
                    value={selectedReportMonth}
                    onChange={(e) => setSelectedReportMonth(parseInt(e.target.value))}
                    className="rounded px-2 py-1 bg-purple-900/50 text-purple-100 border border-purple-700 text-sm"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}월</option>
                    ))}
                  </select>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const success = downloadMonthlyReportAsExcel(
                        financeTransactions, 
                        selectedReportYear, 
                        selectedReportMonth,
                        `${name}님의_월간보고서`
                      );
                      if (success) {
                        alert(`${selectedReportYear}년 ${selectedReportMonth}월 보고서가 다운로드되었습니다!`);
                      } else {
                        alert('월간 보고서 다운로드 중 오류가 발생했습니다.');
                      }
                    }}
                    className="border-blue-300 text-blue-100 hover:bg-blue-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    월간보고서
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => { setShowAIFinance(false); setShowMenuPage(true); }}
                  className="border-purple-300 text-purple-100 hover:bg-purple-800"
                >
                  돌아가기
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 상단 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-800/50 rounded-lg p-4 border border-purple-600">
                <div className="text-purple-200 text-sm">이번 달 총 지출</div>
                <div className="text-2xl font-bold text-white">{financeAnalysis.monthlyExpense.toLocaleString()}원</div>
              </div>
              <div className="bg-purple-800/50 rounded-lg p-4 border border-purple-600">
                <div className="text-purple-200 text-sm">이번 달 총 수입</div>
                <div className="text-2xl font-bold text-white">{financeAnalysis.monthlyIncome.toLocaleString()}원</div>
              </div>
              <div className="bg-purple-800/50 rounded-lg p-4 border border-purple-600">
                <div className="text-purple-200 text-sm">이번 달 잔액</div>
                <div className={`text-2xl font-bold ${financeAnalysis.monthlyTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {financeAnalysis.monthlyTotal.toLocaleString()}원
                </div>
              </div>
              <div className="bg-purple-800/50 rounded-lg p-4 border border-purple-600">
                <div className="text-purple-200 text-sm">거래 내역</div>
                <div className="text-2xl font-bold text-white">{financeTransactions.length}건</div>
              </div>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 왼쪽: 지출 기록 */}
              <div className="lg:col-span-2 space-y-4">
                {/* 지출 기록 폼 */}
                <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
                  <h3 className="text-xl font-bold text-white mb-4">💰 지출/수입 기록</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <input
                      type="text"
                      value={aiFinanceItem}
                      onChange={(e) => setAiFinanceItem(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter' && aiFinanceItem && aiFinanceAmount && aiFinanceCategory) {
                          // 기본적으로 지출로 등록
                          addFinanceTransaction({
                            item: aiFinanceItem,
                            amount: parseInt(aiFinanceAmount),
                            category: aiFinanceCategory,
                            memo: aiFinanceMemo,
                            type: 'expense'
                          });
                          setAiFinanceItem('');
                          setAiFinanceAmount('');
                          setAiFinanceCategory('');
                          setAiFinanceMemo('');
                        }
                      }}
                      onBlur={() => {
                        if (aiFinanceItem && aiFinanceAmount && aiFinanceCategory) {
                          // 기본적으로 지출로 등록
                          addFinanceTransaction({
                            item: aiFinanceItem,
                            amount: parseInt(aiFinanceAmount),
                            category: aiFinanceCategory,
                            memo: aiFinanceMemo,
                            type: 'expense'
                          });
                          setAiFinanceItem('');
                          setAiFinanceAmount('');
                          setAiFinanceCategory('');
                          setAiFinanceMemo('');
                        }
                      }}
                      placeholder="항목"
                      className="rounded px-3 py-2 bg-purple-900/50 text-purple-100 border border-purple-700 focus:border-purple-400 focus:outline-none"
                      lang="ko"
                      inputMode="text"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <input
                      type="number"
                      value={aiFinanceAmount}
                      onChange={(e) => setAiFinanceAmount(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter' && aiFinanceItem && aiFinanceAmount && aiFinanceCategory) {
                          // 기본적으로 지출로 등록
                          addFinanceTransaction({
                            item: aiFinanceItem,
                            amount: parseInt(aiFinanceAmount),
                            category: aiFinanceCategory,
                            memo: aiFinanceMemo,
                            type: 'expense'
                          });
                          setAiFinanceItem('');
                          setAiFinanceAmount('');
                          setAiFinanceCategory('');
                          setAiFinanceMemo('');
                        }
                      }}
                      onBlur={() => {
                        if (aiFinanceItem && aiFinanceAmount && aiFinanceCategory) {
                          // 기본적으로 지출로 등록
                          addFinanceTransaction({
                            item: aiFinanceItem,
                            amount: parseInt(aiFinanceAmount),
                            category: aiFinanceCategory,
                            memo: aiFinanceMemo,
                            type: 'expense'
                          });
                          setAiFinanceItem('');
                          setAiFinanceAmount('');
                          setAiFinanceCategory('');
                          setAiFinanceMemo('');
                        }
                      }}
                      placeholder="금액"
                      className="rounded px-3 py-2 bg-purple-900/50 text-purple-100 border border-purple-700 focus:border-purple-400 focus:outline-none"
                      lang="ko"
                      inputMode="numeric"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <select 
                      value={aiFinanceCategory}
                      onChange={(e) => setAiFinanceCategory(e.target.value)}
                      onBlur={() => {
                        if (aiFinanceItem && aiFinanceAmount && aiFinanceCategory) {
                          // 기본적으로 지출로 등록
                          addFinanceTransaction({
                            item: aiFinanceItem,
                            amount: parseInt(aiFinanceAmount),
                            category: aiFinanceCategory,
                            memo: aiFinanceMemo,
                            type: 'expense'
                          });
                          setAiFinanceItem('');
                          setAiFinanceAmount('');
                          setAiFinanceCategory('');
                          setAiFinanceMemo('');
                        }
                      }}
                      className="rounded px-3 py-2 bg-purple-900/50 text-purple-100 border border-purple-700 focus:border-purple-400 focus:outline-none"
                    >
                      <option value="">분류 선택</option>
                      <option value="식비">식비</option>
                      <option value="외식">외식</option>
                      <option value="음료">음료</option>
                      <option value="교통비">교통비</option>
                      <option value="문화생활">문화생활</option>
                      <option value="쇼핑">쇼핑</option>
                      <option value="의료">의료</option>
                      <option value="교육">교육</option>
                      <option value="기타">기타</option>
                    </select>
                    <select 
                      className="rounded px-3 py-2 bg-purple-900/50 text-purple-100 border border-purple-700 focus:border-purple-400 focus:outline-none"
                      onChange={(e) => {
                        const type = e.target.value as 'income' | 'expense';
                        if (aiFinanceItem && aiFinanceAmount && aiFinanceCategory) {
                          addFinanceTransaction({
                            item: aiFinanceItem,
                            amount: parseInt(aiFinanceAmount),
                            category: aiFinanceCategory,
                            memo: aiFinanceMemo,
                            type
                          });
                          setAiFinanceItem('');
                          setAiFinanceAmount('');
                          setAiFinanceCategory('');
                          setAiFinanceMemo('');
                        }
                      }}
                    >
                      <option value="">유형 선택 (수동)</option>
                      <option value="expense">지출</option>
                      <option value="income">수입</option>
                    </select>
                  </div>
                  <Textarea
                    value={aiFinanceMemo}
                    onChange={(e) => setAiFinanceMemo(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && aiFinanceItem && aiFinanceAmount && aiFinanceCategory) {
                        // 기본적으로 지출로 등록
                        addFinanceTransaction({
                          item: aiFinanceItem,
                          amount: parseInt(aiFinanceAmount),
                          category: aiFinanceCategory,
                          memo: aiFinanceMemo,
                          type: 'expense'
                        });
                        setAiFinanceItem('');
                        setAiFinanceAmount('');
                        setAiFinanceCategory('');
                        setAiFinanceMemo('');
                      }
                    }}
                    onBlur={() => {
                      if (aiFinanceItem && aiFinanceAmount && aiFinanceCategory) {
                        // 기본적으로 지출로 등록
                        addFinanceTransaction({
                          item: aiFinanceItem,
                          amount: parseInt(aiFinanceAmount),
                          category: aiFinanceCategory,
                          memo: aiFinanceMemo,
                          type: 'expense'
                        });
                        setAiFinanceItem('');
                        setAiFinanceAmount('');
                        setAiFinanceCategory('');
                        setAiFinanceMemo('');
                      }
                    }}
                    placeholder="메모를 입력하세요... (엔터 또는 포커스 아웃 시 자동 등록)"
                    className="w-full min-h-[80px] bg-purple-900/50 text-purple-100 border border-purple-700 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* AI 추천 */}
                {financeAnalysis.recommendations.length > 0 && (
                  <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
                    <h3 className="text-xl font-bold text-white mb-3">🤖 AI 절약 추천</h3>
                    <div className="space-y-2">
                      {financeAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="bg-purple-700/50 rounded p-3 text-purple-100">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 최근 거래 내역 */}
                <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-white">📋 최근 거래 내역</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const success = downloadFinanceDataAsExcel(financeTransactions, `${name}님의_가계부`);
                        if (success) {
                          alert('엑셀 파일이 다운로드되었습니다!');
                        } else {
                          alert('엑셀 다운로드 중 오류가 발생했습니다.');
                        }
                      }}
                      className="border-green-300 text-green-100 hover:bg-green-800 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      엑셀
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {financeTransactions.slice(-10).reverse().map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center bg-purple-700/30 rounded p-3">
                        <div className="flex-1">
                          <div className="text-white font-medium">{transaction.item}</div>
                          <div className="text-purple-200 text-sm">{transaction.category} • {transaction.memo}</div>
                        </div>
                        <div className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}원
                        </div>
                      </div>
                    ))}
                    {financeTransactions.length === 0 && (
                      <div className="text-purple-200 text-center py-4">아직 거래 내역이 없어요. 첫 번째 지출을 기록해보세요!</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 오른쪽: AI 챗봇 */}
              <div className="space-y-4">
                <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600 h-96 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-white">💬 AI 가계부 어시스턴트</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFinanceChat(!showFinanceChat)}
                      className="border-purple-300 text-purple-100 hover:bg-purple-800"
                    >
                      {showFinanceChat ? '접기' : '펼치기'}
                    </Button>
                  </div>
                  
                  {showFinanceChat && (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                        {financeChatMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                              msg.type === 'user' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-purple-700/50 text-purple-100'
                            }`}>
                              <div className="text-sm">{msg.message}</div>
                              <div className="text-xs mt-1 opacity-70">
                                {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                        {financeChatMessages.length === 0 && (
                          <div className="text-purple-200 text-center py-4">
                            AI 가계부 어시스턴트에게 물어보세요!<br/>
                            "이번 달 외식비 얼마나 썼어?"<br/>
                            "절약 팁 알려줘"
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={financeChatInput}
                          onChange={(e) => setFinanceChatInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && financeChatInput.trim()) {
                              addFinanceChatMessage('user', financeChatInput.trim());
                              setFinanceChatInput('');
                            }
                          }}
                          placeholder="가계부에 대해 물어보세요..."
                          className="flex-1 rounded px-3 py-2 bg-purple-900/50 text-purple-100 border border-purple-700 focus:border-purple-400 focus:outline-none"
                          lang="ko"
                          inputMode="text"
                          autoComplete="off"
                          spellCheck="false"
                        />
                        <Button
                          onClick={() => {
                            if (financeChatInput.trim()) {
                              addFinanceChatMessage('user', financeChatInput.trim());
                              setFinanceChatInput('');
                            }
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                        >
                          전송
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* 자동 데이터 수집 기능 */}
                <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
                  <h3 className="text-xl font-bold text-white mb-3">📱 자동 데이터 수집</h3>
                  <div className="space-y-3">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      📷 영수증 사진 인식
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      💳 카드 내역 연동
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      💬 카카오톡 내역 연동
                    </Button>
                    <div className="text-xs text-purple-200 text-center">
                      * 실제 연동을 위해서는 API 키와 권한 설정이 필요합니다
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  // AI 앨범 게시판 페이지
  if (showAIAlbumBoard) {
    const aiAlbums = JSON.parse(localStorage.getItem('aiAlbums') || '[]');
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-pink-800 to-pink-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-6xl text-center border-2 border-pink-700 shadow-2xl bg-gradient-to-br from-pink-900/90 to-pink-800/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">🖼️ AI 앨범 게시판</CardTitle>
                <CardDescription className="text-pink-100 text-xl">사용자들이 업로드한 AI 앨범들을 감상해보세요</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setShowAIAlbumBoard(false); setShowMenuPage(true); }}
                className="border-pink-300 text-pink-100 hover:bg-pink-800"
              >
                ← 돌아가기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {aiAlbums.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📷</div>
                <h3 className="text-2xl font-bold text-pink-100 mb-2">아직 업로드된 앨범이 없습니다</h3>
                <p className="text-pink-200 mb-6">첫 번째 AI 앨범을 업로드해보세요!</p>
                <Button
                  onClick={() => { setShowAIAlbumBoard(false); setShowAIAlbum(true); }}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  AI 앨범 만들기
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiAlbums.map((album: any) => (
                  <Card key={album.id} className="bg-pink-800/50 border-pink-600 hover:border-pink-400 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* 이미지 */}
                        <div className="relative group">
                          <img
                            src={album.image_url}
                            alt={album.title}
                            className="w-full h-48 object-cover rounded-lg border border-pink-500 group-hover:scale-105 transition-transform duration-300"
                          />
                          {album.style && album.style !== "원본" && (
                            <Badge className="absolute top-2 right-2 bg-pink-600 text-white">
                              {album.style}
                            </Badge>
                          )}
                        </div>
                        
                        {/* 앨범 정보 */}
                        <div className="text-left space-y-2">
                          <h3 className="text-lg font-bold text-pink-100 truncate">
                            {album.title}
                          </h3>
                          
                          {album.description && (
                            <p className="text-pink-200 text-sm overflow-hidden" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {album.description}
                            </p>
                          )}
                          
                                                     {album.text_description && (
                             <div className="bg-pink-900/30 rounded p-2">
                               <p className="text-pink-100 text-xs overflow-hidden" style={{
                                 display: '-webkit-box',
                                 WebkitLineClamp: 3,
                                 WebkitBoxOrient: 'vertical'
                               }}>
                                 {album.text_description}
                               </p>
                             </div>
                           )}
                          
                          {/* 메타 정보 */}
                          <div className="flex justify-between items-center text-xs text-pink-300">
                            <span>
                              {new Date(album.created_at).toLocaleDateString('ko-KR')}
                            </span>
                            {album.is_public && (
                              <Badge variant="outline" className="border-green-400 text-green-300">
                                공개
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* 액션 버튼들 */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedAlbumForView(album);
                              setShowAlbumViewModal(true);
                            }}
                            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-sm"
                          >
                            🔍 크게보기
                          </Button>
                          <Button
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: album.title,
                                  text: album.description,
                                  url: window.location.href
                                });
                              } else {
                                // 클립보드에 복사
                                navigator.clipboard.writeText(`${album.title}\n${album.description}`);
                                alert('앨범 정보가 클립보드에 복사되었습니다!');
                              }
                            }}
                            variant="outline"
                            className="border-pink-400 text-pink-200 hover:bg-pink-800 text-sm"
                          >
                            📤 공유
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // AI 앨범 페이지
  if (showAIAlbum) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-pink-800 to-pink-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-4xl text-center border-2 border-pink-700 shadow-2xl bg-gradient-to-br from-pink-900/90 to-pink-800/95 relative z-20">
          <CardHeader className="pb-4">
            <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">AI 앨범</CardTitle>
            <CardDescription className="text-pink-100 text-xl">AI가 생성한 이미지로 앨범을 만들어보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 앨범 제목 입력 */}
              <div className="space-y-2">
                <label className="text-pink-100 font-semibold text-left block">앨범 제목</label>
                <input
                  type="text"
                  value={aiAlbumTitle}
                  onChange={(e) => setAiAlbumTitle(e.target.value)}
                  placeholder="앨범 제목을 입력하세요..."
                  className="w-full rounded px-4 py-3 bg-white/10 text-white placeholder-pink-200 border border-pink-400 focus:border-pink-300 focus:outline-none"
                />
              </div>

              {/* 앨범 설명 입력 */}
              <div className="space-y-2">
                <label className="text-pink-100 font-semibold text-left block">앨범 설명</label>
                <Textarea
                  value={aiAlbumDescription}
                  onChange={(e) => setAiAlbumDescription(e.target.value)}
                  placeholder="앨범에 넣을 이미지에 대한 설명을 입력하세요..."
                  className="min-h-[120px] border-pink-200 focus:border-pink-400"
                />
              </div>

              {/* 파일 업로드 */}
              <div className="space-y-2">
                <label className="text-pink-100 font-semibold text-left block">이미지 파일 업로드</label>
                <div className="border-2 border-dashed border-pink-400 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setAiAlbumFile(file);
                      setAiAlbumPreview(null);
                      setAiAlbumTextDescription("");
                    }}
                    className="hidden"
                    id="album-file-upload"
                  />
                  <label htmlFor="album-file-upload" className="cursor-pointer">
                    <div className="text-pink-200 mb-2">
                      {aiAlbumFile ? (
                        <div>
                          <p className="font-semibold">선택된 파일: {aiAlbumFile.name}</p>
                          <p className="text-sm opacity-75">{(aiAlbumFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-2xl mb-2">📁</p>
                          <p>클릭하여 이미지 파일을 선택하거나</p>
                          <p>파일을 여기에 드래그하세요</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* 이미지 미리보기 */}
              {aiAlbumFile && (
                <div className="space-y-2">
                  <label className="text-pink-100 font-semibold text-left block">이미지 미리보기</label>
                  <div className="relative">
                    <img
                      src={aiAlbumPreview || URL.createObjectURL(aiAlbumFile)}
                      alt="미리보기"
                      className="w-full max-h-64 object-contain rounded-lg border border-pink-400"
                    />
                    {aiAlbumProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-center">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p>스타일 변환 중...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 이미지 스타일 선택 */}
              {aiAlbumFile && (
                <div className="space-y-2">
                  <label className="text-pink-100 font-semibold text-left block">이미지 스타일</label>
                  <select
                    value={aiAlbumStyle}
                    onChange={async (e) => {
                      const selectedStyle = e.target.value;
                      setAiAlbumStyle(selectedStyle);
                      
                      if (selectedStyle !== "원본" && aiAlbumFile) {
                        const transformedImage = await transformImageStyle(aiAlbumFile, selectedStyle);
                        if (transformedImage) {
                          setAiAlbumPreview(transformedImage);
                        }
                      } else {
                        setAiAlbumPreview(null);
                      }
                    }}
                    className="w-full rounded px-3 py-2 bg-pink-900/50 text-pink-100 border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="원본">원본</option>
                    <option value="동화">동화 스타일</option>
                    <option value="수채화">수채화 스타일</option>
                    <option value="유화">유화 스타일</option>
                    <option value="만화">만화 스타일</option>
                    <option value="사진">사진 스타일</option>
                    <option value="인상주의">인상주의 스타일</option>
                    <option value="추상">추상 스타일</option>
                  </select>
                </div>
              )}

              {/* 이미지 텍스트 설명 */}
              {aiAlbumFile && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-pink-100 font-semibold text-left block">이미지 설명</label>
                    <Button
                      onClick={async () => {
                        if (aiAlbumFile) {
                          const description = await generateImageDescription(aiAlbumFile);
                          setAiAlbumTextDescription(description);
                        }
                      }}
                      disabled={aiAlbumProcessing}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                    >
                      AI 설명 생성
                    </Button>
                  </div>
                  <Textarea
                    value={aiAlbumTextDescription}
                    onChange={(e) => setAiAlbumTextDescription(e.target.value)}
                    placeholder="이미지에 대한 설명을 입력하거나 AI 설명 생성 버튼을 클릭하세요..."
                    className="min-h-[100px] border-pink-200 focus:border-pink-400"
                  />
                </div>
              )}

              {/* 공개 설정 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="album-public"
                  checked={aiAlbumIsPublic}
                  onChange={(e) => setAiAlbumIsPublic(e.target.checked)}
                  className="w-4 h-4 text-pink-600 bg-pink-900 border-pink-400 rounded focus:ring-pink-500"
                />
                <label htmlFor="album-public" className="text-pink-100">
                  공개 게시판에 올리기
                </label>
              </div>

              {/* 버튼들 */}
              <div className="flex gap-3 flex-wrap">
                <Button 
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={async () => {
                    if (!aiAlbumDescription.trim()) {
                      alert('앨범 설명을 입력해주세요.');
                      return;
                    }
                    
                    try {
                      // 사용자 정보를 포함한 프롬프트 생성
                      const enhancedPrompt = generateUserBasedImagePrompt(aiAlbumDescription);
                      
                      const response = await fetch('/api/dalle', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          prompt: enhancedPrompt,
                          n: 1,
                          size: '1024x1024'
                        })
                      });

                      if (response.ok) {
                        const data = await response.json();
                        if (data.data && data.data[0] && data.data[0].url) {
                          // 새 창에서 이미지 열기
                          window.open(data.data[0].url, '_blank');
                          alert('이미지가 생성되었습니다! 새 창에서 확인하세요.');
                        } else {
                          alert('이미지 생성에 실패했습니다.');
                        }
                      } else {
                        alert('이미지 생성 중 오류가 발생했습니다.');
                      }
                    } catch (error) {
                      console.error('AI 앨범 이미지 생성 오류:', error);
                      alert('이미지 생성 중 오류가 발생했습니다.');
                    }
                  }}
                >
                  AI 이미지 생성하기
                </Button>

                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!aiAlbumFile || !aiAlbumTitle.trim() || aiAlbumUploading}
                  onClick={async () => {
                    if (!aiAlbumFile) {
                      alert('이미지 파일을 선택해주세요.');
                      return;
                    }
                    if (!aiAlbumTitle.trim()) {
                      alert('앨범 제목을 입력해주세요.');
                      return;
                    }

                    setAiAlbumUploading(true);
                    try {
                      // 변환된 이미지 또는 원본 이미지 사용
                      const finalImage = aiAlbumPreview || await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target?.result as string);
                        reader.readAsDataURL(aiAlbumFile);
                      });
                      
                      // 게시판에 저장
                      const success = await saveAIAlbumToBoard(
                        finalImage,
                        aiAlbumTitle,
                        aiAlbumDescription,
                        aiAlbumIsPublic,
                        aiAlbumStyle,
                        aiAlbumTextDescription
                      );

                      if (success) {
                        alert('앨범이 성공적으로 게시판에 저장되었습니다!');
                        // 폼 초기화
                        setAiAlbumFile(null);
                        setAiAlbumTitle("");
                        setAiAlbumDescription("");
                        setAiAlbumTextDescription("");
                        setAiAlbumStyle("원본");
                        setAiAlbumIsPublic(false);
                        setAiAlbumPreview(null);
                      } else {
                        alert('앨범 저장에 실패했습니다.');
                      }
                      setAiAlbumUploading(false);
                    } catch (error) {
                      console.error('앨범 업로드 오류:', error);
                      alert('앨범 업로드 중 오류가 발생했습니다.');
                      setAiAlbumUploading(false);
                    }
                  }}
                >
                  {aiAlbumUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      업로드 중...
                    </div>
                  ) : (
                    "게시판에 업로드"
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setShowAIAlbum(false); 
                    setShowAIAlbumBoard(true);
                  }}
                  className="border-blue-300 text-blue-100 hover:bg-blue-800"
                >
                  🖼️ 게시판 보기
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setShowAIAlbum(false); 
                    setShowMenuPage(true);
                    // 폼 초기화
                    setAiAlbumFile(null);
                    setAiAlbumTitle("");
                    setAiAlbumDescription("");
                    setAiAlbumTextDescription("");
                    setAiAlbumStyle("원본");
                    setAiAlbumIsPublic(false);
                    setAiAlbumPreview(null);
                  }}
                  className="border-pink-300 text-pink-100 hover:bg-pink-800"
                >
                  돌아가기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 계정관리 페이지
  if (showAccountManagement) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-800 to-blue-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-4xl text-center border-2 border-blue-700 shadow-2xl bg-gradient-to-br from-blue-900/90 to-blue-800/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">⚙️ 계정관리</CardTitle>
                <CardDescription className="text-blue-100 text-xl">회원정보, 프로필, 연동설정을 관리하세요</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setShowAccountManagement(false); setShowMenuPage(true); }}
                className="border-blue-300 text-blue-100 hover:bg-blue-800"
              >
                ← 돌아가기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 회원정보 수정 */}
              <Card className="bg-blue-800/50 border-blue-600 hover:border-blue-400 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Edit3 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-100">회원정보 수정</h3>
                    <p className="text-blue-200 text-sm">이름, 이메일, 비밀번호 등 기본 정보를 수정하세요</p>
                    <Button
                      onClick={() => {
                        setShowAccountManagement(false);
                        setShowUserInfoEdit(true);
                        // 현재 사용자 정보로 초기화
                        setEditName(name);
                        // 로컬 스토리지에서 현재 사용자 이메일 가져오기
                        const tempUserStr = localStorage.getItem('tempUser');
                        const currentUser = tempUserStr ? JSON.parse(tempUserStr) : null;
                        setEditEmail(currentUser?.email || "");
                        setEditPassword("");
                        setEditConfirmPassword("");
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      수정하기
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 프로필 설정 */}
              <Card className="bg-blue-800/50 border-blue-600 hover:border-blue-400 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-100">프로필 설정</h3>
                    <p className="text-blue-200 text-sm">프로필 이미지, 개인정보, 선호도 등을 설정하세요</p>
                    <Button
                      onClick={() => {
                        setShowAccountManagement(false);
                        setShowProfileSettings(true);
                        // 현재 프로필 정보로 초기화
                        setProfileBirthYear(userBirthYear || "");
                        setProfileGender(userGender || "");
                        setProfileNationality(userNationality || "");
                        setProfileImageStyle(imageStyle || "동화");
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      설정하기
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notion 연동설정 */}
              <Card className="bg-blue-800/50 border-blue-600 hover:border-blue-400 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <Share2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-100">Notion 연동설정</h3>
                    <p className="text-blue-200 text-sm">Notion과 연동하여 데이터를 자동으로 저장하세요</p>
                    <Button
                      onClick={() => {
                        setShowAccountManagement(false);
                        setShowNotionSettings(true);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      연동하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  // 회원정보 수정 페이지
  if (showUserInfoEdit) {
    const handleSaveUserInfo = async () => {
      if (editPassword !== editConfirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      if (editPassword && editPassword.length < 6) {
        alert('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      
      setIsEditingUserInfo(true);
      
      try {
        // 로컬 스토리지에서 사용자 정보 업데이트
        const tempUserStr = localStorage.getItem('tempUser');
        const currentUser = tempUserStr ? JSON.parse(tempUserStr) : null;
        
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: editName.trim(),
            email: editEmail.trim()
          };
          
          // 비밀번호가 입력된 경우에만 업데이트
          if (editPassword) {
            updatedUser.password_hash = btoa(editPassword); // 간단한 인코딩
          }
          
          localStorage.setItem('tempUser', JSON.stringify(updatedUser));
          
          // 전역 상태 업데이트
          setName(editName.trim());
          
          alert('회원정보가 성공적으로 수정되었습니다!');
          setShowUserInfoEdit(false);
          setShowAccountManagement(true);
        }
      } catch (error) {
        console.error('회원정보 수정 오류:', error);
        alert('회원정보 수정 중 오류가 발생했습니다.');
      } finally {
        setIsEditingUserInfo(false);
      }
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-800 to-blue-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-2xl text-center border-2 border-blue-700 shadow-2xl bg-gradient-to-br from-blue-900/90 to-blue-800/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">✏️ 회원정보 수정</CardTitle>
                <CardDescription className="text-blue-100 text-xl">기본 정보를 수정하세요</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setShowUserInfoEdit(false); setShowAccountManagement(true); }}
                className="border-blue-300 text-blue-100 hover:bg-blue-800"
              >
                ← 돌아가기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 이름 */}
              <div className="text-left">
                <label className="text-blue-100 font-semibold text-left block mb-2">이름</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 bg-blue-800/50 border border-blue-600 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400"
                  placeholder="이름을 입력하세요"
                />
              </div>
              
              {/* 이메일 */}
              <div className="text-left">
                <label className="text-blue-100 font-semibold text-left block mb-2">이메일</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-3 bg-blue-800/50 border border-blue-600 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400"
                  placeholder="이메일을 입력하세요"
                />
              </div>
              
              {/* 비밀번호 */}
              <div className="text-left">
                <label className="text-blue-100 font-semibold text-left block mb-2">새 비밀번호 (선택사항)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full p-3 bg-blue-800/50 border border-blue-600 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400"
                  placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                />
              </div>
              
              {/* 비밀번호 확인 */}
              <div className="text-left">
                <label className="text-blue-100 font-semibold text-left block mb-2">비밀번호 확인</label>
                <input
                  type="password"
                  value={editConfirmPassword}
                  onChange={(e) => setEditConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-blue-800/50 border border-blue-600 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
              
              {/* 저장 버튼 */}
              <Button
                onClick={handleSaveUserInfo}
                disabled={isEditingUserInfo || !editName.trim() || !editEmail.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-bold disabled:opacity-50"
              >
                {isEditingUserInfo ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 프로필 설정 페이지
  if (showProfileSettings) {
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // 파일 크기 검사 (5MB 이하)
        if (file.size > 5 * 1024 * 1024) {
          alert('파일 크기는 5MB 이하여야 합니다.');
          return;
        }
        
        // 파일 타입 검사
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.');
          return;
        }
        
        setProfileImageFile(file);
        
        // 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSaveProfile = async () => {
      setIsEditingProfile(true);
      
      try {
        // 이미지가 업로드된 경우 Base64로 변환
        let imageData = "";
        if (profileImageFile) {
          const reader = new FileReader();
          imageData = await new Promise((resolve) => {
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(profileImageFile);
          });
        }
        
        // 로컬 스토리지에 프로필 정보 저장
        const profileData = {
          birthYear: profileBirthYear,
          gender: profileGender,
          nationality: profileNationality,
          imageStyle: profileImageStyle,
          profileImage: imageData || profileImage, // 새 이미지가 있으면 사용, 없으면 기존 이미지 유지
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        // 전역 상태 업데이트
        setUserBirthYear(profileBirthYear);
        setUserGender(profileGender);
        setUserNationality(profileNationality);
        setImageStyle(profileImageStyle);
        if (imageData) {
          setProfileImage(imageData);
        }
        
        alert('프로필이 성공적으로 저장되었습니다!');
        setShowProfileSettings(false);
        setShowAccountManagement(true);
      } catch (error) {
        console.error('프로필 저장 오류:', error);
        alert('프로필 저장 중 오류가 발생했습니다.');
      } finally {
        setIsEditingProfile(false);
      }
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-green-800 to-green-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-2xl text-center border-2 border-green-700 shadow-2xl bg-gradient-to-br from-green-900/90 to-green-800/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">⚙️ 프로필 설정</CardTitle>
                <CardDescription className="text-green-100 text-xl">개인정보와 선호도를 설정하세요</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setShowProfileSettings(false); setShowAccountManagement(true); }}
                className="border-green-300 text-green-100 hover:bg-green-800"
              >
                ← 돌아가기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 프로필 이미지 */}
              <div className="text-left">
                <label className="text-green-100 font-semibold text-left block mb-2">프로필 이미지</label>
                <div className="space-y-3">
                  {/* 현재 이미지 또는 미리보기 */}
                  {(profileImagePreview || profileImage) && (
                    <div className="flex justify-center">
                      <div className="relative">
                        <img
                          src={profileImagePreview || profileImage}
                          alt="프로필 이미지"
                          className="w-32 h-32 object-cover rounded-full border-4 border-green-400 shadow-lg"
                        />
                        {profileImagePreview && (
                          <button
                            onClick={() => {
                              setProfileImageFile(null);
                              setProfileImagePreview("");
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 이미지 업로드 버튼 */}
                  <div className="flex justify-center">
                    <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      <span className="flex items-center gap-2">
                        📷 {profileImagePreview || profileImage ? '이미지 변경' : '이미지 업로드'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <p className="text-green-300 text-xs text-center">
                    JPG, PNG, GIF 파일 (최대 5MB)
                  </p>
                </div>
              </div>

              {/* 출생년도 */}
              <div className="text-left">
                <label className="text-green-100 font-semibold text-left block mb-2">출생년도</label>
                <input
                  type="text"
                  value={profileBirthYear}
                  onChange={(e) => setProfileBirthYear(e.target.value)}
                  className="w-full p-3 bg-green-800/50 border border-green-600 rounded-lg text-white placeholder-green-300 focus:outline-none focus:border-green-400"
                  placeholder="예: 1990"
                />
              </div>
              
              {/* 성별 */}
              <div className="text-left">
                <label className="text-green-100 font-semibold text-left block mb-2">성별</label>
                <select
                  value={profileGender}
                  onChange={(e) => setProfileGender(e.target.value)}
                  className="w-full p-3 bg-green-800/50 border border-green-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                >
                  <option value="">성별을 선택하세요</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              
              {/* 국적 */}
              <div className="text-left">
                <label className="text-green-100 font-semibold text-left block mb-2">국적</label>
                <input
                  type="text"
                  value={profileNationality}
                  onChange={(e) => setProfileNationality(e.target.value)}
                  className="w-full p-3 bg-green-800/50 border border-green-600 rounded-lg text-white placeholder-green-300 focus:outline-none focus:border-green-400"
                  placeholder="예: 대한민국"
                />
              </div>
              
              {/* 이미지 스타일 */}
              <div className="text-left">
                <label className="text-green-100 font-semibold text-left block mb-2">선호하는 이미지 스타일</label>
                <select
                  value={profileImageStyle}
                  onChange={(e) => setProfileImageStyle(e.target.value)}
                  className="w-full p-3 bg-green-800/50 border border-green-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                >
                  <option value="동화">동화</option>
                  <option value="사실적">사실적</option>
                  <option value="만화">만화</option>
                  <option value="수채화">수채화</option>
                  <option value="유화">유화</option>
                  <option value="디지털아트">디지털아트</option>
                </select>
              </div>
              
              {/* 저장 버튼 */}
              <Button
                onClick={handleSaveProfile}
                disabled={isEditingProfile}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-bold disabled:opacity-50"
              >
                {isEditingProfile ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Notion 설정 페이지
  if (showNotionSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-800 to-indigo-900">
        <Starfield explode={false} />
        <Card className="w-full max-w-2xl text-center border-2 border-blue-700 shadow-2xl bg-gradient-to-br from-blue-900/90 to-indigo-900/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">📝 Notion 연동 설정</CardTitle>
                <CardDescription className="text-blue-100 text-xl">Notion과 연동하여 데이터를 자동으로 저장하세요</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setShowNotionSettings(false); setShowAccountManagement(true); }}
                className="border-blue-300 text-blue-100 hover:bg-blue-800"
              >
                돌아가기
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 연결 상태 표시 */}
            <div className="bg-blue-800/50 rounded-lg p-4 border border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 font-semibold">연결 상태</span>
                <div className={`flex items-center gap-2 ${notionConnected ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${notionConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm font-medium">
                    {notionConnected ? '연결됨' : '연결되지 않음'}
                  </span>
                </div>
              </div>
              {notionConnectionStatus && (
                <p className="text-blue-200 text-sm">{notionConnectionStatus}</p>
              )}
            </div>

            {/* API 키 입력 */}
            <div className="space-y-2">
              <label className="text-blue-100 font-semibold text-left block">Notion API 키</label>
              <input
                type="password"
                value={notionApiKey}
                onChange={(e) => setNotionApiKey(e.target.value)}
                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded px-3 py-2 bg-blue-900/50 text-blue-100 border border-blue-700 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-blue-300 text-xs text-left">
                Notion 개발자 페이지에서 API 키를 생성하세요. 
                <a 
                  href="https://www.notion.so/my-integrations" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline ml-1"
                >
                  API 키 생성하기
                </a>
              </p>
            </div>

            {/* 데이터베이스 ID 입력 */}
            <div className="space-y-2">
              <label className="text-blue-100 font-semibold text-left block">Notion 데이터베이스 ID</label>
              <input
                type="text"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full rounded px-3 py-2 bg-blue-900/50 text-blue-100 border border-blue-700 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-blue-300 text-xs text-left">
                Notion 데이터베이스 URL에서 ID를 복사하세요. 
                예: https://notion.so/workspace/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
              </p>
            </div>

            {/* 연결 테스트 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  setIsNotionLoading(true);
                  setNotionConnectionStatus("연결 테스트 중...");
                  try {
                    // 설정을 로컬 스토리지에 저장
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('notionApiKey', notionApiKey);
                      localStorage.setItem('notionDatabaseId', notionDatabaseId);
                    }
                    
                    // API 키와 데이터베이스 ID를 환경변수로 설정 (실제로는 서버에서 처리)
                    const result = await testNotionConnection();
                    if (result.success) {
                      setNotionConnected(true);
                      setNotionConnectionStatus(result.message);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('notionConnected', 'true');
                      }
                      await loadNotionDatabases();
                    } else {
                      setNotionConnected(false);
                      setNotionConnectionStatus(result.message);
                      alert(result.message);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('notionConnected', 'false');
                      }
                    }
                  } catch (error) {
                    console.error('Notion 연결 테스트 오류:', error);
                    setNotionConnectionStatus("연결 오류가 발생했습니다. 설정을 확인해주세요.");
                    setNotionConnected(false);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('notionConnected', 'false');
                    }
                  } finally {
                    setIsNotionLoading(false);
                  }
                }}
                disabled={!notionApiKey || !notionDatabaseId || isNotionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg"
              >
                {isNotionLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    테스트 중...
                  </div>
                ) : (
                  "연결 테스트"
                )}
              </Button>
              
              <Button
                onClick={() => {
                  setNotionApiKey("");
                  setNotionDatabaseId("");
                  setNotionConnected(false);
                  setNotionConnectionStatus("");
                  setNotionDatabases([]);
                  setSelectedNotionDatabase("");
                  
                  // 로컬 스토리지에서 설정 삭제
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('notionApiKey');
                    localStorage.removeItem('notionDatabaseId');
                    localStorage.removeItem('notionConnected');
                  }
                }}
                variant="outline"
                className="border-red-400 text-red-200 hover:bg-red-900 font-bold py-3 rounded-lg shadow-lg"
              >
                설정 초기화
              </Button>
            </div>

            {/* 데이터베이스 선택 */}
            {notionDatabases.length > 0 && (
              <div className="space-y-2">
                <label className="text-blue-100 font-semibold text-left block">저장할 데이터베이스 선택</label>
                <select
                  value={selectedNotionDatabase}
                  onChange={(e) => setSelectedNotionDatabase(e.target.value)}
                  className="w-full rounded px-3 py-2 bg-blue-900/50 text-blue-100 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">데이터베이스를 선택하세요</option>
                  {notionDatabases.map((db) => (
                    <option key={db.id} value={db.id}>
                      {db.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 연동 기능 설명 */}
            <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-600">
              <h3 className="text-blue-100 font-semibold mb-2">연동 기능</h3>
              <ul className="text-blue-200 text-sm space-y-1 text-left">
                <li>• AI 그림일기 작성 시 자동으로 Notion에 저장</li>
                <li>• AI 가계부 거래 내역을 Notion에 자동 기록</li>
                <li>• 자서전 섹션별 내용을 Notion 페이지로 저장</li>
                <li>• 모든 데이터가 실시간으로 동기화됩니다</li>
              </ul>
            </div>

            {/* 설정 저장 */}
            {notionConnected && selectedNotionDatabase && (
              <div className="bg-green-800/30 rounded-lg p-4 border border-green-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-100 font-semibold">연동 준비 완료</span>
                </div>
                <p className="text-green-200 text-sm">
                  Notion 연동이 설정되었습니다. 이제 AI 기능을 사용하면 데이터가 자동으로 Notion에 저장됩니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  // 메뉴 페이지
  if (showMenuPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-amber-800 to-orange-900">
        <Starfield explode={isStarting} />
        <img
          src="/api/placeholder/400/600"
          alt="책 표지"
          className="absolute left-1/2 top-1/2 z-10 rounded-2xl shadow-2xl border-4 border-yellow-100 object-cover opacity-80"
          style={{
            width: 'min(400px, 80vw)',
            height: 'auto',
            maxHeight: '60vh',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
        <Card className="w-full max-w-lg text-center border-2 border-yellow-700 shadow-2xl bg-gradient-to-br from-amber-900/90 to-orange-900/95 relative z-20">
          <CardHeader className="pb-4">
            {/* 로고 이미지 */}
            <div className="flex justify-center mb-4">
              <img 
                src="/lifecast-logo.png" 
                alt="AI Life Cast Logo" 
                className="h-16 w-auto object-contain drop-shadow-lg"
                onError={(e) => {
                  // 로고 로드 실패 시 텍스트로 대체
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="text-3xl font-extrabold text-white drop-shadow-lg">AI Life Cast</div>';
                  }
                }}
              />
            </div>
            <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">메뉴</CardTitle>
            <CardDescription className="text-yellow-100 text-xl">원하는 기능을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              {/* 첫 번째 줄: 이름과 생년월일 */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
                  lang="ko"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck="false"
                />
                <input
                  type="text"
                  placeholder="생년월일(YYYYMMDD)"
                  value={userBirthYear}
                  onChange={e => {
                    const newBirthYear = e.target.value;
                    setUserBirthYear(newBirthYear);
                    if (typeof window !== 'undefined' && name.trim()) {
                      localStorage.setItem(`userBirthYear_${name.trim()}`, newBirthYear);
                      console.log('Birth year updated in menu page:', newBirthYear);
                    }
                  }}
                  className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
                  lang="ko"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              
              {/* 두 번째 줄: 성별과 국적 */}
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={userGender}
                  onChange={e => {
                    const newGender = e.target.value;
                    setUserGender(newGender);
                    if (typeof window !== 'undefined' && name.trim()) {
                      localStorage.setItem(`userGender_${name.trim()}`, newGender);
                      console.log('Gender updated in menu page:', newGender);
                    }
                  }}
                  className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 font-serif"
                >
                  <option value="">성별 선택</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                  <option value="기타">기타</option>
                </select>
                <input
                  type="text"
                  value={userNationality}
                  onChange={e => {
                    const newNationality = e.target.value;
                    setUserNationality(newNationality);
                    if (typeof window !== 'undefined' && name.trim()) {
                      localStorage.setItem(`userNationality_${name.trim()}`, newNationality);
                      console.log('Nationality updated in menu page:', newNationality);
                    }
                  }}
                  placeholder="국적(예: 대한민국)"
                  className="w-full rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
                  lang="ko"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex justify-between items-center rounded px-3 py-2 bg-amber-900/50 text-yellow-100 border border-yellow-700 font-serif focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                >
                  <span>{
                    ({
                      ghibli: '지브리풍',
                      elegant: '우아한 일러스트',
                      childhood: '동심/동화풍',
                      watercolor: '수채화',
                      oil: '유화',
                      infographic: '인포그래픽',
                      sketch: '스케치',
                    } as any)[imageStyle] || '스타일 선택'
                  }</span>
                  <svg className={`w-4 h-4 ml-2 transition-transform ${showStyleDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showStyleDropdown && (
                  <ul className="absolute z-30 mt-1 w-full bg-amber-900/90 border border-yellow-700 rounded shadow-lg max-h-60 overflow-auto">
                    {[
                      { key: 'ghibli', label: '지브리풍' },
                      { key: 'elegant', label: '우아한 일러스트' },
                      { key: 'childhood', label: '동심/동화풍' },
                      { key: 'watercolor', label: '수채화' },
                      { key: 'oil', label: '유화' },
                      { key: 'infographic', label: '인포그래픽' },
                      { key: 'sketch', label: '스케치' },
                    ].map(style => (
                      <li
                        key={style.key}
                        className={`px-4 py-2 cursor-pointer hover:bg-yellow-700 hover:text-white ${imageStyle === style.key ? 'bg-yellow-800 text-yellow-100 font-bold' : 'text-yellow-100'}`}
                        onClick={() => {
                          setImageStyle(style.key);
                          setShowStyleDropdown(false);
                        }}
                      >
                        {style.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="space-y-4 mb-4">
              {/* 첫 번째 줄: AI 대화하기와 AI 그림일기 */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => { setShowMenuPage(false); setShowAIChat(true); }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-blue-700"
                >
                  AI 대화하기
                </Button>
                
                <Button
                  onClick={() => { setShowMenuPage(false); setShowAIDiary(true); }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-green-700"
                >
                  AI 그림일기
                </Button>
              </div>
              
              {/* 두 번째 줄: AI 가계부 관리와 AI 앨범 만들기 */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => { setShowMenuPage(false); setShowAIFinance(true); }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-purple-700"
                >
                  AI 가계부 관리
                </Button>
                
                <Button
                  onClick={() => { setShowMenuPage(false); setShowAIAlbum(true); }}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-400 hover:from-pink-700 hover:to-pink-500 text-white font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-pink-700"
                >
                  AI 앨범 만들기
                </Button>
              </div>
              
              {/* 세 번째 줄: 자서전 만들기 (단독) */}
              <Button
                onClick={() => { setShowMenuPage(false); setIsStarted(true); setCurrentStage(null); }}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-700 hover:to-yellow-500 text-amber-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-yellow-700"
              >
                나만의 자서전 만들기
              </Button>
              
              {/* 네 번째 줄: AI 앨범 게시판과 그림일기 갤러리 */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => { setShowMenuPage(false); setShowAIAlbumBoard(true); }}
                  variant="outline"
                  className="border-pink-400 text-pink-200 hover:bg-pink-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-pink-700"
                >
                  🖼️ AI 앨범 게시판
                </Button>
                <Button
                  onClick={() => { setShowMenuPage(false); setShowDiaryGallery(true); }}
                  variant="outline"
                  className="border-yellow-400 text-yellow-200 hover:bg-yellow-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-yellow-700"
                >
                  📚 그림일기 갤러리
                </Button>
              </div>

              {/* 다섯 번째 줄: 계정관리 */}
              <Button
                onClick={() => { setShowMenuPage(false); setShowAccountManagement(true); }}
                variant="outline"
                className="w-full border-blue-400 text-blue-200 hover:bg-blue-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-blue-700"
              >
                ⚙️ 계정관리
              </Button>
              
              {/* 여섯 번째 줄: 로그아웃 (단독) */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-red-400 text-red-200 hover:bg-red-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-red-700"
              >
                로그아웃
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <Button
            onClick={() => { setShowMenuPage(true); setIsStarted(false); }}
            variant="outline"
            className="w-48 py-3 bg-opacity-50 border-yellow-600 text-yellow-100 hover:bg-yellow-900 text-lg font-bold rounded-full shadow-lg border-2 border-yellow-700"
          >
            ← 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 이미지 생성 중 로딩 화면
  if (isGeneratingImages) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100" />
        <div className="absolute inset-0 z-10 pointer-events-none"><Starfield explode={false} /></div>
        
        <Card className="w-full max-w-lg text-center border-2 border-pink-200 shadow-xl relative z-20">
          <CardHeader>
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              이미지 생성 중
            </CardTitle>
            <CardDescription className="text-gray-600">
              AI가 당신의 이야기를 아름다운 그림으로 그리고 있어요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>진행률</span>
                <span>{Math.round(imageGenerationProgress)}%</span>
              </div>
              <Progress value={imageGenerationProgress} className="h-3" />
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentGeneratingImage}
                </div>
                <span className="font-semibold text-gray-800">/ 4</span>
              </div>
              <p className="text-sm text-gray-700">{generationStatus}</p>
            </div>

            <div className="text-center space-y-2">
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
              <p className="text-sm text-gray-500">잠시만 기다려주세요. 아름다운 그림을 만들고 있어요 ✨</p>
            </div>

            {/* 생성된 이미지 미리보기 */}
            {generatedImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">생성된 이미지 ({generatedImages.length}/4)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {generatedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`생성된 이미지 ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-lg border-2 border-pink-200 shadow-md"
                      />
                      <div className="absolute top-1 left-1 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                  {/* 아직 생성되지 않은 이미지 자리 표시 */}
                  {Array.from({ length: 4 - generatedImages.length }, (_, index) => (
                    <div key={`placeholder-${index}`} className="relative">
                      <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-gray-400 text-sm font-medium">
                          {generatedImages.length + index + 1}번 생성 중...
                        </div>
                      </div>
                      <div className="absolute top-1 left-1 bg-gray-400 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {generatedImages.length + index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // 이미지 선택 UI
  if (selectingImages) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100" />
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Starfield explode={false} />
        </div>
        
        <div className="relative z-20 flex flex-col items-center justify-center w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-center mb-6 text-amber-800">4개 이미지 중 원하는 것을 선택하세요</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {selectingImages.images.map((img, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  className={`relative border-4 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none ${selectedImageIndexes.includes(idx) ? 'border-amber-500 ring-2 ring-amber-400' : 'border-amber-200'}`}
                  onClick={() => {
                    if (selectedImageIndexes.includes(idx)) {
                      setSelectedImageIndexes(selectedImageIndexes.filter(i => i !== idx));
                    } else if (selectedImageIndexes.length < 4) {
                      setSelectedImageIndexes([...selectedImageIndexes, idx]);
                      playSound('/sfx/image-select.mp3', 0.25);
                    }
                  }}
                  disabled={selectedImageIndexes.length === 4 && !selectedImageIndexes.includes(idx)}
                >
                  <img 
                    src={getProxiedImageUrl(img)} 
                    alt={`생성 이미지 ${idx+1}`} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src && target.src.includes('oaidalleapiprodscus.blob.core.windows.net')) {
                        target.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`;
                      }
                    }}
                  />
                  {selectedImageIndexes.includes(idx) && (
                    <div className="absolute inset-0 bg-amber-400 bg-opacity-40 flex items-center justify-center text-3xl text-white font-bold">✔</div>
                  )}
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1 text-xs px-2 py-1 border-amber-400 text-amber-700"
                  onClick={async () => {
                    // 해당 컷만 다시 생성
                    const {sectionIndex} = selectingImages;
                    const updatedImages = [...selectingImages.images];
                    const currentSection = sections[sectionIndex];
                    const birthYear = userBirthYear ? parseInt(userBirthYear.substring(0, 4)) : 1994;
                    const sectionInfo = getSectionAgeAndYear(currentSection.id, birthYear);
                    const answer = currentSection.answers[idx] || '아름다운 순간';
                    const question = currentSection.questions[idx] || '일상의 순간';
                    const genderEnglish = userGender === '남성' ? 'boy' : 'girl';
                    const genderKorean = userGender === '남성' ? '남자아이' : '여자아이';
                    const prompt = `Name: ${name.trim()}
Age: ${sectionInfo.age}세 (${sectionInfo.year}년)
Gender: ${userGender} (${genderEnglish})
Nationality: ${userNationality || '대한민국'}
Scene: ${currentSection.title} - ${question}
Mood: 따뜻하고 감성적인
Style: ${imageStyle || '동화'}
Keywords: ${answer}
Panel: ${idx + 1}/4 - ${answer}
Description: ${name.trim()}이(가) ${sectionInfo.age}세 ${genderKorean}로 ${sectionInfo.year}년에 ${answer}에 대한 추억을 담은 ${imageStyle || '동화'} 스타일의 일러스트레이션
Character: ${genderEnglish}, ${genderKorean}, male child, boy character`;
                    const response = await fetch('/api/generate-image', {
        method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
                        prompt,
                        style: imageStyle || '동화',
                        userName: name.trim(),
                        userAge: new Date().getFullYear() - birthYear,
                        userGender: userGender,
                        userNationality: userNationality || '대한민국'
                      }),
                    });
                    let newImg = img;
                    if (response.ok) {
                      const data = await response.json();
                      if (data.success && data.imageUrl) {
                        newImg = data.imageUrl;
                      } else {
                        newImg = `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}&blur=2`;
                      }
                    } else {
                      newImg = `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}&blur=2`;
                    }
                    updatedImages[idx] = newImg;
                    setSelectingImages({ ...selectingImages, images: updatedImages });
                  }}
                >
                  다시 생성
                </Button>
              </div>
            ))}
          </div>
            <Button
              className={`w-full py-3 rounded-lg font-bold text-lg ${selectedImageIndexes.length > 0 ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-500 cursor-not-allowed'}`}
              disabled={selectedImageIndexes.length === 0}
            onClick={() => {
              playSound('/sfx/selection-complete.mp3', 0.4);
              const {sectionIndex, images} = selectingImages;
              const updatedSections = [...sections];
                const selectedImagesArr = selectedImageIndexes.map(i => images[i]);
                updatedSections[sectionIndex].illustration = JSON.stringify(selectedImagesArr);
              setSections(updatedSections);
              setSelectingImages(null);
              setShowBlog(true);
            }}
          >
              블로그로 이동 ({selectedImageIndexes.length}/4)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 블로그 페이지 컴포넌트
  if (showBlog) {

    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
        <Starfield explode={false} />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => setShowBlog(false)}
              variant="outline"
              className="border-amber-300 hover:bg-amber-50 bg-white shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div className="flex items-center gap-4">
              <img 
                src="/lifecast-logo.png" 
                alt="AI Life Cast Logo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            <h1 className="text-3xl font-bold text-amber-800">나의 이야기 블로그</h1>
            </div>
            <Button
              onClick={() => {
                // 블로그 저장 로직
                const blogData = {
                  title: `${name.trim()}의 자서전`,
                  description: `${name.trim()}의 인생 여정을 담은 특별한 자서전입니다.`,
                  customUrl: `${name.trim().toLowerCase().replace(/\s+/g, '-')}-autobiography`,
                  isPublic: false,
                  sections: sections,
                  author: name.trim(),
                  createdAt: new Date().toISOString()
                };
                
                if (typeof window !== 'undefined') {
                  const existingBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
                  const updatedBlogs = [...existingBlogs, blogData];
                  localStorage.setItem('userBlogs', JSON.stringify(updatedBlogs));
                  setUserBlogs(updatedBlogs);
                }
                
                alert('블로그가 저장되었습니다!');
                
                // 나만의 자서전 설정 페이지로 이동
                setShowBlog(false);
                setShowBlogManagement(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
            >
              💾 저장
            </Button>
          </div>
          
          {/* 전체 자서전 소개 */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-8 rounded-lg mb-8 border-2 border-amber-300">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-amber-800 mb-4">📚 {name.trim()}의 자서전</h2>
              <p className="text-lg text-amber-700">인생의 각 시절을 담은 특별한 이야기</p>
            </div>
            <div className="text-gray-700 leading-relaxed text-center">
              <p className="mb-4">
                이 책은 {name.trim()}의 인생 여정을 담은 특별한 자서전입니다. 
                어린 시절부터 현재까지, 각 시절의 소중한 추억들과 경험들이 
                아름다운 이미지와 함께 펼쳐집니다.
              </p>
              <p>
                각 장은 그 시절의 질문과 답변을 바탕으로 AI가 자연스럽게 연결하여 
                500자 이상의 감동적인 이야기로 재구성했습니다.
              </p>
            </div>
          </div>
          
          {sections.map((section, index) => {
            const hasAnswers = section.answers.some(answer => answer && answer.trim());
            
            // 4컷 이미지 파싱
            let images: string[] = [];
            if (section.illustration) {
              try {
                images = JSON.parse(section.illustration);
              } catch (e) {
                console.error('이미지 파싱 오류:', e);
              }
            }
            
            // AI 자서전 생성 (1000자 이상)
            const generateAutobiography = (section: any) => {
              const answers = section.answers.filter((a: string) => a && a.trim());
              const questions = section.questions.slice(0, answers.length);
              const nationality = userNationality || '대한민국';
              
              let autobiography = `${name.trim()}의 ${section.title} 이야기\n\n`;
              
              // 섹션별 자연스러운 스토리 구성 (1000자 이상)
              switch (section.id) {
                case 'childhood':
                  autobiography += `${nationality}에서 태어나 자란 나는 어린 시절, ${answers[0] || '순수한 호기심'}. 그때의 나는 세상 모든 것이 신기하고 재미있었다. `;
                  if (answers[1]) autobiography += `${answers[1]}도 내게는 특별한 의미가 있었다. `;
                  if (answers[2]) autobiography += `그리고 ${answers[2]}를 통해 나는 많은 것을 배웠다. `;
                  if (answers[3]) autobiography += `마지막으로 ${answers[3]}는 지금도 내 마음속에 소중한 추억으로 남아있다. `;
                  autobiography += `\n\n${nationality}의 문화와 전통 속에서 자란 어린 시절의 순수함과 호기심은 지금도 내 마음속에 살아있다. 그때의 경험들이 나를 성장시켰고, 지금의 나를 만들어주었다. 때로는 그때의 단순함이 그립기도 하지만, 그 순수함은 여전히 내 안에 있다. 어린 시절의 추억은 마치 보물상자처럼 내 마음속에 간직되어 있으며, 그때의 경험들이 지금의 나를 만든 소중한 토대가 되었다. 유년기의 기억 속에서 발견한 소중한 순간들은 내가 세상을 바라보는 시각을 형성하는 데 큰 영향을 미쳤다. 어린아이의 눈으로 바라본 세상은 언제나 신비롭고 아름다웠으며, 그때의 순수한 마음과 끝없는 호기심이 지금도 내 안에 살아 숨쉬고 있다.`;
                  break;
                  
                case 'school':
                  autobiography += `${nationality}의 교육 환경에서 학교 생활은 내 인생에서 가장 중요한 시기 중 하나였다. ${answers[0] || '새로운 친구들과의 만남'}. `;
                  if (answers[1]) autobiography += `${answers[1]}을 통해 나는 많은 것을 배웠다. `;
                  if (answers[2]) autobiography += `그리고 ${answers[2]}는 나에게 큰 영향을 주었다. `;
                  if (answers[3]) autobiography += `마지막으로 ${answers[3]}는 내 학교 생활의 하이라이트였다. `;
                  autobiography += `\n\n${nationality}의 교육 시스템에서 배운 것들은 단순한 지식이 아닌 인생의 기본기가 되었다. 그때의 경험들이 나를 성숙하게 만들었고, 지금도 그 교훈들이 내 삶의 지침이 되고 있다. 학교 생활은 내게 새로운 세계를 열어주었으며, 학업뿐만 아니라 인간관계의 소중함도 배웠다. 교실에서 보낸 그 소중한 시간들, 선생님들의 가르침과 친구들과의 우정이 내 인생의 나침반이 되어주었다. 청춘의 한 페이지에서 그 모든 순간들이 지금의 나를 만든 소중한 추억이 되었다. 학창시절을 회상하면 그 시절의 경험들은 내가 사회의 일원으로 성장하는 데 중요한 밑거름이 되었다. 친구들과 함께 나눈 웃음과 눈물이 지금도 생생하며, 그때의 경험들이 나를 성장시켰고, 지금의 나를 만들어주었다.`;
                  break;
                  
                case 'teen':
                  autobiography += `${nationality}의 청소년 문화 속에서 청소년 시절은 내게 가장 혼란스럽고 동시에 가장 성장하는 시기였다. ${answers[0] || '새로운 도전'}. `;
                  if (answers[1]) autobiography += `${answers[1]}을 통해 나는 자신을 발견했다. `;
                  if (answers[2]) autobiography += `그리고 ${answers[2]}는 나에게 큰 의미가 있었다. `;
                  if (answers[3]) autobiography += `마지막으로 ${answers[3]}는 내 청소년기의 특별한 추억이다. `;
                  autobiography += `\n\n${nationality}의 사회 환경에서의 청소년기의 방황과 성장은 나를 더욱 성숙하게 만들어주었다. 그때의 고민과 고뇌가 지금의 나를 만들어준 소중한 경험이었다. 청소년기는 내게 가장 역동적이고 변화무쌍한 시기였으며, 자신만의 정체성을 찾아가는 여정을 시작했다. 이 시기의 고민과 성장은 내 미래를 결정하는 중요한 전환점이 되었다. 청소년기의 경험들은 내가 성인으로 성장하는 데 중요한 역할을 했으며, 그때의 고민과 성장이 지금의 나를 만들어주었다.`;
                  break;
                  
                case 'college':
                  autobiography += `${nationality}의 대학 문화에서 대학 시절은 내게 자유와 독립의 시간이었다. ${answers[0] || '새로운 학문'}. `;
                  if (answers[1]) autobiography += `${answers[1]}을 통해 나는 세상을 다르게 보게 되었다. `;
                  if (answers[2]) autobiography += `그리고 ${answers[2]}는 나에게 큰 도전이었다. `;
                  if (answers[3]) autobiography += `마지막으로 ${answers[3]}는 내 대학 생활의 특별한 경험이었다. `;
                  autobiography += `\n\n${nationality}의 학문적 환경에서의 대학 시절의 자유와 도전은 내 인생의 새로운 시작이었다. 그때의 경험들이 나를 성장시켰고, 지금의 나를 만들어주었다. 대학 생활은 내게 전문적인 지식과 함께 독립적인 사고를 키워주었으며, 자신의 꿈과 목표를 구체화해나갔다. 이 시기의 경험들은 내 전문성과 사회 진출을 위한 중요한 기반이 되었다. 대학 시절의 자유와 도전은 내 인생의 새로운 시작이었으며, 그때의 경험들이 나를 성장시켰고, 지금의 나를 만들어주었다.`;
                  break;
                  
                case 'work':
                  autobiography += `${nationality}의 직장 문화에서 직장 생활은 내게 책임감과 성취감을 가르쳐준 시기였다. ${answers[0] || '새로운 업무'}. `;
                  if (answers[1]) autobiography += `${answers[1]}을 통해 나는 많은 것을 배웠다. `;
                  if (answers[2]) autobiography += `그리고 ${answers[2]}는 나에게 큰 도전이었다. `;
                  if (answers[3]) autobiography += `마지막으로 ${answers[3]}는 내 직장 생활의 특별한 성취였다. `;
                  autobiography += `\n\n${nationality}의 기업 문화에서의 직장에서의 경험은 나에게 책임감과 성취감을 가르쳐주었다. 그때의 도전들이 나를 성장시켰고, 지금의 나를 만들어주었다. 직장 생활은 내게 현실적인 도전과 성장의 기회를 제공했으며, 전문가로서의 역량을 키워나갔다. 이 시기의 경험들은 내 경력과 사회적 지위를 확립하는 데 중요한 역할을 했다. 직장에서의 경험은 나에게 책임감과 성취감을 가르쳐주었으며, 그때의 도전들이 나를 성장시켰고, 지금의 나를 만들어주었다.`;
                  break;
                  
                case 'love':
                  autobiography += `${nationality}의 문화적 배경에서 사랑은 내게 가장 큰 행복과 성장을 가져다준 경험이었다. ${answers[0] || '특별한 만남'}. `;
                  if (answers[1]) autobiography += `${answers[1]}을 통해 나는 사랑의 의미를 알게 되었다. `;
                  if (answers[2]) autobiography += `그리고 ${answers[2]}는 나에게 큰 감동이었다. `;
                  if (answers[3]) autobiography += `마지막으로 ${answers[3]}는 내 인생의 가장 소중한 추억이다. `;
                  autobiography += `\n\n${nationality}의 전통과 가치관 속에서의 사랑은 나에게 가장 큰 행복과 성장을 가져다주었다. 그 경험들이 나를 더욱 따뜻하고 이해심 많은 사람으로 만들어주었다. 사랑과 관계는 내 인생에서 가장 아름답고 소중한 경험이었으며, 진정한 사랑의 의미를 깨달았다. 이 시기의 경험들은 내 감정적 성숙과 인간관계에 대한 이해를 깊게 했다. 사랑을 통해 배운 가장 소중한 것은 무엇인가요라는 질문에 대한 답을 찾아가는 과정에서 나는 인간관계의 소중함을 깨달았다. 사랑에 대한 당신만의 철학이 있다면이라는 질문을 통해 나는 사랑의 본질에 대해 깊이 생각하게 되었다.`;
                  break;
                  
                case 'present':
                  autobiography += `${nationality}에서 살아가는 현재의 나는 과거의 모든 경험들이 만들어낸 결과물이다. ${answers[0] || '현재의 나'}. `;
                  if (answers[1]) autobiography += `${answers[1]}을 통해 나는 지금의 나를 발견했다. `;
                  if (answers[2]) autobiography += `그리고 ${answers[2]}는 나에게 큰 의미가 있다. `;
                  if (answers[3]) autobiography += `마지막으로 ${answers[3]}는 내 현재의 특별한 가치이다. `;
                  autobiography += `\n\n${nationality}의 사회와 문화 속에서 현재의 나는 과거의 모든 경험들이 만들어낸 결과물이다. 그때의 경험들이 지금의 나를 만들어주었고, 앞으로도 계속해서 나를 성장시킬 것이다. 현재의 나는 과거의 모든 경험을 바탕으로 한 성숙한 인격체이며, 문화적 정체성을 바탕으로 자신만의 독특한 인생관을 형성했다. 이 모든 경험들이 모여 현재의 나를 만들어냈으며, 이러한 경험들이 나의 인생을 풍요롭고 의미 있게 만들어주었다.`;
                  break;
                  
                default:
                  // 기본 스토리 구성
                  questions.forEach((question: string, index: number) => {
                    const answer = answers[index];
                    if (answer && answer.trim()) {
                      autobiography += `${answer}. `;
                    }
                  });
                  autobiography += `\n\n${nationality}의 문화와 환경 속에서 그 시절의 경험들이 지금의 나를 만들어주었다. 그때의 추억들은 여전히 내 마음속에 소중하게 간직되어 있다. 이 모든 경험들이 모여 현재의 나를 만들어냈으며, 이러한 경험들이 나의 인생을 풍요롭고 의미 있게 만들어주었다.`;
              }
              
              return autobiography;
            };
            
            const autobiography = hasAnswers ? generateAutobiography(section) : "";
            
            return (
              <div key={section.id} className="bg-white rounded-lg shadow-lg p-8 mb-8 border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white">
                      {renderIcon(section.icon)}
                    </div>
                    <div>
                      <div className="text-sm text-amber-600 font-medium">제 {index + 1}장</div>
                      <h2 className="text-3xl font-bold text-amber-800">{section.title}</h2>
                    </div>
                  </div>
                </div>
                
                {/* 4컷 이미지 표시 */}
                {hasAnswers && images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">📸 추억의 순간들</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {images.map((img, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img 
                            src={img} 
                            alt={`${section.title} 이미지 ${imgIndex + 1}`} 
                            className="w-full h-48 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {imgIndex + 1}/4
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* AI 자서전 텍스트 */}
                {hasAnswers ? (
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border-l-4 border-amber-400">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold text-amber-800">📖 나의 이야기</h3>
                          {saveMessage && (
                            <span className="text-green-600 text-sm font-medium">{saveMessage}</span>
                          )}
                        </div>
                        <Button
                          onClick={() => {
                            setEditingSection(section.id);
                            setEditedAutobiography(section.editedAutobiography || autobiography);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-amber-400 text-amber-700 hover:bg-amber-50"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                      </div>
                    
                    {editingSection === section.id ? (
                      <div className="space-y-4">
                        <Textarea
                          value={editedAutobiography}
                          onChange={(e) => setEditedAutobiography(e.target.value)}
                          className="min-h-[300px] text-gray-700 leading-relaxed"
                          placeholder="자서전 내용을 수정해주세요..."
                          lang="ko"
                          inputMode="text"
                          autoComplete="off"
                          spellCheck="false"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              // 수정된 내용을 섹션에 저장
                              const updatedSections = [...sections];
                              const sectionIndex = updatedSections.findIndex(s => s.id === section.id);
                              if (sectionIndex !== -1) {
                                updatedSections[sectionIndex] = {
                                  ...updatedSections[sectionIndex],
                                  editedAutobiography: editedAutobiography
                                };
                                setSections(updatedSections);
                                
                                // localStorage에 저장 (사용자별 구분)
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('editedSections', JSON.stringify(updatedSections));
                                  localStorage.setItem(`editedSections_${name.trim()}`, JSON.stringify(updatedSections));
                                  localStorage.setItem(`sections_${name.trim()}`, JSON.stringify(updatedSections));
                                }
                                
                                // 저장 완료 메시지
                                setSaveMessage("저장되었습니다!");
                                
                                // 즉시 블로그 관리 페이지로 이동
                                setShowBlog(false);
                                setShowBlogManagement(true);
                              }
                              setEditingSection(null);
                              setEditedAutobiography("");
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            저장
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingSection(null);
                              setEditedAutobiography("");
                            }}
                            variant="outline"
                            className="border-gray-400 text-gray-600"
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {section.editedAutobiography || autobiography}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border-l-4 border-gray-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-600">📖 나의 이야기</h3>
                      </div>
                    </div>
                    <div className="text-gray-500 leading-relaxed text-center py-8">
                      <p className="text-lg">아직 작성되지 않은 섹션입니다.</p>
                      <p className="text-sm mt-2">메뉴에서 해당 섹션을 선택하여 이야기를 작성해보세요.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
          })}
          
          {/* 자서전 마무리 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-lg border-2 border-amber-200 text-center">
            <h3 className="text-2xl font-bold text-amber-800 mb-4">📖 에필로그</h3>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">
                이렇게 {name.trim()}의 인생 여정을 돌아보며, 각 시절의 소중한 추억들을 정리해보았다. 
                어린 시절의 순수함부터 현재의 성숙함까지, 모든 경험이 나를 만들어준 소중한 이야기들이다.
              </p>
              <p className="mb-4">
                때로는 그때로 돌아가고 싶을 때도 있지만, 지금의 나도 충분히 아름답고 의미 있다고 생각한다. 
                앞으로의 인생도 이렇게 소중한 추억들로 채워나갈 수 있기를 바란다.
              </p>
              <p className="text-amber-700 font-medium">
                - {name.trim()}의 자서전을 마치며 -
              </p>
            </div>
          </div>
          
          {/* 저장 버튼들 */}
          <div className="text-center mt-8 space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => {
                  // HTML 형태로 자서전 저장
                  saveAutobiographyAsHTML(name.trim(), sections, new Date().toLocaleDateString('ko-KR'));
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg"
              >
              📄 HTML로 저장
              </Button>
              
              <Button
                onClick={async () => {
                  // PDF 형태로 자서전 저장
                  try {
                    await saveAutobiographyAsPDF(name.trim(), sections, new Date().toLocaleDateString('ko-KR'));
    } catch (error) {
                    console.error('PDF 저장 실패:', error);
                    alert('PDF 저장에 실패했습니다. HTML 파일로 저장해보세요.');
                  }
                }}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg"
              >
              📖 PDF로 저장
              </Button>
              
            <Button
              onClick={() => {
                // 블로그 저장 로직
                const blogData = {
                  title: `${name.trim()}의 자서전`,
                  description: `${name.trim()}의 인생 여정을 담은 특별한 자서전입니다.`,
                  customUrl: `${name.trim().toLowerCase().replace(/\s+/g, '-')}-autobiography`,
                  isPublic: false,
                  sections: sections,
                  author: name.trim(),
                  createdAt: new Date().toISOString()
                };
                
                if (typeof window !== 'undefined') {
                  const existingBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
                  const updatedBlogs = [...existingBlogs, blogData];
                  localStorage.setItem('userBlogs', JSON.stringify(updatedBlogs));
                  setUserBlogs(updatedBlogs);
                }
                
                alert('블로그가 저장되었습니다!');
                
                // 나만의 자서전 설정 페이지로 이동
                setShowBlog(false);
                setShowBlogManagement(true);
              }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg"
            >
              💾 블로그 저장하기
            </Button>
            </div>
            
            <div className="text-sm text-gray-600 mt-4">
              <p>💡 <strong>HTML 저장:</strong> 웹 브라우저에서 아름다운 형태로 볼 수 있는 파일</p>
              <p>💡 <strong>PDF 저장:</strong> 인쇄하거나 공유하기 좋은 문서 형태</p>
              <p>💡 <strong>블로그 저장:</strong> 온라인에서 공유할 수 있는 블로그 형태</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // 블로그 관리 페이지
  if (showBlogManagement) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
        <Starfield explode={false} />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => setShowBlogManagement(false)}
              variant="outline"
              className="border-blue-300 hover:bg-blue-50 bg-white shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div className="flex items-center gap-4">
              <img 
                src="/lifecast-logo.png" 
                alt="AI Life Cast Logo" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            <h1 className="text-3xl font-bold text-blue-800">개인별 블로그 관리</h1>
            </div>
            <div className="w-20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 블로그 설정 */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-6">📝 나만의 자서전 설정</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="블로그 제목을 입력하세요"
                      lang="ko"
                      inputMode="text"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <div className="text-xs text-gray-500">
                      자동 제목 옵션:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => setBlogTitle(`${name.trim()}의 자서전_(${section.title})`)}
                          className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md border border-blue-300 transition-colors"
                        >
                          {section.title}
                        </button>
                      ))}
                      <button
                        onClick={() => setBlogTitle(`${name.trim()}의 자서전`)}
                        className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-md border border-green-300 transition-colors"
                      >
                        전체 자서전
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                  <textarea
                    value={blogDescription}
                    onChange={(e) => setBlogDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="블로그 설명을 입력하세요"
                    lang="ko"
                    inputMode="text"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">커스텀 URL</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      blog.example.com/
                    </span>
                    <input
                      type="text"
                      value={blogCustomUrl}
                      onChange={(e) => setBlogCustomUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="custom-url"
                      lang="ko"
                      inputMode="text"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">공개 설정</label>
                    <p className="text-sm text-gray-500">다른 사람들이 볼 수 있도록 설정합니다</p>
                  </div>
                  <button
                    onClick={() => setBlogIsPublic(!blogIsPublic)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      blogIsPublic ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        blogIsPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <Button
                  onClick={() => {
                    // 블로그 저장 로직
                    const defaultTitle = blogTitle || `${name.trim()}의 자서전`;
                    const defaultDescription = blogDescription || `${name.trim()}의 인생 여정을 담은 특별한 자서전입니다.`;
                    const defaultCustomUrl = blogCustomUrl || `${name.trim().toLowerCase().replace(/\s+/g, '-')}-autobiography`;
                    
                    const blogData = {
                      title: defaultTitle,
                      description: defaultDescription,
                      customUrl: defaultCustomUrl,
                      isPublic: blogIsPublic,
                      sections: sections,
                      author: name.trim(),
                      createdAt: new Date().toISOString()
                    };
                    
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('userBlogs', JSON.stringify([...userBlogs, blogData]));
                      setUserBlogs([...userBlogs, blogData]);
                    }
                    
                    alert('블로그가 저장되었습니다!');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                >
                  💾 블로그 저장
                </Button>
              </div>
            </div>

            {/* 블로그 목록 */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-6">📚 내 블로그 목록</h2>
              
              {userBlogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>아직 저장된 블로그가 없습니다.</p>
                  <p className="text-sm mt-2">왼쪽에서 블로그를 설정하고 저장해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBlogs.map((blog, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{blog.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={blog.isPublic ? "default" : "secondary"}>
                            {blog.isPublic ? "공개" : "비공개"}
                          </Badge>
                          <button
                            onClick={() => {
                              const updatedBlogs = [...userBlogs];
                              updatedBlogs[index] = { ...blog, isPublic: !blog.isPublic };
                              setUserBlogs(updatedBlogs);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('userBlogs', JSON.stringify(updatedBlogs));
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {blog.isPublic ? "비공개로" : "공개로"}
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{blog.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>조회수: {blog.views?.[0]?.count || 0}</span>
                        <span>생성일: {new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600"
                          onClick={() => {
                            setSelectedBlog(blog);
                            setShowBookFlipAnimation(true);
                            setShowBlogManagement(false);
                          }}
                        >
                          보기
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600"
                          onClick={() => {
                            // 편집 기능: 블로그 설정 페이지로 이동
                            setBlogTitle(blog.title);
                            setBlogDescription(blog.description);
                            setBlogIsPublic(blog.isPublic);
                            setSelectedBlogForEdit(blog);
                            setShowBlogManagement(true);
                          }}
                        >
                          편집
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-purple-600"
                          onClick={() => downloadBlogAsPDF(blog)}
                        >
                          다운로드
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600"
                          onClick={() => {
                            if (confirm('정말로 이 블로그를 삭제하시겠습니까?')) {
                              const updatedBlogs = userBlogs.filter((_, i) => i !== index);
                              setUserBlogs(updatedBlogs);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('userBlogs', JSON.stringify(updatedBlogs));
                              }
                            }
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">📊 통계 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userBlogs.length}</div>
                <div className="text-sm text-gray-600">총 블로그</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userBlogs.filter(b => b.isPublic).length}</div>
                <div className="text-sm text-gray-600">공개 블로그</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{blogViews}</div>
                <div className="text-sm text-gray-600">총 조회수</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{userBlogs.length > 0 ? Math.round(blogViews / userBlogs.length) : 0}</div>
                <div className="text-sm text-gray-600">평균 조회수</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 책 넘기는 애니메이션 모달
  if (showBookFlipAnimation && selectedBlog) {
    return (
      <BookFlipAnimation
        sections={selectedBlog.sections || []}
        title={selectedBlog.title}
        author={selectedBlog.author}
        onClose={() => {
          setShowBookFlipAnimation(false);
          setShowBlogManagement(true);
          setSelectedBlog(null);
        }}
      />
    );
  }

  // 섹션별 자서전 보기 모달
  if (showSectionAutobiography) {
    const section = sections.find(s => s.id === showSectionAutobiography);
    if (section) {
      return (
        <BookFlipAnimation
          sections={[section]}
          title={`${section.title} - ${name.trim()}의 이야기`}
          author={name.trim()}
          onClose={() => {
            setShowSectionAutobiography(null);
          }}
        />
      );
    }
  }
  // 메인 화면
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#fdf6e3] to-[#f5e1c0]">
      {/* 상단 로고 */}
      <header className="w-full flex items-center justify-center py-6 bg-white/80 shadow-sm mb-4">
        <img src="/lifecast-logo.png" alt="LifeCast 로고" className="h-12 w-auto mr-3" style={{minWidth:48}} />
        <span className="text-3xl font-bold text-amber-700 tracking-tight">LifeCast</span>
      </header>

      {/* 기존 메인 컨텐츠 */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-6 md:px-8">
        {/* AI 기능별 컴포넌트들 - 자서전 만들기 페이지에서는 숨김 */}
        {!isStarted && (
          <>
            <AIChatSection />
            <AIDiarySection />
            <AIFinanceSection />
            <AIAlbumSection />
          </>
        )}
        
        {/* 자서전 생성 UI - isStarted가 true일 때만 표시 */}
        <div className="text-center mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            className="border-amber-400 bg-white text-amber-900 hover:bg-amber-50 shadow-md"
            onClick={() => { 
              setShowMenuPage(true); 
              setIsStarted(false);
              setCurrentStage(null);
              setCurrentQuestionIndex(0);
              // 다른 AI 기능들도 초기화
              setShowAIChat(false);
              setShowAIDiary(false);
              setShowAIFinance(false);
              setShowAIAlbum(false);
              setShowAIAlbumBoard(false);
              setShowDiaryGallery(false);
              setShowAccountManagement(false);
              setShowBlog(false);
              setShowBlogManagement(false);
              setShowAutobiography(false);
              setShowSectionAutobiography(null);
              setShowBookFlipAnimation(false);
              setShowNotionSettings(false);
            }}
          >
            ← 메뉴로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-amber-800 flex-1 text-center">
            나만의 자서전 만들기
          </h1>
          <span className="w-24" />
        </div>

        <div className="text-center mb-8">
          <Progress value={progress} className="w-full max-w-md mx-auto h-2" />
          <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}% 완성</p>
        </div>

        {!currentStage ? (
          <div className="relative flex justify-center items-center min-h-[420px]">
            <div className="absolute inset-0 z-10 rounded-3xl shadow-2xl bg-gradient-to-br from-purple-500 via-purple-400 to-purple-600 opacity-90 p-8 md:p-12" />
            <div className="relative z-20 flex justify-center items-center w-full h-full py-8 md:py-12 px-8 md:px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-fit mx-auto p-0">
            {sections.map((section) => {
              const completedQuestions = section.answers.filter((a) => a).length
              const totalQuestions = section.questions.length
              const isCompleted = completedQuestions === totalQuestions

              return (
                <Card
                  key={section.id}
                  className={cn(
                        "w-64 md:w-72 min-h-[140px] max-w-full flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 p-2 text-base",
                    section.color,
                    isCompleted && "ring-2 ring-green-400",
                  )}
                  onClick={() => selectStage(section.id)}
                >
                  <CardHeader className="text-center p-2">
                    <div className="mx-auto w-8 h-8 bg-white rounded-full flex items-center justify-center mb-1 shadow-md">
                      {renderIcon(section.icon)}
                    </div>
                    <CardTitle className="text-base font-bold">{section.title}</CardTitle>
                    <CardDescription>
                      {completedQuestions}/{totalQuestions} 질문 완료
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-center">
                        {isCompleted ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            완료됨 ✨
                          </Badge>
                        ) : (
                          <Badge variant="outline">시작하기</Badge>
                        )}
                      </div>
                      {isCompleted && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                        onClick={() => {
                              saveSectionAutobiography(section.id);
                              setShowSectionAutobiography(section.id);
                            }}
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            자서전 보기
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-pink-200 shadow-xl">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {renderIcon(sections.find((s) => s.id === currentStage)?.icon || "heart")}
                  <CardTitle className="text-xl">{sections.find((s) => s.id === currentStage)?.title}</CardTitle>
                </div>
                <CardDescription>
                  질문 {currentQuestionIndex + 1} / {sections.find((s) => s.id === currentStage)?.questions.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg">
                  <p className="text-lg font-medium text-gray-800">
                    {sections.find((s) => s.id === currentStage)?.questions[currentQuestionIndex]}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() =>
                        speakQuestion(
                          sections.find((s) => s.id === currentStage)?.questions[currentQuestionIndex] || "",
                        )
                      }
                      disabled={isPlaying}
                      className="border-pink-300 hover:bg-pink-50"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                      질문 듣기
                    </Button>

                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
                      className={
                        isRecording
                          ? ""
                          : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      }
                    >
                      {isRecording ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                      {isRecording ? "녹음 중지" : "음성 답변"}
                    </Button>
                  </div>

                  {isRecording && (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        음성을 듣고 있습니다... 마이크에 가까이서 말씀해 주세요
                      </div>
                    </div>
                  )}

                  {!isRecording && (
                    <div className="text-center text-sm text-gray-500">
                      💡 음성 답변 버튼을 누르고 마이크 권한을 허용한 후 답변해 주세요
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">답변 (직접 입력 또는 음성으로)</label>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="여기에 답변을 입력하거나 음성으로 답변해주세요..."
                    className="min-h-[120px] border-pink-200 focus:border-pink-400"
                    lang="ko"
                    inputMode="text"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStage(null)} className="border-gray-300">
                    단계 선택으로
                  </Button>
                  <Button
                    onClick={nextQuestion}
                    disabled={!currentAnswer.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    다음 질문
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {checkAllSectionsCompleted(sections) && (
          <div className="mt-8 text-center">
            <Button
              onClick={async () => {
                setShowAutobiography(true);
                playSound('/sfx/full-autobiography-complete.mp3', 0.45);
                
                // Notion에 자서전 저장
                if (selectedNotionDatabase && userBirthYear) {
                  try {
                    const fullAutobiography = sections
                      .filter(section => section.editedAutobiography)
                      .map(section => `${section.title}\n\n${section.editedAutobiography}`)
                      .join('\n\n');
                    
                    await saveToNotion('autobiography', {
                      sectionTitle: '완전한 자서전',
                      content: fullAutobiography,
                      birthYear: parseInt(userBirthYear)
                    });
                  } catch (error) {
                    console.error('자서전 Notion 저장 실패:', error);
                  }
                }
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-full text-lg font-semibold"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              자서전 보기
            </Button>
          </div>
        )}

        <div className="fixed bottom-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-lg border-pink-200 hover:bg-pink-50"
            aria-label="편집"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-lg border-pink-200 hover:bg-pink-50"
            aria-label="다운로드"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </main>

      {/* Notion 설정 페이지 */}
      {showNotionSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-blue-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  📝 Notion 연동 설정
                </CardTitle>
                <Button
                  onClick={() => setShowNotionSettings(false)}
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  ✕
                </Button>
              </div>
              <CardDescription className="text-gray-600">
                Notion과 연동하여 AI 그림일기, 가계부, 자서전을 자동으로 저장할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 연결 상태 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">연결 상태</h3>
                    <p className="text-sm text-gray-600">{notionConnectionStatus || "연결되지 않음"}</p>
                  </div>
                  <Button
                    onClick={testNotionAPI}
                    disabled={notionConnectionStatus === "연결 중..."}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {notionConnectionStatus === "연결 중..." ? "연결 중..." : "연결 테스트"}
                  </Button>
                </div>
              </div>

              {/* 데이터베이스 선택 */}
              {notionConnected && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notion 데이터베이스 선택</label>
                    <select
                      value={selectedNotionDatabase}
                      onChange={(e) => setSelectedNotionDatabase(e.target.value)}
                      className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                    >
                      <option value="">데이터베이스를 선택하세요</option>
                      {notionDatabases.map((db) => (
                        <option key={db.id} value={db.id}>
                          {db.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedNotionDatabase && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-800 font-medium">데이터베이스가 선택되었습니다!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        이제 AI 그림일기, 가계부, 자서전이 자동으로 Notion에 저장됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 저장 옵션 */}
              {selectedNotionDatabase && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">자동 저장 설정</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                          📖
                        </div>
                        <h4 className="font-medium">AI 그림일기</h4>
                      </div>
                      <p className="text-sm text-gray-600">AI가 작성한 일기가 자동으로 저장됩니다.</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white">
                          💰
                        </div>
                        <h4 className="font-medium">AI 가계부</h4>
                      </div>
                      <p className="text-sm text-gray-600">가계부 기록이 자동으로 저장됩니다.</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white">
                          📚
                        </div>
                        <h4 className="font-medium">자서전</h4>
                      </div>
                      <p className="text-sm text-gray-600">완성된 자서전이 자동으로 저장됩니다.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 설정 완료 버튼 */}
              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setShowNotionSettings(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  닫기
                </Button>
                {selectedNotionDatabase && (
                  <Button
                    onClick={() => {
                      alert('Notion 연동 설정이 완료되었습니다!');
                      setShowNotionSettings(false);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    설정 완료
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 앨범 크게보기 모달 */}
      {showAlbumViewModal && selectedAlbumForView && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedAlbumForView.title}</h2>
                <Button
                  onClick={() => {
                    setShowAlbumViewModal(false);
                    setSelectedAlbumForView(null);
                  }}
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* 이미지 */}
                <div className="flex justify-center">
                  <img
                    src={selectedAlbumForView.image_url}
                    alt={selectedAlbumForView.title}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300?text=이미지를+불러올+수+없습니다';
                    }}
                  />
                </div>
                
                {/* 앨범 정보 */}
                <div className="space-y-3">
                  {selectedAlbumForView.description && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">설명</h3>
                      <p className="text-gray-600">{selectedAlbumForView.description}</p>
                    </div>
                  )}
                  
                  {selectedAlbumForView.text_description && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">AI 설명</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedAlbumForView.text_description}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>생성일: {new Date(selectedAlbumForView.created_at).toLocaleDateString('ko-KR')}</span>
                    {selectedAlbumForView.style && selectedAlbumForView.style !== "원본" && (
                      <Badge variant="outline" className="border-pink-400 text-pink-600">
                        {selectedAlbumForView.style}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* 액션 버튼들 */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedAlbumForView.title,
                          text: selectedAlbumForView.description,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(`${selectedAlbumForView.title}\n${selectedAlbumForView.description}`);
                        alert('앨범 정보가 클립보드에 복사되었습니다!');
                      }
                    }}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    📤 공유
                  </Button>
                  <Button
                    onClick={() => window.open(selectedAlbumForView.image_url, '_blank')}
                    variant="outline"
                    className="flex-1 border-pink-400 text-pink-600 hover:bg-pink-50"
                  >
                    🔗 새 탭에서 열기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 팀명 */}
      <footer className="w-full text-center py-3 text-xs text-gray-500 bg-transparent mt-8">
        팀 라이프캐스트 이주혜, 류미란, 이수영, 박강원
      </footer>
    </div>
  );
}