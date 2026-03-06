import { useEffect, useState, useRef, useCallback, type FormEvent } from 'react';
import DOMPurify from 'dompurify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CATEGORIES = ['하자관리', '관리비', '시설관리', '세입자관리', '건물운영', '유지보수', '법/제도'];

interface Guide {
  id: string;
  category: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

const emptyForm = { category: CATEGORIES[0], title: '', thumbnailUrl: '' };

// ── Toolbar Button ──────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

// ── Rich Text Editor ────────────────────────────────────────────────────────
function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[180px] focus:outline-none px-3 py-2',
      },
    },
  });

  // Sync external value changes (e.g. when switching from edit to create)
  const prevValue = useRef(value);
  useEffect(() => {
    if (editor && value !== prevValue.current && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    prevValue.current = value;
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="굵게">
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="기울임">
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="밑줄">
          <span className="underline">U</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="취소선">
          <span className="line-through">S</span>
        </ToolbarBtn>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="제목 2">
          H2
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="제목 3">
          H3
        </ToolbarBtn>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="글머리 기호">
          • 목록
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="번호 목록">
          1. 목록
        </ToolbarBtn>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="인용">
          ❝
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="서식 제거">
          ✕
        </ToolbarBtn>
      </div>
      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Guides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/guides`)
      .then((r) => setGuides(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setContent('');
    setError('');
    setShowForm(true);
  };

  const openEdit = (g: Guide) => {
    setEditingId(g.id);
    setForm({ category: g.category, title: g.title, thumbnailUrl: g.thumbnailUrl || '' });
    setContent(g.content);
    setError('');
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API_BASE_URL}/api/upload`, fd, { headers });
      setForm((f) => ({ ...f, thumbnailUrl: res.data.fileUrl }));
    } catch {
      setError('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleContentChange = useCallback((html: string) => setContent(html), []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (!form.title.trim() || !plainText) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        category: form.category,
        title: form.title,
        content,
        thumbnailUrl: form.thumbnailUrl || null,
      };
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/guides/${editingId}`, payload, { headers });
      } else {
        await axios.post(`${API_BASE_URL}/api/guides`, payload, { headers });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setContent('');
      load();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || '저장에 실패했습니다.');
      } else {
        setError('저장에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 가이드를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/guides/${id}`, { headers });
      load();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">매거진/가이드 관리</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 가이드 등록
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {editingId ? '가이드 수정' : '새 가이드 작성'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="가이드 제목을 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
              <RichEditor value={content} onChange={handleContentChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">썸네일 이미지</label>
              {form.thumbnailUrl && (
                <img
                  src={form.thumbnailUrl}
                  alt="thumbnail"
                  className="w-32 h-20 object-cover rounded-lg mb-2 border border-gray-200"
                />
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-sm text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? '업로드 중...' : '이미지 선택'}
                </button>
                {form.thumbnailUrl && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, thumbnailUrl: '' }))}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    제거
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); setError(''); }}
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {submitting ? '저장 중...' : editingId ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <p className="text-gray-400">불러오는 중...</p>
      ) : guides.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">등록된 가이드가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {guide.thumbnailUrl ? (
                <img src={guide.thumbnailUrl} alt={guide.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
              )}
              <div className="p-4">
                <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2">
                  {guide.category}
                </span>
                <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{guide.title}</h4>
                <p
                  className="text-xs text-gray-500 line-clamp-2 mb-3"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(guide.content) }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{new Date(guide.createdAt).toLocaleDateString('ko-KR')}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(guide)}
                      className="text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id)}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
