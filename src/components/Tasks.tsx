import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  userId: string;
  createdAt: number;
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/tasks', {
        headers: { 'x-user-id': user.uid }
      });
      if (res.ok) {
        setTasks(await res.json());
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const addTask = async () => {
    if (!user) return;
    if (!newTask.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newTask,
          completed: false,
          priority: priority,
          userId: user.uid,
          createdAt: Date.now()
        }),
      });
      if (res.ok) {
        setNewTask('');
        toast.success('Task added!');
        fetchTasks();
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Task deleted');
        fetchTasks();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const priorityStyles = {
    high: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
          Tasks
        </h1>
        <p className="text-muted-foreground font-medium mt-1">Stay on top of your assignments and goals.</p>
      </div>

      <Card className="glass border-none shadow-none overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <Input 
                placeholder="What needs to be done?" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className="py-6 bg-background/50 border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="px-4 py-3 bg-background/50 border border-border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <Button 
                className="rounded-2xl h-full px-6 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all" 
                onClick={addTask}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.sort((a, b) => Number(a.completed) - Number(b.completed)).map((task) => (
            <motion.div 
              key={task.id} 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`group flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${
                task.completed 
                  ? 'bg-muted/30 border-border/50 opacity-60' 
                  : 'glass border-border/50 hover:border-primary/30 shadow-none hover:shadow-xl hover:shadow-primary/5'
              }`}
            >
              <div className="flex items-center gap-5">
                <button 
                  onClick={() => toggleTask(task.id, task.completed)} 
                  className={`transition-all duration-300 transform active:scale-90 ${
                    task.completed ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5px]" />
                  ) : (
                    <Circle className="w-7 h-7 stroke-[2px]" />
                  )}
                </button>
                <div>
                  <p className={`text-base font-bold transition-all ${
                    task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}>
                    {task.text}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                        <Calendar className="w-3 h-3" /> Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all" 
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="text-center py-20 glass rounded-3xl">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black">All caught up!</h3>
          <p className="text-muted-foreground font-medium mt-2">You've completed all your tasks. Time to relax!</p>
        </div>
      )}
    </div>
  );
}
