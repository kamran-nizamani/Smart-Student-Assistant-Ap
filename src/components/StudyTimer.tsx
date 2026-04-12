import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Timer, Coffee, Brain } from 'lucide-react';
import { toast } from 'sonner';

export default function StudyTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          handleTimerComplete();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    const nextMode = mode === 'study' ? 'break' : 'study';
    setMode(nextMode);
    setMinutes(nextMode === 'study' ? 25 : 5);
    setSeconds(0);
    
    toast(mode === 'study' ? 'Time for a break!' : 'Back to work!', {
      description: mode === 'study' ? "You've completed a focus session." : "Let's get back to studying.",
      icon: mode === 'study' ? <Coffee className="w-4 h-4" /> : <Brain className="w-4 h-4" />,
    });

    // Browser notification if supported
    if (Notification.permission === "granted") {
      new Notification(mode === 'study' ? "Study Session Complete!" : "Break Over!", {
        body: mode === 'study' ? "Take a 5-minute break." : "Time to focus again.",
      });
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'study' ? 25 : 5);
    setSeconds(0);
  };

  const progress = ((mode === 'study' ? 25 * 60 : 5 * 60) - (minutes * 60 + seconds)) / (mode === 'study' ? 25 * 60 : 5 * 60) * 100;

  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-2xl ${mode === 'study' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
            {mode === 'study' ? <Timer className="w-8 h-8" /> : <Coffee className="w-8 h-8" />}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          {mode === 'study' ? 'Focus Session' : 'Short Break'}
        </CardTitle>
        <CardDescription>
          {mode === 'study' ? 'Concentrate on your studies' : 'Relax and recharge'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-4">
        <div className="text-center">
          <div className="text-7xl font-mono font-bold tracking-tighter text-slate-900 mb-2">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <Progress value={progress} className={`h-2 ${mode === 'study' ? 'bg-indigo-100' : 'bg-green-100'}`} />
        </div>

        <div className="flex gap-4">
          <Button 
            className={`flex-1 h-12 text-lg font-semibold ${
              mode === 'study' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={toggleTimer}
          >
            {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12" onClick={resetTimer}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant={mode === 'study' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => { setMode('study'); resetTimer(); }}
            className="text-xs"
          >
            Pomodoro (25m)
          </Button>
          <Button 
            variant={mode === 'break' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => { setMode('break'); resetTimer(); }}
            className="text-xs"
          >
            Short Break (5m)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
