'use client';

import { useEffect, useState } from 'react';

type Question = {
  id: number;
  idioms: string;
  meaning_en: string;
  meaning_id: string;
  options: string[]; // 4 pilihan
  answer: string;    // meaning_id yang benar
};

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);

  useEffect(() => {
    fetch('/api/quiz')
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setTotalPossible(data.length);
      })
      .catch((err) => console.error('Gagal memuat quiz:', err));
  }, []);

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSelected('');
    } else {
      // hitung skor
      const correct = newAnswers.filter((a, i) => a === questions[i].answer).length;
      const maxScore = questions.length >= 5 ? 100 : (questions.length * 20);
      setScore(Math.round((correct / questions.length) * maxScore));
      setShowResult(true);
    }
  };

  if (questions.length === 0)
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-700">Memuat soal...</p>
      </main>
    );

  if (showResult)
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900 px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Hasil Quiz</h2>
          <p className="mb-2">Skor Anda: <span className="font-bold text-green-700">{score}/100</span></p>
          <p className="mb-6">Jawaban benar: {answers.filter((a, i) => a === questions[i].answer).length}/{questions.length}</p>

          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="border rounded-xl p-4">
                <p className="font-semibold">{i + 1}. {q.idioms}</p>
                <p className="text-sm text-gray-600 mb-1">Jawaban Anda: <span className={answers[i] === q.answer ? 'text-green-700' : 'text-red-600'}>{answers[i]}</span></p>
                {answers[i] !== q.answer && <p className="text-sm text-green-700">Benar: {q.answer}</p>}
              </div>
            ))}
          </div>

          <button
            onClick={() => location.reload()}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
          >
            Ulangi Quiz
          </button>
        </div>
      </main>
    );

  const q = questions[index];

    return (
    <>
      {/* Background gambar + overlay */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-white/60 backdrop-blur-sm" />

      {/* Konten quiz */}
      <main className="min-h-screen text-gray-900">
        {questions.length === 0 ? (
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-800">Memuat soal...</p>
          </div>
        ) : showResult ? (
          <div className="px-4 py-16">
            <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Hasil Quiz</h2>
              <p className="mb-2">
                Skor Anda: <span className="font-bold text-green-700">{score}/100</span>
              </p>
              <p className="mb-6">
                Jawaban benar:{' '}
                {answers.filter((a, i) => a === questions[i].answer).length}/
                {questions.length}
              </p>

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="border rounded-xl p-4 bg-white/70">
                    <p className="font-semibold">
                      {i + 1}. {q.idioms}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Jawaban Anda:{' '}
                      <span
                        className={
                          answers[i] === q.answer
                            ? 'text-green-700'
                            : 'text-red-600'
                        }
                      >
                        {answers[i]}
                      </span>
                    </p>
                    {answers[i] !== q.answer && (
                      <p className="text-sm text-green-700">
                        Benar: {q.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => location.reload()}
                className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
              >
                Ulangi Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-16">
            <div className="max-w-2xl mx-auto">
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
                      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-green-50 transition"
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={opt}
                        checked={selected === opt}
                        onChange={(e) => setSelected(e.target.value)}
                        className="text-green-700"
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
          </div>
        )}
      </main>
    </>
  );
}