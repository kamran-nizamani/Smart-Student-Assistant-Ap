import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  Plus, 
  MoreVertical,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingGrades: 0,
    classAverage: 0
  });
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const headers = { 'x-user-id': user.uid };
        const [usersRes, quizzesRes, resultsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/quizzes', { headers }),
          fetch('/api/results')
        ]);

        let students: any[] = [];
        if (usersRes.ok) {
          const allUsers = await usersRes.ok ? await usersRes.json() : [];
          students = allUsers.filter((u: any) => u.role === 'student');
          setStats(prev => ({ ...prev, totalStudents: students.length }));
        }

        if (quizzesRes.ok) {
          const allQuizzes = await quizzesRes.json();
          setQuizzes(allQuizzes.filter((q: any) => q.createdBy === user.uid));
        }

        if (resultsRes.ok) {
          const allResults = await resultsRes.json();
          // Map results to include student names
          const resultsData = allResults.slice(0, 5).map((r: any) => {
            const student = students.find(s => s.uid === r.studentId);
            return {
              id: r.id,
              student: student?.displayName || 'Unknown Student',
              assignment: r.subject || 'Quiz',
              time: new Date(r.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'completed',
              score: r.score,
              total: r.totalQuestions
            };
          });
          setRecentSubmissions(resultsData);

          const totalScore = allResults.reduce((acc: number, curr: any) => acc + (curr.score / curr.totalQuestions), 0);
          const avg = allResults.length > 0 ? (totalScore / allResults.length) * 100 : 0;
          setStats(prev => ({ ...prev, classAverage: Math.round(avg) }));
        }

      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-lg font-medium text-slate-600">Loading teacher dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teacher Portal</h1>
          <p className="text-slate-500">Manage your classes, grade assignments, and track student performance.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Grades</p>
                <p className="text-3xl font-bold">{stats.pendingGrades}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Class Average</p>
                <p className="text-3xl font-bold">{stats.classAverage}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Quizzes</CardTitle>
                <CardDescription>Quizzes you have created for your students</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search quizzes..." className="pl-9 w-[200px] h-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {quizzes.length > 0 ? (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                          {quiz.subject.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{quiz.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px]">{quiz.difficulty}</Badge>
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {quiz.questions.length} Questions
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                    <GraduationCap className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">No quizzes created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest quiz results from students</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length > 0 ? (
                <div className="space-y-6">
                  {recentSubmissions.map((sub) => (
                    <div key={sub.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{sub.student.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{sub.student}</p>
                        <p className="text-xs text-slate-500 truncate">{sub.assignment}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-400">{sub.time}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {sub.score}/{sub.total}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">No recent submissions</p>
                </div>
              )}
              {recentSubmissions.length > 0 && (
                <Button variant="ghost" className="w-full mt-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  View All Submissions
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
