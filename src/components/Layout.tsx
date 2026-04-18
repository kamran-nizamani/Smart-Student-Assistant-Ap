import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  StickyNote, 
  CheckSquare, 
  CloudSun, 
  MessageSquare, 
  BarChart3, 
  Settings,
  LogOut,
  User,
  GraduationCap,
  Menu,
  X,
  Timer,
  Brain,
  Search,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from './GlobalSearch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  notifications: any[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  notifications,
  onMarkAsRead,
  onClearAll
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'timer', icon: Timer, label: 'Timer' },
    { id: 'weather', icon: CloudSun, label: 'Weather' },
    { id: 'ai', icon: MessageSquare, label: 'AI Assistant' },
    { id: 'ai-quiz', icon: Brain, label: 'AI Quiz' },
    { id: 'gpa', icon: Zap, label: 'GPA Tracker' },
    { id: 'quiz', icon: GraduationCap, label: 'Quizzes' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const bottomNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'timer', icon: Timer, label: 'Timer' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              SmartStudent
            </span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="glass rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.displayName?.[0] || <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.displayName || 'Student'}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-9"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-[10px] text-center font-black text-muted-foreground uppercase tracking-[0.2em]">
                Developed by <span className="text-primary">Kamran Nizamani</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-card z-50 lg:hidden flex flex-col shadow-2xl border-r border-border"
            >
              <div className="p-6 flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  SmartStudent
                </h1>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="flex-1 px-4 space-y-1.5">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium transition-all ${
                      activeTab === item.id 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-6 mt-auto">
                <div className="glass rounded-3xl p-5">
                  <div className="flex items-center gap-4 mb-5">
                    <Avatar className="w-12 h-12 border-2 border-background shadow-md">
                      <AvatarImage src={user?.photoURL} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {user?.displayName?.[0] || <User className="w-6 h-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-base font-bold truncate">{user?.displayName || 'Student'}</p>
                      <p className="text-xs text-muted-foreground truncate uppercase tracking-widest font-bold">
                        {user?.role || 'User'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 rounded-2xl h-11 font-bold"
                    onClick={onLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="text-[11px] text-center font-black text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                      Developed by <br/>
                      <span className="text-primary text-xs">Kamran Nizamani</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-14 lg:h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-10 w-10 rounded-xl" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-base lg:text-lg font-bold capitalize truncate text-foreground">
              {activeTab === 'dashboard' ? 'Overview' : activeTab}
            </h2>
          </div>
          <div className="flex-1 max-w-md mx-6 hidden sm:block">
            <Popover>
              <PopoverTrigger className="w-full">
                <div className="flex w-full items-center px-4 justify-start text-muted-foreground font-medium rounded-xl h-9 border border-border/50 bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                  <Search className="w-4 h-4 mr-2" />
                  Search...
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0 border-none shadow-2xl rounded-3xl" align="start">
                <GlobalSearch onNavigate={handleTabChange} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter 
              notifications={notifications} 
              onMarkAsRead={onMarkAsRead} 
              onClearAll={onClearAll} 
            />
            <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden h-10 w-10 rounded-xl"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="hidden sm:flex h-9 rounded-xl font-medium"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Avatar className="w-9 h-9 hidden lg:flex border-2 border-background shadow-sm ml-2">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user?.displayName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 glass rounded-3xl px-2 py-2 flex items-center justify-around z-40 shadow-2xl border border-white/20">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTabMobile"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
