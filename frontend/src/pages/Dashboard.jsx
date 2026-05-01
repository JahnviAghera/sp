import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Users, Clock, Plus, BarChart3, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

const Dashboard = () => {
  // Mock data for UI presentation
  const stats = [
    { label: 'Total Sessions', value: '24', icon: Mic, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Avg. Score', value: '86', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Time Spoken', value: '4h 12m', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Connections', value: '18', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  const activeRooms = [
    { id: '1', title: 'Tech Interview Prep', topic: 'Software Engineering', participants: 4, max: 6, isPrivate: false },
    { id: '2', title: 'MBA GD Practice', topic: 'Business Strategy', participants: 6, max: 8, isPrivate: false },
  ];

  const recentActivity = [
    { id: '1', title: 'Consulting Case Interview', date: '2 hours ago', score: 88, role: 'Participant' },
    { id: '2', title: 'Product Management GD', date: 'Yesterday', score: 92, role: 'Moderator' },
    { id: '3', title: 'System Design Discussion', date: '3 days ago', score: 78, role: 'Participant' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your progress overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Plus}>Join Room</Button>
          <Button icon={Plus}>Create Room</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card p-6 animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Rooms */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Rooms
              </h2>
              <Link to="/rooms" className="text-sm font-medium text-brand-400 hover:text-brand-300">View All</Link>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {activeRooms.map((room) => (
                <div key={room.id} className="card-interactive p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="brand">{room.topic}</Badge>
                    <span className="text-xs font-medium text-slate-500 bg-dark-800 px-2.5 py-1 rounded-md">
                      {room.participants}/{room.max}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{room.title}</h3>
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                    <div className="flex -space-x-2">
                      <Avatar size="sm" alt="U1" className="ring-2 ring-surface-raised" />
                      <Avatar size="sm" alt="U2" className="ring-2 ring-surface-raised" />
                      <Avatar size="sm" alt="U3" className="ring-2 ring-surface-raised" />
                    </div>
                    <span className="text-xs text-slate-400 ml-2">Active now</span>
                  </div>
                </div>
              ))}
              
              <div className="card-interactive p-6 flex flex-col items-center justify-center text-center h-full border-dashed border-white/20 hover:border-brand-500/50 bg-transparent">
                <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-3">
                  <Plus className="text-brand-400" size={24} />
                </div>
                <h3 className="text-white font-medium mb-1">Start a new topic</h3>
                <p className="text-xs text-slate-400">Create a room and invite others</p>
              </div>
            </div>
          </section>

          {/* Performance Chart Placeholder */}
          <section className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-purple-400" size={20} />
                Performance Trend
              </h2>
            </div>
            <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
              {/* Fake chart bars */}
              {[40, 55, 45, 70, 65, 80, 75, 88, 82, 95].map((height, i) => (
                <div key={i} className="w-full bg-dark-800 rounded-t-md relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-md transition-all duration-500 group-hover:from-purple-500 group-hover:to-cyan-400"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-4 px-2">
              <span>Past 10 Sessions</span>
              <span>Recent</span>
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          
          {/* Recent Activity */}
          <section className="card p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="text-brand-400" size={20} />
              Recent History
            </h2>
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={activity.id} className="relative pl-6">
                  {/* Timeline line */}
                  {i !== recentActivity.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-[-24px] w-px bg-white/10" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-[19px] h-[19px] rounded-full bg-dark-900 border-2 border-brand-500" />
                  
                  <div className="mb-1">
                    <h4 className="text-sm font-semibold text-white">{activity.title}</h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-400">{activity.date} • {activity.role}</p>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {activity.score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-sm">
              View All History
            </Button>
          </section>

          {/* AI Tip */}
          <section className="glass-strong p-6 rounded-2xl border-brand-500/30 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/20 rounded-full blur-xl" />
            <h3 className="text-sm font-bold text-brand-300 mb-2 uppercase tracking-wider">AI Insight</h3>
            <p className="text-sm text-slate-300 leading-relaxed relative z-10">
              You've improved your pacing! In your last session, you spoke at an average of 140 WPM, which is right in the sweet spot for maximum clarity. Keep it up!
            </p>
          </section>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
