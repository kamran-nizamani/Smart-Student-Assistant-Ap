import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, Users } from 'lucide-react';
import { generateQuiz } from '../lib/gemini';
import { toast } from 'sonner';

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newQuizSubject, setNewQuizSubject] = useState('');
  const [newQuizDifficulty, setNewQuizDifficulty] = useState('medium');
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    try {
      const headers = { 'x-user-id': user.uid };
      const [qRes, rRes] = await Promise.all([
        fetch('/api/quizzes', { headers }),
        fetch('/api/results', { headers })
      ]);
      
      if (qRes.ok) {
        const allQuizzes = await qRes.json();
        setQuizzes(allQuizzes.filter((q: any) => q.createdBy === user.uid));
      }
      if (rRes.ok) setResults(await rRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizSubject || !user) return;
    
    setCreating(true);
    try {
      const questions = await generateQuiz(newQuizSubject, newQuizDifficulty);
      
      const quizData = {
        id: `quiz-${Date.now()}`,
        title: `${newQuizSubject} Quiz`,
        subject: newQuizSubject,
        difficulty: newQuizDifficulty,
        questions: questions,
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      };
      
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify(quizData),
      });

      if (res.ok) {
        toast.success("Quiz created successfully!");
        setNewQuizSubject('');
        fetchData();
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Quiz with AI</h2>
        <form onSubmit={handleCreateQuiz} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Subject / Topic</label>
            <input
              type="text"
              required
              value={newQuizSubject}
              onChange={(e) => setNewQuizSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="e.g. Photosynthesis, World War 2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select
              value={newQuizDifficulty}
              onChange={(e) => setNewQuizDifficulty(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
          >
            {creating ? 'Generating...' : (
              <>
                <PlusCircle className="w-5 h-5 mr-2" />
                Generate Quiz
              </>
            )}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Quizzes</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const quizResults = results.filter(r => r.quizId === quiz.id);
            const avgScore = quizResults.length > 0 
              ? (quizResults.reduce((acc, curr) => acc + curr.score, 0) / quizResults.length).toFixed(1)
              : 'N/A';

            return (
              <div key={quiz.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 truncate mb-2">{quiz.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">Difficulty: {quiz.difficulty}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {quizResults.length} attempts
                    </div>
                    <div>
                      Avg Score: <span className="font-bold">{avgScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {quizzes.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">You haven't created any quizzes yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
