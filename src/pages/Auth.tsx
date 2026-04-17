import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password }
        : { email, password, displayName, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Google login is disabled in 'Direct' mode. Please use Email/Password.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <motion.div 
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40"
          >
            <GraduationCap className="h-10 w-10" />
          </motion.div>
        </div>
        <h2 className="mt-8 text-center text-4xl font-black tracking-tight text-foreground">
          {isLogin ? 'Welcome Back' : 'Join SmartStudent'}
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
          {isLogin ? 'Sign in to continue your journey' : 'Start your journey to academic excellence'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass py-10 px-4 sm:rounded-3xl sm:px-10 border-none">
          {/* Toggle */}
          <div className="flex p-1 bg-muted rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                isLogin ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                !isLogin ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {error && (
                <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-destructive rounded-full animate-ping" />
                  {error}
                </div>
              )}
              
              <form onSubmit={handleAuth} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Email address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Select Your Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex items-center justify-center px-4 py-3 border-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                          role === 'student'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-border text-muted-foreground bg-transparent hover:border-primary/30'
                        }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('teacher')}
                        className={`flex items-center justify-center px-4 py-3 border-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                          role === 'teacher'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-border text-muted-foreground bg-transparent hover:border-primary/30'
                        }`}
                      >
                        Teacher
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </div>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-transparent text-muted-foreground font-bold uppercase tracking-widest">Or continue with</span>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  {isLogin && (
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">
                        Register as (for new Google users)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setRole('student')}
                          className={`flex items-center justify-center px-4 py-3 border-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                            role === 'student'
                              ? 'border-primary text-primary bg-primary/5'
                              : 'border-border text-muted-foreground bg-transparent hover:border-primary/30'
                          }`}
                        >
                          Student
                        </button>
                        <button
                          onClick={() => setRole('teacher')}
                          className={`flex items-center justify-center px-4 py-3 border-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                            role === 'teacher'
                              ? 'border-primary text-primary bg-primary/5'
                              : 'border-border text-muted-foreground bg-transparent hover:border-primary/30'
                          }`}
                        >
                          Teacher
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    variant="outline"
                    className="w-full py-6 rounded-2xl text-sm font-bold border-2 border-border hover:bg-accent hover:border-primary/30 transition-all active:scale-95"
                  >
                    <Chrome className="w-5 h-5 mr-3 text-primary" />
                    Continue with Google
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
