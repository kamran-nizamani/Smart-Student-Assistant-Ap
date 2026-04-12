import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  UserCheck, 
  AlertTriangle,
  Settings,
  Activity,
  Database,
  Globe
} from 'lucide-react';

export default function AdminDashboard() {
  const systemMetrics = [
    { label: 'System Uptime', value: '99.98%', status: 'healthy' },
    { label: 'Active Sessions', value: '1,242', status: 'normal' },
    { label: 'Storage Used', value: '42.5 GB', status: 'warning' },
    { label: 'API Latency', value: '24ms', status: 'healthy' },
  ];

  const recentLogs = [
    { event: 'New User Registration', user: 'sarah.l@edu.com', time: '2 mins ago', type: 'info' },
    { event: 'Failed Login Attempt', user: 'admin_test', time: '12 mins ago', type: 'warning' },
    { event: 'Database Backup Completed', user: 'System', time: '1 hour ago', type: 'success' },
    { event: 'Security Policy Updated', user: 'super_admin', time: '3 hours ago', type: 'info' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            Admin Control Center
          </h1>
          <p className="text-slate-500">System-wide monitoring, user management, and security settings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">System Logs</Button>
          <Button className="bg-red-600 hover:bg-red-700">Security Audit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold">{metric.value}</p>
                <Badge 
                  variant={metric.status === 'healthy' ? 'secondary' : metric.status === 'warning' ? 'destructive' : 'outline'}
                  className="capitalize"
                >
                  {metric.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Monitor and manage user accounts across all roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Students</span>
                  </div>
                  <p className="text-2xl font-bold">8,432</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Teachers</span>
                  </div>
                  <p className="text-2xl font-bold">245</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Admins</span>
                  </div>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs">Add User</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Database className="w-5 h-5" />
                    <span className="text-xs">Backup</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Globe className="w-5 h-5" />
                    <span className="text-xs">Network</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Settings className="w-5 h-5" />
                    <span className="text-xs">Config</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Real-time resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Activity graph visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Security Logs</CardTitle>
            <CardDescription>Recent system-wide events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentLogs.map((log, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${
                    log.type === 'warning' ? 'bg-orange-500' :
                    log.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 leading-none mb-1">{log.event}</p>
                    <p className="text-xs text-slate-500 mb-1">{log.user}</p>
                    <span className="text-[10px] text-slate-400">{log.time}</span>
                  </div>
                  {log.type === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />}
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-slate-600 hover:bg-slate-50">
              View Full Audit Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
