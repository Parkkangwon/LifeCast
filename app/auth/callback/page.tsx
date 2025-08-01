"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if Supabase is configured
        if (
          process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co" ||
          !process.env.NEXT_PUBLIC_SUPABASE_URL
        ) {
          router.push("/")
          return
        }

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/?error=auth_failed")
          return
        }

        if (data.session) {
          // Successfully authenticated
          router.push("/")
        } else {
          // No session found
          router.push("/?error=no_session")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        router.push("/?error=callback_failed")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  )
}
