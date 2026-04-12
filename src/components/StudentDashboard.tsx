import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress as UIProgress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { BookOpen, Trophy, Clock, TrendingUp, CheckSquare } from 'lucide-react';
import { Grade, Progress as StudentProgress } from '@/src/types';

interface StudentDashboardProps {
  user: any;
  grades: Grade[];
  progress: StudentProgress[];
}

export default function StudentDashboard({ user, grades, progress }: StudentDashboardProps) {
  const averageGrade = grades.length > 0 
    ? (grades.reduce((acc, g) => acc + (g.score / g.total), 0) / grades.length * 100).toFixed(1)
    : 0;

  const totalStudyMinutes = progress.reduce((acc, p) => acc + p.studyMinutes, 0);

  const chartData = grades.map(g => ({
    name: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: (g.score / g.total) * 100,
    subject: g.subject
  })).sort((a, b) => a.name.localeCompare(b.name));

  const progressData = progress.map(p => ({
    name: p.subject,
    percentage: (p.completedTasks / p.totalTasks) * 100
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.displayName}. Here's your academic overview.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-100">
            Term: Spring 2026
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">GPA Equivalent</p>
                <p className="text-2xl font-bold">{(Number(averageGrade) / 25).toFixed(2)}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+0.2 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Avg. Score</p>
                <p className="text-2xl font-bold">{averageGrade}%</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <UIProgress value={Number(averageGrade)} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Study Time</p>
                <p className="text-2xl font-bold">{Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Across all subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Tasks Done</p>
                <p className="text-2xl font-bold">
                  {progress.reduce((acc, p) => acc + p.completedTasks, 0)}/{progress.reduce((acc, p) => acc + p.totalTasks, 0)}
                </p>
              </div>
              <div className="p-2 bg-pink-50 rounded-lg">
                <CheckSquare className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            <div className="mt-4">
              <UIProgress 
                value={(progress.reduce((acc, p) => acc + p.completedTasks, 0) / Math.max(1, progress.reduce((acc, p) => acc + p.totalTasks, 0))) * 100} 
                className="h-1" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grade Performance</CardTitle>
            <CardDescription>Your scores over time across all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
            <CardDescription>Completion percentage by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grades.slice(-5).reverse().map((grade) => (
              <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    grade.type === 'exam' ? 'bg-red-50 text-red-600' :
                    grade.type === 'quiz' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{grade.subject}</p>
                    <p className="text-xs text-slate-500 capitalize">{grade.type} • {new Date(grade.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{grade.score}/{grade.total}</p>
                  <p className="text-xs text-slate-400">{((grade.score / grade.total) * 100).toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
