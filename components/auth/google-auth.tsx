"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { User, LogOut, BookOpen } from "lucide-react"

interface GoogleUser {
  id: string
  email: string
  name: string
  avatar_url?: string
}

interface GoogleAuthProps {
  onAuthChange: (user: GoogleUser | null) => void
}

export default function GoogleAuth({ onAuthChange }: GoogleAuthProps) {
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    checkUser()

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === "SIGNED_IN" && session?.user) {
        await handleUserSignIn(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        onAuthChange(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        await handleUserSignIn(session.user)
      }
    } catch (error) {
      console.error("사용자 확인 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSignIn = async (authUser: any) => {
    try {
      // 기본 사용자 정보 설정
      const userData: GoogleUser = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email,
        avatar_url: authUser.user_metadata?.avatar_url,
      }

      // Supabase가 제대로 설정되었는지 확인
      if (supabase && supabase.from) {
        try {
          // 사용자 정보를 데이터베이스에 저장/업데이트
          const { data, error } = await supabase
            .from("users")
            .upsert({
              google_id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.full_name || authUser.email,
              avatar_url: authUser.user_metadata?.avatar_url,
            })
            .select()
            .single()

          if (!error && data) {
            // 데이터베이스에서 가져온 정보로 업데이트
            userData.id = data.id
            userData.name = data.name
            userData.avatar_url = data.avatar_url
          } else {
            console.error("사용자 정보 저장 오류:", error)
          }
        } catch (dbError) {
          console.error("데이터베이스 오류:", dbError)
        }
      }

      setUser(userData)
      onAuthChange(userData)
    } catch (error) {
      console.error("사용자 정보 처리 오류:", error)
      // 에러가 발생해도 기본 사용자 정보는 설정
      const userData: GoogleUser = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email,
        avatar_url: authUser.user_metadata?.avatar_url,
      }
      setUser(userData)
      onAuthChange(userData)
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Supabase가 제대로 설정되었는지 확인
      if (!supabase || !supabase.auth) {
        alert("Supabase가 설정되지 않았습니다. 환경 변수를 확인해주세요.")
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error("OAuth 오류:", error)
        throw error
      }
    } catch (error) {
      console.error("구글 로그인 오류:", error)
      alert("로그인에 실패했습니다. 다시 시도해주세요.")
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error("로그아웃 오류:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (user) {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-pink-200">
        <CardHeader className="text-center">
          <Avatar className="w-16 h-16 mx-auto mb-4">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl text-gray-800">환영합니다!</CardTitle>
          <CardDescription>{user.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">{user.email}</div>
          <Button
            onClick={signOut}
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-pink-200 shadow-xl">
      <CardHeader className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          AI 자서전 생성기
        </CardTitle>
        <CardDescription>구글 계정으로 로그인하여 나만의 자서전을 만들어보세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={signInWithGoogle}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          구글로 로그인
        </Button>
      </CardContent>
    </Card>
  )
}
