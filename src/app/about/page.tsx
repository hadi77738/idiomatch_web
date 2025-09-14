export default function AboutPage() {
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
              About Idiomatch
            </h1>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              Your interactive gateway to mastering English idioms.
            </p>
          </section>

          <div className="space-y-8">
            {/* Purpose */}
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow">
              <h2 className="text-xl font-semibold mb-2 text-green-800">Purpose</h2>
              <p className="text-gray-700">
                Idiomatch is designed to help learners understand, remember and use English idioms
                correctly through real-life examples, interactive quizzes and clear Indonesian
                translations.
              </p>
            </div>

            {/* Features */}
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow">
              <h2 className="text-xl font-semibold mb-3 text-green-800">Key Features</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>20 thematic units covering 240+ common idioms</li>
                <li>Real-world example sentences & conversations</li>
                <li>Interactive 5-question quiz with instant scoring</li>
                <li>Bilingual explanations (English - Indonesian)</li>
                <li>Responsive design for phone, tablet & desktop</li>
                <li>Admin dashboard for content management</li>
              </ul>
            </div>

            {/* Target Users */}
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow">
              <h2 className="text-xl font-semibold mb-2 text-green-800">Target Users</h2>
              <p className="text-gray-700">
                Senior-high-school students, university students, English teachers and anyone who
                wants to speak English naturally and confidently.
              </p>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}