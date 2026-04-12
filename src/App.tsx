/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Layout from './components/Layout';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Quiz from './components/Quiz';
import StudyTimer from './components/StudyTimer';
import Notes from './components/Notes';
import Tasks from './components/Tasks';
import Weather from './components/Weather';
import Settings from './components/Settings';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import { UserProfile, UserRole, Grade, Progress, Notification } from './types';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      userId: '1',
      title: 'Welcome!',
      message: 'Welcome to your Smart Student Assistant.',
      type: 'info',
      read: false,
      createdAt: Date.now(),
    }
  ]);

  // Mock data for student
  const mockGrades: Grade[] = [
    { id: '1', studentId: '1', subject: 'Mathematics', score: 85, total: 100, date: Date.now() - 86400000 * 5, type: 'quiz' },
    { id: '2', studentId: '1', subject: 'Computer Science', score: 92, total: 100, date: Date.now() - 86400000 * 3, type: 'assignment' },
    { id: '3', studentId: '1', subject: 'Physics', score: 78, total: 100, date: Date.now() - 86400000 * 1, type: 'exam' },
  ];

  const mockProgress: Progress[] = [
    { id: '1', studentId: '1', subject: 'Mathematics', completedTasks: 8, totalTasks: 10, studyMinutes: 450, lastUpdated: Date.now() },
    { id: '2', studentId: '1', subject: 'Computer Science', completedTasks: 12, totalTasks: 15, studyMinutes: 600, lastUpdated: Date.now() },
    { id: '3', studentId: '1', subject: 'Physics', completedTasks: 5, totalTasks: 12, studyMinutes: 300, lastUpdated: Date.now() },
  ];

  const handleLogin = (email: string, name: string, role: UserRole) => {
    setUser({
      uid: Math.random().toString(36).substr(2, 9),
      email: email,
      displayName: name,
      role: role,
      subjects: role === 'student' ? ['Mathematics', 'Computer Science', 'Physics'] : [],
      dailyGoalMinutes: 120,
      createdAt: Date.now(),
    });
    setIsLoggedIn(true);
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Auth onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (user?.role === 'teacher') return <TeacherDashboard />;
        if (user?.role === 'admin') return <AdminDashboard />;
        return <StudentDashboard user={user} grades={mockGrades} progress={mockProgress} />;
      case 'profile':
        return <Profile profile={user} onUpdate={handleUpdateProfile} />;
      case 'notes':
        return <Notes />;
      case 'tasks':
        return <Tasks />;
      case 'weather':
        return <Weather />;
      case 'settings':
        return <Settings />;
      case 'quiz':
        return <Quiz />;
      case 'timer':
        return <StudyTimer />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <p className="text-lg font-medium">{activeTab} feature coming soon!</p>
          </div>
        );
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={handleLogout}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onClearAll={handleClearAll}
    >
      {renderContent()}
      <Toaster />
    </Layout>
  );
}
