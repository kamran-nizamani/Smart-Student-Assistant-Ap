import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, StickyNote, CheckSquare, Brain, ArrowRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface SearchResult {
  type: 'note' | 'task' | 'quiz';
  id: string;
  title: string;
  sub?: string;
}

interface GlobalSearchProps {
  onNavigate: (tab: string) => void;
  onClose?: () => void;
}

export default function GlobalSearch({ onNavigate, onClose }: GlobalSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          headers: { 'x-user-id': user?.uid || '' }
        });
        if (res.ok) {
          setResults(await res.json());
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'note': return <StickyNote className="w-4 h-4 text-blue-500" />;
      case 'task': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'quiz': return <Brain className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          className="pl-12 py-7 bg-card border-border rounded-2xl shadow-xl focus:ring-4 focus:ring-primary/10 transition-all text-lg font-bold"
          placeholder="Search all notes, tasks, and quizzes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-muted-foreground" />}
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-16 left-0 right-0 z-[60] mt-2 overflow-hidden"
          >
            <Card className="glass border-none shadow-2xl rounded-3xl p-2 max-h-[400px] overflow-y-auto">
              <CardContent className="p-0">
                <div className="flex flex-col gap-1">
                  {results.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 transition-all text-left group active:scale-[0.99]"
                      onClick={() => {
                        onNavigate(res.type === 'quiz' ? 'Quizzes' : (res.type === 'note' ? 'Notes' : 'Tasks'));
                        onClose?.();
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {getIcon(res.type)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{res.title}</p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{res.sub || res.type}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
