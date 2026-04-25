'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/useToast';
import { apiFetch } from '@/lib/client-api';

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
  updatedAt: string;
  author: Author;
  likeCount: number;
  liked: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = use(params);
  const router = useRouter();

  const { confirm: confirmDialog, dialog: confirmDialogEl } = useConfirm();
  const { toast, toastEl } = useToast();

  const [villaId, setVillaId] = useState('');
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string }; id?: string; role?: string };
    setVillaId(user.villa?.id ?? '');
    setUserId(user.id ?? '');
    setUserRole(user.role ?? '');
  }, []);

  useEffect(() => {
    if (!villaId || !postId) return;

    async function fetchPost() {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/api/villas/${villaId}/posts/${postId}`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json() as { post: Post; comments: Comment[] };
        setPost(data.post);
        setComments(data.comments);
      } catch {
        setError('게시글을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [villaId, postId]);

  async function handleCommentSubmit() {
    if (!commentText.trim() || commentSubmitting) return;
    setCommentSubmitting(true);
    setCommentError('');
    try {
      const res = await apiFetch(`/api/villas/${villaId}/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json() as { comment?: Comment; error?: string };
      if (!res.ok) throw new Error(data.error ?? '댓글 등록에 실패했습니다.');
      if (data.comment) setComments((prev) => [...prev, data.comment!]);
      setCommentText('');
    } catch (e) {
      setCommentError(e instanceof Error ? e.message : '댓글 등록에 실패했습니다.');
    } finally {
      setCommentSubmitting(false);
    }
  }

  const canDelete = post && (userRole === 'ADMIN' || post.author.id === userId);
  const canEdit = post && post.author.id === userId;
  const isEdited = post
    ? new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 5000
    : false;

  async function handleDelete() {
    if (!post || !villaId) return;
    const confirmed = await confirmDialog({ title: '게시글 삭제', description: '게시글을 삭제하시겠습니까?', confirmLabel: '삭제', variant: 'destructive' });
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? '삭제에 실패했습니다.');
      }
      router.back();
    } catch (e) {
      toast(e instanceof Error ? e.message : '삭제에 실패했습니다.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function handleLike() {
    if (!post || !villaId || liking) return;
    setLiking(true);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/posts/${postId}/like`, {
        method: 'POST',
      });
      const data = await res.json() as { liked?: boolean; likeCount?: number };
      if (res.ok && data.likeCount !== undefined) {
        setPost((prev) => prev ? { ...prev, liked: data.liked!, likeCount: data.likeCount! } : prev);
      }
    } finally {
      setLiking(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {confirmDialogEl}
      {toastEl}
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="뒤로가기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-1">
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/community/${postId}/edit`)}
            >
              수정
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              loading={deleting}
              onClick={handleDelete}
              className="text-error-500 hover:bg-red-50"
            >
              삭제
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="px-4 space-y-4 animate-pulse">
          <div className="h-6 w-3/4 bg-neutral-200 rounded" />
          <div className="h-4 w-1/3 bg-neutral-100 rounded" />
          <div className="h-40 bg-neutral-100 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-neutral-500">{error}</p>
        </div>
      ) : post ? (
        <div className="px-4 space-y-4">
          {/* 게시글 헤더 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {post.isNotice && (
                <Badge variant="warning">공지</Badge>
              )}
              {post.category === 'ISSUE' && !post.isNotice && (
                <Badge variant="warning">민원</Badge>
              )}
              <h2 className="text-lg font-bold text-neutral-900">{post.title}</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-neutral-500">
                {post.author.name} · {formatDate(post.createdAt)}
              </p>
              {isEdited && (
                <span className="text-xs text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
                  수정됨
                </span>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="첨부 이미지"
                className="mt-4 rounded-xl w-full object-cover"
              />
            )}
            {/* 좋아요 */}
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
              <button
                type="button"
                onClick={handleLike}
                disabled={liking}
                className={[
                  'flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors',
                  post.liked
                    ? 'bg-red-50 text-red-500'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
                ].join(' ')}
              >
                <svg className="w-4 h-4" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {post.likeCount}
              </button>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-semibold text-neutral-700 mb-3">
              댓글 {comments.length}
            </p>
            {comments.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">
                아직 댓글이 없습니다.
              </p>
            ) : (
              <div className="space-y-3 mb-4">
                {comments.map((c) => (
                  <div key={c.id} className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-neutral-700">{c.author.name}</span>
                      <span className="text-xs text-neutral-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-neutral-700">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 border-t border-neutral-100 pt-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요"
                rows={2}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-primary-400 transition-colors"
              />
              {commentError && (
                <p className="text-xs text-error-500 mt-1">{commentError}</p>
              )}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleCommentSubmit}
                  disabled={commentSubmitting}
                  className="text-sm font-semibold text-primary-600 disabled:opacity-50 min-h-[36px] px-3"
                >
                  {commentSubmitting ? '등록 중...' : '등록'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
