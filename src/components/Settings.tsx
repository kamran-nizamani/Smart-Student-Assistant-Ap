import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Moon, Smartphone, Download, Shield, User, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        toast.success("Installation started!");
      }
    } else {
      // If no prompt is available, it's likely because we're in an iframe or already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone) {
        toast.info("App is already installed and running as a native app!");
      } else {
        toast.error("Installation prompt not ready.", {
          description: "Please make sure you are opening the app in Google Chrome (not inside the AI Studio preview) to enable direct installation.",
          duration: 6000,
        });
      }
    }
  };

  const copyAppUrl = () => {
    const url = "https://ais-dev-h3wwgyppdoaev6qkxid3vo-549229097871.asia-east1.run.app";
    navigator.clipboard.writeText(url);
    toast.success("App URL copied! Paste this into your Chrome browser.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500">Manage your app preferences and account.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              Native App Experience
            </CardTitle>
            <CardDescription>Make this app feel like a real Android application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-indigo-900">Direct Installation</p>
                  <p className="text-sm text-indigo-700">Click to add to your home screen.</p>
                </div>
                <Button onClick={handleInstallClick} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
              </div>
              
              <Separator className="bg-indigo-200/50" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-indigo-900 text-sm">Copy App Link</p>
                  <p className="text-xs text-indigo-700">Open this in Chrome to enable install.</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyAppUrl} className="border-indigo-200 text-indigo-600 hover:bg-indigo-100">
                  Copy URL
                </Button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-3">
              <p className="text-sm font-bold text-amber-900 flex items-center gap-2">
                ⚠️ If the button above doesn't work:
              </p>
              <div className="space-y-3 text-xs text-amber-800">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                  <p>Open this app in <strong>Chrome</strong> (not inside the preview chat).</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                  <p>Tap the <strong>three dots (⋮)</strong> at the top right of Chrome.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                  <p>Look for <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-slate-500">Receive alerts for study timers and tasks.</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Study Reminders</Label>
                <p className="text-sm text-slate-500">Get notified when it's time to study.</p>
              </div>
              <Switch checked={true} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-slate-500">Switch to a darker theme for night study.</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              Account Privacy Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
