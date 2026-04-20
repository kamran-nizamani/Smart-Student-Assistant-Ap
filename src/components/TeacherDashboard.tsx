import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Brain,
  Trash2,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { collection, query, where, onSnapshot, addDoc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingGrades: 0,
    classAverage: 0
  });
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [newAsgn, setNewAsgn] = useState({ title: '', subject: '', dueDate: '', totalPoints: 100 });
  const [newQuiz, setNewQuiz] = useState({ 
    title: '', 
    subject: '', 
    difficulty: 'Medium', 
    questions: [{ question: '', options: ['', '', '', ''], answer: 0 }] 
  });

  useEffect(() => {
    if (!user) return;

    // Fetch all students (needed for lookup)
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    let studentsCached: any[] = [];
    const unsubscribeStudents = onSnapshot(qStudents, (snapshot) => {
      studentsCached = [];
      snapshot.forEach(doc => studentsCached.push({ uid: doc.id, ...doc.data() }));
      setStats(prev => ({ ...prev, totalStudents: studentsCached.length }));
    });

    // Teacher's Quizzes
    const qQuizzes = query(collection(db, 'quizzes'), where('createdBy', '==', user.uid));
    const unsubscribeQuizzes = onSnapshot(qQuizzes, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setQuizzes(list.sort((a, b) => b.createdAt - a.createdAt));
    });

    // Teacher's Assignments
    const qAsgn = query(collection(db, 'assignments'), where('teacherId', '==', user.uid));
    const unsubscribeAsgn = onSnapshot(qAsgn, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setAssignments(list.sort((a, b) => b.createdAt - a.createdAt));
    });

    // All Results for this teacher's quizzes
    const qResults = query(collection(db, 'results'), where('teacherId', '==', user.uid));
    const unsubscribeResults = onSnapshot(qResults, (snapshot) => {
      const allResults: any[] = [];
      snapshot.forEach(doc => allResults.push({ id: doc.id, ...doc.data() }));
      
      const totalScore = allResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0);
      const avg = allResults.length > 0 ? (totalScore / allResults.length) * 100 : 0;
      setStats(prev => ({ ...prev, classAverage: Math.round(avg) }));
      
      updateFeed(allResults, submissionsCached, studentsCached);
    });

    // Submissions for teacher
    const qSub = query(collection(db, 'submissions'), where('teacherId', '==', user.uid));
    let submissionsCached: any[] = [];
    const unsubscribeSub = onSnapshot(qSub, (snapshot) => {
      submissionsCached = [];
      snapshot.forEach(doc => submissionsCached.push({ id: doc.id, ...doc.data() }));
      
      const pending = submissionsCached.filter(s => s.status === 'submitted').length;
      setStats(prev => ({ ...prev, pendingGrades: pending }));
      
      // Update data for feed
      // Note: In real app, we might want to consolidate this.
      setLoading(false);
    });

    const updateFeed = (results: any[], submissions: any[], students: any[]) => {
      const quizFeed = results.map(r => {
        const student = students.find(s => s.uid === r.studentId);
        return {
          id: r.id,
          type: 'quiz',
          student: student?.displayName || 'Student',
          assignment: r.subject || 'Quiz',
          rawTime: r.completedAt,
          time: new Date(r.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          score: r.score,
          total: r.totalQuestions
        };
      });

      const asgnFeed = submissions.map(s => {
        const student = students.find(st => st.uid === s.studentId);
        return {
          id: s.id,
          type: 'assignment',
          student: student?.displayName || 'Student',
          assignment: s.assignmentTitle || 'Assignment',
          rawTime: s.submittedAt,
          time: new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          score: s.score || 0,
          total: 100
        };
      });

      const combined = [...quizFeed, ...asgnFeed].sort((a, b) => b.rawTime - a.rawTime);
      setRecentSubmissions(combined.slice(0, 8));
    };

    return () => {
      unsubscribeStudents();
      unsubscribeQuizzes();
      unsubscribeAsgn();
      unsubscribeResults();
      unsubscribeSub();
    };
  }, [user]);

  const handleAddAssignment = async () => {
    if (!newAsgn.title || !newAsgn.subject) {
      toast.error("Please fill in title and subject");
      return;
    }

    try {
      await addDoc(collection(db, 'assignments'), {
        ...newAsgn,
        teacherId: user?.uid,
        status: 'published',
        createdAt: Date.now()
      });

      toast.success("Assignment published!");
      setIsAddingAssignment(false);
      setNewAsgn({ title: '', subject: '', dueDate: '', totalPoints: 100 });
    } catch (error) {
      console.error(error);
      toast.error("Failed to add assignment");
    }
  };

  const handleAddQuiz = async () => {
    if (!newQuiz.title || !newQuiz.subject) {
      toast.error("Please fill in title and subject");
      return;
    }

    if (newQuiz.questions.some(q => !q.question || q.options.some(opt => !opt))) {
      toast.error("Please fill in all questions and options");
      return;
    }

    try {
      await addDoc(collection(db, 'quizzes'), {
        ...newQuiz,
        createdBy: user?.uid,
        createdAt: Date.now()
      });

      toast.success("Custom quiz published!");
      setIsAddingQuiz(false);
      setNewQuiz({ 
        title: '', 
        subject: '', 
        difficulty: 'Medium', 
        questions: [{ question: '', options: ['', '', '', ''], answer: 0 }] 
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to add quiz");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-lg font-black text-muted-foreground uppercase tracking-widest animate-pulse">Classroom Loading</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <GraduationCap className="w-10 h-10 text-primary" />
            Teacher Portal
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Empowering students through organized learning.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="rounded-xl font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white"
            onClick={() => setIsAddingQuiz(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quiz
          </Button>
          <Button 
            className="rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            onClick={() => setIsAddingAssignment(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-none rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Total Students</p>
                <p className="text-3xl font-black">{stats.totalStudents}</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500" />
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Pending Tasks</p>
                <p className="text-3xl font-black">{stats.pendingGrades}</p>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Class Average</p>
                <p className="text-3xl font-black">{stats.classAverage}%</p>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="quizzes" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-2xl mb-6">
              <TabsTrigger value="quizzes" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transform transition-all active:scale-95">Quizzes</TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transform transition-all active:scale-95">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="quizzes" className="space-y-4">
              <Card className="glass border-none rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-black">Managed Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  {quizzes.length > 0 ? (
                    <div className="space-y-4">
                      {quizzes.map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between p-5 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Brain className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-base">{quiz.title}</h4>
                              <div className="flex items-center gap-3 mt-1 underline-offset-4">
                                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">{quiz.difficulty}</Badge>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 tracking-wider">
                                  <FileText className="w-3.5 h-3.5" /> {quiz.questions.length} Questions
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto text-muted-foreground/30">
                        <Brain className="w-10 h-10" />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground">No curriculum quizzes created</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <Card className="glass border-none rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-black">General Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignments.map((asgn) => (
                        <div key={asgn.id} className="p-5 rounded-3xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                          </div>
                          <h4 className="font-black text-lg mb-1">{asgn.title}</h4>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{asgn.subject}</p>
                          <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest pt-4 border-t border-border/30">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> {asgn.dueDate || 'No Limit'}
                            </span>
                            <span>{asgn.totalPoints} PTS</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto text-muted-foreground/30">
                        <BookOpen className="w-10 h-10" />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground">No assignments published yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="glass border-none rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-black">Recent Feed</CardTitle>
              <Clock className="w-5 h-5 text-muted-foreground/50" />
            </CardHeader>
            <CardContent>
              {recentSubmissions.length > 0 ? (
                <div className="space-y-5">
                  {recentSubmissions.map((sub) => (
                    <div key={sub.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-all cursor-pointer">
                      <Avatar className="w-10 h-10 border-2 border-background shadow-md">
                        <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">{sub.student.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-black text-foreground truncate">{sub.student}</p>
                          <span className="text-[9px] font-black text-primary px-2 py-0.5 rounded-full bg-primary/10">{sub.score}/{sub.total}</span>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground truncate uppercase tracking-widest mb-2">{sub.assignment}</p>
                        <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{sub.time}</span>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full mt-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">
                    View Classroom Log
                  </Button>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground/30">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No activity log</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Assignment Overlay */}
      {isAddingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg glass border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black">Create Assignment</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsAddingAssignment(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Assignment Title</label>
                <Input 
                  placeholder="e.g. History Analysis" 
                  value={newAsgn.title}
                  onChange={(e) => setNewAsgn({...newAsgn, title: e.target.value})}
                  className="py-6 bg-background/30 border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Subject</label>
                  <Input 
                    placeholder="e.g. History" 
                    value={newAsgn.subject}
                    onChange={(e) => setNewAsgn({...newAsgn, subject: e.target.value})}
                    className="py-6 bg-background/30 border-border rounded-2xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Due Date</label>
                  <Input 
                    type="date"
                    value={newAsgn.dueDate}
                    onChange={(e) => setNewAsgn({...newAsgn, dueDate: e.target.value})}
                    className="py-6 bg-background/30 border-border rounded-2xl font-bold h-12"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-2 flex gap-3">
              <Button variant="ghost" onClick={() => setIsAddingAssignment(false)} className="flex-1 rounded-2xl font-black uppercase text-xs">Cancel</Button>
              <Button onClick={handleAddAssignment} className="flex-1 py-7 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30">Publish</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {isAddingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-2xl glass border-none shadow-2xl rounded-[2.5rem] overflow-hidden max-h-[90vh] flex flex-col">
            <CardHeader className="pb-4 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black italic">Curriculum Forge</CardTitle>
                  <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Create Custom Assessment</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsAddingQuiz(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Quiz Title</label>
                  <Input 
                    placeholder="e.g. Quantum Physics 101" 
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                    className="py-6 bg-background/30 border-border rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Subject</label>
                  <Input 
                    placeholder="e.g. Science" 
                    value={newQuiz.subject}
                    onChange={(e) => setNewQuiz({...newQuiz, subject: e.target.value})}
                    className="py-6 bg-background/30 border-border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest">Question Set</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg font-black text-[10px] uppercase tracking-widest border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => setNewQuiz({
                      ...newQuiz,
                      questions: [...newQuiz.questions, { question: '', options: ['', '', '', ''], answer: 0 }]
                    })}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Question
                  </Button>
                </div>

                {newQuiz.questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-5 rounded-2xl bg-muted/30 border border-border/30 space-y-4 relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        const qs = [...newQuiz.questions];
                        qs.splice(qIndex, 1);
                        setNewQuiz({ ...newQuiz, questions: qs });
                      }}
                      className="absolute top-2 right-2 h-8 w-8 text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      disabled={newQuiz.questions.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Question {qIndex + 1}</label>
                      <Input 
                        placeholder="Type your question..."
                        value={q.question}
                        onChange={(e) => {
                          const qs = [...newQuiz.questions];
                          qs[qIndex].question = e.target.value;
                          setNewQuiz({ ...newQuiz, questions: qs });
                        }}
                        className="bg-background/50 border-none rounded-xl font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <div 
                            onClick={() => {
                              const qs = [...newQuiz.questions];
                              qs[qIndex].answer = optIndex;
                              setNewQuiz({ ...newQuiz, questions: qs });
                            }}
                            className={`w-5 h-5 rounded-full border-2 cursor-pointer flex items-center justify-center shrink-0 transition-all ${q.answer === optIndex ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/30'}`}
                          >
                            {q.answer === optIndex && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <Input 
                            placeholder={`Option ${optIndex + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const qs = [...newQuiz.questions];
                              qs[qIndex].options[optIndex] = e.target.value;
                              setNewQuiz({ ...newQuiz, questions: qs });
                            }}
                            className="bg-background/20 border-border/50 rounded-lg text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-4 shrink-0 border-t border-border/10 flex gap-3">
              <Button variant="ghost" onClick={() => setIsAddingQuiz(false)} className="flex-1 rounded-2xl font-black uppercase text-xs">Discard</Button>
              <Button onClick={handleAddQuiz} className="flex-1 py-7 rounded-2xl font-black uppercase tracking-widest text-xs bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 text-white">Publish Exam</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
