"use client"

import React from 'react';
import { StorySection } from '@/types/blog';
import { getProxiedImageUrl } from '@/lib/image-utils';

// AI 자서전 생성 함수
function generateAIAutobiography(section: StorySection, userName: string, nationality: string = '대한민국'): string {
  const answers = section.answers.filter((a: string) => a && a.trim());
  const questions = section.questions.slice(0, answers.length);
  
  let autobiography = `${userName}의 ${section.title} 이야기\n\n`;
  
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
}

interface AutobiographyRendererProps {
  userName: string;
  sections: StorySection[];
  createdAt?: string;
  className?: string;
}

export default function AutobiographyRenderer({ 
  userName, 
  sections, 
  createdAt = new Date().toLocaleDateString('ko-KR'),
  className = "" 
}: AutobiographyRendererProps) {
  const completedSections = sections.filter(section => 
    section.answers?.some(answer => answer && answer.trim())
  );

  return (
    <div className={`autobiography-container ${className}`}>
      {/* 제목 페이지 */}
      <div className="autobiography-page title-page">
        
        <div className="title-content">
          <h1 className="main-title">{userName}의 자서전</h1>
          <h2 className="subtitle">{userName}의 자서전</h2>
          <p className="creation-date">작성일: {createdAt}</p>
        </div>
      </div>

      {/* 섹션별 페이지 */}
      {completedSections.map((section, index) => {
        const sectionImages = section.illustration ? 
          (typeof section.illustration === 'string' ? 
            JSON.parse(section.illustration) : section.illustration) : 
          [];

        return (
          <div key={section.id} className="autobiography-page section-page">

            <div className="page-content">
              {/* 왼쪽: 이미지 섹션 */}
              <div className="image-section">
                <h2 className="section-title">{section.title}</h2>
                <h3 className="section-subtitle">추억의 순간들</h3>
                
                <div className="image-grid">
                  {[0, 1, 2, 3].map((imgIndex) => (
                    <div key={imgIndex} className="image-panel">
                      <div className="image-number">{imgIndex + 1}</div>
                      {sectionImages[imgIndex] ? (
                        <img 
                          src={getProxiedImageUrl(sectionImages[imgIndex])} 
                          alt={`${section.title} 이미지 ${imgIndex + 1}`}
                          className="section-image"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src && target.src.includes('oaidalleapiprodscus.blob.core.windows.net')) {
                              target.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`;
                            }
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">이미지</div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="navigation-arrows">
                  <div className="nav-arrow left">‹</div>
                  <div className="nav-arrow right">›</div>
                </div>
                
                <div className="page-indicator">페이지 {index + 1}/{completedSections.length}</div>
              </div>

              {/* 오른쪽: 텍스트 섹션 */}
              <div className="text-section">
                <div className="text-header">
                  <div className="text-icon">■</div>
                  <h2 className="text-title">나의 이야기</h2>
                </div>
                
                <div className="autobiography-text">
                  {section.editedAutobiography || generateAIAutobiography(section, userName)}
                </div>
                
                <div className="text-footer">
                  <div className="navigation-arrows">
                    <div className="nav-arrow left">‹</div>
                    <div className="nav-arrow right">›</div>
                  </div>
                  <div className="autobiography-footer">{userName}의 자서전</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* 마지막 페이지 */}
      <div className="autobiography-page final-page">
        
        <div className="final-content">
          <h2 className="final-title">감사의 말</h2>
          <div className="final-text">
            이 자서전을 통해 나의 인생 여정을 돌아보며, 모든 순간이 소중했음을 깨달았습니다. 
            앞으로도 더욱 풍요로운 삶을 살아가겠습니다.
          </div>
          <div className="final-footer">
            <p>이 자서전은 AI 자서전 생성기로 작성되었습니다.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .autobiography-container {
          font-family: 'Arial', sans-serif;
          background: #fff8dc;
          min-height: 100vh;
        }

        .autobiography-page {
          background: linear-gradient(135deg, #fff8dc 0%, #f5e6b3 100%);
          border-radius: 20px;
          margin: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        

        .title-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 600px;
          text-align: center;
        }

        .title-content {
          padding: 40px;
        }

        .main-title {
          font-size: 48px;
          font-weight: bold;
          color: #8b4513;
          margin-bottom: 20px;
        }

        .subtitle {
          font-size: 24px;
          color: #a0522d;
          margin-bottom: 40px;
        }

        .creation-date {
          font-size: 18px;
          color: #808080;
        }

        .section-page {
          min-height: 600px;
        }

        .page-content {
          display: flex;
          height: calc(100vh - 120px);
        }

        .image-section {
          width: 45%;
          padding: 30px;
          background: white;
          border-radius: 15px;
          margin: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          border: 2px solid #ffd700;
          position: relative;
        }

        .section-title {
          font-size: 36px;
          font-weight: bold;
          color: #8b4513;
          margin-bottom: 10px;
        }

        .section-subtitle {
          font-size: 20px;
          color: #a0522d;
          margin-bottom: 30px;
        }

        .image-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 10px;
          height: 300px;
          margin-bottom: 20px;
        }

        .image-panel {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid #ffd700;
          background: #f0f0f0;
        }

        .image-number {
          position: absolute;
          top: 5px;
          left: 5px;
          width: 25px;
          height: 25px;
          background: #ffd700;
          color: #8b4513;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          z-index: 2;
        }

        .section-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #808080;
          font-size: 14px;
        }

        .text-section {
          width: 55%;
          padding: 30px;
          background: white;
          border-radius: 15px;
          margin: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          border: 2px solid #ffd700;
          display: flex;
          flex-direction: column;
        }

        .text-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .text-icon {
          width: 20px;
          height: 20px;
          background: #8b4513;
          margin-right: 10px;
        }

        .text-title {
          font-size: 24px;
          font-weight: bold;
          color: #8b4513;
        }

                .autobiography-text {
            flex: 1;
            font-size: 16px;
            line-height: 1.8;
            color: #404040;
            white-space: pre-wrap;
            text-align: justify;
            font-family: 'Georgia', 'Times New Roman', serif;
            padding: 20px;
            background: linear-gradient(135deg, #fefefe 0%, #f8f8f8 100%);
            border-radius: 10px;
            border-left: 4px solid #ffd700;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
            overflow-y: auto;
        }

        .qa-pair {
          margin-bottom: 20px;
        }

        .question {
          font-weight: bold;
          color: #8b4513;
          margin-bottom: 8px;
        }

        .answer {
          color: #404040;
          margin-bottom: 15px;
        }

        .text-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navigation-arrows {
          display: flex;
          gap: 10px;
        }

        .nav-arrow {
          width: 30px;
          height: 30px;
          background: #ffd700;
          color: #8b4513;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
        }

        .page-indicator {
          text-align: center;
          font-size: 14px;
          color: #808080;
          margin-top: 10px;
        }

        .autobiography-footer {
          text-align: center;
          font-size: 14px;
          color: #8b4513;
        }

        .final-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 600px;
          text-align: center;
        }

        .final-content {
          padding: 40px;
        }

        .final-title {
          font-size: 36px;
          font-weight: bold;
          color: #8b4513;
          margin-bottom: 30px;
        }

        .final-text {
          font-size: 20px;
          color: #404040;
          line-height: 1.6;
          max-width: 600px;
          margin-bottom: 40px;
        }

        .final-footer {
          font-size: 12px;
          color: #7f8c8d;
          border-top: 1px solid #ecf0f1;
          padding-top: 20px;
        }

        @media (max-width: 768px) {
          .page-content {
            flex-direction: column;
            height: auto;
          }

          .image-section,
          .text-section {
            width: auto;
            margin: 10px;
          }

          .main-title {
            font-size: 32px;
          }

          .section-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
} 