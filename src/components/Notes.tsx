import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Plus, Search, Trash2, Edit3, Calendar, X, Sparkles, Brain, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { summarizeNote, generateQuizFromNote } from '../lib/gemini';
import Markdown from 'react-markdown';

interface Note {
  id: string;
  title: string;
  content: string;
  date: number;
  tags: string[];
  userId: string;
}

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const fetchNotes = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notes', {
        headers: { 'x-user-id': user.uid }
      });
      if (res.ok) {
        setNotes(await res.json());
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const handleAddNote = async () => {
    if (!user) return;
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          date: Date.now(),
          tags: [],
          userId: user.uid
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setIsAdding(false);
        toast.success('Note added!');
        fetchNotes();
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Note deleted');
        fetchNotes();
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleSummarize = async (note: Note) => {
    setAiLoading(note.id);
    try {
      const result = await summarizeNote(note.title, note.content);
      setSummary(result || "Error generating summary.");
    } catch (error) {
      toast.error("AI could not summarize this note.");
    } finally {
      setAiLoading(null);
    }
  };

  const handleGenerateQuiz = async (note: Note) => {
    setAiLoading(note.id);
    try {
      const quizQuestions = await generateQuizFromNote(note.title, note.content);
      // For this demo, we'll store it as a system quiz in db.json
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Quiz: ${note.title}`,
          subject: note.tags[0] || "General",
          difficulty: "medium",
          questions: quizQuestions,
          createdBy: user?.uid,
          createdAt: new Date().toISOString()
        }),
      });

      if (res.ok) {
        toast.success('AI Quiz generated based on this note!');
      }
    } catch (error) {
      toast.error("AI could not generate a quiz.");
    } finally {
      setAiLoading(null);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Study Notes
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Capture and organize your study materials.</p>
        </div>
        <Button 
          className="rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all" 
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search notes..." 
          className="pl-10 py-6 bg-card/50 border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <Card className="w-full max-w-2xl glass border-none shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">AI Summary</CardTitle>
                      <CardDescription>Synthesized key points from your note.</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSummary(null)} className="rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto p-6">
                <div className="markdown-body">
                  <Markdown>{summary}</Markdown>
                </div>
              </CardContent>
              <CardFooter className="bg-background/30 p-4 flex justify-end">
                <Button onClick={() => setSummary(null)} className="rounded-xl font-bold">Close Summary</Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <Card className="w-full max-w-lg glass border-none shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-black">Create Note</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Title</label>
                  <Input 
                    placeholder="Note title" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="py-6 bg-background/50 border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Content</label>
                  <textarea 
                    className="w-full min-h-[150px] p-4 bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                    placeholder="Write your thoughts..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-6 px-6 flex gap-3">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="flex-1 rounded-xl font-bold">Cancel</Button>
                <Button onClick={handleAddNote} className="flex-1 py-6 rounded-xl font-bold text-base shadow-xl shadow-primary/20">Save Note</Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="glass border-none card-hover overflow-hidden h-full flex flex-col relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-black group-hover:text-primary transition-colors line-clamp-1">
                      {note.title}
                    </CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" 
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium line-clamp-4 leading-relaxed">
                    {note.content}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 flex flex-col gap-2">
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 active:scale-95 transition-all border-primary/20"
                      onClick={() => handleSummarize(note)}
                      disabled={!!aiLoading}
                    >
                      {aiLoading === note.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                      Summarize
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-purple-600 hover:bg-purple-50 active:scale-95 transition-all border-purple-200"
                      onClick={() => handleGenerateQuiz(note)}
                      disabled={!!aiLoading}
                    >
                      {aiLoading === note.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3 mr-1.5" />}
                      Generate Quiz
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted w-full">
                    <Edit3 className="w-3 h-3 mr-2" />
                    Edit Note
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-3xl">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
            <StickyNote className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black">No notes yet</h3>
          <p className="text-muted-foreground font-medium mt-2">Start capturing your study materials today!</p>
        </div>
      )}
    </div>
  );
}
