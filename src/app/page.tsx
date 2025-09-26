'use client';

import { useEffect, useState } from 'react';

type Idiom = {
  id: number;
  idioms: string;
  meaning_en: string;
  meaning_id: string;
  example_sentence: string;
  sentence_translation: string;
  example_conversation: string;
};

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Idiom[]>([]);
  const [randomIdioms, setRandomIdioms] = useState<Idiom[]>([]);
  const [selected, setSelected] = useState<Idiom | null>(null);

  useEffect(() => {
    fetch('/api/idioms/random')
      .then((res) => res.json())
      .then((data) => setRandomIdioms(data))
      .catch((err) => console.error('Gagal memuat idiom populer:', err));
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    const res = await fetch(`/api/idioms/search?q=${encodeURIComponent(search)}`);
    const data = await res.json();
    setResults(data);
  };

  return (
    <>
      {/* Background image + overlay */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-white/20 backdrop-blur-sm" />

      {/* Content */}
      <main className="min-h-screen text-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Welcome */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-800 to-blue-600 bg-clip-text text-transparent mb-4">
              Welcome to Idiomatch
            </h1>

            {/* Logo */}
            <img
              src="/logo.png"
              alt="Idiomatch Logo"
              className="mx-auto h-40 w-auto mb-4 object-contain"
            />

            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              Discover, learn, and master English idioms easily and enjoyably.
            </p>
          </section>

          {/* Search */}
          <section className="mb-16">
            <div className="max-w-2xl mx-auto">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Find an idiom that you want to learn:
              </label>
              <div className="flex gap-2">
                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Example: once in a blue moon / cemburu"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/80"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
                >
                  Cari
                </button>
              </div>
            </div>
          </section>

          {/* Search Results */}
          {results.length > 0 && (
            <section className="mb-16">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Hasil Pencarian</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow hover:shadow-md cursor-pointer transition"
                  >
                    <h3 className="font-semibold text-green-800">{item.idioms}</h3>
                    <p className="text-sm text-gray-700 mt-1">{item.meaning_id}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Random Idioms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Idioms Today</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {randomIdioms.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow hover:shadow-lg cursor-pointer transition"
                >
                  <h3 className="font-semibold text-green-800 mb-2">{item.idioms}</h3>
                  <p className="text-sm text-gray-700 mb-3">{item.meaning_id}</p>
                  <span className="text-sm font-medium text-blue-600">See detail →</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Popup Detail */}
{selected && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
      <button
        onClick={() => setSelected(null)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        aria-label="Tutup"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold text-green-800 mb-3">{selected.idioms}</h2>

      <p className="text-gray-800 mb-1"><span className="font-semibold">Meaning (EN):</span> {selected.meaning_en}</p>
      <p className="text-gray-800 mb-4"><span className="font-semibold">Meaning (ID):</span> {selected.meaning_id}</p>

      <p className="text-gray-800 mb-4">
        <span className="font-semibold">Example:</span><br />
        {selected.example_sentence}<br />
        <span className="text-sm text-gray-600">→ {selected.sentence_translation}</span>
      </p>

      <div className="text-gray-800">
        <span className="font-semibold">Example conversation:</span>
        <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white/70 rounded-lg p-3 border mt-1">
          {selected.example_conversation.replace(/\\n/g, '\n')}
        </pre>
      </div>
    </div>
  </div>
)}
    </>
  );
}
