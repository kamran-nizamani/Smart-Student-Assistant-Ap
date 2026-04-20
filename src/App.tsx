/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Layout from './components/Layout';
import Profile from './components/Profile';
import Auth from './pages/Auth';
import ErrorBoundary from './components/ErrorBoundary';
import StudyTimer from './components/StudyTimer';
import Notes from './components/Notes';
import Tasks from './components/Tasks';
import Weather from './components/Weather';
import Settings from './components/Settings';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import QuizList from './pages/QuizList';
import TeacherQuizzes from './pages/TeacherQuizzes';
import AdminPanel from './pages/AdminPanel';
import QuizTaking from './pages/QuizTaking';
import Quiz from './components/Quiz';
import AIStudyEngine from './components/AIStudyEngine';
import GPATracker from './components/GPATracker';
import Assignments from './components/Assignments';
import { UserProfile, Grade, Progress, Notification } from './types';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from './contexts/AuthContext';
import { toast } from 'sonner';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './lib/firebase';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-background gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Verifying Identity</p>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

export default function App() {
  const { user, profile, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [realGPAGrades, setRealGPAGrades] = useState<any[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Notifications
    const qNotifs = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const unsubscribeNotifs = onSnapshot(qNotifs, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setNotifications(list.sort((a, b) => b.createdAt - a.createdAt));
    });

    // Quiz Results (Grades)
    const qResults = query(collection(db, 'results'), where('studentId', '==', user.uid));
    const unsubscribeResults = onSnapshot(qResults, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => {
        const r = doc.data();
        list.push({
          id: doc.id,
          studentId: r.studentId,
          subject: r.subject || 'Quiz',
          score: r.score,
          total: r.totalQuestions,
          date: r.completedAt,
          type: 'quiz'
        });
      });
      setGrades(list.sort((a, b) => b.date - a.date));
    });

    // GPA Grades
    const qGrades = query(collection(db, 'grades'), where('userId', '==', user.uid));
    const unsubscribeGrades = onSnapshot(qGrades, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setRealGPAGrades(list.sort((a, b) => b.date - a.date));
    });

    // Progress
    const qProgress = query(collection(db, 'progress'), where('studentId', '==', user.uid));
    const unsubscribeProgress = onSnapshot(qProgress, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setProgress(list);
    });

    return () => {
      unsubscribeNotifs();
      unsubscribeResults();
      unsubscribeGrades();
      unsubscribeProgress();
    };
  }, [user]);

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), updates);
      toast.success("Profile updated");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearAll = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, 'notifications', n.id));
      });
      await batch.commit();
      toast.success("Notifications cleared");
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-background gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Initializing SmartStudent</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (profile?.role === 'teacher') return <TeacherDashboard />;
        if (profile?.role === 'admin') return <AdminDashboard />;
        return (
          <StudentDashboard 
            user={profile} 
            grades={grades} 
            realGPAGrades={realGPAGrades}
            progress={progress} 
            onStartAIQuiz={() => setActiveTab('ai-quiz')}
          />
        );
      case 'profile':
        return <Profile profile={profile as any} onUpdate={handleUpdateProfile} />;
      case 'notes':
        return <Notes />;
      case 'tasks':
        return <Tasks />;
      case 'weather':
        return <Weather />;
      case 'settings':
        return <Settings />;
      case 'quiz':
        if (profile?.role === 'teacher') return <TeacherQuizzes />;
        if (profile?.role === 'admin') return <AdminPanel />;
        return <QuizList />;
      case 'ai-quiz':
        return <Quiz />;
      case 'ai':
        return <AIStudyEngine />;
      case 'assignments':
        return <Assignments />;
      case 'gpa':
        return <GPATracker />;
      case 'timer':
        return <StudyTimer />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary/20 mb-6">
              <GraduationCap className="w-10 h-10" />
            </div>
            <p className="text-xl font-black">{activeTab} coming soon!</p>
            <p className="text-sm font-medium mt-2">We're working hard to bring this feature to life.</p>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Auth />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Auth />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                user={profile as any} 
                onLogout={handleLogout}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearAll}
              >
                {renderContent()}
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/:quizId" 
          element={
            <ProtectedRoute>
              <QuizTaking />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </ErrorBoundary>
  );
}

