'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

interface SystemNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

function FaqItem({ faq }: { faq: Faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-neutral-900 pr-4">{faq.question}</span>
        {open ? (
          <ChevronUpIcon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

function NoticeItem({ notice }: { notice: SystemNotice }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 text-left gap-4"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">{notice.title}</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        {open ? (
          <ChevronUpIcon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
          {notice.content}
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [notices, setNotices] = useState<SystemNotice[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [tab, setTab] = useState<'faq' | 'notice'>('faq');

  useEffect(() => {
    fetch('/api/faqs')
      .then((r) => r.json() as Promise<Faq[]>)
      .then(setFaqs)
      .catch(() => {})
      .finally(() => setLoadingFaqs(false));

    fetch('/api/notices')
      .then((r) => r.json() as Promise<SystemNotice[]>)
      .then(setNotices)
      .catch(() => {})
      .finally(() => setLoadingNotices(false));
  }, []);

  return (
    <main className="pb-20">
      {/* 헤더 */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-neutral-900">고객센터</h1>
        <p className="text-sm text-neutral-500 mt-1">궁금한 점을 해결해 드립니다.</p>
      </header>

      {/* 연락처 카드 */}
      <div className="mx-4 mb-5 bg-primary-50 rounded-2xl p-4">
        <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
          문의하기
        </p>
        <div className="space-y-1">
          <p className="text-sm text-neutral-700">
            <span className="font-medium">이메일</span>{' '}
            <a href="mailto:support@villamate.kr" className="text-primary-600 underline">
              support@villamate.kr
            </a>
          </p>
          <p className="text-sm text-neutral-700">
            <span className="font-medium">운영시간</span>{' '}
            <span className="text-neutral-500">평일 09:00 – 18:00</span>
          </p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex mx-4 mb-4 bg-neutral-100 rounded-xl p-1 gap-1">
        {(['faq', 'notice'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors',
              tab === t ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500',
            ].join(' ')}
          >
            {t === 'faq' ? '자주 묻는 질문' : '공지사항'}
          </button>
        ))}
      </div>

      {/* FAQ */}
      {tab === 'faq' && (
        <div className="mx-4">
          {loadingFaqs ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-neutral-400 text-sm">
              등록된 FAQ가 없습니다.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {faqs.map((faq) => (
                <FaqItem key={faq.id} faq={faq} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 시스템 공지 */}
      {tab === 'notice' && (
        <div className="mx-4">
          {loadingNotices ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : notices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-neutral-400 text-sm">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {notices.map((notice) => (
                <NoticeItem key={notice.id} notice={notice} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
