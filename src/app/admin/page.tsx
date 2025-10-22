'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Unit = { id: number; name: string };
type Idiom = {
  id: number;
  unit_id: number;
  idioms: string;
  meaning_en: string;
  meaning_id: string;
  example_sentence: string;
  sentence_translation: string;
  example_conversation: string;
};
type QuizAttempt = {
  id: number;
  user: { full_name: string; nim: string };
  score: number;
  total_questions: number;
  created_at: string;
};

type AuthMe = {
  id: number;
  full_name: string;
  nim: string;
  is_admin: boolean;
};

export default function AdminPage() {
  const router = useRouter();

  /* ---------- STATE BARU ---------- */
  const [user, setUser] = useState<AuthMe | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- STATE LAMA ---------- */
  const [units, setUnits] = useState<Unit[]>([]);
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  const [showIdiomForm, setShowIdiomForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingIdiom, setEditingIdiom] = useState<Idiom | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [idiomForm, setIdiomForm] = useState({
    idioms: '',
    meaning_en: '',
    meaning_id: '',
    example_sentence: '',
    sentence_translation: '',
    example_conversation: '',
    unit_id: 1,
  });

  const [unitForm, setUnitForm] = useState('');

  /* ---------- AUTH GUARD ---------- */
  useEffect(() => {
const checkAuth = async () => {
  try {
    console.log('[AdminPage] checking /api/auth/me');
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    console.log('[AdminPage] status:', res.status);
    const data = await res.json();
    console.log('[AdminPage] data:', data);
    if (!data.user?.is_admin) {
      alert('Akses hanya untuk admin. Response: ' + JSON.stringify(data));
      router.replace('/');
      return;
    }
    setUser(data.user);
  } catch (e) {
    console.error('[AdminPage] auth error', e);
    router.replace('/login');
  } finally {
    setLoading(false);
  }
};

    checkAuth();
  }, [router]);

  /* ---------- DATA FETCHING (hanya jika user admin) ---------- */
  useEffect(() => {
    if (!user) return; // belum lolos guard
    fetchUnits();
    fetchIdioms();
    fetchQuizAttempts();
  }, [user]);

  const fetchQuizAttempts = async () => {
    const res = await fetch('/api/quiz-attempts');
    const data: QuizAttempt[] = await res.json();
    setQuizAttempts(data);
  };

  const fetchUnits = async () => {
    const res = await fetch('/api/units');
    const data = await res.json();
    setUnits(data);
  };

  const fetchIdioms = async () => {
    const res = await fetch('/api/idioms');
    const data = await res.json();
    setIdioms(data);
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  const resetIdiomForm = () => {
    setIdiomForm({
      idioms: '',
      meaning_en: '',
      meaning_id: '',
      example_sentence: '',
      sentence_translation: '',
      example_conversation: '',
      unit_id: 1,
    });
    setEditingIdiom(null);
    setShowIdiomForm(false);
  };

  const resetUnitForm = () => {
    setUnitForm('');
    setEditingUnit(null);
    setShowUnitForm(false);
  };

  const saveIdiom = async () => {
    const url = editingIdiom ? `/api/idioms/${editingIdiom.id}` : '/api/idioms';
    const method = editingIdiom ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(idiomForm),
    });
    resetIdiomForm();
    fetchIdioms();
  };

  const saveUnit = async () => {
    const url = editingUnit ? `/api/units/${editingUnit.id}` : '/api/units';
    const method = editingUnit ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: unitForm }),
    });
    resetUnitForm();
    fetchUnits();
  };

  const deleteIdiom = async (id: number) => {
    if (!confirm('Delete this idiom?')) return;
    await fetch(`/api/idioms/${id}`, { method: 'DELETE' });
    fetchIdioms();
  };

  const deleteUnit = async (id: number) => {
    if (!confirm('Delete this unit? All idioms in this unit will also be deleted.')) return;
    await fetch(`/api/units/${id}`, { method: 'DELETE' });
    fetchUnits();
    fetchIdioms();
  };

  const filteredIdioms = selectedUnit ? idioms.filter((i) => i.unit_id === selectedUnit) : idioms;

  /* ---------- RENDER ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Memeriksa otentikasi...</p>
      </div>
    );
  }

  if (!user) return null; // seharusnya tidak sampai sini karena redirect

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-white/20 backdrop-blur-sm" />

      <main className="min-h-screen text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>

          {/* ========== QUIZ ATTEMPTS ========== */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Recent Quiz Attempts</h2>
            <div className="rounded-xl bg-white/80 backdrop-blur-sm shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">NIM</th>
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizAttempts.map((qa) => (
                    <tr key={qa.id} className="border-t">
                      <td className="px-4 py-3">{qa.user.full_name}</td>
                      <td className="px-4 py-3">{qa.user.nim}</td>
                      <td className="px-4 py-3">
                        {qa.score}/{qa.total_questions}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(qa.created_at).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Units */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Units</h2>
              <button
                onClick={() => setShowUnitForm(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white hover:from-green-800 hover:to-blue-700 transition"
              >
                + Add Unit
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow hover:shadow-md transition"
                >
                  <h3 className="font-semibold mb-2">{unit.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingUnit(unit);
                        setUnitForm(unit.name);
                        setShowUnitForm(true);
                      }}
                      className="text-sm px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUnit(unit.id)}
                      className="text-sm px-3 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedUnit(unit.id)}
                      className="text-sm px-3 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      View Idioms
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Idioms */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Idioms{' '}
                {selectedUnit
                  ? `- Unit ${units.find((u) => u.id === selectedUnit)?.name}`
                  : '(All Units)'}
              </h2>
              <button
                onClick={() => setShowIdiomForm(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white hover:from-green-800 hover:to-blue-700 transition"
              >
                + Add Idiom
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIdioms.map((idiom) => (
                <div
                  key={idiom.id}
                  className="p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow hover:shadow-md transition"
                >
                  <h3 className="font-semibold mb-1">{idiom.idioms}</h3>
                  <p className="text-sm text-gray-700 mb-2">{idiom.meaning_en}</p>
                  <p className="text-sm text-gray-600 mb-3">{idiom.meaning_id}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingIdiom(idiom);
                        setIdiomForm({
                          idioms: idiom.idioms,
                          meaning_en: idiom.meaning_en,
                          meaning_id: idiom.meaning_id,
                          example_sentence: idiom.example_sentence,
                          sentence_translation: idiom.sentence_translation,
                          example_conversation: idiom.example_conversation,
                          unit_id: idiom.unit_id,
                        });
                        setShowIdiomForm(true);
                      }}
                      className="text-sm px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteIdiom(idiom.id)}
                      className="text-sm px-3 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Modal Idiom Form */}
        {showIdiomForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={resetIdiomForm}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-bold mb-4">{editingIdiom ? 'Edit Idiom' : 'Add New Idiom'}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={idiomForm.unit_id}
                    onChange={(e) => setIdiomForm({ ...idiomForm, unit_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idiom</label>
                  <input
                    type="text"
                    value={idiomForm.idioms}
                    onChange={(e) => setIdiomForm({ ...idiomForm, idioms: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meaning (EN)</label>
                  <input
                    type="text"
                    value={idiomForm.meaning_en}
                    onChange={(e) => setIdiomForm({ ...idiomForm, meaning_en: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meaning (ID)</label>
                  <input
                    type="text"
                    value={idiomForm.meaning_id}
                    onChange={(e) => setIdiomForm({ ...idiomForm, meaning_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Example Sentence</label>
                  <textarea
                    value={idiomForm.example_sentence}
                    onChange={(e) => setIdiomForm({ ...idiomForm, example_sentence: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sentence Translation</label>
                  <textarea
                    value={idiomForm.sentence_translation}
                    onChange={(e) => setIdiomForm({ ...idiomForm, sentence_translation: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Example Conversation</label>
                  <textarea
                    value={idiomForm.example_conversation}
                    onChange={(e) => setIdiomForm({ ...idiomForm, example_conversation: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveIdiom}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={resetIdiomForm}
                  className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Unit Form */}
        {showUnitForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              <button
                onClick={resetUnitForm}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-bold mb-4">{editingUnit ? 'Edit Unit' : 'Add New Unit'}</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
                <input
                  type="text"
                  value={unitForm}
                  onChange={(e) => setUnitForm(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveUnit}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={resetUnitForm}
                  className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}