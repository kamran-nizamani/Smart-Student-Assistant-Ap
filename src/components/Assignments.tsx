import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  Send, 
  Upload, 
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  totalPoints: number;
  teacherId: string;
  status: 'published' | 'closed';
  createdAt: number;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: number;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    if (!user) return;

    // All active assignments
    const qAsgn = query(collection(db, 'assignments'), where('status', '==', 'published'));
    const unsubscribeAsgn = onSnapshot(qAsgn, (snapshot) => {
      const list: Assignment[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Assignment));
      setAssignments(list.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });

    // Student's submissions
    const qSub = query(collection(db, 'submissions'), where('studentId', '==', user.uid));
    const unsubscribeSub = onSnapshot(qSub, (snapshot) => {
      const list: Submission[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Submission));
      setSubmissions(list);
    });

    return () => {
      unsubscribeAsgn();
      unsubscribeSub();
    };
  }, [user]);

  const handleSubmit = async (asgn: Assignment) => {
    if (!submissionText.trim()) {
      toast.error("Please write your submission content");
      return;
    }

    try {
      await addDoc(collection(db, 'submissions'), {
        assignmentId: asgn.id,
        studentId: user?.uid,
        content: submissionText,
        status: 'submitted',
        submittedAt: Date.now(),
        teacherId: asgn.teacherId, // Denormalize for easy teacher lookup
        assignmentTitle: asgn.title // Denormalize for easy display
      });

      toast.success("Assignment submitted successfully!");
      setSubmittingId(null);
      setSubmissionText('');
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit assignment");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Assignments</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
          <BookOpen className="w-10 h-10 text-primary" />
          Assignments
        </h1>
        <p className="text-muted-foreground font-medium mt-1">Submit your work and review expert feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.length > 0 ? (
          assignments.map((asgn) => {
            const submission = submissions.find(s => s.assignmentId === asgn.id);
            return (
              <motion.div
                key={asgn.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`glass border-none rounded-[2rem] overflow-hidden transition-all duration-300 ${submission ? 'opacity-80' : 'hover:shadow-2xl hover:shadow-primary/5'}`}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-4">
                        <FileText className="w-6 h-6" />
                      </div>
                      <Badge variant={submission ? "default" : "outline"} className={`rounded-xl px-4 py-1 font-black uppercase text-[10px] tracking-widest ${submission ? 'bg-emerald-500 text-white' : ''}`}>
                        {submission ? (submission.status === 'graded' ? 'Graded' : 'Submitted') : 'Pending'}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-black">{asgn.title}</CardTitle>
                    <CardDescription className="text-xs font-black uppercase tracking-[0.2em]">{asgn.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm py-4 border-y border-border/30">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="font-bold">Due: {asgn.dueDate || 'Flexible'}</span>
                      </div>
                      <div className="font-black text-primary">
                        {asgn.totalPoints} POINTS
                      </div>
                    </div>

                    {submission ? (
                      <div className="p-4 bg-background/50 rounded-2xl border border-border/50">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">My Submission</p>
                        <p className="text-sm font-medium line-clamp-3 italic opacity-70 mb-4">{submission.content}</p>
                        {submission.status === 'graded' && (
                          <div className="pt-4 border-t border-border/30 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Teacher Feedback</span>
                              <Badge className="bg-emerald-500 font-black">{submission.score}%</Badge>
                            </div>
                            <p className="text-sm font-bold bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-emerald-700">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-2">
                        {submittingId === asgn.id ? (
                          <div className="space-y-4 animate-in slide-in-from-top-2">
                            <Textarea 
                              placeholder="Type or paste your assignment work here..."
                              className="min-h-[150px] rounded-2xl bg-background/30 border-border focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                              value={submissionText}
                              onChange={(e) => setSubmissionText(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => setSubmittingId(null)}>Cancel</Button>
                              <Button className="flex-1 rounded-xl font-bold" onClick={() => handleSubmit(asgn)}>Submit Work</Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/10"
                            onClick={() => setSubmittingId(asgn.id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Start Submission
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-2 py-20 text-center glass rounded-[3rem]">
            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground/30 mx-auto mb-6">
              <BookOpen className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black">No Assignments Found</h3>
            <p className="text-muted-foreground font-medium mt-2">Check back later for work from your teacher.</p>
          </div>
        )}
      </div>
    </div>
  );
}
