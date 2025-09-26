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
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setIsAuthorized(true);
      })
      .catch(() => setIsAuthorized(false));

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
    <>
      {/* Background image + overlay */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-white/20 backdrop-blur-sm" />

      <main className="min-h-screen text-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <section className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-800 to-blue-600 bg-clip-text text-transparent mb-2">
              Testimoni Pengguna
            </h1>
            <p className="text-gray-800 max-w-xl mx-auto">
              Cerita & pengalaman mereka yang telah menggunakan layanan kami.
            </p>
          </section>

          {/* Form kirim testimoni */}
          {isAuthorized && (
            <section className="mb-10">
              <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl shadow p-5">
                <textarea
                  value={newTesti}
                  onChange={(e) => setNewTesti(e.target.value)}
                  placeholder="Tulis testimoni Anda..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/80"
                />
                <button
                  onClick={handleSubmit}
                  className="mt-4 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
                >
                  Kirim Testimoni
                </button>
              </div>
            </section>
          )}

          {/* List testimoni */}
          <section>
            {testimonies.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {testimonies.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow hover:shadow-lg transition"
                  >
                    <p className="text-gray-800 italic">“{t.content}”</p>
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-semibold text-green-800">{t.user_name}</span>
                      <span className="mx-2">·</span>
                      <span>{new Date(t.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-700">Belum ada testimoni.</p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}