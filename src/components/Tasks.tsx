import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Complete Math Assignment', completed: false, priority: 'high', dueDate: '2026-04-15' },
    { id: '2', text: 'Read History Chapter 4', completed: true, priority: 'medium', dueDate: '2026-04-12' }
  ]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTask,
      completed: false,
      priority: priority
    };
    setTasks([...tasks, task]);
    setNewTask('');
    toast.success('Task added!');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Task deleted');
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">To-Do List</h1>
        <p className="text-slate-500">Stay on top of your assignments and goals.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input 
                placeholder="What needs to be done?" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
            </div>
            <select 
              className="px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={addTask}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {tasks.sort((a, b) => Number(a.completed) - Number(b.completed)).map((task) => (
          <div 
            key={task.id} 
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <button onClick={() => toggleTask(task.id)} className="text-indigo-600">
                {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </button>
              <div>
                <p className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 capitalize ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {task.dueDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => deleteTask(task.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
