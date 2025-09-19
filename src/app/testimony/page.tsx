'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Testimony = {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
};

export default function TestimonyPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [newTesti, setNewTesti] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // cek user login
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setIsAuthorized(true);
      })
      .catch(() => setIsAuthorized(false));

    // load testimonies
    fetch('/api/testimony')
      .then(res => res.json())
      .then(data => setTestimonies(data || []));
  }, []);

  const handleSubmit = async () => {
    if (!newTesti.trim()) return;
    try {
      const res = await fetch('/api/testimony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newTesti }),
      });
      if (res.ok) {
        setNewTesti('');
        // refresh list
        const data = await fetch('/api/testimony').then(r => r.json());
        setTestimonies(data);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Gagal tambah testimony:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-4 py-16">
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Testimoni Pengguna</h2>

        {/* Form hanya jika login */}
        {isAuthorized && (
          <div className="mb-8">
            <textarea
              value={newTesti}
              onChange={(e) => setNewTesti(e.target.value)}
              placeholder="Tulis testimoni Anda..."
              className="w-full p-3 border rounded-xl focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={handleSubmit}
              className="mt-3 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
            >
              Kirim Testimoni
            </button>
          </div>
        )}

        {/* List testimony */}
        <div className="space-y-4">
          {testimonies.length > 0 ? (
            testimonies.map((t) => (
              <div key={t.id} className="border rounded-xl p-4 bg-white/70">
                <p className="text-gray-800">{t.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Oleh <span className="font-medium">{t.user_name}</span> ·{' '}
                  {new Date(t.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-700 text-center">Belum ada testimoni.</p>
          )}
        </div>
      </div>
    </main>
  );
}
