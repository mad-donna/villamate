import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Faq {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export default function Faqs() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/faqs`)
      .then((r) => setFaqs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!question.trim() || !answer.trim()) {
      setError('질문과 답변을 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/faqs`, { question, answer }, { headers });
      setQuestion('');
      setAnswer('');
      setShowForm(false);
      load();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || '등록에 실패했습니다.');
      } else {
        setError('등록에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 FAQ를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/faqs/${id}`, { headers });
      load();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">FAQ 관리</h2>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? '취소' : '+ FAQ 등록'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">새 FAQ 작성</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">질문</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="자주 묻는 질문을 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">답변</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                placeholder="답변을 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); }}
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <p className="text-gray-400">불러오는 중...</p>
      ) : faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">등록된 FAQ가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">Q</span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{faq.question}</span>
                  <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 flex items-start gap-3">
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded shrink-0 mt-0.5">A</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{faq.answer}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-400">
                          {new Date(faq.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
