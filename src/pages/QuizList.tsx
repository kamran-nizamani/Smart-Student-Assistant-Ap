import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlayCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const headers = { 'x-user-id': user.uid };
        
        const [quizzesRes, resultsRes] = await Promise.all([
          fetch('/api/quizzes', { headers }),
          fetch('/api/results', { headers })
        ]);

        if (quizzesRes.ok) setQuizzes(await quizzesRes.json());
        if (resultsRes.ok) setResults(await resultsRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  const getResultForQuiz = (quizId: string) => {
    return results.find(r => r.quizId === quizId);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Available Quizzes</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => {
          const result = getResultForQuiz(quiz.id);
          return (
            <div key={quiz.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{quiz.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Subject: {quiz.subject}</p>
                <p className="text-sm text-gray-500 mb-6">{quiz.questions.length} Questions</p>
                
                {result ? (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      Score: {result.score}/{result.totalQuestions}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Start Quiz
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No quizzes available yet. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
