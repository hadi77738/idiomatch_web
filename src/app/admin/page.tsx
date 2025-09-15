'use client';

import { useEffect, useState, FC, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

// --- Type Definitions ---
type Unit = { id: number; name: string };
type Idiom = {
  id: number;
  unit_id: number;
  idioms: string;
  meaning_en: string;
  meaning_id: string;
  example_sentence: string;
  sentence_translation: string;
  example_conversation: string;
};
type User = {
  id: number;
  full_name: string;
  username: string;
  nim: string;
  is_admin: boolean;
};
type QuizAttempt = {
  id: number;
  full_name: string;
  nim: string;
  score: number;
  total_questions: number;
  created_at: string;
};

// --- Accordion Item Component ---
interface AccordionItemProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}
const AccordionItem: FC<AccordionItemProps> = ({ title, children, isOpen, onToggle }) => (
  <div className="border-b border-gray-200">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-800 hover:bg-gray-100/50 transition-colors"
    >
      {title}
      <svg
        className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && <div className="p-4 bg-gray-50/70">{children}</div>}
  </div>
);

// --- Main Admin Page Component ---
export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useUser();

  // State for accordion
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Data states
  const [units, setUnits] = useState<Unit[]>([]);
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);

  // Modal and form states
  const [showIdiomForm, setShowIdiomForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingIdiom, setEditingIdiom] = useState<Idiom | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [idiomForm, setIdiomForm] = useState({
    idioms: '', meaning_en: '', meaning_id: '',
    example_sentence: '', sentence_translation: '',
    example_conversation: '', unit_id: 1,
  });
  const [unitForm, setUnitForm] = useState('');

  // --- Effects ---
  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin)) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.is_admin) {
      fetchUnits();
      fetchIdioms();
      fetchUsers();
      fetchQuizAttempts();
    }
  }, [user]);

  // --- Data Fetching ---
  const fetchUnits = async () => {
    const res = await fetch('/api/units');
    if (res.ok) setUnits(await res.json());
  };
  const fetchIdioms = async () => {
    const res = await fetch('/api/idioms');
    if (res.ok) setIdioms(await res.json());
  };
  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  };
  const fetchQuizAttempts = async () => {
    const res = await fetch('/api/quiz/attempts');
    if (res.ok) setQuizAttempts(await res.json());
  };

  // --- Handlers ---
  const resetIdiomForm = () => {
    setIdiomForm({
        idioms: '', meaning_en: '', meaning_id: '',
        example_sentence: '', sentence_translation: '',
        example_conversation: '', unit_id: units[0]?.id || 1,
    });
    setEditingIdiom(null);
    setShowIdiomForm(false);
  };

  const resetUnitForm = () => {
    setUnitForm('');
    setEditingUnit(null);
    setShowUnitForm(false);
  };
  
  const saveIdiom = async () => {
    try {
      const url = editingIdiom ? `/api/idioms/${editingIdiom.id}` : '/api/idioms';
      const method = editingIdiom ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idiomForm),
      });
      
      if (res.ok) {
        resetIdiomForm();
        fetchIdioms();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to save idiom');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const saveUnit = async () => {
    try {
      const url = editingUnit ? `/api/units/${editingUnit.id}` : '/api/units';
      const method = editingUnit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: unitForm }),
      });
      
      if (res.ok) {
        resetUnitForm();
        fetchUnits();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to save unit');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const deleteIdiom = async (id: number) => {
    if (!confirm('Are you sure you want to delete this idiom?')) return;
    
    try {
      const res = await fetch(`/api/idioms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchIdioms();
      } else {
        alert('Failed to delete idiom');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const deleteUnit = async (id: number) => {
    if (!confirm('Are you sure you want to delete this unit? All idioms in this unit will also be deleted.')) return;
    
    try {
      const res = await fetch(`/api/units/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUnits();
        fetchIdioms();
        if (selectedUnit === id) setSelectedUnit(null);
      } else {
        alert('Failed to delete unit');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };
  
  const handleToggleUserAdmin = async (targetUser: User) => {
    const newStatus = !targetUser.is_admin;
    if (confirm(`Make ${targetUser.full_name} ${newStatus ? 'an admin' : 'a regular user'}?`)) {
      try {
        const res = await fetch(`/api/users/${targetUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_admin: newStatus }),
        });
        
        if (res.ok) {
          fetchUsers();
        } else {
          alert('Failed to update user role');
        }
      } catch (error) {
        alert('Network error occurred');
      }
    }
  };

  const filteredIdioms = selectedUnit ? idioms.filter((i) => i.unit_id === selectedUnit) : idioms;
  
  // --- Render Logic ---
  if (isLoading || !user || !user.is_admin) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading & Verifying Access...</p>
      </main>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('/bg.jpeg')" }} />
      <div className="fixed inset-0 -z-10 bg-white/60 backdrop-blur-sm" />

      <main className="min-h-screen text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button onClick={logout} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition">
              Logout
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <AccordionItem title={`Quiz Attempts (${quizAttempts.length})`} isOpen={activeSection === 'attempts'} onToggle={() => setActiveSection(activeSection === 'attempts' ? null : 'attempts')}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quizAttempts.map(attempt => (
                      <tr key={attempt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{attempt.full_name} ({attempt.nim})</td>
                        <td className="px-6 py-4 whitespace-nowrap">{attempt.score}/{attempt.total_questions*20}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(attempt.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionItem>

            <AccordionItem title={`Manage Users (${users.length})`} isOpen={activeSection === 'users'} onToggle={() => setActiveSection(activeSection === 'users' ? null : 'users')}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{u.full_name} ({u.username})</td>
                        <td className="px-6 py-4 whitespace-nowrap">{u.is_admin ? 'Admin' : 'User'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button onClick={() => handleToggleUserAdmin(u)} className="text-sm px-3 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {u.is_admin ? 'Make User' : 'Make Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionItem>

            <AccordionItem title={`Manage Units (${units.length})`} isOpen={activeSection === 'units'} onToggle={() => setActiveSection(activeSection === 'units' ? null : 'units')}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setShowUnitForm(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white hover:from-green-800 hover:to-blue-700 transition"
                  >
                    + Add Unit
                  </button>
                  {selectedUnit && (
                    <button
                      onClick={() => setSelectedUnit(null)}
                      className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                    >
                      Show All Units
                    </button>
                  )}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className={`p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow hover:shadow-md transition ${
                        selectedUnit === unit.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <h3 className="font-semibold mb-2">{unit.name}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setEditingUnit(unit);
                            setUnitForm(unit.name);
                            setShowUnitForm(true);
                          }}
                          className="text-sm px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUnit(unit.id)}
                          className="text-sm px-3 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setSelectedUnit(unit.id)}
                          className="text-sm px-3 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          View Idioms
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionItem>

            <AccordionItem title={`Manage Idioms (${filteredIdioms.length})`} isOpen={activeSection === 'idioms'} onToggle={() => setActiveSection(activeSection === 'idioms' ? null : 'idioms')}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedUnit ? `Idioms in ${units.find((u) => u.id === selectedUnit)?.name}` : 'All Idioms'}
                  </h3>
                  <button
                    onClick={() => setShowIdiomForm(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white hover:from-green-800 hover:to-blue-700 transition"
                  >
                    + Add Idiom
                  </button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredIdioms.map((idiom) => (
                    <div
                      key={idiom.id}
                      className="p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow hover:shadow-md transition"
                    >
                      <h3 className="font-semibold mb-1">{idiom.idioms}</h3>
                      <p className="text-sm text-gray-700 mb-2">{idiom.meaning_en}</p>
                      <p className="text-sm text-gray-600 mb-3">{idiom.meaning_id}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingIdiom(idiom);
                            setIdiomForm({
                              idioms: idiom.idioms,
                              meaning_en: idiom.meaning_en,
                              meaning_id: idiom.meaning_id,
                              example_sentence: idiom.example_sentence,
                              sentence_translation: idiom.sentence_translation,
                              example_conversation: idiom.example_conversation,
                              unit_id: idiom.unit_id,
                            });
                            setShowIdiomForm(true);
                          }}
                          className="text-sm px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteIdiom(idiom.id)}
                          className="text-sm px-3 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionItem>
          </div>
        </div>
      </main>

      {/* Idiom Form Modal */}
      {showIdiomForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={resetIdiomForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4">{editingIdiom ? 'Edit Idiom' : 'Add New Idiom'}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={idiomForm.unit_id}
                  onChange={(e) => setIdiomForm({ ...idiomForm, unit_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idiom</label>
                <input
                  type="text"
                  value={idiomForm.idioms}
                  onChange={(e) => setIdiomForm({ ...idiomForm, idioms: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  placeholder="e.g., Break the ice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meaning (EN)</label>
                <input
                  type="text"
                  value={idiomForm.meaning_en}
                  onChange={(e) => setIdiomForm({ ...idiomForm, meaning_en: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  placeholder="e.g., To initiate conversation in a social setting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meaning (ID)</label>
                <input
                  type="text"
                  value={idiomForm.meaning_id}
                  onChange={(e) => setIdiomForm({ ...idiomForm, meaning_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  placeholder="e.g., Memulai percakapan dalam suasana sosial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Example Sentence</label>
                <textarea
                  value={idiomForm.example_sentence}
                  onChange={(e) => setIdiomForm({ ...idiomForm, example_sentence: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  placeholder="e.g., She broke the ice by telling a funny joke."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sentence Translation</label>
                <textarea
                  value={idiomForm.sentence_translation}
                  onChange={(e) => setIdiomForm({ ...idiomForm, sentence_translation: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  placeholder="e.g., Dia memecahkan kebekuan dengan menceritakan lelucon yang lucu."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Example Conversation</label>
                <textarea
                  value={idiomForm.example_conversation}
                  onChange={(e) => setIdiomForm({ ...idiomForm, example_conversation: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                  placeholder="e.g., A: How was the party? B: Great! Sarah broke the ice with a hilarious story and everyone started talking."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveIdiom}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
              >
                Save
              </button>
              <button
                onClick={resetIdiomForm}
                className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit Form Modal */}
      {showUnitForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={resetUnitForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4">{editingUnit ? 'Edit Unit' : 'Add New Unit'}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
              <input
                type="text"
                value={unitForm}
                onChange={(e) => setUnitForm(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white/90"
                placeholder="e.g., Unit 1: Basic Idioms"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveUnit}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-700 to-blue-600 text-white font-semibold hover:from-green-800 hover:to-blue-700 transition"
              >
                Save
              </button>
              <button
                onClick={resetUnitForm}
                className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}