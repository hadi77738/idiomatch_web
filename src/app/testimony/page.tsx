'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Testimony = {
  id: number;
  full_name: string;
  content: string;
  created_at: string;
};

export default function TestimonyPage() {
  const router = useRouter();
  const [list, setList] = useState<Testimony[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // global loading

  useEffect(() => {
    // 1. cek login dulu (sama persis seperti halaman quiz)
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (data.user) setLoggedIn(true);
        // 2. ambil list testimoni (publik)
        return fetch('/api/testimonies');
      })
      .then((res) => res.json())
      .then((data) => setList(data))
      .catch(() => router.push('/login'))
      .finally(() => setIsLoading(false));
  }, [router]);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const res = await fetch('/api/testimonies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setLoading(false);
    if (res.ok) {
      setContent('');
      // reload list
      const { json } = await fetch('/api/testimonies').then((r) => r.json().then((j) => ({ json: j })));
      setList(json);
    } else alert('Gagal kirim testimoni');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Background seragam */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-white/60 backdrop-blur-sm" />

      <main className="min-h-screen text-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Testimoni Pengguna</h1>
            <p className="mt-2 text-gray-600">Ceritakan pengalamanmu menggunakan platform ini.</p>
          </div>

          {/* Form kirim (hanya login) */}
          {loggedIn && (
            <div className="mb-10 p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis testimonimu di sini..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                rows={4}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={submit}
                  disabled={loading}
                  className={`px-6 py-2 rounded-xl font-semibold text-white transition
                    ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-green-700 to-blue-600 hover:from-green-800 hover:to-blue-700'}`}
                >
                  {loading ? 'Menyimpan...' : 'Kirim Testimoni'}
                </button>
              </div>
            </div>
          )}

          {/* Daftar testimoni */}
          <div className="space-y-6">
            {list.length === 0 && <p className="text-center text-gray-600">Belum ada testimoni.</p>}
            {list.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{t.full_name}</p>
                  <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleString('id-ID')}</p>
                </div>
                <p className="mt-3 text-gray-700 whitespace-pre-wrap">{t.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}