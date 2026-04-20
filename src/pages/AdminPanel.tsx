import React, { useEffect, useState } from 'react';
import { Trash2, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  useEffect(() => {
    // All users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setUsers(list);
      setLoading(false);
    });

    // All quizzes
    const unsubscribeQuizzes = onSnapshot(collection(db, 'quizzes'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setQuizzes(list);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeQuizzes();
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success("User role updated");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      toast.success("Quiz deleted");
      setDeletingQuizId(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Users</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 truncate">{user.email}</p>
                  <p className="text-sm text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Quizzes</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 truncate">{quiz.title}</p>
                  <p className="text-sm text-gray-500">Subject: {quiz.subject} | Difficulty: {quiz.difficulty}</p>
                </div>
                <div className="flex items-center gap-2">
                  {deletingQuizId === quiz.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeletingQuizId(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingQuizId(quiz.id)}
                      className="text-red-600 hover:text-red-900 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
            {quizzes.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">No quizzes found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
