'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/client-api';

interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  phone: string;
  memo: string | null;
}

type VendorCategory = 'PLUMBING' | 'ELECTRICAL' | 'CLEANING' | 'CONSTRUCTION' | 'ELEVATOR' | 'ETC';

const CATEGORY_LABELS: Record<VendorCategory, string> = {
  PLUMBING: '배관/설비',
  ELECTRICAL: '전기',
  CLEANING: '청소',
  CONSTRUCTION: '건설/공사',
  ELEVATOR: '엘리베이터',
  ETC: '기타',
};

const CATEGORIES: VendorCategory[] = ['PLUMBING', 'ELECTRICAL', 'CLEANING', 'CONSTRUCTION', 'ELEVATOR', 'ETC'];

// 카테고리별로 묶어서 렌더링
function groupByCategory(vendors: Vendor[]): Map<VendorCategory, Vendor[]> {
  const map = new Map<VendorCategory, Vendor[]>();
  for (const v of vendors) {
    const arr = map.get(v.category) ?? [];
    arr.push(v);
    map.set(v.category, arr);
  }
  return map;
}

export default function ResidentVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<VendorCategory | 'ALL'>('ALL');

  const fetchVendors = (cat: VendorCategory | 'ALL' = 'ALL') => {
    const url = cat !== 'ALL' ? `/api/resident/vendors?category=${cat}` : '/api/resident/vendors';
    setLoading(true);
    apiFetch(url)
      .then((r) => r.json())
      .then((data: { vendors?: Vendor[]; error?: string }) => {
        if (data.error) { setError(data.error); return; }
        setVendors(data.vendors ?? []);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, []);

  const changeFilter = (cat: VendorCategory | 'ALL') => {
    setFilterCat(cat);
    fetchVendors(cat);
  };

  const grouped = groupByCategory(vendors);

  return (
    <main className="px-4 pt-6 pb-24 min-h-screen bg-neutral-50">
      <h1 className="text-xl font-bold text-neutral-900 mb-1">업체 연락처</h1>
      <p className="text-sm text-neutral-500 mb-5">전화 아이콘을 탭해 바로 전화하세요.</p>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {(['ALL', ...CATEGORIES] as Array<VendorCategory | 'ALL'>).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => changeFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-[36px] transition-colors ${
              filterCat === cat
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {cat === 'ALL' ? '전체' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {error && <p className="text-error-500 text-sm mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && vendors.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">📞</p>
          <p>등록된 업체가 없습니다.</p>
        </div>
      )}

      {!loading && !error && vendors.length > 0 && (
        filterCat !== 'ALL' ? (
          /* 단일 카테고리 목록 */
          <ul className="space-y-3">
            {vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}
          </ul>
        ) : (
          /* 카테고리별 그룹 */
          <div className="space-y-6">
            {CATEGORIES.filter((c) => grouped.has(c)).map((cat) => (
              <section key={cat}>
                <h2 className="text-sm font-semibold text-neutral-500 mb-2">{CATEGORY_LABELS[cat]}</h2>
                <ul className="space-y-3">
                  {(grouped.get(cat) ?? []).map((v) => <VendorCard key={v.id} vendor={v} />)}
                </ul>
              </section>
            ))}
          </div>
        )
      )}
    </main>
  );
}

function VendorCard({ vendor: v }: { vendor: Vendor }) {
  return (
    <li className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-neutral-900">{v.name}</p>
            <Badge variant="info">{CATEGORY_LABELS[v.category]}</Badge>
          </div>
          {v.memo && <p className="text-xs text-neutral-400 mt-0.5">{v.memo}</p>}
        </div>
        <a
          href={`tel:${v.phone}`}
          className="flex items-center gap-1.5 bg-success-50 text-success-700 font-semibold text-sm px-3 py-2 rounded-xl min-h-[44px] shrink-0"
          aria-label={`${v.name} 전화하기`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
          {v.phone}
        </a>
      </div>
    </li>
  );
}
