export default function CreditPage() {
  const lecturers = [
    {
      name: 'Eko Heriyanto, S.S., M.Hum.',
      role: 'Lecturer in English Education',
      affiliation: 'Universitas Muhammadiyah Semarang',
    },
    {
      name: 'Dr. Anjar Setiawan, M.Pd.',
      role: 'Lecturer in English Education',
      affiliation: 'Universitas Muhammadiyah Semarang',
    },
  ];

  const students = [
    { name: 'M. Nur Arifin S.S.', major: 'Dev Team' },
    { name: 'Kikan Laila Arinil Haque', major: 'Dev Team' },
    { name: 'Ahmad Hadi Lukmanul Hakim', major: 'Dev Team' },
    // Tambahkan nama mahasiswa lain di sini
  ];

  return (
    <>
      {/* Background & overlay */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-white/20 backdrop-blur-sm" />

      <main className="min-h-screen text-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-800 to-blue-600 bg-clip-text text-transparent mb-4">
              Credits
            </h1>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              Meet the dedicated team behind Idiomatch.
            </p>
          </section>

          {/* Lecturers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">Supervising Lecturers</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {lecturers.map((lecturer) => (
                <div
                  key={lecturer.name}
                  className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-green-800">{lecturer.name}</h3>
                  <p className="text-sm text-gray-700">{lecturer.role}</p>
                  <p className="text-sm text-gray-600">{lecturer.affiliation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Students */}
          <section>
            <h2 className="text-2xl font-bold text-center mb-6">Developer Team</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-blue-700">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.major}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}