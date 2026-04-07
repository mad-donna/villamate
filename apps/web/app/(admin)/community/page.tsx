'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Author {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'NOTICE' | 'ISSUE';
  isNotice: boolean;
  imageUrl: string | null;
  createdAt: string;
  author: Author;
  commentCount: number;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminCommunityPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/villas/${villaId}/posts`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { posts: Post[] };
      setPosts(data.posts);
    } catch {
      setError('게시글을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useEffect(() => {
    if (villaId) fetchPosts();
  }, [villaId, fetchPosts]);

  const notices = posts.filter((p) => p.isNotice);
  const general = posts.filter((p) => !p.isNotice);

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900">커뮤니티</h1>
        <Button
          size="sm"
          onClick={() => router.push('/community/new')}
        >
          ✏️ 글쓰기
        </Button>
      </div>

      {loading ? (
        <div className="px-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-neutral-200 rounded mb-2" />
              <div className="h-3 w-full bg-neutral-100 rounded mb-1" />
              <div className="h-3 w-2/3 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-neutral-500">{error}</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={fetchPosts}>
            다시 시도
          </Button>
        </div>
      ) : (
        <div className="px-4">
          {/* 공지 섹션 */}
          {notices.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">공지사항</p>
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-neutral-100">
                {notices.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => router.push(`/community/${post.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left hover:bg-neutral-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <span className="text-warning-500 shrink-0">📌</span>
                    <span className="text-sm font-medium text-neutral-800 truncate flex-1">
                      {post.title}
                    </span>
                    <span className="text-xs text-neutral-400 shrink-0">{formatDate(post.createdAt)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 게시글 리스트 */}
          {general.length === 0 && notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg
                className="w-12 h-12 text-neutral-300 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <p className="text-neutral-500 font-medium">아직 게시글이 없습니다.</p>
              <p className="text-sm text-neutral-400 mt-1">첫 번째 글을 작성해보세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {general.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => router.push(`/community/${post.id}`)}
                  className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {post.category === 'ISSUE' && (
                      <Badge variant="warning">민원</Badge>
                    )}
                    <p className="text-sm font-semibold text-neutral-900 truncate">{post.title}</p>
                  </div>
                  <p className="line-clamp-2 text-sm text-neutral-500 mb-2">{post.content}</p>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{post.author.name} · {formatDate(post.createdAt)}</span>
                    <span>💬 {post.commentCount}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
