import React, { useState } from 'react';
import { UserProfile } from '@/src/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileProps {
  profile: UserProfile | null;
  onUpdate: (profile: Partial<UserProfile>) => void;
}

export default function Profile({ profile, onUpdate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.displayName || '');
  const [subjects, setSubjects] = useState<string[]>(profile?.subjects || []);
  const [newSubject, setNewSubject] = useState('');
  const [dailyGoal, setDailyGoal] = useState(profile?.dailyGoalMinutes || 120);

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  const handleSave = () => {
    onUpdate({
      displayName: name,
      subjects,
      dailyGoalMinutes: dailyGoal,
    });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  if (!isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Your personal study preferences and goals.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Full Name</p>
                <p className="text-lg">{profile?.displayName || 'Not set'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Email Address</p>
                <p className="text-lg">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">Preferred Subjects</p>
              <div className="flex flex-wrap gap-2">
                {profile?.subjects && profile.subjects.length > 0 ? (
                  profile.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary" className="px-3 py-1">
                      {subject}
                    </Badge>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No subjects added yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Daily Study Goal</p>
              <p className="text-lg font-semibold text-indigo-600">
                {profile?.dailyGoalMinutes || 0} minutes / day
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your information and study goals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Subjects</Label>
            <div className="flex gap-2">
              <Input 
                value={newSubject} 
                onChange={(e) => setNewSubject(e.target.value)} 
                placeholder="Add a subject (e.g. Physics)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
              />
              <Button type="button" size="icon" onClick={handleAddSubject}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {subjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                  {subject}
                  <button 
                    onClick={() => handleRemoveSubject(subject)}
                    className="hover:bg-slate-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Daily Study Goal (minutes)</Label>
            <Input 
              id="goal" 
              type="number" 
              value={dailyGoal} 
              onChange={(e) => setDailyGoal(parseInt(e.target.value) || 0)} 
            />
            <p className="text-xs text-slate-500">Set a realistic goal to stay motivated!</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
