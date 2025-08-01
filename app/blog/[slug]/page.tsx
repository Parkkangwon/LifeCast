import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PublicBlogView from "@/components/blog/public-blog-view"

interface BlogPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  try {
    // Check if Supabase is configured
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      notFound()
    }

    const { data: blog, error } = await supabase
      .from("autobiographies")
      .select(`
        *,
        users(name, avatar_url)
      `)
      .eq("slug", await params.slug)
      .eq("is_public", true)
      .single()

    if (error || !blog) {
      notFound()
    }

    // Record view
    await supabase.from("blog_views").insert({
      autobiography_id: blog.id,
    })

    return <PublicBlogView blog={blog} />
  } catch (error) {
    console.error("블로그 조회 오류:", error)
    notFound()
  }
}

export async function generateMetadata({ params }: BlogPageProps) {
  try {
    const { data: blog } = await supabase
      .from("autobiographies")
      .select("title, description")
      .eq("slug", await params.slug)
      .eq("is_public", true)
      .single()

    if (!blog) {
      return {
        title: "블로그를 찾을 수 없습니다",
      }
    }

    return {
      title: blog.title,
      description: blog.description,
    }
  } catch (error) {
    return {
      title: "AI 자서전 블로그",
    }
  }
}
