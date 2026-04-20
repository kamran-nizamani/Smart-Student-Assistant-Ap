import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { BookOpen, Trophy, Clock, TrendingUp, CheckSquare, GraduationCap, Calendar, Plus, Activity, ChevronRight, Brain } from 'lucide-react';
import { Grade, Progress as StudentProgress } from '../types';
import { motion } from 'motion/react';

interface StudentDashboardProps {
  user: any;
  grades: Grade[];
  realGPAGrades?: any[];
  progress: StudentProgress[];
  onStartAIQuiz?: () => void;
}

export default function StudentDashboard({ user, grades, realGPAGrades = [], progress, onStartAIQuiz }: StudentDashboardProps) {
  const averageGrade = grades.length > 0 
    ? (grades.reduce((acc, g) => acc + (g.score / g.total), 0) / grades.length * 100).toFixed(1)
    : '0';

  const realGPA = realGPAGrades.length > 0
    ? (realGPAGrades.reduce((acc, g) => acc + g.grade, 0) / realGPAGrades.length).toFixed(2)
    : (Number(averageGrade) / 25).toFixed(2);

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

  const COLORS = ['oklch(0.65 0.15 260)', 'oklch(0.6 0.18 280)', 'oklch(0.55 0.2 320)', 'oklch(0.6 0.2 20)', 'oklch(0.7 0.15 40)'];

  const stats = [
    { label: 'GPA Equivalent', value: realGPA, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg. Score', value: `${averageGrade}%`, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Study Time', value: `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tasks Done', value: `${progress.reduce((acc, p) => acc + p.completedTasks, 0)}/${progress.reduce((acc, p) => acc + p.totalTasks, 0)}`, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Welcome back, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Scholar'}</span>!
          </h1>
          <p className="text-muted-foreground font-medium">Here's what's happening with your studies today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl font-bold border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            onClick={onStartAIQuiz}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Quiz
          </Button>
          <Button variant="outline" className="rounded-xl font-bold border-2">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass border-none card-hover overflow-hidden relative group">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${stat.color.replace('text', 'bg')}`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-black">Performance Trend</CardTitle>
            <CardDescription className="font-medium">Your academic trajectory over the last few weeks</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 600 }}
                      domain={[0, 100]}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderRadius: '16px', 
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-soft)',
                        padding: '12px'
                      }}
                      itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                      labelStyle={{ fontWeight: 800, marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="var(--primary)" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 3, stroke: 'var(--card)' }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--primary)' }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold">No performance data yet</p>
                <p className="text-sm">Complete quizzes to see your trend!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-black">Subject Mastery</CardTitle>
            <CardDescription className="font-medium">Completion and proficiency across your curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.length > 0 ? (
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 700 }}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderRadius: '16px', 
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-soft)'
                      }}
                    />
                    <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={24}>
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold">No subject data yet</p>
                <p className="text-sm">Your subject progress will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-none shadow-none overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black">Recent Activity</CardTitle>
            <CardDescription className="font-medium">Your latest quiz results and assignments</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/10 rounded-xl">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {grades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grades.slice(-4).reverse().map((grade) => (
                <div key={grade.id} className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                      grade.type === 'exam' ? 'bg-rose-500/10 text-rose-500' :
                      grade.type === 'quiz' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{grade.subject}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                        {grade.type} • {new Date(grade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary">{grade.score}/{grade.total}</p>
                    <p className="text-[10px] font-black text-muted-foreground">{((grade.score / grade.total) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-bold text-muted-foreground">No recent activity recorded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
