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
import { UserProfile, Grade, Progress, Notification } from './types';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from './contexts/AuthContext';
import { toast } from 'sonner';

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
  const [progress, setProgress] = useState<Progress[]>([]);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  const fetchData = async () => {
    if (!user) return;
    try {
      const headers = { 'x-user-id': user.uid };
      
      const [notifsRes, gradesRes] = await Promise.all([
        fetch('/api/notifications', { headers }),
        fetch('/api/results', { headers })
      ]);

      if (notifsRes.ok) setNotifications(await notifsRes.json());
      if (gradesRes.ok) {
        const results = await gradesRes.json();
        setGrades(results.map((r: any) => ({
          id: r.id,
          studentId: r.studentId,
          subject: r.subject || 'Quiz',
          score: r.score,
          total: r.totalQuestions,
          date: new Date(r.completedAt).getTime(),
          type: 'quiz'
        })));
      }
    } catch (error) {
      console.error("Error fetching app data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s for "real-time" feel
    return () => clearInterval(interval);
  }, [user]);

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user/${user.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success("Profile updated");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    // Mock implementation for direct mode
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = async () => {
    setNotifications([]);
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

