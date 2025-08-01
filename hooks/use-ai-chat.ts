import { useState, useCallback } from 'react';
import { generateUniqueId, handleError } from '@/lib/utils';

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

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [customCharacter, setCustomCharacter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 감정 분석 함수
  const analyzeEmotion = useCallback((message: string): 'happy' | 'sad' | 'angry' | 'question' | 'general' => {
    const happyKeywords = ['좋아', '행복', '기뻐', '축하', '성공', '대단', '멋져', '완벽', '최고', '좋은', '기쁜', '즐거운', '신나는', '재미있는', '좋다', '좋네', '좋아요'];
    const sadKeywords = ['슬퍼', '우울', '힘들어', '아파', '속상', '실패', '실망', '우울해', '슬픈', '힘든', '아픈', '속상한', '실망한', '우울한', '슬프다', '힘들다', '아프다'];
    const angryKeywords = ['화나', '짜증', '열받', '분노', '화가', '짜증나', '열받아', '분노해', '화난', '짜증나는', '열받는', '분노한', '화나는', '화나다', '짜증나다', '열받다'];
    const questionKeywords = ['왜', '어떻게', '무엇', '언제', '어디', '누가', '어떤', '?', '궁금', '알고 싶', '궁금해', '알고 싶어', '궁금한', '알고 싶은', '뭐', '무슨', '어떤가', '어떠냐'];
    
    const lowerMessage = message.toLowerCase();
    
    // 인사말 체크
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
  }, []);

  // 기본 캐릭터 정보
  const characterInfo: Record<string, CharacterInfo> = {
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
          "축하드립니다! 그런 성취감을 느끼시는군요 👏",
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
    }
  };

  // AI 응답 생성 함수
  const generateAIResponse = useCallback(async (userMessage: string): Promise<string> => {
    try {
      const currentCharacter = selectedCharacter === "기타" ? customCharacter : selectedCharacter || "선생님";
      const characterData = characterInfo[currentCharacter];
      
      if (!characterData) {
        // 기본 응답
        const defaultResponses = [
          "흥미로운 이야기네요! 더 자세히 들려주세요 😊",
          "그런 생각을 하시다니 정말 좋아요! 💭",
          "정말 멋진 관점이에요! 더 이야기해보고 싶어요 ✨",
          "그런 경험이 있었군요. 어떻게 느끼셨나요? 🤔",
          "좋은 대화 주제네요! 더 깊이 이야기해보자요 💕"
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      }

      const emotion = analyzeEmotion(userMessage);
      const responses = characterData.responses[emotion];
      
      if (responses && responses.length > 0) {
        // 반복 방지를 위해 최근 응답과 다른 응답 선택
        const recentResponses = messages.slice(-3).map(msg => msg.message);
        const availableResponses = responses.filter(response => !recentResponses.includes(response));
        
        if (availableResponses.length > 0) {
          return availableResponses[Math.floor(Math.random() * availableResponses.length)];
        }
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      // 해당 감정의 응답이 없으면 일반 응답 사용
      const generalResponses = characterData.responses.general;
      const recentResponses = messages.slice(-3).map(msg => msg.message);
      const availableResponses = generalResponses.filter(response => !recentResponses.includes(response));
      
      if (availableResponses.length > 0) {
        return availableResponses[Math.floor(Math.random() * availableResponses.length)];
      }
      return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    } catch (error) {
      handleError(error, 'AI Response Generation');
      return "죄송해요, 잠시 문제가 있었네요. 다시 말씀해주세요 😊";
    }
  }, [selectedCharacter, customCharacter, messages, analyzeEmotion]);

  // 메시지 추가 함수
  const addMessage = useCallback(async (type: 'user' | 'ai', message: string) => {
    const newMessage: ChatMessage = {
      id: generateUniqueId(),
      type,
      message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // 사용자 메시지인 경우 AI 응답 생성
    if (type === 'user') {
      setIsLoading(true);
      try {
        const aiResponse = await generateAIResponse(message);
        const aiMessage: ChatMessage = {
          id: generateUniqueId(),
          type: 'ai',
          message: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        handleError(error, 'AI Response Generation');
      } finally {
        setIsLoading(false);
      }
    }
  }, [generateAIResponse]);

  // 채팅 초기화
  const resetChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    selectedCharacter,
    customCharacter,
    isLoading,
    setSelectedCharacter,
    setCustomCharacter,
    addMessage,
    resetChat,
    characterInfo
  };
}; 