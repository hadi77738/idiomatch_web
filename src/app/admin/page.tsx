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

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; full_name: string; is_admin: boolean } | null>(null);
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.replace('/login');
          return;
        }

        const data = await res.json();
        if (!data.user?.is_admin) {
          alert('Akses khusus admin.');
          router.replace('/');
          return;
        }

        setUser(data.user);
      } catch (err) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Memeriksa otentikasi...</p>
      </div>
    );
  }
  if (!user) return null;

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

  const fetchQuizAttempts = async () => {
    const res = await fetch('/api/quiz-attempts');
    const data = await res.json();
    setQuizAttempts(data);
  };

  useEffect(() => {
    fetchUnits();
    fetchIdioms();
    fetchQuizAttempts();
  }, []);

  const handleLogout = () => {
    document.cookie = 'session_token=; path=/; max-age=0';
    router.push('/login');
  };

  const saveUnit = async () => {
    const url = editingUnit ? `/api/units/${editingUnit.id}` : '/api/units';
    const method = editingUnit ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: unitForm }),
    });
    setShowUnitForm(false);
    setUnitForm('');
    fetchUnits();
  };

  const saveIdiom = async () => {
    const url = editingIdiom ? `/api/idioms/${editingIdiom.id}` : '/api/idioms';
    const method = editingIdiom ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(idiomForm),
    });
    setShowIdiomForm(false);
    fetchIdioms();
  };

  const deleteUnit = async (id: number) => {
    if (!confirm('Hapus unit ini? Semua idiom terkait juga akan dihapus.')) return;
    await fetch(`/api/units/${id}`, { method: 'DELETE' });
    fetchUnits();
    fetchIdioms();
  };

  const deleteIdiom = async (id: number) => {
    if (!confirm('Hapus idiom ini?')) return;
    await fetch(`/api/idioms/${id}`, { method: 'DELETE' });
    fetchIdioms();
  };

  const filteredIdioms = selectedUnit ? idioms.filter((i) => i.unit_id === selectedUnit) : idioms;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700">
            Logout
          </button>
        </div>
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Recent Quiz Attempts</h2>
          <table className="w-full bg-white shadow rounded-xl">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">NIM</th>
                <th className="px-4 py-2 text-left">Score</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {quizAttempts.map((qa) => (
                <tr key={qa.id} className="border-t">
                  <td className="px-4 py-2">{qa.user.full_name}</td>
                  <td className="px-4 py-2">{qa.user.nim}</td>
                  <td className="px-4 py-2">{qa.score}/{qa.total_questions}</td>
                  <td className="px-4 py-2">{new Date(qa.created_at).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
