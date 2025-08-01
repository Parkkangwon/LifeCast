"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  Heart,
  Eye,
  Calendar,
  Share2,
  Download,
  Quote,
  Sparkles,
  GraduationCap,
  Briefcase,
  Star,
  User,
} from "lucide-react"
import { SectionCard } from "@/components/ui/section-card"
import { ImageGallery } from "@/components/ui/image-gallery"
import { QuestionAnswer } from "@/components/ui/question-answer"
import { cn } from "@/lib/utils"
import { getSectionIcon, getBackgroundImage, expandAnswer, shareUrl } from "@/lib/autobiography-utils"
import type { Blog } from "@/types/blog"

interface PublicBlogViewProps {
  blog: Blog
}

export default function PublicBlogView({ blog }: PublicBlogViewProps) {
  const [viewCount, setViewCount] = useState(0)

  useEffect(() => {
    // 실제 조회수 기록 및 조회
    const recordViewAndFetchCount = async () => {
      if (!blog?.id || !blog.is_public) return;
      try {
        // Insert a new view record
        await supabase.from("blog_views").insert({ autobiography_id: blog.id, viewer_ip: null });
        // Fetch the updated view count
        const { count } = await supabase
          .from("blog_views")
          .select("id", { count: "exact", head: true })
          .eq("autobiography_id", blog.id);
        setViewCount(count || 0);
      } catch (e) {
        setViewCount(0);
      }
    };
    recordViewAndFetchCount();
  }, [blog?.id, blog?.is_public]);

  // 배경 테마별 스타일 정의
  const themeStyles: Record<string, any> = {
    bling1: {
      gradient: "from-pink-100 via-yellow-50 to-purple-100",
      particles: ["#fffbe9", "#ffe6fa"],
    },
    bling2: {
      gradient: "from-blue-100 via-teal-50 to-purple-100",
      particles: ["#e0f7fa", "#e3e0ff"],
    },
    bling3: {
      gradient: "from-orange-100 via-yellow-50 to-pink-100",
      particles: ["#fff3e0", "#ffe0ef"],
    },
    bling4: {
      gradient: "from-violet-100 via-sky-50 to-white",
      particles: ["#f3e8ff", "#e0f7fa"],
    },
    bling5: {
      gradient: "from-green-100 via-yellow-50 to-sky-100",
      particles: ["#e0ffe0", "#e0f7fa"],
    },
  };
  const theme = themeStyles[blog.background_theme] || themeStyles.bling1;

  const completedSections =
    blog.sections?.filter((section) => section.answers?.some((answer) => answer && answer.trim())) || []

  return (
    <div className={cn("min-h-screen bg-gradient-to-br", theme.gradient)}>
      {/* 블링블링 배경 레이어 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 반짝임 애니메이션 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} animate-gradient-move`} style={{ opacity: 0.85 }} />
        {/* 입자 효과 */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.18 }}>
          <defs>
            <radialGradient id="bling1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.particles[0]} stopOpacity="0.9" />
              <stop offset="100%" stopColor={theme.particles[0]} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bling2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.particles[1]} stopOpacity="0.7" />
              <stop offset="100%" stopColor={theme.particles[1]} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="20%" cy="30%" r="120" fill="url(#bling1)">
            <animate attributeName="r" values="120;160;120" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="60%" r="90" fill="url(#bling2)">
            <animate attributeName="r" values="90;130;90" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="60%" cy="20%" r="60" fill="url(#bling1)">
            <animate attributeName="r" values="60;100;60" dur="5s" repeatCount="indefinite" />
          </circle>
        </svg>
        {/* 별빛 효과 */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/70 blur-[2px] animate-twinkle"
              style={{
                width: `${6 + Math.random() * 10}px`,
                height: `${6 + Math.random() * 10}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>
      </div>
      {/* 기존 내용: z-10 이상으로 올림 */}
      <div className="relative z-10">
        {/* 대표 이미지: 페이지 맨 상단, 이름 오버레이 */}
        {blog.generated_images && blog.generated_images.length > 0 && (
          <div className="relative w-full max-w-6xl mx-auto aspect-[4/1.5] md:aspect-[4/1.8] rounded-b-3xl overflow-hidden mb-[-32px] shadow-lg border border-amber-200 bg-white flex items-center justify-center">
            <img
              src={blog.generated_images[0]}
              alt="대표 이미지"
              className="object-cover w-full h-full"
              style={{ minHeight: 180, maxHeight: 340 }}
            />
            {/* 이름 오버레이 */}
            <div className="absolute left-0 bottom-0 w-full flex items-end p-4 md:p-6 bg-gradient-to-t from-black/40 via-black/10 to-transparent">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white shadow">
                  <AvatarImage src={blog.users?.avatar_url || "/placeholder.svg"} alt={blog.users?.name} />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-white text-lg md:text-xl font-bold drop-shadow-lg">{blog.users?.name || "익명"}</span>
              </div>
            </div>
          </div>
        )}
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4 md:gap-0">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={blog.users?.avatar_url || "/placeholder.svg"} alt={blog.users?.name} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {blog.title}
                    </h1>
                    {blog.is_public && (
                      <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded shadow ml-1">공개</span>
                    )}
                  </div>
                  <p className="text-gray-600">{blog.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Eye className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-500">{viewCount}회 조회</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button
                  onClick={() => shareUrl(window.location.href)}
                  variant="outline"
                  className="border-amber-300 hover:bg-amber-50 bg-transparent"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  공유
                </Button>
                <Button
                  onClick={() => {}}
                  variant="outline"
                  className="border-amber-300 hover:bg-amber-50 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
              </div>
            </div>

            {/* 메타 정보 */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(blog.created_at).toLocaleDateString("ko-KR")}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {viewCount}회 조회
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {completedSections.length}개 섹션
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {completedSections.map((section, sectionIndex) => {
            let sectionImages: string[] = [];
            try {
              if (section.illustration) {
                const parsed = JSON.parse(section.illustration);
                if (Array.isArray(parsed)) sectionImages = parsed;
              }
            } catch {}

            return (
              <SectionCard
                key={section.id}
                icon={getSectionIcon(section.id)}
                title={section.title}
                className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-16"
                style={{
                  backgroundImage: `url(${getBackgroundImage(section.id)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="absolute inset-0 bg-white bg-opacity-90"></div>
                <div className="relative z-10">
                  <ImageGallery images={sectionImages.slice(0, 4)} maxImages={4} />
                  
                  <div className="p-8 md:p-12">
                    {section.questions?.map((question, qIndex) => (
                      <QuestionAnswer
                        key={qIndex}
                        question={question}
                        answer={expandAnswer(question, section.answers?.[qIndex], section.id)}
                        questionNumber={qIndex}
                      />
                    ))}
                </div>
              </div>

              {/* 구분선 */}
              {sectionIndex < completedSections.length - 1 && (
                <div className="flex items-center justify-center my-12">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                    <Heart className="w-5 h-5 text-amber-500" />
                    <div className="w-16 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  </div>
                </div>
              )}
              </SectionCard>
            );
          })}

          {/* 마무리 섹션 */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 text-center shadow-xl border border-amber-200">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-amber-800 mb-2">나의 이야기</h3>
              <p className="text-amber-700">
                모든 순간들이 모여 지금의 나를 만들었습니다. 과거의 경험들이 미래를 향한 소중한 밑거름이 되어, 더욱
                아름다운 내일을 그려나가겠습니다.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {completedSections.map((section) => (
                <Badge key={section.id} className="bg-amber-200 text-amber-800 border-amber-300">
                  {section.title}
                </Badge>
              ))}
            </div>

            <div className="text-sm text-amber-600">
              <p>✨ AI 자서전 생성기로 만든 나만의 특별한 이야기 ✨</p>
              <p className="mt-1">{new Date(blog.created_at).toLocaleDateString("ko-KR")} 작성</p>
            </div>
          </div>

          {/* 작성자 정보 */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
              <Avatar className="w-8 h-8">
                <AvatarImage src={blog.users?.avatar_url || "/placeholder.svg"} alt={blog.users?.name} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-700">작성자: {blog.users?.name || "익명"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
