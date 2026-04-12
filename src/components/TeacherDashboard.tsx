import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  Plus, 
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TeacherDashboard() {
  const classes = [
    { name: 'Advanced Mathematics', students: 24, avgGrade: 88, assignments: 12 },
    { name: 'Computer Science 101', students: 32, avgGrade: 82, assignments: 8 },
    { name: 'Physics II', students: 18, avgGrade: 79, assignments: 15 },
  ];

  const recentSubmissions = [
    { student: 'Alice Johnson', assignment: 'Calculus Quiz 3', time: '2 mins ago', status: 'pending' },
    { student: 'Bob Smith', assignment: 'Final Project Draft', time: '15 mins ago', status: 'graded' },
    { student: 'Charlie Brown', assignment: 'Lab Report 4', time: '1 hour ago', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teacher Portal</h1>
          <p className="text-slate-500">Manage your classes, grade assignments, and track student performance.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold">74</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Grades</p>
                <p className="text-3xl font-bold">18</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Class Average</p>
                <p className="text-3xl font-bold">83%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Classes</CardTitle>
                <CardDescription>Overview of your active teaching groups</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search classes..." className="pl-9 w-[200px] h-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classes.map((cls, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        {cls.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{cls.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {cls.students} Students
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {cls.assignments} Assignments
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600">{cls.avgGrade}%</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Avg. Grade</p>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest work from your students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentSubmissions.map((sub, idx) => (
                  <div key={idx} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{sub.student.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{sub.student}</p>
                      <p className="text-xs text-slate-500 truncate">{sub.assignment}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">{sub.time}</span>
                        <Badge variant={sub.status === 'pending' ? 'outline' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                View All Submissions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
