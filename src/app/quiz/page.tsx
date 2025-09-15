'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Kita tidak lagi memerlukan js-cookie untuk pengecekan ini

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

  // State untuk logika kuis
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Fungsi untuk cek status login dan mengambil soal kuis
    async function checkAuthAndFetchQuiz() {
      try {
        // 1. Panggil API untuk cek otentikasi
        const authRes = await fetch('/api/auth/me');

        if (!authRes.ok) {
          // Jika tidak terotentikasi, lempar error untuk dialihkan
          throw new Error('Not authenticated');
        }

        // 2. Jika berhasil, izinkan akses dan ambil soal kuis
        setIsAuthorized(true);

        const quizRes = await fetch('/api/quiz');
        if (!quizRes.ok) {
          throw new Error('Gagal memuat soal kuis');
        }
        const data = await quizRes.json();
        setQuestions(data);

      } catch (error) {
        console.error(error);
        // 3. Jika terjadi error (misal: tidak login), alihkan ke halaman login
        router.push('/login');
      } finally {
        // 4. Hentikan loading setelah semua proses selesai
        setIsLoading(false);
      }
    }

    checkAuthAndFetchQuiz();
  }, [router]);

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSelected('');
    } else {
      // Hitung skor
      const correct = newAnswers.filter((a, i) => a === questions[i].answer).length;
      const maxScore = 100;
      setScore(Math.round((correct / questions.length) * maxScore));
      setShowResult(true);
    }
  };

  // Tampilkan UI Loading selama proses verifikasi
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-700">Memverifikasi & Memuat soal...</p>
      </main>
    );
  }

  // Jangan render apapun jika tidak terotorisasi (pengalihan sedang berlangsung)
  if (!isAuthorized) {
    return null;
  }

  // Tampilkan hasil jika kuis selesai
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

  // Tampilkan soal kuis jika belum selesai dan soal sudah termuat
  if (questions.length > 0) {
    return (
      <>
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.jpeg')" }}
        />
        <div className="fixed inset-0 -z-10 bg-white/60 backdrop-blur-sm" />
        <main className="min-h-screen flex items-center justify-center text-gray-900 px-4">
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
        </main>
      </>
    );
  }
  
  return null; // Tampilkan null jika soal belum termuat setelah loading
}

