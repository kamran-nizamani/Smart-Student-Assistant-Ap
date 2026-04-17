import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw, Loader2, Sparkles, Timer, User, BookOpen } from 'lucide-react';
import { generateQuiz } from '@/src/lib/gemini';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function Quiz() {
  const { profile } = useAuth();
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
    if (!profile) return;
    
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': profile.uid
        },
        body: JSON.stringify({
          quizId: `ai-${Date.now()}`,
          studentId: profile.uid,
          score: finalScore,
          totalQuestions: questions.length,
          subject: subject,
          completedAt: new Date().toISOString()
        }),
      });
      if (res.ok) {
        toast.success('Your progress has been saved!');
      }
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
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-lg font-medium text-slate-600">Generating your personalized quiz...</p>
        <p className="text-sm text-slate-400 italic">"Gemini is crafting questions just for you"</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl">AI Quiz Generator</CardTitle>
            <CardDescription>
              Select a course or enter a topic, and our AI will generate a custom quiz for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Select Course or Topic</Label>
              {profile?.subjects && profile.subjects.length > 0 && !isCustomSubject ? (
                <div className="space-y-2">
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose one of your courses..." />
                    </SelectTrigger>
                    <SelectContent>
                      {profile.subjects.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs text-indigo-600" 
                    onClick={() => {
                      setIsCustomSubject(true);
                      setSubject('');
                    }}
                  >
                    Enter a custom topic instead
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input 
                    id="subject"
                    placeholder="e.g. Quantum Physics, World War II, React Hooks..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
                  />
                  {profile?.subjects && profile.subjects.length > 0 && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs text-indigo-600" 
                      onClick={() => setIsCustomSubject(false)}
                    >
                      Back to my courses
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Select Difficulty</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['easy', 'medium', 'hard', 'advance'] as const).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={difficulty === level ? 'default' : 'outline'}
                    className="capitalize text-xs h-9"
                    onClick={() => setDifficulty(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleStartQuiz}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
              <CardDescription>Here's how you performed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeDasharray="100, 100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600"
                    strokeDasharray={`${percentage}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{score}/{questions.length}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-semibold">
                  {percentage >= 80 ? 'Excellent Work!' : percentage >= 60 ? 'Good Job!' : 'Keep Studying!'}
                </p>
                <p className="text-slate-500">
                  You got {score} out of {questions.length} questions correct.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button className="flex-1" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Topic
              </Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleStartQuiz}>
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Student</p>
              <p className="text-sm font-bold text-slate-900">{profile?.displayName || 'Student'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Course</p>
              <p className="text-sm font-bold text-slate-900">{subject}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="px-3 py-1">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
          <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
            <Timer className="w-4 h-4" />
            {timeLeft}s
          </div>
        </div>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl leading-tight">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = isAnswered && option === currentQuestion.correctAnswer;
                const isWrong = isAnswered && isSelected && option !== currentQuestion.correctAnswer;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      isCorrect ? 'border-green-500 bg-green-50 text-green-700' :
                      isWrong ? 'border-red-500 bg-red-50 text-red-700' :
                      isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700' :
                      'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {isWrong && <XCircle className="w-5 h-5 text-red-600" />}
                  </button>
                );
              })}

              {isAnswered && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <p className="text-sm font-semibold text-slate-900 mb-1">Explanation:</p>
                  <p className="text-sm text-slate-600">{currentQuestion.explanation}</p>
                </motion.div>
              )}
            </CardContent>
            <CardFooter>
              {!isAnswered ? (
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700" 
                  disabled={!selectedAnswer}
                  onClick={handleConfirmAnswer}
                >
                  Confirm Answer
                </Button>
              ) : (
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleNextQuestion}>
                  {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
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
