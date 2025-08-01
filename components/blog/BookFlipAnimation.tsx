'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react';

interface BookFlipAnimationProps {
  sections: any[];
  title: string;
  author: string;
  onClose: () => void;
}

export default function BookFlipAnimation({ sections, title, author, onClose }: BookFlipAnimationProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');

  // 책 표지에서 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCover(false);
    }, 2000); // 2초 후 표지에서 내용으로

    return () => clearTimeout(timer);
  }, []);

  const totalPages = sections.length + 2; // 표지 + 내용 + 에필로그

  const nextPage = () => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('right');
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsFlipping(false);
      }, 400);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('left');
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsFlipping(false);
      }, 400);
    }
  };

  const renderPage = () => {
    if (currentPage === 0) {
      // 책 표지 - 금장 문향 고급스러운 디자인
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-900 via-amber-800 to-yellow-700 rounded-lg shadow-2xl border-8 border-yellow-600 relative overflow-hidden">
          {/* 금장 문향 패턴 배경 */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-yellow-400/30 via-transparent to-yellow-600/30"></div>
            <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-yellow-400/40 rounded-lg"></div>
            <div className="absolute top-8 left-8 right-8 bottom-8 border border-yellow-300/30 rounded-lg"></div>
            <div className="absolute top-12 left-12 right-12 bottom-12 border border-yellow-200/20 rounded-lg"></div>
          </div>
          
          {/* 중앙 장식 요소 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-yellow-400/60 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-yellow-300/40 rounded-full opacity-40"></div>
          
          <div className="text-center p-8 relative z-10">
            {/* 고급스러운 아이콘 */}
            <div className="text-6xl mb-8 text-yellow-300 drop-shadow-lg">📚</div>
            
            {/* 제목 - 금장 효과 */}
            <div className="mb-6">
              <h1 className="text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-300 bg-clip-text drop-shadow-lg mb-2">
                {title}
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
            </div>
            
            {/* 저자 정보 */}
            <div className="mb-8">
              <p className="text-2xl text-yellow-200 font-semibold mb-2">저자</p>
              <p className="text-3xl font-bold text-yellow-100 drop-shadow-md">{author}</p>
            </div>
            
            {/* 부제목 */}
            <div className="text-lg text-yellow-200 mb-8 font-medium">
              <p className="mb-1">인생의 각 시절을 담은</p>
              <p>특별한 이야기</p>
            </div>
            
            {/* 장식 요소 */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="w-8 h-0.5 bg-yellow-400"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-8 h-0.5 bg-yellow-400"></div>
            </div>
            
            {/* 안내 텍스트 */}
            <div className="text-sm text-yellow-300/80 font-medium">
              <p>클릭하여 읽기 시작</p>
            </div>
            
            {/* 하단 장식 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (currentPage === totalPages - 1) {
      // 에필로그 - 고급스러운 디자인
      return (
        <div className="w-full h-full bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-8 rounded-lg border-4 border-yellow-200 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-amber-400"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-yellow-400"></div>
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-400 to-amber-400"></div>
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-amber-400 to-yellow-400"></div>
          
          <div className="text-center relative z-10">
            {/* 제목 */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text mb-4">
                📖 에필로그
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto rounded-full"></div>
            </div>
            
            {/* 내용 */}
            <div className="text-gray-800 leading-relaxed text-lg max-w-4xl mx-auto">
              <p className="mb-6 text-xl">
                이렇게 <span className="font-bold text-amber-700">{author}</span>의 인생 여정을 돌아보며, 각 시절의 소중한 추억들을 정리해보았다. 
                어린 시절의 순수함부터 현재의 성숙함까지, 모든 경험이 나를 만들어준 소중한 이야기들이다.
              </p>
              <p className="mb-8 text-xl">
                때로는 그때로 돌아가고 싶을 때도 있지만, 지금의 나도 충분히 아름답고 의미 있다고 생각한다. 
                앞으로의 인생도 이렇게 소중한 추억들로 채워나갈 수 있기를 바란다.
              </p>
              
              {/* 마무리 문구 */}
              <div className="mt-12 p-6 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border-2 border-yellow-200">
                <p className="text-amber-700 font-bold text-2xl">
                  - {author}의 자서전을 마치며 -
                </p>
              </div>
            </div>
            
            {/* 하단 장식 */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // 자서전 내용 - 양면 책 형태
      const section = sections[currentPage - 1];
      const autobiography = section.editedAutobiography || generateAutobiography(section);
      
      // 4컷 이미지 파싱
      let images: string[] = [];
      if (section.illustration) {
        try { 
          images = JSON.parse(section.illustration); 
        } catch (e) { 
          console.error('이미지 파싱 오류:', e); 
        }
      }
      
      return (
        <div className="w-full h-full flex bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-2xl overflow-hidden relative border-4 border-yellow-200">
          {/* 책 중앙 접힌 부분 - 금장 효과 */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-full bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-400 z-10 shadow-lg"></div>
          
          {/* 책 전체 그림자 효과 */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/30 via-transparent to-amber-200/30 pointer-events-none"></div>
          
          {/* 왼쪽 페이지 - 4컷 이미지 */}
          <div className="w-1/2 h-full bg-gradient-to-br from-yellow-100 to-amber-100 p-6 border-r-4 border-yellow-300 relative">
            {/* 왼쪽 페이지 그림자 */}
            <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-l from-yellow-200/50 to-transparent"></div>
            <div className="h-full flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text mb-2">{section.title}</h3>
                <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto rounded-full"></div>
                <p className="text-sm text-amber-600 mt-2 font-medium">추억의 순간들</p>
              </div>
              
              {images.length > 0 ? (
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {images.map((image, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"></div>
                      <img
                        src={image}
                        alt={`추억 ${imgIndex + 1}`}
                        className="w-full h-full object-cover rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border-2 border-yellow-200 group-hover:border-yellow-400"
                      />
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                        {imgIndex + 1}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-bold text-sm bg-yellow-600 bg-opacity-80 px-3 py-2 rounded-lg shadow-lg">
                          추억 {imgIndex + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-amber-600">
                    <div className="text-6xl mb-4">📸</div>
                    <p className="text-lg font-medium">이미지가 없습니다</p>
                  </div>
                </div>
              )}
              
              <div className="text-center mt-4">
                <div className="text-xs text-amber-600 font-medium bg-yellow-100 px-3 py-1 rounded-full">
                  페이지 {currentPage} / {totalPages - 1}
                </div>
              </div>
            </div>
          </div>
          
          {/* 오른쪽 페이지 - 자서전 텍스트 */}
          <div className="w-1/2 h-full bg-gradient-to-r from-amber-100 to-orange-100 p-6 relative">
            {/* 오른쪽 페이지 그림자 */}
            <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-amber-200/50 to-transparent"></div>
            <div className="h-full flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text mb-2">📖 나의 이야기</h3>
                <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-lg shadow-inner border-2 border-yellow-200 min-h-full relative">
                    {/* 인쇄된 종이 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-yellow-100/40 pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="text-gray-800 leading-relaxed whitespace-pre-line font-serif text-lg tracking-wide">
                        {autobiography}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <div className="text-sm text-amber-700 font-medium">
                  {author}의 자서전
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const generateAutobiography = (section: any) => {
    const nationality = '대한민국'; // 기본값
    const name = author;
    
    switch (section.id) {
      case 'childhood':
        return `${name}의 어린 시절은 ${nationality}의 전통적인 가치관 속에서 자라난 특별한 시간이었다. 부모님의 따뜻한 사랑과 보살핌 속에서 ${name}는 세상에 대한 호기심과 순수함을 키워나갔다. ${section.answers.join(' ')} 이러한 경험들은 ${name}의 인생관과 가치관을 형성하는 데 중요한 역할을 했다. 어린 시절의 추억은 마치 보물상자처럼 ${name}의 마음속에 간직되어 있으며, 그때의 경험들이 지금의 ${name}를 만든 소중한 토대가 되었다. 유년기의 기억 속에서 발견한 소중한 순간들은 ${name}가 세상을 바라보는 시각을 형성하는 데 큰 영향을 미쳤다. 어린아이의 눈으로 바라본 세상은 언제나 신비롭고 아름다웠으며, 그때의 순수한 마음과 끝없는 호기심이 지금도 ${name}의 안에 살아 숨쉬고 있다.`;
      case 'school':
        return `학교 생활은 ${name}에게 새로운 세계를 열어주었다. ${nationality}의 교육 환경 속에서 ${name}는 학업뿐만 아니라 인간관계의 소중함도 배웠다. ${section.answers.join(' ')} 이 시절의 경험들은 ${name}가 사회적 존재로서 성장하는 데 큰 도움이 되었다. 교실에서 보낸 그 소중한 시간들, 선생님들의 가르침과 친구들과의 우정이 ${name}의 인생의 나침반이 되어주었다. 청춘의 한 페이지에서 그 모든 순간들이 지금의 ${name}를 만든 소중한 추억이 되었다. 학창시절을 회상하면 그 시절의 경험들은 ${name}가 사회의 일원으로 성장하는 데 중요한 밑거름이 되었다. 친구들과 함께 나눈 웃음과 눈물이 지금도 생생하며, 그때의 경험들이 ${name}를 성장시켰고, 지금의 ${name}를 만들어주었다.`;
      case 'teen':
        return `청소년기는 ${name}에게 가장 역동적이고 변화무쌍한 시기였다. ${nationality}의 청소년 문화 속에서 ${name}는 자신만의 정체성을 찾아가는 여정을 시작했다. ${section.answers.join(' ')} 이 시기의 고민과 성장은 ${name}의 미래를 결정하는 중요한 전환점이 되었다. 청소년기의 경험들은 ${name}가 성인으로 성장하는 데 중요한 역할을 했으며, 그때의 고민과 성장이 지금의 ${name}를 만들어주었다. 이 시기의 방황과 성장은 ${name}를 더욱 성숙하게 만들어주었으며, 그때의 고민과 고뇌가 지금의 ${name}를 만들어준 소중한 경험이었다.`;
      case 'college':
        return `대학 생활은 ${name}에게 전문적인 지식과 함께 독립적인 사고를 키워주었다. ${nationality}의 고등교육 환경에서 ${name}는 자신의 꿈과 목표를 구체화해나갔다. ${section.answers.join(' ')} 이 시기의 경험들은 ${name}의 전문성과 사회 진출을 위한 중요한 기반이 되었다. 대학 시절의 자유와 도전은 ${name}의 인생의 새로운 시작이었으며, 그때의 경험들이 ${name}를 성장시켰고, 지금의 ${name}를 만들어주었다. 이 시기의 경험들은 ${name}의 전문성과 사회 진출을 위한 중요한 기반이 되었다.`;
      case 'work':
        return `직장 생활은 ${name}에게 현실적인 도전과 성장의 기회를 제공했다. ${nationality}의 직장 문화 속에서 ${name}는 전문가로서의 역량을 키워나갔다. ${section.answers.join(' ')} 이 시기의 경험들은 ${name}의 경력과 사회적 지위를 확립하는 데 중요한 역할을 했다. 직장에서의 경험은 ${name}에게 책임감과 성취감을 가르쳐주었으며, 그때의 도전들이 ${name}를 성장시켰고, 지금의 ${name}를 만들어주었다. 이 시기의 경험들은 ${name}의 경력과 사회적 지위를 확립하는 데 중요한 역할을 했다.`;
      case 'love':
        return `사랑과 관계는 ${name}의 인생에서 가장 아름답고 소중한 경험이었다. ${nationality}의 문화적 배경 속에서 ${name}는 진정한 사랑의 의미를 깨달았다. ${section.answers.join(' ')} 이 시기의 경험들은 ${name}의 감정적 성숙과 인간관계에 대한 이해를 깊게 했다. 사랑을 통해 배운 가장 소중한 것은 무엇인가요라는 질문에 대한 답을 찾아가는 과정에서 ${name}는 인간관계의 소중함을 깨달았다. 사랑에 대한 당신만의 철학이 있다면이라는 질문을 통해 ${name}는 사랑의 본질에 대해 깊이 생각하게 되었다.`;
      case 'present':
        return `현재의 ${name}는 과거의 모든 경험을 바탕으로 한 성숙한 인격체이다. ${nationality}의 문화적 정체성을 바탕으로 ${name}는 자신만의 독특한 인생관을 형성했다. ${section.answers.join(' ')} 이 모든 경험들이 모여 현재의 ${name}를 만들어냈다. 현재의 ${name}는 과거의 모든 경험을 바탕으로 한 성숙한 인격체이며, 문화적 정체성을 바탕으로 자신만의 독특한 인생관을 형성했다. 이러한 경험들이 ${name}의 인생을 풍요롭고 의미 있게 만들어주었다.`;
      default:
        return `${name}의 인생 여정은 ${nationality}의 문화적 배경 속에서 펼쳐진 특별한 이야기이다. ${section.answers.join(' ')} 이러한 경험들이 ${name}의 인생을 풍요롭고 의미 있게 만들어주었다. 이 모든 경험들이 모여 현재의 ${name}를 만들어냈으며, 이러한 경험들이 ${name}의 인생을 풍요롭고 의미 있게 만들어주었다.`;
    }
  };

  if (showCover) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">자서전 열기</h2>
            <Button onClick={onClose} variant="outline" size="icon" className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center p-8 bg-gradient-to-br from-amber-100 to-orange-100">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-pulse">📖</div>
              <h3 className="text-2xl font-bold text-amber-800 mb-4">자서전을 여는 중...</h3>
              <p className="text-amber-600">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col" style={{ aspectRatio: '4/5.33' }}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={onClose} variant="outline" className="border-amber-300 hover:bg-amber-50">
              <X className="w-4 h-4 mr-2" />
              닫기
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-amber-800">{title}</h2>
              <p className="text-amber-600">{author}의 자서전</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {currentPage + 1} / {totalPages}
          </div>
        </div>

        {/* 책 내용 */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-amber-100 to-orange-100">
          <div className="relative w-full max-w-6xl h-full">
            {/* 페이지 컨테이너 - 자연스러운 페이지 넘김 효과 */}
            <div 
              className="w-full h-full relative overflow-hidden"
              style={{
                boxShadow: isFlipping ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.4s ease-out'
              }}
            >
              {/* 현재 페이지 */}
              <div 
                className={`w-full h-full transition-all duration-400 ease-out ${
                  isFlipping 
                    ? flipDirection === 'right' 
                      ? 'transform -translate-x-full opacity-0' 
                      : 'transform translate-x-full opacity-0'
                    : 'transform translate-x-0 opacity-100'
                }`}
              >
                {renderPage()}
              </div>
              
              {/* 다음/이전 페이지 (플립 중에만 표시) */}
              {isFlipping && (
                <div 
                  className={`absolute inset-0 w-full h-full transition-all duration-400 ease-out ${
                    flipDirection === 'right' 
                      ? 'transform translate-x-full opacity-0' 
                      : 'transform -translate-x-full opacity-0'
                  }`}
                  style={{
                    animation: flipDirection === 'right' 
                      ? 'slideInFromRight 0.4s ease-out forwards' 
                      : 'slideInFromLeft 0.4s ease-out forwards'
                  }}
                >
                  {renderPage()}
                </div>
              )}
            </div>
            
            {/* CSS 애니메이션 스타일 */}
            <style jsx>{`
              @keyframes slideInFromRight {
                0% {
                  transform: translateX(100%);
                  opacity: 0;
                }
                50% {
                  transform: translateX(50%);
                  opacity: 0.5;
                }
                100% {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
              
              @keyframes slideInFromLeft {
                0% {
                  transform: translateX(-100%);
                  opacity: 0;
                }
                50% {
                  transform: translateX(-50%);
                  opacity: 0.5;
                }
                100% {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
            `}</style>

            {/* 네비게이션 버튼 */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
              <Button
                onClick={prevPage}
                disabled={currentPage === 0 || isFlipping}
                variant="outline"
                size="icon"
                className="pointer-events-auto bg-white/80 hover:bg-white shadow-lg border-amber-300 hover:border-amber-400"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1 || isFlipping}
                variant="outline"
                size="icon"
                className="pointer-events-auto bg-white/80 hover:bg-white shadow-lg border-amber-300 hover:border-amber-400"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              표지로
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={prevPage}
              disabled={currentPage === 0}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              이전
            </Button>
            <Button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              다음
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 