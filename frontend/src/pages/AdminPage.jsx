import React from 'react';
import { Users, AlertTriangle, ShieldCheck, Activity, Trash2, Ban } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const AdminPage = () => {
  const stats = [
    { label: 'Total Users', value: '1,248', icon: Users, color: 'text-brand-400' },
    { label: 'Active Rooms', value: '34', icon: Activity, color: 'text-emerald-400' },
    { label: 'Reports Pending', value: '12', icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'System Health', value: '99.9%', icon: ShieldCheck, color: 'text-purple-400' },
  ];

  const reportedUsers = [
    { id: 1, name: 'John Doe', reason: 'Inappropriate language', date: '2 hrs ago', status: 'Pending' },
    { id: 2, name: 'Jane Smith', reason: 'Spamming', date: '5 hrs ago', status: 'Reviewed' },
    { id: 3, name: 'Anonymous01', reason: 'Harassment', date: '1 day ago', status: 'Pending' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Admin Dashboard</h1>
        <p className="text-slate-400">System overview and moderation controls.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={stat.color} size={20} />
              <span className="text-sm font-medium text-slate-400">{stat.label}</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Moderation Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                Moderation Queue
              </h2>
              <Badge variant="warning">12 Pending</Badge>
            </div>
            
            <div className="divide-y divide-white/5">
              {reportedUsers.map((report) => (
                <div key={report.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200">{report.name}</span>
                      <span className="text-xs text-slate-500">• {report.date}</span>
                    </div>
                    <p className="text-sm text-slate-400"><span className="text-amber-500/80 font-medium">Reason:</span> {report.reason}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" icon={Ban} className="text-red-400 hover:text-red-300 hover:border-red-500/50">Ban</Button>
                    <Button variant="ghost" size="sm">Dismiss</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/5 transition-colors text-sm text-slate-300">
                Clear System Cache
              </button>
              <button className="w-full text-left p-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/5 transition-colors text-sm text-slate-300">
                Restart WebSocket Server
              </button>
              <button className="w-full text-left p-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/5 transition-colors text-sm text-slate-300">
                Generate Analytics Report
              </button>
              <button className="w-full text-left p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm text-red-400 flex items-center justify-between">
                <span>Emergency Stop All Rooms</span>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
