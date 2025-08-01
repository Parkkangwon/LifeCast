import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/hooks/use-ai-chat';
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
  MicOff
} from '@/components/ui/common';
import { cn, calculateAge } from '@/lib/utils';
import { characterInfo } from '@/lib/character-info';

interface AIChatSectionProps {
  onBackToMenu?: () => void;
}

const AIChatSection: React.FC<AIChatSectionProps> = ({ onBackToMenu }) => {
  const { user } = useAuth();
  const {
    messages: aiChatMessages,
    selectedCharacter,
    customCharacter,
    isLoading: aiChatLoading,
    setSelectedCharacter,
    setCustomCharacter,
    addMessage: addChatMessage,
    resetChat,
    characterInfo: chatCharacterInfo
  } = useAIChat();
  
  const { 
    isRecording, 
    transcript, 
    error: speechError, 
    startRecording, 
    stopRecording, 
    resetTranscript 
  } = useSpeechRecognition();

  const [showCharacterSelect, setShowCharacterSelect] = useState(true);
  const [aiChatMessage, setAiChatMessage] = useState('');
  const [previousCharacters, setPreviousCharacters] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 사용자 정보
  const name = user?.name || '';
  const userGender = user?.gender || '';
  const userBirthYear = user?.birthYear || '';

  // 사용자 정보 기반 캐릭터 생성 함수
  const generateUserBasedCharacter = (userName: string, userGender: string, userAge: number) => {
    const ageGroup = userAge < 20 ? '청소년' : userAge < 30 ? '20대' : userAge < 40 ? '30대' : userAge < 50 ? '40대' : '50대+';
    
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
            ]
          }
        };
      }
    }
    
    return {
      name: "친구",
      emoji: "👥",
      personality: "따뜻하고 공감하는",
      greeting: `안녕! 오늘은 어떤 일이 있었어?`,
      responses: {
        general: [
          `정말 그랬구나! 더 자세히 들려줘 👥`,
          `그런 일이 있었구나. 많이 힘들었겠어 😊`,
          `와, 정말 대단해! 자랑스러워해 👏`,
          `그런 생각을 하다니 너무 멋져! 💪`,
          `괜찮아, 내가 들어줄게. 더 이야기해봐 💖`
        ]
      }
    };
  };

  // 대화 맥락 초기화 함수
  const resetConversationContext = () => {
    // 대화 맥락 초기화 로직
  };

  // 음성 채팅 시작
  const startVoiceChat = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // 음성 인식 결과 처리
  useEffect(() => {
    if (transcript && !isRecording) {
      addChatMessage('user', transcript);
      resetTranscript();
    }
  }, [transcript, isRecording, addChatMessage, resetTranscript]);

  // 채팅창 자동 스크롤
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiChatMessages]);

  // 이전 대화 캐릭터 로드
  useEffect(() => {
    const saved = localStorage.getItem('previousCharacters');
    if (saved) {
      setPreviousCharacters(JSON.parse(saved));
    }
  }, []);

  // 캐릭터 선택 화면
  if (showCharacterSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-800 to-blue-900">
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
                        resetConversationContext();
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
              {/* 개인화된 캐릭터 */}
              {name.trim() && userGender && userBirthYear && (
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105",
                    selectedCharacter === "개인화" 
                      ? "ring-4 ring-green-400 bg-gradient-to-br from-green-500/20 to-emerald-500/20" 
                      : "bg-gradient-to-br from-green-800/50 to-emerald-800/50"
                  )}
                  onClick={() => {
                    const userAge = calculateAge(userBirthYear);
                    const userBasedCharacter = generateUserBasedCharacter(name.trim(), userGender, userAge);
                    setSelectedCharacter("개인화");
                    setCustomCharacter(userBasedCharacter.name);
                    resetConversationContext();
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
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-105",
                  selectedCharacter === "남자친구" 
                    ? "ring-4 ring-pink-400 bg-gradient-to-br from-pink-500/20 to-red-500/20" 
                    : "bg-gradient-to-br from-blue-800/50 to-purple-800/50"
                )}
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
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-105",
                  selectedCharacter === "여자친구" 
                    ? "ring-4 ring-pink-400 bg-gradient-to-br from-pink-500/20 to-red-500/20" 
                    : "bg-gradient-to-br from-blue-800/50 to-purple-800/50"
                )}
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
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-105",
                  selectedCharacter === "선생님" 
                    ? "ring-4 ring-pink-400 bg-gradient-to-br from-pink-500/20 to-red-500/20" 
                    : "bg-gradient-to-br from-blue-800/50 to-purple-800/50"
                )}
                onClick={() => {
                  setSelectedCharacter("선생님");
                  resetConversationContext();
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
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-105",
                  selectedCharacter === "기타" 
                    ? "ring-4 ring-pink-400 bg-gradient-to-br from-pink-500/20 to-red-500/20" 
                    : "bg-gradient-to-br from-blue-800/50 to-purple-800/50"
                )}
                onClick={() => {
                  setSelectedCharacter("기타");
                  resetConversationContext();
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
                onClick={onBackToMenu}
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
                  
                  setShowCharacterSelect(false);
                  resetConversationContext();
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
                onClick={startVoiceChat}
                disabled={isRecording}
                className={cn(
                  "rounded-full px-4 py-2",
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                )}
              >
                {isRecording ? (
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
                  resetChat();
                }}
                className="border-blue-300 text-blue-100 hover:bg-blue-800 rounded-full px-4 py-2"
              >
                상대 변경
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  onBackToMenu?.();
                  resetChat();
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
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-3 shadow-lg",
                  msg.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md'
                )}
              >
                <div className="text-sm">{msg.message}</div>
                <div className={cn(
                  "text-xs mt-1",
                  msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                )}>
                  {msg.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          {aiChatLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-bl-md px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 메시지 입력 영역 */}
        <CardContent className="pt-4 border-t border-blue-600">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiChatMessage}
              onChange={(e) => setAiChatMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && aiChatMessage.trim() && !aiChatLoading) {
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
              disabled={aiChatLoading}
            />
            <Button 
              onClick={() => {
                if (aiChatMessage.trim() && !aiChatLoading) {
                  addChatMessage('user', aiChatMessage.trim());
                  setAiChatMessage('');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3"
              disabled={!aiChatMessage.trim() || aiChatLoading}
            >
              전송
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatSection;