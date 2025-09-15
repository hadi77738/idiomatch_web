// src/app/register/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type University = { id: number; name: string };

export default function RegisterPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState({
    full_name: '',
    nim: '',
    password: '',
    university_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/universities')
      .then((r) => r.json())
      .then(setUniversities)
      .catch(() => setError('Failed to load universities'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error || 'Registration failed');
    router.push('/login');
  };

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-white/60 backdrop-blur-sm" />

      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Create Student Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                placeholder="e.g. Budi Santoso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (NIM)</label>
              <input
                name="nim"
                value={form.nim}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                placeholder="e.g. 123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
              <select
                name="university_id"
                value={form.university_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
              >
                <option value="" disabled>Select university</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </main>
    </>
  );
}