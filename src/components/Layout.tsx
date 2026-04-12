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
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationCenter from './NotificationCenter';

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
    { id: 'ai', icon: MessageSquare, label: 'AI' },
    { id: 'quiz', icon: GraduationCap, label: 'Quiz' },
    { id: 'analytics', icon: BarChart3, label: 'Stats' },
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
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            SmartStudent
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <Separator className="mb-4" />
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName || 'Student'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
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
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  SmartStudent
                </h1>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      activeTab === item.id 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-6 mt-auto">
                <Separator className="mb-6" />
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.photoURL} />
                    <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold truncate">{user?.displayName || 'Student'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-center text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-14 lg:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-9 w-9" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-base lg:text-lg font-bold capitalize truncate text-slate-800">
              {activeTab === 'dashboard' ? 'SmartStudent' : activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <NotificationCenter 
              notifications={notifications} 
              onMarkAsRead={onMarkAsRead} 
              onClearAll={onClearAll} 
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden h-9 w-9"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex h-9"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Avatar className="w-8 h-8 hidden lg:flex">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8fafc] pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-40 pb-safe">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'fill-indigo-50' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1.5 w-1 h-1 bg-indigo-600 rounded-full"
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
