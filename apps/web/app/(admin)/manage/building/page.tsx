'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ImageViewer } from '@/components/ui/ImageViewer';

type Category = 'REPAIR' | 'INSPECTION' | 'CONTRACT' | 'CLEANING' | 'ETC';

const CATEGORY_LABELS: Record<Category, string> = {
  REPAIR: '하자보수',
  INSPECTION: '정기점검',
  CONTRACT: '유지계약',
  CLEANING: '청소',
  ETC: '기타',
};

const CATEGORY_BADGE: Record<Category, 'warning' | 'error' | 'info' | 'success' | 'neutral'> = {
  REPAIR: 'error',
  INSPECTION: 'info',
  CONTRACT: 'warning',
  CLEANING: 'success',
  ETC: 'neutral',
};

interface BuildingEvent {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  eventDate: string;
  contractorName: string | null;
  contactNumber: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  creator: { name: string };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminBuildingPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [events, setEvents] = useState<BuildingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');

  // 등록 폼 상태
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('REPAIR');
  const [formDate, setFormDate] = useState(todayIso());
  const [formContractor, setFormContractor] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 사진 첨부
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // 이미지 뷰어
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  // 토스트
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') ?? '';
      const category = filterCategory !== 'ALL' ? `?category=${filterCategory}` : '';
      const res = await fetch(`/api/villas/${villaId}/building-events${category}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('fetch failed');
      const data = (await res.json()) as BuildingEvent[];
      setEvents(data);
    } catch {
      setError('건물 이력을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId, filterCategory]);

  useEffect(() => {
    if (villaId) fetchEvents();
  }, [villaId, fetchEvents]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  function resetForm() {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('REPAIR');
    setFormDate(todayIso());
    setFormContractor('');
    setFormContact('');
    setFormError('');
    setAttachmentUrl(null);
    setAttachmentPreview(null);
    setUploadError('');
  }

  function handleOpenForm() {
    resetForm();
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAttachmentPreview(objectUrl);
    setAttachmentUrl(null);
    setUploadError('');
    setUploading(true);

    try {
      const token = localStorage.getItem('token') ?? '';
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('upload failed');
      const data = (await res.json()) as { url: string };
      setAttachmentUrl(data.url);
    } catch {
      setUploadError('사진 업로드에 실패했습니다. 다시 시도해주세요.');
      setAttachmentPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemoveAttachment() {
    setAttachmentUrl(null);
    setAttachmentPreview(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit() {
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('제목을 입력해주세요.');
      return;
    }
    if (!formDate) {
      setFormError('날짜를 선택해주세요.');
      return;
    }
    if (uploading) {
      setFormError('사진 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`/api/villas/${villaId}/building-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          category: formCategory,
          eventDate: formDate,
          contractorName: formContractor.trim() || undefined,
          contactNumber: formContact.trim() || undefined,
          attachmentUrl: attachmentUrl ?? undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? '등록에 실패했습니다.');
      }
      showToast('건물 이력이 등록되었습니다.');
      setShowForm(false);
      resetForm();
      await fetchEvents();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  const CATEGORIES: Category[] = ['REPAIR', 'INSPECTION', 'CONTRACT', 'CLEANING', 'ETC'];

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
            aria-label="뒤로가기"
          >
            <svg
              className="w-5 h-5 text-neutral-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">건물 이력</h1>
        </div>
        {!showForm && (
          <Button size="sm" onClick={handleOpenForm}>
            + 이력 등록
          </Button>
        )}
      </div>

      {/* 카테고리 필터 */}
      {!showForm && (
        <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={[
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors',
              filterCategory === 'ALL'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
            ].join(' ')}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={[
                'shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors',
                filterCategory === cat
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
              ].join(' ')}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* 등록 폼 */}
      {showForm && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            <h2 className="text-base font-bold text-neutral-900">이력 등록</h2>

            {/* 카테고리 선택 */}
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">분류</p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFormCategory(cat)}
                    className={[
                      'min-h-[44px] rounded-xl text-sm font-semibold border transition-colors',
                      formCategory === cat
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
                    ].join(' ')}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <Input
              label="제목"
              type="text"
              placeholder="이력 제목을 입력하세요"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />

            {/* 날짜 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">날짜</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="h-12 rounded-xl px-4 text-sm border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* 내용 */}
            <Textarea
              label="내용 (선택)"
              placeholder="상세 내용을 입력하세요"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
            />

            {/* 업체명 / 연락처 */}
            <Input
              label="업체명 (선택)"
              type="text"
              placeholder="업체명을 입력하세요"
              value={formContractor}
              onChange={(e) => setFormContractor(e.target.value)}
            />
            <Input
              label="연락처 (선택)"
              type="tel"
              inputMode="tel"
              placeholder="연락처를 입력하세요"
              value={formContact}
              onChange={(e) => setFormContact(e.target.value)}
            />

            {/* 사진 첨부 */}
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">사진 첨부 (선택)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {attachmentPreview ? (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachmentPreview}
                    alt="첨부 사진 미리보기"
                    className="w-full max-h-48 object-cover rounded-xl border border-neutral-200"
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                      <svg
                        className="animate-spin w-6 h-6 text-primary-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    </div>
                  )}
                  {!uploading && (
                    <button
                      onClick={handleRemoveAttachment}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-neutral-800/70 text-white hover:bg-neutral-900 transition-colors"
                      aria-label="사진 제거"
                    >
                      <svg
                        className="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[80px] flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-neutral-400 hover:text-primary-600"
                >
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  <span className="text-sm font-medium">이미지 선택</span>
                </button>
              )}
              {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
              {attachmentUrl && !uploading && (
                <p className="text-xs text-green-600 mt-1 font-medium">업로드 완료</p>
              )}
            </div>

            {formError && <p className="text-sm text-red-500 font-medium">{formError}</p>}

            <div className="flex gap-2 pt-1">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={handleCancelForm}
                disabled={submitting}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                loading={submitting}
                disabled={uploading}
                onClick={handleSubmit}
              >
                {uploading ? '업로드 중...' : '등록'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 이력 목록 */}
      <div className="px-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-5 w-16 bg-neutral-200 rounded-full" />
                <div className="h-4 w-32 bg-neutral-200 rounded" />
              </div>
              <div className="h-4 w-48 bg-neutral-200 rounded" />
            </div>
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-neutral-500">{error}</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={fetchEvents}>
              다시 시도
            </Button>
          </div>
        ) : events.length === 0 ? (
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
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
              />
            </svg>
            <p className="text-neutral-500 font-medium">등록된 건물 이력이 없습니다.</p>
            <p className="text-sm text-neutral-400 mt-1">이력을 등록해보세요.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={CATEGORY_BADGE[event.category]}>
                    {CATEGORY_LABELS[event.category]}
                  </Badge>
                  <span className="text-xs text-neutral-400">{formatDate(event.eventDate)}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-neutral-900 mb-1">{event.title}</p>
              {event.description && (
                <p className="text-sm text-neutral-600 whitespace-pre-line mb-2">
                  {event.description}
                </p>
              )}
              {(event.contractorName || event.contactNumber) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {event.contractorName && (
                    <span className="text-xs text-neutral-500">
                      업체:{' '}
                      <span className="font-medium text-neutral-700">{event.contractorName}</span>
                    </span>
                  )}
                  {event.contactNumber && (
                    <span className="text-xs text-neutral-500">
                      연락처:{' '}
                      <a
                        href={`tel:${event.contactNumber}`}
                        className="font-medium text-primary-600"
                      >
                        {event.contactNumber}
                      </a>
                    </span>
                  )}
                </div>
              )}
              {event.attachmentUrl && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.attachmentUrl}
                    alt="첨부 사진"
                    className="w-full max-h-48 object-cover rounded-xl border border-neutral-200 cursor-pointer"
                    onClick={() => setViewerSrc(event.attachmentUrl!)}
                  />
                </div>
              )}
              <p className="text-xs text-neutral-400 mt-2">등록: {event.creator.name}</p>
            </div>
          ))
        )}
      </div>

      {/* 이미지 뷰어 */}
      {viewerSrc && (
        <ImageViewer src={viewerSrc} alt="건물 이력 사진" onClose={() => setViewerSrc(null)} />
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto w-fit px-5 py-3 bg-neutral-800 text-white text-sm font-medium rounded-2xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </main>
  );
}
