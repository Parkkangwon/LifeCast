import React, { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useAuth } from '@/hooks/use-auth';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Mic,
  MicOff,
  Download,
  Edit3,
  Heart,
  Sparkles
} from '@/components/ui/common';
import { cn, generateUniqueId, handleError, showSuccess } from '@/lib/utils';

interface DiaryEntry {
  id: string;
  content: string;
  mood: string;
  weather: string;
  images: string[];
  timestamp: Date;
}

interface DiaryChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface AIDiarySectionProps {
  onBackToMenu?: () => void;
}

const AIDiarySection: React.FC<AIDiarySectionProps> = ({ onBackToMenu }) => {
  const { user } = useAuth();
  const { 
    isRecording, 
    transcript, 
    error: speechError, 
    startRecording, 
    stopRecording, 
    resetTranscript 
  } = useSpeechRecognition();

  // 상태 관리
  const [diaryContent, setDiaryContent] = useState('');
  const [mood, setMood] = useState('기쁨');
  const [weather, setWeather] = useState('맑음');
  const [diaryImages, setDiaryImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [savedDiaryEntries, setSavedDiaryEntries] = useState<DiaryEntry[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  
  // 챗봇 관련 상태
  const [diaryChatMessages, setDiaryChatMessages] = useState<DiaryChatMessage[]>([]);
  const [diaryChatInput, setDiaryChatInput] = useState('');
  const [isDiaryChatLoading, setIsDiaryChatLoading] = useState(false);
  const [diaryChatMode, setDiaryChatMode] = useState<'text' | 'voice'>('text');
  const diaryChatContainerRef = useRef<HTMLDivElement>(null);

  // Notion 연동 상태
  const [notionConnected, setNotionConnected] = useState(false);

  const moodOptions = ['기쁨', '슬픔', '화남', '평온', '설렘', '걱정', '감사', '사랑'];
  const weatherOptions = ['맑음', '흐림', '비', '눈', '바람', '더움', '추움'];

  // 일기 챗봇 메시지 추가
  const addDiaryChatMessage = (type: 'user' | 'ai', message: string) => {
    const newMessage: DiaryChatMessage = {
      id: generateUniqueId(),
      type,
      message,
      timestamp: new Date()
    };
    setDiaryChatMessages(prev => [...prev, newMessage]);
  };

  // AI 응답 생성
  const generateDiaryChatResponse = async (userMessage: string) => {
    setIsDiaryChatLoading(true);
    
    try {
      // 간단한 AI 응답 로직 (실제로는 OpenAI API 사용)
      const responses = [
        "오늘 하루는 어땠나요? 더 자세히 들려주세요! 😊",
        "그런 일이 있었군요. 어떤 기분이었어요? 🤔",
        "정말 흥미로운 하루였네요! 더 이야기해주세요 ✨",
        "그런 경험을 하셨다니 대단해요! 💪",
        "오늘 하루도 수고하셨어요! 내일은 더 좋은 일이 있을 거예요 🌟"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // 약간의 지연을 두어 자연스러운 대화 느낌 연출
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      addDiaryChatMessage('ai', randomResponse);
    } catch (error) {
      handleError(error, 'AI 응답 생성');
      addDiaryChatMessage('ai', '죄송해요, 잠시 문제가 있었네요. 다시 말씀해주세요 😊');
    } finally {
      setIsDiaryChatLoading(false);
    }
  };

  // 챗봇 메시지 전송
  const sendDiaryChatMessage = async (message: string) => {
    if (!message.trim() || isDiaryChatLoading) return;
    
    addDiaryChatMessage('user', message);
    setDiaryChatInput('');
    
    await generateDiaryChatResponse(message);
  };

  // 음성 인식 시작
  const startDiaryVoiceRecognition = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // 음성 인식 중지
  const stopDiaryVoiceRecognition = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  // 음성 인식 결과 처리
  useEffect(() => {
    if (transcript && !isRecording) {
      sendDiaryChatMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isRecording]);

  // 챗봇 초기화
  const resetDiaryChat = () => {
    setDiaryChatMessages([]);
    setDiaryChatInput('');
  };

  // 이미지 생성
  const generateDiaryImages = async (diaryContent: string, mood: string, weather: string) => {
    setIsGeneratingImages(true);
    
    try {
      // 실제로는 OpenAI DALL-E API를 사용하여 이미지 생성
      // 여기서는 더미 이미지로 대체
      const dummyImages = [
        'https://via.placeholder.com/400x300/87CEEB/000000?text=맑은+하늘',
        'https://via.placeholder.com/400x300/98FB98/000000?text=평화로운+풍경',
        'https://via.placeholder.com/400x300/DDA0DD/000000?text=아름다운+일몰',
        'https://via.placeholder.com/400x300/F0E68C/000000?text=따뜻한+햇살'
      ];
      
      // 약간의 지연을 두어 생성 중임을 표시
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      setDiaryImages(dummyImages);
      showSuccess('이미지 생성이 완료되었습니다!');
    } catch (error) {
      handleError(error, '이미지 생성');
      showSuccess('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // 일기 저장
  const saveDiaryEntry = (content: string, mood: string, weather: string, images: string[]) => {
    const newEntry: DiaryEntry = {
      id: generateUniqueId(),
      content,
      mood,
      weather,
      images,
      timestamp: new Date()
    };
    
    setSavedDiaryEntries(prev => [newEntry, ...prev]);
    
    // localStorage에 저장
    const savedEntries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    savedEntries.unshift(newEntry);
    localStorage.setItem('diaryEntries', JSON.stringify(savedEntries));
    
    showSuccess('일기가 저장되었습니다!');
    
    // 폼 초기화
    setDiaryContent('');
    setMood('기쁨');
    setWeather('맑음');
    setDiaryImages([]);
  };

  // 저장된 일기 로드
  const loadSavedDiaryEntries = () => {
    const saved = localStorage.getItem('diaryEntries');
    if (saved) {
      const entries = JSON.parse(saved);
      setSavedDiaryEntries(entries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })));
    }
  };

  // 일기 삭제
  const deleteDiaryEntry = (id: string) => {
    setSavedDiaryEntries(prev => prev.filter(entry => entry.id !== id));
    
    // localStorage에서도 삭제
    const savedEntries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const filteredEntries = savedEntries.filter((entry: any) => entry.id !== id);
    localStorage.setItem('diaryEntries', JSON.stringify(filteredEntries));
    
    showSuccess('일기가 삭제되었습니다.');
  };

  // 컴포넌트 마운트 시 저장된 일기 로드
  useEffect(() => {
    loadSavedDiaryEntries();
  }, []);

  // 챗봇 컨테이너 자동 스크롤
  useEffect(() => {
    if (diaryChatContainerRef.current) {
      diaryChatContainerRef.current.scrollTop = diaryChatContainerRef.current.scrollHeight;
    }
  }, [diaryChatMessages]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-green-800 to-green-900">
      <Card className="w-full max-w-6xl text-center border-2 border-green-700 shadow-2xl bg-gradient-to-br from-green-900/90 to-green-800/95 relative z-20">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">AI 그림일기</CardTitle>
              <CardDescription className="text-green-100 text-xl">AI와 대화하며 그림일기를 만들어보세요</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDiaryChatMode('text')}
                className={cn(
                  diaryChatMode === 'text' 
                    ? 'bg-green-600 text-white' 
                    : 'border-green-300 text-green-100 hover:bg-green-800'
                )}
              >
                💬 텍스트
              </Button>
              <Button
                variant="outline"
                onClick={() => setDiaryChatMode('voice')}
                className={cn(
                  diaryChatMode === 'voice' 
                    ? 'bg-green-600 text-white' 
                    : 'border-green-300 text-green-100 hover:bg-green-800'
                )}
              >
                🎤 음성
              </Button>
              {notionConnected && (
                <div className="flex items-center gap-2 bg-green-800/50 rounded-full px-3 py-1 border border-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-100 text-sm font-medium">Notion 연동됨</span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={onBackToMenu}
                className="border-green-300 text-green-100 hover:bg-green-800"
              >
                돌아가기
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 챗봇 대화 영역 */}
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
                          className={cn(
                            "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                            message.type === 'user'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-700/50 text-green-100 border border-green-600'
                          )}
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
                      lang="ko"
                      inputMode="text"
                      autoComplete="off"
                      spellCheck="false"
                      disabled={isDiaryChatLoading}
                    />
                    <Button
                      onClick={() => sendDiaryChatMessage(diaryChatInput.trim())}
                      disabled={!diaryChatInput.trim() || isDiaryChatLoading}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-3"
                    >
                      전송
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={startDiaryVoiceRecognition}
                      disabled={isDiaryChatLoading}
                      className={cn(
                        "flex-1 rounded-full px-4 py-3",
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      )}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-4 h-4 mr-2" />
                          음성 인식 중... (클릭하여 중지)
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          음성으로 대화하기
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* 오른쪽: 일기 작성 영역 */}
            <div className="space-y-4">
              <div className="bg-green-800/30 rounded-lg p-4 border border-green-600">
                <h3 className="text-xl font-bold text-white mb-4">📝 일기 작성</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-green-100 text-sm font-medium mb-2">오늘의 기분</label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 bg-white/10 text-white border border-green-400 focus:border-green-300 focus:outline-none"
                    >
                      {moodOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-green-100 text-sm font-medium mb-2">날씨</label>
                    <select
                      value={weather}
                      onChange={(e) => setWeather(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 bg-white/10 text-white border border-green-400 focus:border-green-300 focus:outline-none"
                    >
                      {weatherOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-green-100 text-sm font-medium mb-2">오늘의 일기</label>
                    <textarea
                      value={diaryContent}
                      onChange={(e) => setDiaryContent(e.target.value)}
                      placeholder="오늘 하루는 어땠나요? AI와의 대화 내용을 바탕으로 일기를 작성해보세요..."
                      className="w-full h-32 rounded-lg px-3 py-2 bg-white/10 text-white placeholder-green-200 border border-green-400 focus:border-green-300 focus:outline-none resize-none"
                      lang="ko"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateDiaryImages(diaryContent, mood, weather)}
                      disabled={!diaryContent.trim() || isGeneratingImages}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isGeneratingImages ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          이미지 생성 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI 이미지 생성
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => saveDiaryEntry(diaryContent, mood, weather, diaryImages)}
                      disabled={!diaryContent.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                  </div>
                </div>
              </div>

              {/* 생성된 이미지 */}
              {diaryImages.length > 0 && (
                <div className="bg-green-800/30 rounded-lg p-4 border border-green-600">
                  <h3 className="text-lg font-bold text-white mb-3">🎨 생성된 이미지</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {diaryImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`일기 이미지 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-black"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 갤러리 버튼 */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowGallery(!showGallery)}
              variant="outline"
              className="border-green-300 text-green-100 hover:bg-green-800"
            >
              {showGallery ? '갤러리 숨기기' : '저장된 일기 보기'}
            </Button>
          </div>

          {/* 저장된 일기 갤러리 */}
          {showGallery && (
            <div className="bg-green-800/30 rounded-lg p-4 border border-green-600">
              <h3 className="text-xl font-bold text-white mb-4">📚 저장된 일기</h3>
              {savedDiaryEntries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📖</div>
                  <p className="text-green-200">아직 저장된 일기가 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedDiaryEntries.map((entry) => (
                    <Card key={entry.id} className="bg-green-700/50 border-green-600">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm text-green-200">
                            {entry.timestamp.toLocaleDateString('ko-KR')}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-300 text-green-100 hover:bg-green-800"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteDiaryEntry(entry.id)}
                              className="border-red-300 text-red-100 hover:bg-red-800"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        <div className="text-white text-sm mb-2 line-clamp-3">
                          {entry.content}
                        </div>
                        <div className="flex gap-2 text-xs text-green-200">
                          <span>😊 {entry.mood}</span>
                          <span>🌤️ {entry.weather}</span>
                        </div>
                        {entry.images.length > 0 && (
                          <div className="mt-2">
                            <img
                              src={entry.images[0]}
                              alt="일기 이미지"
                              className="w-full h-16 object-cover rounded"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDiarySection; 