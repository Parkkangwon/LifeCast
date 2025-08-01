"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Download, Share2, Quote, BookOpen, Star } from "lucide-react"
import { expandAnswer, getSectionIcon, getBackgroundImage } from "@/lib/autobiography-utils";
import type { StorySection, Blog } from "@/types/blog";

interface AutobiographyDisplayProps {
  sections: StorySection[];
  images: string[];
  onBack: () => void;
  imageStyle?: string;
}

export default function AutobiographyDisplay({ sections, images, onBack, imageStyle }: AutobiographyDisplayProps) {
  // 완료된 섹션만 필터링
  const completedSections = sections.filter((section) => section.answers.some((answer) => answer && answer.trim()))

  // PDF 다운로드 함수
  const downloadPDF = () => {
    // 실제 구현에서는 jsPDF나 다른 PDF 라이브러리 사용
    const printContent = document.getElementById("autobiography-content")
    if (printContent) {
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-amber-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              나의 인생 이야기
            </h1>
            <p className="text-gray-600 mt-1">AI가 들려주는 특별한 자서전</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onBack} variant="outline" className="border-amber-300 hover:bg-amber-50 bg-white shadow-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <Button
              onClick={downloadPDF}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF 다운로드
            </Button>
          </div>
        </div>
      </div>

      <div id="autobiography-content" className="max-w-4xl mx-auto px-4 py-8">
        {/* 서문 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16 border border-amber-200">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-amber-800 mb-4">나의 이야기</h1>
            <p className="text-lg text-amber-600">인생의 여정을 되돌아보며</p>
          </div>

          <div className="prose prose-lg mx-auto text-gray-700 leading-relaxed">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border-l-4 border-amber-400">
              <Quote className="w-8 h-8 text-amber-400 mb-4" />
              <p className="text-lg italic">
                인생은 수많은 순간들로 이루어진 아름다운 이야기입니다. 어린 시절의 순수한 꿈부터 현재의 성숙한 모습까지,
                그리고 미래를 향한 희망까지... 이 모든 것들이 모여 지금의 나를 만들어냈습니다.
              </p>
              <p className="mt-4">
                이 자서전은 단순한 기록이 아닌, 내 삶의 의미를 찾아가는 여정입니다. 과거를 통해 배우고, 현재를 감사하며,
                미래를 꿈꾸는 한 사람의 진솔한 이야기를 담았습니다.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-amber-600 font-medium">{new Date().toLocaleDateString("ko-KR")} 작성</p>
          </div>
        </div>

        {/* 각 시절별 스토리 */}
        {completedSections.map((section, sectionIndex) => (
          <article key={section.id} className="mb-16">
            {/* 섹션 헤더 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-amber-200">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white">
                  {getSectionIcon(section.id)}
                </div>
                <h2 className="text-2xl font-bold text-amber-800">{section.title}</h2>
              </div>
            </div>

            {/* 배경 이미지와 함께 스토리+이미지 번갈아 출력 */}
            <div
              className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
              style={{
                backgroundImage: `url(${getBackgroundImage(section.id)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-white bg-opacity-90"></div>
              <div className="relative z-10 p-8 md:p-12">
                {section.questions.map((question, qIndex) => {
                  const answer = section.answers[qIndex]
                  if (!answer || !answer.trim()) return null
                  // 섹션별 이미지(illustration)는 JSON string으로 저장됨
                  let sectionImages: string[] = [];
                  if (section.illustration) {
                    try { sectionImages = JSON.parse(section.illustration) } catch {}
                  }
                  const imageUrl = sectionImages[qIndex] || null;
                  return (
                    <div key={qIndex} className="mb-12 last:mb-0">
                      <div className="mb-4">
                        <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
                          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {qIndex + 1}
                          </div>
                          <h3 className="font-semibold text-amber-800">{question}</h3>
                        </div>
                      </div>
                      <div className="bg-white bg-opacity-80 rounded-lg p-6 shadow-sm border border-amber-200 mb-4">
                        <div className="relative">
                          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-amber-300" />
                          <p className="text-gray-700 leading-relaxed text-lg italic pl-6">
                            {expandAnswer(question, answer, section.id)}
                          </p>
                        </div>
                      </div>
                      {imageUrl && (
                        <div className="flex justify-center mb-2">
                          <img
                            src={
                              images[sectionIndex] ||
                                `/placeholder.svg?height=200&width=200&text=${encodeURIComponent((imageStyle || "Manga") + ' ' + (section.title || "Memory") + ' ' + (sectionIndex + 1))}`
                            }
                            alt={`${section.title} ${imageStyle || "Manga"} panel ${sectionIndex + 1}`}
                            className="w-full h-full object-cover"
                            style={{ aspectRatio: "1 / 1", minHeight: 0, minWidth: 0 }}
                          />
                        </div>
                      )}
                      {/* 이미지 아래에는 아무 내용도 출력하지 않음 */}
                    </div>
                  )
                })}
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
          </article>
        ))}

        {/* 마무리 섹션 */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 text-center shadow-xl border border-amber-200">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-amber-800 mb-4">에pilogue</h3>
            <div className="prose prose-lg mx-auto text-amber-700">
              <p className="mb-4">
                이렇게 나의 이야기를 되돌아보니, 모든 순간이 소중했음을 깨닫습니다. 기쁨과 슬픔, 성공과 실패, 만남과
                이별... 이 모든 경험들이 모여 지금의 나를 만들어냈습니다.
              </p>
              <p className="mb-4">
                과거의 경험들은 현재를 이해하는 열쇠가 되었고, 현재의 깨달음은 미래를 향한 나침반이 되어줍니다. 앞으로도
                이 여정은 계속될 것이고, 새로운 이야기들이 계속 써져나갈 것입니다.
              </p>
              <p>
                이 자서전을 읽는 모든 분들도 각자의 아름다운 이야기를 가지고 계실 것입니다. 우리 모두의 이야기가
                서로에게 위로와 희망이 되기를 바랍니다.
              </p>
            </div>
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
            <p className="mt-1">{new Date().toLocaleDateString("ko-KR")} 완성</p>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex justify-center gap-4 mt-8 print:hidden">
          <Button
            onClick={downloadPDF}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF 다운로드
          </Button>
          <Button variant="outline" className="border-amber-300 hover:bg-amber-50 bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            공유하기
          </Button>
        </div>
      </div>
    </div>
  )
}
