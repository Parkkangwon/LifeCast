"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { BookOpen, Globe, Lock, Eye, Calendar, ExternalLink, Trash2, Plus, X, Edit3, Download, FileText } from "lucide-react"
import AutobiographyFlipBook from "./AutobiographyFlipBook";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MyBlogsProps {
  user: any
  onCreateNew: () => void
  anonymousName?: string // 추가: 익명 사용자 이름
  onEditBlog?: (blog: any) => void // 편집 기능 추가
}

export default function MyBlogs({ user, onCreateNew, anonymousName, onEditBlog }: MyBlogsProps) {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBlog, setSelectedBlog] = useState<any>(null)
  const [showBlogModal, setShowBlogModal] = useState(false)
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (user || anonymousName) {
      fetchMyBlogs()
    }
  }, [user, anonymousName])

  const fetchMyBlogs = async () => {
    try {
      let data, error;
      if (user) {
        ({ data, error } = await supabase
          .from("autobiographies")
          .select(`*, blog_views(count)`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        );
      } else if (anonymousName) {
        ({ data, error } = await supabase
          .from("autobiographies")
          .select(`*, blog_views(count)`)
          .eq("author_name", anonymousName)
          .order("created_at", { ascending: false })
        );
      } else {
        setBlogs([]);
        setLoading(false);
        return;
      }

      if (error) {
        console.error("블로그 목록 조회 오류:", error)
        setBlogs([])
        return
      }
      setBlogs(data || [])
    } catch (error) {
      console.error("블로그 목록 조회 오류:", error)
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  const deleteBlog = async (blogId: string) => {
    if (!confirm("정말로 이 블로그를 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase.from("autobiographies").delete().eq("id", blogId)

      if (error) {
        console.error("블로그 삭제 오류:", error)
        alert("블로그 삭제에 실패했습니다.")
        return
      }

      setBlogs(blogs.filter((blog) => blog.id !== blogId))
      alert("블로그가 삭제되었습니다.")
    } catch (error) {
      console.error("블로그 삭제 오류:", error)
      alert("블로그 삭제에 실패했습니다.")
    }
  }

  const togglePublic = async (blogId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("autobiographies").update({ is_public: !currentStatus }).eq("id", blogId)

      if (error) {
        console.error("공개 설정 변경 오류:", error)
        alert("설정 변경에 실패했습니다.")
        return
      }

      setBlogs(blogs.map((blog) => (blog.id === blogId ? { ...blog, is_public: !currentStatus } : blog)))
    } catch (error) {
      console.error("공개 설정 변경 오류:", error)
      alert("설정 변경에 실패했습니다.")
    }
  }

  // PDF 다운로드 함수
  const downloadPDF = async (blog: any) => {
    try {
      // 임시 DOM 생성하여 이미지와 텍스트를 함께 렌더링
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '1200px';
      tempDiv.style.background = '#fff8dc';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.padding = '40px';
      tempDiv.style.boxSizing = 'border-box';

      // 제목 페이지
      const titlePage = document.createElement('div');
      titlePage.style.width = '100%';
      titlePage.style.height = '800px';
      titlePage.style.background = 'linear-gradient(135deg, #fff8dc 0%, #f5e6b3 100%)';
      titlePage.style.display = 'flex';
      titlePage.style.flexDirection = 'column';
      titlePage.style.justifyContent = 'center';
      titlePage.style.alignItems = 'center';
      titlePage.style.borderRadius = '20px';
      titlePage.style.marginBottom = '40px';
      titlePage.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';

      const title = document.createElement('h1');
      title.innerText = blog.title || '나의 자서전';
      title.style.fontSize = '48px';
      title.style.fontWeight = 'bold';
      title.style.color = '#8b4513';
      title.style.marginBottom = '20px';
      title.style.textAlign = 'center';

      const subtitle = document.createElement('h2');
      subtitle.innerText = 'AI와 함께 써내려간 인생의 순간들';
      subtitle.style.fontSize = '24px';
      subtitle.style.color = '#a0522d';
      subtitle.style.marginBottom = '40px';
      subtitle.style.textAlign = 'center';

      const date = document.createElement('p');
      date.innerText = new Date(blog.created_at).toLocaleDateString('ko-KR');
      date.style.fontSize = '18px';
      date.style.color = '#808080';
      date.style.textAlign = 'center';

      titlePage.appendChild(title);
      titlePage.appendChild(subtitle);
      titlePage.appendChild(date);
      tempDiv.appendChild(titlePage);

      // 각 섹션별 페이지 생성
      const completedSections = (blog.sections || []).filter((section: any) => 
        section.answers?.some((answer: string) => answer && answer.trim())
      );

      completedSections.forEach((section: any, index: number) => {
        const sectionPage = document.createElement('div');
        sectionPage.style.width = '100%';
        sectionPage.style.height = '800px';
        sectionPage.style.background = 'linear-gradient(135deg, #fff8dc 0%, #f5e6b3 100%)';
        sectionPage.style.borderRadius = '20px';
        sectionPage.style.marginBottom = '40px';
        sectionPage.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        sectionPage.style.padding = '40px';
        sectionPage.style.boxSizing = 'border-box';
        sectionPage.style.display = 'flex';
        sectionPage.style.flexDirection = 'column';

        // 섹션 헤더
        const header = document.createElement('div');
        header.style.marginBottom = '30px';

        const sectionTitle = document.createElement('h2');
        sectionTitle.innerText = section.title;
        sectionTitle.style.fontSize = '36px';
        sectionTitle.style.fontWeight = 'bold';
        sectionTitle.style.color = '#8b4513';
        sectionTitle.style.marginBottom = '10px';

        const sectionSubtitle = document.createElement('h3');
        sectionSubtitle.innerText = '추억의 순간들';
        sectionSubtitle.style.fontSize = '20px';
        sectionSubtitle.style.color = '#a0522d';
        sectionSubtitle.style.marginBottom = '20px';

        header.appendChild(sectionTitle);
        header.appendChild(sectionSubtitle);

        // 메인 콘텐츠 영역
        const content = document.createElement('div');
        content.style.display = 'flex';
        content.style.gap = '30px';
        content.style.flex = '1';

        // 왼쪽: 4컷 이미지
        const imageSection = document.createElement('div');
        imageSection.style.width = '45%';
        imageSection.style.background = 'white';
        imageSection.style.borderRadius = '15px';
        imageSection.style.padding = '20px';
        imageSection.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        imageSection.style.border = '2px solid #ffd700';

        const imageGrid = document.createElement('div');
        imageGrid.style.display = 'grid';
        imageGrid.style.gridTemplateColumns = '1fr 1fr';
        imageGrid.style.gridTemplateRows = '1fr 1fr';
        imageGrid.style.gap = '10px';
        imageGrid.style.height = '300px';

        // 4컷 이미지 배치
        let sectionImages: string[] = [];
        if (section.illustration) {
          try {
            sectionImages = JSON.parse(section.illustration);
          } catch {
            sectionImages = [];
          }
        }

        for (let i = 0; i < 4; i++) {
          const imageContainer = document.createElement('div');
          imageContainer.style.position = 'relative';
          imageContainer.style.borderRadius = '10px';
          imageContainer.style.overflow = 'hidden';
          imageContainer.style.border = '2px solid #ffd700';
          imageContainer.style.background = '#f0f0f0';

          // 이미지 번호
          const numberBadge = document.createElement('div');
          numberBadge.innerText = (i + 1).toString();
          numberBadge.style.position = 'absolute';
          numberBadge.style.top = '5px';
          numberBadge.style.left = '5px';
          numberBadge.style.width = '25px';
          numberBadge.style.height = '25px';
          numberBadge.style.background = '#ffd700';
          numberBadge.style.color = '#8b4513';
          numberBadge.style.borderRadius = '50%';
          numberBadge.style.display = 'flex';
          numberBadge.style.alignItems = 'center';
          numberBadge.style.justifyContent = 'center';
          numberBadge.style.fontWeight = 'bold';
          numberBadge.style.fontSize = '12px';
          numberBadge.style.zIndex = '2';

          if (sectionImages[i]) {
            const img = document.createElement('img');
            img.src = sectionImages[i];
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.display = 'block';
            imageContainer.appendChild(img);
          } else {
            const placeholder = document.createElement('div');
            placeholder.style.width = '100%';
            placeholder.style.height = '100%';
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.color = '#808080';
            placeholder.style.fontSize = '14px';
            placeholder.innerText = '이미지';
            imageContainer.appendChild(placeholder);
          }

          imageContainer.appendChild(numberBadge);
          imageGrid.appendChild(imageContainer);
        }

        imageSection.appendChild(imageGrid);

        // 오른쪽: 자서전 텍스트
        const textSection = document.createElement('div');
        textSection.style.width = '55%';
        textSection.style.background = 'white';
        textSection.style.borderRadius = '15px';
        textSection.style.padding = '25px';
        textSection.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        textSection.style.border = '2px solid #ffd700';
        textSection.style.overflow = 'auto';

        let autobiographyText = '';
        if (section.editedAutobiography) {
          autobiographyText = section.editedAutobiography;
        } else {
          // 질문-답변을 자서전 형태로 변환
          const answers = section.answers?.filter((a: string) => a && a.trim()) || [];
          const questions = section.questions?.slice(0, answers.length) || [];
          
          autobiographyText = answers.map((answer: string, idx: number) => {
            const question = questions[idx] || '';
            return `${question} ${answer}`;
          }).join(' ');
        }

        const textContent = document.createElement('div');
        textContent.innerText = autobiographyText;
        textContent.style.fontSize = '16px';
        textContent.style.lineHeight = '1.6';
        textContent.style.color = '#404040';
        textContent.style.whiteSpace = 'pre-wrap';

        textSection.appendChild(textContent);

        content.appendChild(imageSection);
        content.appendChild(textSection);

        // 페이지 번호
        const pageNumber = document.createElement('div');
        pageNumber.style.textAlign = 'center';
        pageNumber.style.marginTop = '20px';
        pageNumber.style.fontSize = '14px';
        pageNumber.style.color = '#808080';
        pageNumber.innerText = `페이지 ${index + 2}/${completedSections.length + 1}`;

        sectionPage.appendChild(header);
        sectionPage.appendChild(content);
        sectionPage.appendChild(pageNumber);
        tempDiv.appendChild(sectionPage);
      });

      // 마지막 페이지 (감사의 말)
      const endPage = document.createElement('div');
      endPage.style.width = '100%';
      endPage.style.height = '800px';
      endPage.style.background = 'linear-gradient(135deg, #fff8dc 0%, #f5e6b3 100%)';
      endPage.style.borderRadius = '20px';
      endPage.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
      endPage.style.display = 'flex';
      endPage.style.flexDirection = 'column';
      endPage.style.justifyContent = 'center';
      endPage.style.alignItems = 'center';
      endPage.style.padding = '40px';
      endPage.style.boxSizing = 'border-box';

      const endTitle = document.createElement('h2');
      endTitle.innerText = '감사의 말';
      endTitle.style.fontSize = '36px';
      endTitle.style.fontWeight = 'bold';
      endTitle.style.color = '#8b4513';
      endTitle.style.marginBottom = '30px';
      endTitle.style.textAlign = 'center';

      const endText = document.createElement('p');
      endText.innerText = '이 자서전을 통해 나의 인생 여정을 돌아보며, 모든 순간이 소중했음을 깨달았습니다. 앞으로도 더욱 풍요로운 삶을 살아가겠습니다.';
      endText.style.fontSize = '20px';
      endText.style.color = '#404040';
      endText.style.textAlign = 'center';
      endText.style.lineHeight = '1.6';
      endText.style.maxWidth = '600px';

      endPage.appendChild(endTitle);
      endPage.appendChild(endText);
      tempDiv.appendChild(endPage);

      document.body.appendChild(tempDiv);

      // 캡처 및 PDF 변환
      const canvas = await html2canvas(tempDiv, { 
        useCORS: true, 
        background: '#fff8dc',
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 이미지를 여러 페이지로 분할
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pagesNeeded = Math.ceil(imgHeight / (pageHeight - 20));
      
      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) pdf.addPage();
        
        const sourceY = i * (canvas.height / pagesNeeded);
        const sourceHeight = canvas.height / pagesNeeded;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const pageImgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, (sourceHeight * imgWidth) / canvas.width);
        }
      }

      pdf.save(`${blog.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_자서전.pdf`);
      document.body.removeChild(tempDiv);
      alert('자서전이 PDF 파일로 다운로드되었습니다.');
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      alert('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">내 블로그</h1>
          <p className="text-gray-600 mt-1">작성한 자서전 블로그를 관리하세요</p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />새 자서전 작성
        </Button>
      </div>

      {/* 블로그 목록 */}
      {blogs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">아직 작성한 블로그가 없습니다</h3>
            <p className="text-gray-500 mb-6">첫 번째 자서전을 작성해보세요!</p>
            <Button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              자서전 작성 시작하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} className="border-2 border-gray-200 hover:border-pink-300 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{blog.title}</CardTitle>
                      <Badge variant={blog.is_public ? "default" : "secondary"}>
                        {blog.is_public ? (
                          <>
                            <Globe className="w-3 h-3 mr-1" />
                            공개
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            비공개
                          </>
                        )}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">{blog.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 통계 */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(blog.created_at).toLocaleDateString("ko-KR")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {blog.blog_views?.[0]?.count || 0}회 조회
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {blog.sections?.filter((s: any) => s.answers?.some((a: string) => a && a.trim())).length || 0}개
                      섹션
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={() => {
                        setSelectedBlog(blog)
                        setShowBlogModal(true)
                      }}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      보기
                    </Button>
                    {onEditBlog && (
                      <Button
                        onClick={() => onEditBlog(blog)}
                        size="sm"
                        variant="outline"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        편집
                      </Button>
                    )}
                    <Button
                      onClick={() => downloadPDF(blog)}
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      다운로드
                    </Button>
                    <Button
                      onClick={() => togglePublic(blog.id, blog.is_public)}
                      size="sm"
                      variant="outline"
                      className={
                        blog.is_public
                          ? "border-orange-300 text-orange-700 hover:bg-orange-50"
                          : "border-green-300 text-green-700 hover:bg-green-50"
                      }
                    >
                      {blog.is_public ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          비공개로
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 mr-1" />
                          공개하기
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => deleteBlog(blog.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      삭제
                    </Button>
                  </div>

                  {/* 블로그 URL */}
                  {blog.is_public && origin && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">공개 URL:</div>
                      <code className="text-sm text-blue-600">
                        {origin}/blog/{blog.slug}
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 블로그 보기 모달 */}
      {showBlogModal && selectedBlog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedBlog.title}</h2>
                <p className="text-gray-600 mt-1">{selectedBlog.description}</p>
              </div>
              <Button
                onClick={() => {
                  setShowBlogModal(false)
                  setSelectedBlog(null)
                }}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 flex items-center justify-center p-0 bg-gradient-to-br from-[#fdf6e3] to-[#f5e1c0]">
              <AutobiographyFlipBook sections={selectedBlog.sections} />
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                작성일: {new Date(selectedBlog.created_at).toLocaleDateString("ko-KR")}
              </div>
              <div className="flex gap-2">
                {onEditBlog && (
                  <Button
                    onClick={() => {
                      onEditBlog(selectedBlog)
                      setShowBlogModal(false)
                      setSelectedBlog(null)
                    }}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    편집
                  </Button>
                )}
                <Button
                  onClick={() => downloadPDF(selectedBlog)}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
                <Button
                  onClick={() => window.open(`/blog/${selectedBlog.slug}`, "_blank")}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  새 탭에서 보기
                </Button>
                <Button
                  onClick={() => {
                    setShowBlogModal(false)
                    setSelectedBlog(null)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
