"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BlogBoardPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      // blog_views count 포함해서 조회
      const { data, error } = await supabase
        .from("autobiographies")
        .select(`id, slug, title, author_name, created_at, generated_images, description, is_public, blog_views(count)`)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (error) {
        setBlogs([]);
      } else {
        setBlogs(data || []);
      }
    } catch (e) {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터
  const filteredBlogs = blogs.filter((blog) =>
    blog.author_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">공개 자서전 게시판</h1>
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="이름으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">불러오는 중...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center text-gray-500">공개된 자서전이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden border border-pink-100"
              >
                <div className="aspect-w-4 aspect-h-3 bg-gray-100 relative">
                  {blog.generated_images && blog.generated_images.length > 0 ? (
                    <img
                      src={blog.generated_images[0]}
                      alt="대표 이미지"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">이미지 없음</div>
                  )}
                  {/* 공개 뱃지 */}
                  {blog.is_public && (
                    <span className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded shadow">공개</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold text-lg truncate">{blog.title}</div>
                  <div className="text-sm text-gray-600 truncate">by {blog.author_name}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(blog.created_at).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500 mt-2 line-clamp-2">{blog.description}</div>
                  {/* 조회수 표시 */}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                    <span>{blog.blog_views?.[0]?.count || 0}회</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 