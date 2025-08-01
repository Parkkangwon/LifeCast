"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  ArrowLeft,
  Download,
  Share2,
  Quote,
  BookOpen,
  Calendar,
  User,
  Eye,
  MessageCircle,
  ThumbsUp,
  Sparkles,
  Save,
} from "lucide-react"
import { useState, useMemo } from "react"
import TypingText from "./TypingText";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import BlogSettings from "./blog/blog-settings";
import { getSectionIcon } from "@/lib/autobiography-utils";
import { getProxiedImageUrl, handleImageError } from "@/lib/image-utils";
import { copyToClipboard } from "@/lib/utils";
import type { StorySection, Blog } from "@/types/blog";

interface LikeCommentState {
  [sectionId: string]: {
    likes: number;
    liked: boolean;
    comments: string[];
    showComment: boolean;
    commentInput: string;
  };
}

interface BlogDisplayProps {
  sections: StorySection[];
  onBack: () => void;
  onViewFullAutobiography?: () => void;
  selectedImages: { [sectionId: string]: string };
  setSelectedImages: React.Dispatch<React.SetStateAction<{ [sectionId: string]: string }>>;
  imageStyle?: string;
  onShowMyBlogs?: () => void;
}

export default function BlogDisplay({ sections, onBack, onViewFullAutobiography, selectedImages, setSelectedImages, imageStyle, onShowMyBlogs }: BlogDisplayProps & { onShowMyBlogs?: () => void }) {
  // 섹션별 좋아요/댓글 상태
  const [likeComment, setLikeComment] = useState<LikeCommentState>(() => {
    const state: LikeCommentState = {};
    sections.forEach((section) => {
      state[section.id] = {
        likes: 0,
        liked: false,
        comments: [],
        showComment: false,
        commentInput: "",
      };
    });
    return state;
  });
  // 공유 안내 메시지
  const [shareMsg, setShareMsg] = useState<string>("");
  const [showSaveBlog, setShowSaveBlog] = useState(false);

  // 완료된 섹션만 필터링
  const completedSections = sections.filter((section) => section.answers.some((answer) => answer && answer.trim()))

  // 블로그 전체 배경 이미지를 한 번만 랜덤 선정
  const blogBackgroundImage = useMemo(() => getBackgroundImage(completedSections[0]?.id || "childhood"), [completedSections]);

  // 답변을 자서전 형태로 확장하는 함수 (질문-답변을 자연스럽게 이어붙여 한 문단으로)
  const expandSectionToParagraph = (section: StorySection) => {
    return section.questions
      .map((q, i) => section.answers[i] && expandAnswer(q, section.answers[i], section.id))
      .filter(Boolean)
      .join(' ');
  };

  // 각 시절별 배경 이미지를 랜덤으로 선택 (이제 사용하지 않음)
  // const getBackgroundImage = (sectionId: string) => blogBackgroundImage;

  // 섹션별 색상 테마
  const getSectionTheme = (sectionId: string) => {
    const themes = {
      childhood: {
        gradient: "from-pink-500 to-rose-500",
        bg: "from-pink-50 to-rose-50",
        text: "text-pink-700",
        border: "border-pink-200",
      },
      school: {
        gradient: "from-purple-500 to-indigo-500",
        bg: "from-purple-50 to-indigo-50",
        text: "text-purple-700",
        border: "border-purple-200",
      },
      work: {
        gradient: "from-blue-500 to-cyan-500",
        bg: "from-blue-50 to-cyan-50",
        text: "text-blue-700",
        border: "border-blue-200",
      },
      love: {
        gradient: "from-rose-500 to-pink-500",
        bg: "from-rose-50 to-pink-50",
        text: "text-rose-700",
        border: "border-rose-200",
      },
      present: {
        gradient: "from-green-500 to-emerald-500",
        bg: "from-green-50 to-emerald-50",
        text: "text-green-700",
        border: "border-green-200",
      },
      future: {
        gradient: "from-indigo-500 to-purple-500",
        bg: "from-indigo-50 to-purple-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
      },
    }
    return themes[sectionId as keyof typeof themes] || themes.childhood
  }

  const allSectionsCompleted = sections.every(
    (section) =>
      section.answers.length === section.questions.length && section.answers.every((answer) => answer && answer.trim()),
  )

  // 답변을 자서전 형태로 확장하는 함수
  const expandAnswerToAutobiography = (question: string, answer: string, sectionId: string) => {
    if (!answer) return ""

    const autobiographyTemplates = {
      childhood: {
        templates: [
          `어린 시절을 되돌아보면, ${answer} 그 순간들은 마치 보석처럼 내 마음 속에 간직되어 있다. 순수했던 그 시절의 기억들이 지금의 나를 만든 소중한 토대가 되었다.`,
          `유년기의 기억 속에서, ${answer} 이러한 경험들은 내가 세상을 바라보는 시각을 형성하는 데 큰 영향을 미쳤다. 어린아이의 눈으로 바라본 세상은 언제나 신비롭고 아름다웠다.`,
          `어린 시절의 나에게, ${answer} 그때의 순수한 마음과 끝없는 호기심이 지금도 내 안에 살아 숨쉬고 있다.`,
        ],
      },
      school: {
        templates: [
          `학창시절을 회상하면, ${answer} 그 시절의 경험들은 내가 사회의 일원으로 성장하는 데 중요한 밑거름이 되었다. 친구들과 함께 나눈 웃음과 눈물이 지금도 생생하다.`,
          `교실에서 보낸 그 소중한 시간들, ${answer} 선생님들의 가르침과 친구들과의 우정이 내 인생의 나침반이 되어주었다.`,
          `청춘의 한 페이지에서, ${answer} 그 모든 순간들이 지금의 나를 만든 소중한 추억이 되었다.`,
        ],
      },
      work: {
        templates: [
          `직장생활을 시작하며, ${answer} 이러한 경험들은 나를 한 단계 더 성숙한 어른으로 만들어주었다. 책임감과 성취감을 동시에 느낄 수 있었던 소중한 시간이었다.`,
          `사회인으로서의 첫걸음에서, ${answer} 동료들과 함께 이루어낸 성과들이 내게 큰 자신감을 주었다.`,
          `커리어를 쌓아가며, ${answer} 이 모든 경험들이 내 인생의 중요한 전환점이 되었다.`,
        ],
      },
      love: {
        templates: [
          `사랑이라는 감정을 알게 되면서, ${answer} 그 순간들은 내 마음에 영원히 새겨진 아름다운 기억이 되었다. 사랑을 통해 나는 더 깊이 있는 사람이 될 수 있었다.`,
          `연애를 통해 배운 것들, ${answer} 이러한 경험들이 내게 진정한 사랑의 의미를 가르쳐주었다.`,
          `마음을 나눈 그 특별한 시간들, ${answer} 사랑의 기쁨과 아픔 모두가 나를 더욱 성숙하게 만들어주었다.`,
        ],
      },
      present: {
        templates: [
          `현재를 살아가며, ${answer} 지금 이 순간의 소중함을 깨닫게 된다. 과거의 모든 경험들이 현재의 나를 만들어냈다.`,
          `오늘을 살아가면서, ${answer} 이러한 깨달음들이 내 삶에 새로운 의미를 부여해준다.`,
          `현재의 나는, ${answer} 이 모든 것들이 미래를 향한 희망의 원동력이 되고 있다.`,
        ],
      },
      future: {
        templates: [
          `미래를 그려보며, ${answer} 이러한 꿈들이 내 삶을 더욱 풍요롭게 만들어줄 것이라 믿는다. 앞으로의 여정이 기대된다.`,
          `앞으로의 계획을 세우며, ${answer} 이 모든 목표들이 실현되는 그날을 상상하면 가슴이 설렌다.`,
          `미래의 나에게, ${answer} 이러한 희망들이 현실이 되기를 간절히 바란다.`,
        ],
      },
    }

    const templates = autobiographyTemplates[sectionId as keyof typeof autobiographyTemplates]?.templates || []
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]

    return randomTemplate || `${answer} 이러한 경험들이 내 인생의 소중한 한 페이지를 장식하고 있다.`
  }

  // PDF 다운로드 함수 (섹션별 1페이지, 이미지+텍스트 포함)
  const downloadBlog = async () => {
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    function waitForImagesToLoad(container: HTMLElement): Promise<void> {
      const images = Array.from(container.querySelectorAll('img'));
      return Promise.all(
        images.map(img => {
          return new Promise<void>(resolve => {
            // DALL-E 이미지인 경우 프록시 URL로 변경
            if (img.src && img.src.includes('oaidalleapiprodscus.blob.core.windows.net')) {
              img.src = getProxiedImageUrl(img.src);
            }
            
            img.onload = () => resolve();
            img.onerror = () => {
              // 이미지 로딩 실패 시 플레이스홀더 이미지로 대체
              handleImageError(img);
              img.onload = () => resolve();
              img.onerror = () => resolve(); // 두 번째 시도도 실패하면 그냥 진행
            };
            
            if (!img.complete || img.naturalWidth === 0) {
              const src = img.src;
              img.src = '';
              img.src = src;
            } else {
              // 이미 로드된 경우에도 load 이벤트 강제 발생
              setTimeout(() => resolve(), 0);
            }
          });
        })
      ).then(() => undefined);
    }

    for (let i = 0; i < completedSections.length; i++) {
      const section = completedSections[i];
      const domId = `pdf-section-page-${i}`;
      const sectionEl = document.getElementById(domId);
      if (!sectionEl) continue;
      // 이미지가 모두 로드될 때까지 대기
      await waitForImagesToLoad(sectionEl);
      // 캡처
      const canvas = await html2canvas(sectionEl, { 
        useCORS: true,
        allowTaint: true
      });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = { width: canvas.width, height: canvas.height };
      const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
      const pdfWidth = imgProps.width * ratio;
      const pdfHeight = imgProps.height * ratio;
      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    }
    pdf.save("나의_AI_자서전.pdf");
  };

  // 이미지 삭제 애니메이션 상태
  const [deletingImage, setDeletingImage] = useState<{ [sectionId: string]: string | null }>({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-lavender-50 to-rose-50" id="blog-content">
      {/* 블로그 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button onClick={onBack} variant="outline" className="border-gray-300 hover:bg-gray-50 bg-white shadow-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div className="flex gap-2">
              {allSectionsCompleted && onViewFullAutobiography && (
                <Button
                  onClick={onViewFullAutobiography}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  완전한 자서전 보기
                </Button>
              )}
              <Button
                onClick={downloadBlog}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                블로그 다운로드
              </Button>
              {/* 블로그 게시판 저장 버튼 */}
              <Button
                onClick={() => setShowSaveBlog(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                블로그 게시판에 저장
              </Button>
            </div>
          </div>
          {/* BlogSettings 모달/화면 */}
          {showSaveBlog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => setShowSaveBlog(false)}>
                  닫기
                </Button>
                <BlogSettings
                  sections={sections}
                  images={Object.values(selectedImages)}
                  onSave={() => {
                    setShowSaveBlog(false);
                    if (onShowMyBlogs) onShowMyBlogs();
                    // 상세페이지로 바로 이동하는 로직이 있다면 제거
                  }}
                />
              </div>
            </div>
          )}

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">나의 이야기 블로그</h1>
            <p className="text-gray-600">AI와 함께 써내려가는 인생의 순간들</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>작성자</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString("ko-KR")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{completedSections.length}개 포스트</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 블로그 포스트들 */}
        <div className="space-y-12">
          {completedSections.map((section, index) => {
            const theme = getSectionTheme(section.id)
            const blogPosts = createBlogPost(section)

            // 텍스트를 useMemo로 고정 (200자 이상, 뉴스/이슈/이벤트 포함)
            const fixedText = useMemo(() => {
              // 기존 스토리
              const base = expandSectionToParagraph(section);
              // 사용자 정보 추출(나이) - 생년월일에서 계산
              const userBirthYear = (typeof window !== "undefined" && localStorage.getItem("userBirthYear")) || "";
              const userAge = userBirthYear ? (new Date().getFullYear() - parseInt(userBirthYear.substring(0, 4))).toString() : "30";
              const year = getSectionYear(section.id, userAge);
              const eventText = getYearEventText(year);
              // 200자 이상으로 보장
              let result = `${base}\n\n${eventText}`;
              if (result.length < 200) {
                result = result + "\n" + "그 시절의 다양한 사건과 변화 속에서 나만의 특별한 이야기가 만들어졌습니다. 사회와 문화, 기술이 빠르게 변하던 시기, 나의 경험도 그 흐름 속에 녹아 있었습니다.";
              }
              return result;
            }, [section]);

            return (
              <article key={section.id} className="group">
                {/* 실제 화면용 카드 */}
                <Card
                  className={`overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${theme.border}`}
                >
                  {/* 포스트 헤더 */}
                  <div className={`bg-gradient-to-r ${theme.gradient} text-white p-6`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        {getSectionIcon(section.id)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                        <p className="text-white text-opacity-90">
                          {new Date().toLocaleDateString("ko-KR")} • {blogPosts.length}개의 이야기
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 포스트 내용 */}
                  <CardContent className="p-0">
                    <div
                      className="relative min-h-[700px]"
                      style={{
                        backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.92) 100%), url(" + blogBackgroundImage + "),",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "fixed",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-60"></div>
                      <div className="relative z-10 p-8">
                        {/* 2컷 이미지 출력 */}
                        <div className="mb-8">
                          <h4 className="text-lg font-semibold text-center mb-4 text-gray-800">
                            {section.title}의 4컷 이미지
                          </h4>
                          <div className="bg-white bg-opacity-95 rounded-xl p-6 shadow-lg border-2 border-pink-200 max-w-2xl mx-auto">
                            <div className="grid grid-cols-2 gap-4">
                              {(() => {
                                let sectionImages: string[] = [];
                                try {
                                  sectionImages = section.illustration ? JSON.parse(section.illustration) : [];
                                } catch {
                                  sectionImages = [];
                                }
                                // 사용자 정보 localStorage에서 가져오기
                                const userName = (typeof window !== "undefined" && localStorage.getItem("userName")) || "이름";
                                const userBirthYear = (typeof window !== "undefined" && localStorage.getItem("userBirthYear")) || "";
                                const userAge = userBirthYear ? (new Date().getFullYear() - parseInt(userBirthYear.substring(0, 4))).toString() : "30";
                                const userGender = (typeof window !== "undefined" && localStorage.getItem("userGender")) || "남성";
                                // 프롬프트 생성 함수
                                const getImagePrompt = (name: string, age: string, gender: string, answer: string) =>
                                  `${name}, ${age}세, ${gender}의 인물. ${answer}. 현대적인 복장과 배경, 밝고 생동감 있는 분위기. 인물은 정면을 바라보고 있음. 이미지가 크롭되지 않게 전체가 보이도록.`;
                                // 2컷만 출력
                                return [0, 1, 2, 3].map((idx) => (
                                  <div key={idx} className="relative group">
                                    <div className="aspect-square rounded-lg overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                                      <img
                                        src={
                                          sectionImages[idx] ||
                                          "/placeholder.svg?height=200&width=200&text=" + encodeURIComponent((imageStyle || "Manga") + ' ' + (section.title || "Memory") + ' ' + (idx + 1))
                                        }
                                        alt={section.title + " " + (imageStyle || "Manga") + " panel " + (idx + 1)}
                                        className="w-full h-full object-cover"
                                        style={{ aspectRatio: "1 / 1", minHeight: 0, minWidth: 0 }}
                                      />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white">
                                      {idx + 1}
                                    </div>
                                    {/* 이미지 생성 프롬프트 표시 */}
                                    {/* 이미지 아래 프롬프트 표시 제거 */}
                                  </div>
                                ));
                              })()}
                            </div>
                            <div className="text-center mt-4">
                              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 rounded-full">
                                <Sparkles className="w-4 h-4 text-pink-500" />
                                <span className="text-sm font-medium text-pink-700">AI가 생성한 4컷 이미지</span>
                              </div>
                            </div>
                            {/* 이미지 아래에 전체 텍스트 출력 */}
                            <div className="mt-8">
                              <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">{fixedText}</div>
                            </div>
                          </div>
                        </div>

                        {/* 소설형 스토리 */}
                        {/* 기존 소설형 스토리(텍스트) 단독 블록은 삭제 */}
                      </div>
                    </div>
                  </CardContent>

                  {/* 포스트 푸터 */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* 좋아요 버튼 */}
                        <Button
                          variant={likeComment[section.id]?.liked ? "default" : "ghost"}
                          size="sm"
                          className={likeComment[section.id]?.liked ? "text-red-500" : "text-gray-600 hover:text-red-500"}
                          onClick={() => {
                            setLikeComment((prev) => ({
                              ...prev,
                              [section.id]: {
                                ...prev[section.id],
                                likes: prev[section.id].liked ? prev[section.id].likes - 1 : prev[section.id].likes + 1,
                                liked: !prev[section.id].liked,
                              },
                            }));
                          }}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          좋아요 {likeComment[section.id]?.likes}
                        </Button>
                        {/* 댓글 버튼 */}
                        <Button
                          variant={likeComment[section.id]?.showComment ? "default" : "ghost"}
                          size="sm"
                          className={likeComment[section.id]?.showComment ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}
                          onClick={() => {
                            setLikeComment((prev) => ({
                              ...prev,
                              [section.id]: {
                                ...prev[section.id],
                                showComment: !prev[section.id].showComment,
                              },
                            }));
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          댓글 {likeComment[section.id]?.comments.length}
                        </Button>
                        {/* 공유 버튼 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-green-500"
                          onClick={async () => {
                            const success = await copyToClipboard(window.location.href + `#${section.id}`);
                            if (success) {
                              setShareMsg(`'${section.title}' 섹션 링크가 복사되었습니다!`);
                            } else {
                              setShareMsg("클립보드 복사에 실패했습니다.");
                            }
                            setTimeout(() => setShareMsg(""), 2000);
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          공유
                        </Button>
                      </div>
                      <Badge className={`bg-gradient-to-r ${theme.gradient} text-white border-0`}>
                        {section.title}
                      </Badge>
                    </div>
                    {/* 댓글 입력/목록 UI */}
                    {likeComment[section.id]?.showComment && (
                      <div className="mt-4">
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            className="flex-1 border rounded px-3 py-2 text-sm"
                            placeholder="댓글을 입력하세요"
                            value={likeComment[section.id]?.commentInput}
                            onChange={e => setLikeComment(prev => ({
                              ...prev,
                              [section.id]: {
                                ...prev[section.id],
                                commentInput: e.target.value,
                              },
                            }))}
                            onKeyDown={e => {
                              if (e.key === "Enter" && likeComment[section.id]?.commentInput.trim()) {
                                setLikeComment(prev => ({
                                  ...prev,
                                  [section.id]: {
                                    ...prev[section.id],
                                    comments: [...prev[section.id].comments, prev[section.id].commentInput],
                                    commentInput: "",
                                  },
                                }));
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (likeComment[section.id]?.commentInput.trim()) {
                                setLikeComment(prev => ({
                                  ...prev,
                                  [section.id]: {
                                    ...prev[section.id],
                                    comments: [...prev[section.id].comments, prev[section.id].commentInput],
                                    commentInput: "",
                                  },
                                }));
                              }
                            }}
                          >
                            등록
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {likeComment[section.id]?.comments.map((c, i) => (
                            <div key={i} className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-700">
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* 공유 안내 메시지 */}
                    {shareMsg && (
                      <div className="mt-2 text-green-600 text-sm text-center">{shareMsg}</div>
                    )}
                  </div>
                </Card>
                {/* PDF용 hidden DOM (섹션별 1페이지) */}
                <div
                  id={`pdf-section-page-${index}`}
                  style={{ position: "absolute", left: "-9999px", top: 0, width: "794px", height: "1123px", background: "white", zIndex: -1, overflow: "hidden", display: "block" }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      padding: 32,
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      backgroundImage: "url(" + blogBackgroundImage + ")",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {/* 반투명 흰색 오버레이 */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(255,255,255,0.85)",
                      zIndex: 1,
                    }} />
                    {/* 실제 내용 */}
                    <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{section.title}</h2>
                      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                        {(() => {
                          let sectionImages: string[] = [];
                          try {
                            sectionImages = section.illustration ? JSON.parse(section.illustration) : [];
                          } catch {
                            sectionImages = [];
                          }
                          // 사용자 정보 localStorage에서 가져오기
                          const userName = (typeof window !== "undefined" && localStorage.getItem("userName")) || "이름";
                          const userAge = (typeof window !== "undefined" && localStorage.getItem("userAge")) || "30";
                          const userGender = (typeof window !== "undefined" && localStorage.getItem("userGender")) || "남성";
                          // 프롬프트 생성 함수
                          const getImagePrompt = (name: string, age: string, gender: string, answer: string) =>
                            `${name}, ${age}세, ${gender}의 인물. ${answer}. 현대적인 복장과 배경, 밝고 생동감 있는 분위기. 인물은 정면을 바라보고 있음. 이미지가 크롭되지 않게 전체가 보이도록.`;
                          return [0, 1, 2, 3].map((idx) => (
                            <div key={idx} style={{ flex: 1, borderRadius: 12, overflow: "hidden", border: "2px solid #eee", background: "#faf7f7", minHeight: 180, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <img
                                src={sectionImages[idx] || "/placeholder.svg?height=200&width=200&text=" + encodeURIComponent((imageStyle || "Manga") + ' ' + (section.title || "Memory") + ' ' + (idx + 1))}
                                alt={section.title + " " + (imageStyle || "Manga") + " panel " + (idx + 1)}
                                style={{ width: "100%", height: "auto", objectFit: "cover", aspectRatio: "1/1", minHeight: 0, minWidth: 0 }}
                              />
                            </div>
                          ));
                        })()}
                      </div>
                      <div style={{ fontSize: 18, color: "#333", whiteSpace: "pre-line", marginTop: 16, flex: 1 }}>{fixedText}</div>
                    </div>
                  </div>
                </div>
                {/* 포스트 구분선 */}
                {index < completedSections.length - 1 && (
                  <div className="flex items-center justify-center my-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                      <Heart className="w-4 h-4 text-gray-400" />
                      <div className="w-16 h-0.5 bg-gradient-to-r from-gray-400 to-gray-300"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {/* 블로그 사이드바 정보 */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">블로그 통계</h3>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{completedSections.length}</div>
                <div className="text-sm text-gray-600">작성된 포스트</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {completedSections.reduce(
                    (sum, section) => sum + section.answers.filter((a) => a && a.trim()).length,
                    0,
                  )}
                </div>
                <div className="text-sm text-gray-600">답변한 질문</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((completedSections.length / sections.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">완성도</div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {allSectionsCompleted ? "모든 이야기가 완성되었습니다!" : "더 많은 이야기를 들려주세요"}
            </h3>
            <p className="text-gray-600 mb-6">
              {allSectionsCompleted
                ? "이제 완전한 자서전을 생성하여 PDF로 다운로드할 수 있습니다."
                : `${sections.length - completedSections.length}개의 시절이 더 기다리고 있어요.`}
            </p>
            <div className="flex justify-center gap-4">
              {!allSectionsCompleted && (
                <Button
                  onClick={onBack}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  계속 작성하기
                </Button>
              )}
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                블로그 다운로드
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}