"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/UserContext";
import { Settings, Globe, Lock, Save, Copy, ExternalLink } from "lucide-react"
import { copyToClipboard } from "@/lib/utils";

interface BlogSettingsProps {
  sections: any[];
  images: string[];
  onSave: (blogData: any) => void;
}

export default function BlogSettings({ sections, images, onSave }: BlogSettingsProps) {
  const user = useUser() as any;
  const [title, setTitle] = useState("나의 이야기")
  const [description, setDescription] = useState("AI와 함께 써내려간 인생의 순간들")
  const [slug, setSlug] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedBlog, setSavedBlog] = useState<any>(null)
  // 이름, 비밀번호, 공개/비공개 상태 추가
  // 이름 입력란: localStorage의 userName을 기본값으로 사용, 없으면 user?.name
  const [authorName, setAuthorName] = useState("");
  const [password, setPassword] = useState("")
  const [isPublic, setIsPublic] = useState(true) // 기본값 공개
  const [passwordError, setPasswordError] = useState("")
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    // 메인페이지에서 입력한 이름을 기본값으로 (user가 바뀌지 않아도 항상 적용)
    const storedName = typeof window !== "undefined" ? localStorage.getItem("userName") : "";
    setAuthorName(storedName || user?.name || "");
  }, []);

  const generateSlug = (title: string) => {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now().toString(36)
    )
  }

  const backgroundThemes = [
    "bling1", // 분홍-노랑-보라
    "bling2", // 파랑-민트-보라
    "bling3", // 오렌지-노랑-핑크
    "bling4", // 연보라-하늘-흰색
    "bling5", // 초록-노랑-하늘
  ];

  const saveBlog = async () => {
    setSaveError("");
    if (!authorName.trim()) {
      setSaveError("이름을 입력해주세요.");
      return;
    }
    if (!/^[0-9]{4}$/.test(password)) {
      setPasswordError("비밀번호는 4자리 숫자여야 합니다.");
      return;
    } else {
      setPasswordError("");
    }
    if (!user) {
      setSaveError("로그인이 필요합니다.");
      return;
    }
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      setSaveError("Supabase가 설정되지 않았습니다. 데모 모드에서는 블로그를 저장할 수 없습니다.");
      return;
    }
    setSaving(true)
    try {
      // 1. 기존 블로그가 있는지 author_name+password로 조회
      const { data: existing, error: findError } = await supabase
        .from("autobiographies")
        .select("*")
        .eq("author_name", authorName)
        .eq("password", password)
        .single();
      if (existing && !findError) {
        setSavedBlog(existing);
        onSave(existing);
        setSaveError("동일한 이름과 비밀번호의 블로그가 이미 존재합니다. 기존 블로그를 불러왔습니다.");
        setSaving(false);
        return;
      }
      // 2. 없으면 새로 저장
      const blogSlug = slug || generateSlug(title)
      const randomTheme = backgroundThemes[Math.floor(Math.random() * backgroundThemes.length)]
      const { data, error } = await supabase
        .from("autobiographies")
        .insert({
          user_id: user?.id,
          author_name: authorName,
          password,
          title,
          description,
          is_public: isPublic,
          slug: blogSlug,
          sections,
          generated_images: images,
          background_theme: randomTheme,
        })
        .select()
        .single()
      if (error && (typeof error === "object" ? Object.keys(error).length > 0 : true)) {
        // error가 null이 아니고, 객체라면 키가 1개 이상
        console.error("블로그 저장 오류:", error);
        setSaveError(error.message || "블로그 저장에 실패했습니다. 다시 시도해주세요.");
        return;
      }
      setSavedBlog(data)
      onSave(data)
    } catch (error: any) {
      console.error("블로그 저장 오류:", error)
      setSaveError(error.message || "블로그 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false)
    }
  }

  const copyBlogUrl = async () => {
    if (savedBlog) {
      const url = `${window.location.origin}/blog/${savedBlog.slug}`
      const success = await copyToClipboard(url);
      if (success) {
        alert("블로그 URL이 복사되었습니다!");
      } else {
        alert("클립보드 복사에 실패했습니다.");
      }
    }
  }

  const openBlog = () => {
    if (savedBlog) {
      const url = `${window.location.origin}/blog/${savedBlog.slug}`
      window.open(url, "_blank")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!user && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center mb-4">
          블로그를 저장하려면 먼저 로그인해주세요.
        </div>
      )}
      <Card className="border-2 border-pink-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-pink-600" />
            <CardTitle>블로그 게시</CardTitle>
          </div>
          <CardDescription>나만의 자서전 블로그를 게시판에 올려보세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="authorName">이름</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          {/* 비밀번호 입력 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 (4자리 숫자)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => {
                // 숫자만 허용, 4자리 제한
                const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4)
                setPassword(val)
              }}
              maxLength={4}
              placeholder="4자리 숫자"
              className="border-pink-200 focus:border-pink-400"
            />
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
          </div>
          {/* 공개/비공개 라디오 */}
          <div className="flex items-center gap-6">
            <Label className="flex items-center gap-2">
              <input
                type="radio"
                name="public"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
              />
              공개
            </Label>
            <Label className="flex items-center gap-2">
              <input
                type="radio"
                name="public"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
              />
              비공개
            </Label>
          </div>

          {/* 블로그 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">블로그 제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="나의 이야기"
              className="border-pink-200 focus:border-pink-400"
            />
          </div>

          {/* 블로그 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">블로그 설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="AI와 함께 써내려간 인생의 순간들"
              className="border-pink-200 focus:border-pink-400"
              rows={3}
            />
          </div>

          {/* 커스텀 URL */}
          <div className="space-y-2">
            <Label htmlFor="slug">커스텀 URL (선택사항)</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /blog/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-story-2024"
                className="rounded-l-none border-pink-200 focus:border-pink-400"
              />
            </div>
            <p className="text-xs text-gray-500">비워두면 자동으로 생성됩니다</p>
          </div>

          {/* 저장 버튼 */}
          <Button
            onClick={saveBlog}
            disabled={saving || !title.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "게시 중..." : "블로그 게시하기"}
          </Button>
          {saveError && (
            <div className="mt-2 text-sm text-red-600 text-center">{saveError}</div>
          )}

          {/* 저장된 블로그 정보 */}
          {savedBlog && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ 블로그가 저장되었습니다!</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-700">블로그 URL:</span>
                  <code className="text-xs bg-white px-2 py-1 rounded border">/blog/{savedBlog.slug}</code>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyBlogUrl()}
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    URL 복사
                  </Button>
                  <Button
                    onClick={openBlog}
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    블로그 보기
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 통계 정보 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {sections.filter((s) => s.answers.some((a: string) => a && a.trim())).length}
              </div>
              <div className="text-xs text-gray-600">완성된 섹션</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sections.reduce((sum, s) => sum + s.answers.filter((a: string) => a && a.trim()).length, 0)}
              </div>
              <div className="text-xs text-gray-600">작성된 답변</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{images.length}</div>
              <div className="text-xs text-gray-600">생성된 이미지</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
