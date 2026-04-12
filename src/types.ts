export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'low';
  dueDate?: number;
  createdAt: number;
  userId: string;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  subjects: string[];
  dailyGoalMinutes: number;
  createdAt: number;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  total: number;
  date: number;
  type: 'quiz' | 'assignment' | 'exam';
}

export interface Progress {
  id: string;
  studentId: string;
  subject: string;
  completedTasks: number;
  totalTasks: number;
  studyMinutes: number;
  lastUpdated: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: number;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  time: number; // Timestamp for when the reminder should trigger
  completed: boolean;
  createdAt: number;
}
