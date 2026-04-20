import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle, XCircle, User, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function QuizTaking() {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setQuiz({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Quiz not found");
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };
    fetchQuiz();
  }, [quizId, navigate]);

  useEffect(() => {
    if (!quiz || isFinished || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, isFinished, isAnswered, currentQuestion]);

  const saveFinalResult = async (finalScore: number) => {
    if (!user || !quiz) return;
    try {
      await addDoc(collection(db, 'results'), {
        quizId: quiz.id,
        teacherId: quiz.createdBy, // Store teacherId for teacher access
        studentId: user.uid,
        studentName: user.displayName,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        subject: quiz.subject,
        completedAt: Date.now()
      });
      toast.success("Quiz result saved!");
    } catch (error) {
      console.error("Error saving result:", error);
      toast.error("Failed to save quiz result");
    }
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === quiz.questions[currentQuestion].correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(30);
      } else {
        setIsFinished(true);
        saveFinalResult(newScore);
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    setIsAnswered(true);
    const newScore = score; // Fixed potential score issue in timeup
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(30);
      } else {
        setIsFinished(true);
        saveFinalResult(newScore);
      }
    }, 2000);
  };

  if (!quiz) return <div className="flex justify-center items-center h-screen">Loading quiz...</div>;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Quiz Complete!</h2>
          <p className="text-lg text-gray-600 mb-6">
            You scored {score} out of {quiz.questions.length}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Student</p>
                <p className="text-sm font-bold text-slate-900">{user?.displayName || 'Student'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Course</p>
                <p className="text-sm font-bold text-slate-900">{quiz.subject}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <div className={`flex items-center ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-bold text-lg">{timeLeft}s</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correctAnswer;
              
              let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";
              
              if (!isAnswered) {
                buttonClass += "border-gray-200 hover:border-indigo-500 hover:bg-indigo-50";
              } else {
                if (isCorrect) {
                  buttonClass += "border-green-500 bg-green-50";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50";
                } else {
                  buttonClass += "border-gray-200 opacity-50";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">{option}</span>
                    {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
