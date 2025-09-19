"use client";

import { useEffect, useState } from "react";

interface Testimony {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
}

export default function TestimonyPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/testimony")
      .then((res) => res.json())
      .then((data) => setTestimonies(data))
      .catch(() => setTestimonies([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/testimony", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent("");
        const data = await fetch("/api/testimony").then((r) => r.json());
        setTestimonies(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center px-4 py-10">
      {/* Background sama dengan quiz */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />

      <div className="max-w-3xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 drop-shadow-lg">
          Testimoni Pengguna
        </h1>

        {/* Form tambah testimoni */}
        <form
          onSubmit={handleSubmit}
          className="bg-black/40 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-10"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent border border-white/30 rounded-xl p-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Tulis pengalamanmu di sini..."
            rows={3}
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 font-semibold shadow-md hover:scale-105 transition-transform"
          >
            {loading ? "Mengirim..." : "Kirim Testimoni"}
          </button>
        </form>

        {/* List testimoni */}
        <div className="space-y-6">
          {testimonies.length === 0 && (
            <p className="text-center text-gray-200 drop-shadow">
              Belum ada testimoni. Jadilah yang pertama!
            </p>
          )}
          {testimonies.map((t) => (
            <div
              key={t.id}
              className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-white/20 hover:shadow-xl transition-all"
            >
              <p className="text-lg italic text-gray-100">“{t.content}”</p>
              <div className="mt-3 text-sm text-gray-300 flex justify-between">
                <span>— {t.user_name}</span>
                <span>{new Date(t.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
