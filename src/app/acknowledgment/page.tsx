export default function AcknowledgmentPage() {
  return (
    <>
      {/* Background & overlay */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-white/60 backdrop-blur-sm" />

      <main className="min-h-screen text-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-800 to-blue-600 bg-clip-text text-transparent mb-4">
              Acknowledgment
            </h1>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              Our sincere gratitude to those who supported this project.
            </p>
          </section>

          <div className="space-y-8">
            {/* Institution */}
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow">
              <h2 className="text-xl font-semibold mb-2 text-blue-700">
                Research and Community Service Institute
              </h2>
              <p className="text-gray-700">
                Universitas Muhammadiyah Semarang (UMS) for funding, facilities and
                administrative support throughout the development of Idiomatch.
              </p>
            </div>

            {/* Advisors */}
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow">
              <h2 className="text-xl font-semibold mb-2 text-blue-700">Academic Advisors</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Eko Heriyanto, S.S., M.Hum.</li>
                <li>Dr. Anjar Setiawan, M.Pd.</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                For their invaluable guidance, feedback and encouragement.
              </p>
            </div>

            {/* Closing */}
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow text-center">
              <p className="text-gray-800 italic">
                “This project would not have been possible without collective support.
                Thank you for inspiring us to make learning idioms enjoyable.”
              </p>
              <p className="text-sm text-gray-600 mt-3">— Idiomatch Development Team</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}