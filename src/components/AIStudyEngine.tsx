import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Sparkles, Send, Loader2, BookOpen, Search, Lightbulb, MessageSquare } from 'lucide-react';
import { getStudyHelp } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

export default function AIStudyEngine() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await getStudyHelp(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response || "I couldn't process that request." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Brain className="w-10 h-10 text-primary" />
          AI Study Engine
        </h1>
        <p className="text-muted-foreground font-medium mt-1">Your personal smart assistant for complex study topics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Suggested Prompts</h3>
          <div className="space-y-2">
            {[
              "Explain Quantum Entanglement simply",
              "Summarize the French Revolution",
              "Help me solve 2x + 5 = 15",
              "Mnemonic for periodic table"
            ].map((p, i) => (
              <Button 
                key={i} 
                variant="ghost" 
                className="w-full justify-start text-xs font-bold text-left py-4 h-auto rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                onClick={() => setQuery(p)}
              >
                <Lightbulb className="w-3 h-3 mr-2" />
                {p}
              </Button>
            ))}
          </div>
        </div>

        <Card className="md:col-span-3 glass border-none rounded-3xl overflow-hidden flex flex-col min-h-[500px]">
          <CardHeader className="border-b border-border/50 bg-background/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <CardTitle className="text-sm font-black uppercase tracking-widest">Chat with Study Assistant</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-50">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  <p className="font-bold">How can I help you study today?</p>
                  <p className="text-xs">Type a question or select a prompt to begin.</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl font-medium text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-card border border-border rounded-tl-none'
                    }`}>
                      <div className="markdown-body">
                        <Markdown>{m.content}</Markdown>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-muted p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs font-bold animate-pulse">Assistant is thinking...</span>
                  </div>
                </motion.div>
              ) }
            </AnimatePresence>
          </CardContent>
          <CardFooter className="p-4 bg-background/30 border-t border-border/50">
            <div className="flex w-full gap-3">
              <Input 
                placeholder="Type your study question..." 
                className="py-6 bg-background rounded-xl border-border focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              />
              <Button 
                onClick={handleAsk} 
                disabled={loading || !query.trim()}
                className="h-auto px-6 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
