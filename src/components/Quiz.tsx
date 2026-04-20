import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw, Loader2, Sparkles, Timer, User, BookOpen, Trophy } from 'lucide-react';
import { generateQuiz } from '@/src/lib/gemini';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function Quiz() {
  const { user, profile } = useAuth();
  const [subject, setSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'advance'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let timer: any;
    if (questions.length > 0 && !showResults && !isAnswered && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleConfirmAnswer();
    }
    return () => clearInterval(timer);
  }, [questions, showResults, isAnswered, timeLeft]);

  const handleStartQuiz = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setIsLoading(true);
    try {
      const quizData = await generateQuiz(subject, difficulty);
      setQuestions(quizData);
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResults(false);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } catch (error: any) {
      console.error("Quiz Error:", error);
      toast.error(`Failed to generate quiz: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleConfirmAnswer = () => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const saveQuizResult = async (finalScore: number) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'results'), {
        quizId: `ai-${Date.now()}`,
        studentId: user.uid,
        studentName: user.displayName,
        score: finalScore,
        totalQuestions: questions.length,
        subject: subject,
        completedAt: Date.now()
      });
      toast.success('Your progress has been saved!');
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setShowResults(true);
      saveQuizResult(score);
    }
  };

  const handleReset = () => {
    setQuestions([]);
    setSubject('');
    setShowResults(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-3xl border-2 border-dashed border-primary/20"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-black tracking-tight text-foreground uppercase">Analyzing Curriculum</p>
          <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">
            Gemini is synthesizing high-quality assessment material for <span className="text-primary font-bold">{subject}</span>
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Card className="glass border-none shadow-none overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-primary to-purple-500" />
          <CardHeader className="text-center pt-10">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 rotate-3">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight">AI Quiz Forge</CardTitle>
            <CardDescription className="font-medium text-base mt-2">
              Generate custom assessments on any topic in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Domain</Label>
                {profile?.subjects && profile.subjects.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-auto p-0 text-[10px] font-bold text-primary"
                    onClick={() => {
                      setIsCustomSubject(!isCustomSubject);
                      setSubject('');
                    }}
                  >
                    {isCustomSubject ? 'Use My Courses' : 'Custom Topic'}
                  </Button>
                )}
              </div>
              
              {profile?.subjects && profile.subjects.length > 0 && !isCustomSubject ? (
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="h-14 rounded-2xl bg-background/50 border-border font-bold text-base">
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profile.subjects.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input 
                  id="subject"
                  placeholder="e.g. Quantum Physics, React Development..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
                  className="h-14 rounded-2xl bg-background/50 border-border font-bold text-base px-6 focus:ring-primary/20"
                />
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cognitive Challenge</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['easy', 'medium', 'hard', 'advance'] as const).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={difficulty === level ? 'default' : 'outline'}
                    className={`capitalize font-bold h-11 rounded-xl transition-all ${
                      difficulty === level 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => setDifficulty(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-95" 
              onClick={handleStartQuiz}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ignite Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-2xl mx-auto py-10">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="glass border-none shadow-none overflow-hidden relative text-center">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
            <CardHeader className="pt-10">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-4xl font-black tracking-tight">Analysis Complete</CardTitle>
              <CardDescription className="text-lg font-medium">Performance Metrics for {subject}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-background/50 border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Accuracy</p>
                  <p className="text-4xl font-black text-primary">{percentage.toFixed(0)}%</p>
                </div>
                <div className="p-6 rounded-3xl bg-background/50 border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Score</p>
                  <p className="text-4xl font-black text-foreground">{score}/{questions.length}</p>
                </div>
              </div>
              
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-2">
                <p className="text-xl font-bold italic">
                  {percentage >= 80 ? 'Exceptional Mastery!' : percentage >= 60 ? 'Commendable Progress!' : 'Operational Deficit Detected.'}
                </p>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {percentage >= 80 
                    ? 'You have demonstrated a high level of conceptual understanding in this domain.' 
                    : 'A focused review of the explanations is recommended to solidify your knowledge base.'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4 p-8 pt-0">
              <Button className="flex-1 h-12 rounded-2xl font-bold" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Change Topic
              </Button>
              <Button className="flex-1 h-12 bg-primary hover:bg-primary/90 rounded-2xl font-bold shadow-lg shadow-primary/20" onClick={handleStartQuiz}>
                Re-take Assessment
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">{subject}</h2>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-none">
                {difficulty} Level
              </Badge>
              <div className="h-4 w-[1px] bg-border" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Question {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-card px-6 py-3 rounded-2xl shadow-sm border border-border/50">
            <div className={`flex items-center gap-2 font-mono text-xl font-black ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
              <Timer className="w-5 h-5" />
              {timeLeft < 10 ? `0${timeLeft}` : timeLeft}:00
            </div>
          </div>
        </div>

        <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="glass border-none shadow-none p-2 sm:p-6 overflow-hidden">
            <CardHeader className="pt-4">
              <CardTitle className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = isAnswered && option === currentQuestion.correctAnswer;
                  const isWrong = isAnswered && isSelected && option !== currentQuestion.correctAnswer;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isAnswered}
                      className={`group w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between relative overflow-hidden ${
                        isCorrect ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' :
                        isWrong ? 'border-destructive bg-destructive/5 text-destructive shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]' :
                        isSelected ? 'border-primary bg-primary/5 text-primary' :
                        'border-border/50 hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                          isCorrect ? 'bg-emerald-500 text-white' :
                          isWrong ? 'bg-destructive text-white' :
                          isSelected ? 'bg-primary text-white' :
                          'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="font-bold text-base sm:text-lg">{option}</span>
                      </div>
                      
                      <div className="relative z-10">
                        {isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                        {isWrong && <XCircle className="w-6 h-6 text-destructive" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-8 overflow-hidden"
                  >
                    <div className="p-6 bg-muted/50 rounded-3xl border border-border/50 space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Brain className="w-4 h-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Technician Insight</p>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-foreground/80">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter className="p-8 pt-4">
              {!isAnswered ? (
                <Button 
                  className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-95" 
                  disabled={!selectedAnswer}
                  onClick={handleConfirmAnswer}
                >
                  Verify Logic
                </Button>
              ) : (
                <Button 
                  className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-95" 
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Compute Final Score' : 'Next Transmission'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
