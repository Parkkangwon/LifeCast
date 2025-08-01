// 자서전/질문-답변 확장, 섹션별 매핑, 패턴 등 공통 유틸
import { ReactNode } from "react";
import { Heart, GraduationCap, Briefcase, Star, Sparkles, BookOpen } from "lucide-react";
import { StorySection } from "@/types/blog";
import { getProxiedImageUrl } from './image-utils';

export function getSectionIcon(sectionId: string): ReactNode {
  switch (sectionId) {
    case "childhood": return <Heart className="w-5 h-5" />;
    case "school": return <GraduationCap className="w-5 h-5" />;
    case "work": return <Briefcase className="w-5 h-5" />;
    case "love": return <Star className="w-5 h-5" />;
    case "present": return <Sparkles className="w-5 h-5" />;
    case "future": return <BookOpen className="w-5 h-5" />;
    default: return <Heart className="w-5 h-5" />;
  }
}

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

// 자서전을 아름다운 HTML 형태로 생성하는 함수
export function generateBeautifulAutobiographyHTML(userName: string, sections: StorySection[], createdAt?: string): string {
  const completedSections = sections.filter(section => 
    section.answers?.some(answer => answer && answer.trim())
  );

  const creationDate = createdAt || new Date().toLocaleDateString('ko-KR');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${userName}의 자서전</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: #fff8dc;
            line-height: 1.6;
        }

        .autobiography-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .autobiography-page {
            background: linear-gradient(135deg, #fff8dc 0%, #f5e6b3 100%);
            border-radius: 20px;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
            min-height: 600px;
        }



        .title-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
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

        .page-content {
            display: flex;
            min-height: 500px;
        }

        .image-section {
            width: 45%;
            padding: 30px;
            background: white;
            border-radius: 15px;
            margin: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border: 2px solid #ffd700;
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
            text-align: center;
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

        @media print {
            .autobiography-page {
                page-break-after: always;
                margin: 0;
                border-radius: 0;
            }
            
            .page-header {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="autobiography-container">
        <!-- 제목 페이지 -->
        <div class="autobiography-page title-page">
            
            <div class="title-content">
                <h1 class="main-title">${userName}의 자서전</h1>
                <h2 class="subtitle">${userName}의 자서전</h2>
                <p class="creation-date">작성일: ${creationDate}</p>
            </div>
        </div>

        ${completedSections.map((section, index) => {
          const sectionImages = section.illustration ? 
            (typeof section.illustration === 'string' ? 
              JSON.parse(section.illustration) : section.illustration) : 
            [];

          return `
        <!-- ${section.title} 페이지 -->
        <div class="autobiography-page section-page">

            <div class="page-content">
                <!-- 왼쪽: 이미지 섹션 -->
                <div class="image-section">
                    <h2 class="section-title">${section.title}</h2>
                    <h3 class="section-subtitle">추억의 순간들</h3>
                    
                    <div class="image-grid">
                        ${[0, 1, 2, 3].map((imgIndex) => `
                            <div class="image-panel">
                                <div class="image-number">${imgIndex + 1}</div>
                                ${sectionImages[imgIndex] ? 
                                  `<img src="${getProxiedImageUrl(sectionImages[imgIndex])}" alt="${section.title} 이미지 ${imgIndex + 1}" class="section-image" onerror="this.src='https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2'">` : 
                                  `<div class="image-placeholder">이미지</div>`
                                }
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="navigation-arrows">
                        <div class="nav-arrow left">‹</div>
                        <div class="nav-arrow right">›</div>
                    </div>
                    
                    <div class="page-indicator">페이지 ${index + 1}/${completedSections.length}</div>
                </div>

                <!-- 오른쪽: 텍스트 섹션 -->
                <div class="text-section">
                    <div class="text-header">
                        <div class="text-icon">■</div>
                        <h2 class="text-title">나의 이야기</h2>
                    </div>
                    
                    <div class="autobiography-text">
                        ${section.editedAutobiography || generateAIAutobiography(section, userName)}
                    </div>
                    
                    <div class="text-footer">
                        <div class="navigation-arrows">
                            <div class="nav-arrow left">‹</div>
                            <div class="nav-arrow right">›</div>
                        </div>
                        <div class="autobiography-footer">${userName}의 자서전</div>
                    </div>
                </div>
            </div>
        </div>
          `;
        }).join('')}

        <!-- 마지막 페이지 -->
        <div class="autobiography-page final-page">
            
            <div class="final-content">
                <h2 class="final-title">감사의 말</h2>
                <div class="final-text">
                    이 자서전을 통해 나의 인생 여정을 돌아보며, 모든 순간이 소중했음을 깨달았습니다. 
                    앞으로도 더욱 풍요로운 삶을 살아가겠습니다.
                </div>
                <div class="final-footer">
                    <p>이 자서전은 AI 자서전 생성기로 작성되었습니다.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// 자서전을 HTML 파일로 저장하는 함수
export function saveAutobiographyAsHTML(userName: string, sections: StorySection[], createdAt?: string): void {
  const htmlContent = generateBeautifulAutobiographyHTML(userName, sections, createdAt);
  
  // HTML 파일 생성 및 다운로드
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${userName}_자서전.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 자서전을 PDF로 저장하는 함수 (html2canvas 사용)
export async function saveAutobiographyAsPDF(userName: string, sections: StorySection[], createdAt?: string): Promise<void> {
  try {
    // html2canvas와 jsPDF 동적 import
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    // 임시 컨테이너 생성
    const container = document.createElement('div');
    container.innerHTML = generateBeautifulAutobiographyHTML(userName, sections, createdAt);
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const pages = container.querySelectorAll('.autobiography-page');
    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const canvas = await html2canvas(pages[i] as HTMLElement, {
        useCORS: true,
        allowTaint: true,
        background: '#fff8dc'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }

    // PDF 다운로드
    pdf.save(`${userName}_자서전.pdf`);

    // 임시 컨테이너 제거
    document.body.removeChild(container);
  } catch (error) {
    console.error('PDF 생성 중 오류:', error);
    alert('PDF 생성에 실패했습니다. HTML 파일로 저장해보세요.');
  }
} 