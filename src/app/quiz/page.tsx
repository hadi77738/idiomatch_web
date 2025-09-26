'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ... (kode lainnya tetap sama) ...
type Question = {
  id: number;
  idioms: string;
  meaning_en: string;
  meaning_id: string;
  options: string[]; // 4 pilihan
  answer: string;    // meaning_id yang benar
};

export default function QuizPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Cek status login
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        if(data.user) {
            setIsAuthorized(true);
            // Ambil data kuis jika sudah login
            return fetch('/api/quiz');
        }
      })
      .then(res => res && res.json())
      .then(data => {
        if(data) setQuestions(data);
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleNext = async () => {
    if (!selected) return;

    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSelected('');
    } else {
      // Kuis selesai, hitung skor
      const correctAnswers = newAnswers.filter((a, i) => a === questions[i].answer).length;
      const calculatedScore = Math.round((correctAnswers / questions.length) * 100);
      setScore(calculatedScore);
      
      // Kirim hasil ke server untuk disimpan
      try {
        await fetch('/api/quiz/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: calculatedScore,
            total_questions: questions.length,
          }),
        });
      } catch (error) {
        console.error("Gagal menyimpan hasil kuis:", error);
      } finally {
        // Tampilkan hasil kepada pengguna
        setShowResult(true);
      }
    }
  };

  // ... (sisa kode JSX untuk tampilan tetap sama) ...
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-700">Memverifikasi & Memuat soal...</p>
      </main>
    );
  }
  
  if (!isAuthorized) {
    return null; 
  }

  if (showResult) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900 px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Hasil Quiz</h2>
          <p className="text-center text-lg mb-2">
            Skor Anda: <span className="font-bold text-green-700">{score}/100</span>
          </p>
          <p className="text-center mb-6">
            Jawaban benar: {answers.filter((a, i) => a === questions[i].answer).length}/{questions.length}
          </p>

          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="border rounded-xl p-4 bg-white/70">
                <p className="font-semibold">{i + 1}. {q.idioms}</p>
                <p className={`text-sm mt-1 ${answers[i] === q.answer ? 'text-green-700' : 'text-red-600'}`}>
                  Jawaban Anda: {answers[i]}
                </p>
                {answers[i] !== q.answer && <p className="text-sm text-blue-700">Jawaban Benar: {q.answer}</p>}
              </div>
            ))}
          </div>

          <div className="text-center">
             <button
              onClick={() => location.reload()}
              className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
            >
              Ulangi Quiz
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-white/20 backdrop-blur-sm" />
      <main className="min-h-screen flex items-center justify-center text-gray-900 px-4">
        {questions.length > 0 ? (
        <div className="max-w-2xl w-full">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-700">
                  Soal {index + 1}/{questions.length}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-6">{questions[index].idioms}</h2>
              <div className="space-y-3">
                {questions[index].options.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-green-50 transition ${selected === opt ? 'bg-green-100 border-green-500' : 'bg-white/70'}`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={opt}
                      checked={selected === opt}
                      onChange={(e) => setSelected(e.target.value)}
                      className="form-radio h-5 w-5 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-800">{opt}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={!selected}
                className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold disabled:opacity-50 hover:from-green-800 hover:to-blue-700 transition"
              >
                {index === questions.length - 1 ? 'Selesai' : 'Selanjutnya'}
              </button>
            </div>
        </div>
        ) : (
            <p className="text-gray-700">Tidak ada soal kuis yang tersedia saat ini.</p>
        )}
      </main>
    </>
  );
}

