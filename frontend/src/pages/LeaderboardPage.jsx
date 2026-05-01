import React, { useState } from 'react';
import { Trophy, Medal, Star, Flame, ChevronUp, ChevronDown } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

const LeaderboardPage = () => {
  const [timeframe, setTimeframe] = useState('weekly');

  const topUsers = [
    { rank: 1, name: 'Alex Johnson', score: 9850, change: 1, streak: 12, role: 'Pro' },
    { rank: 2, name: 'Sarah Chen', score: 9420, change: 0, streak: 8, role: 'Pro' },
    { rank: 3, name: 'Michael Smith', score: 8900, change: -1, streak: 5, role: 'Basic' },
    { rank: 4, name: 'Emma Davis', score: 8450, change: 2, streak: 15, role: 'Pro' },
    { rank: 5, name: 'James Wilson', score: 8100, change: 1, streak: 3, role: 'Basic' },
    { rank: 6, name: 'You', score: 7850, change: 4, streak: 7, role: 'Basic', isCurrentUser: true },
    { rank: 7, name: 'David Lee', score: 7600, change: -2, streak: 2, role: 'Basic' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Leaderboard</h1>
          <p className="text-slate-400">See how you stack up against the best speakers.</p>
        </div>
        
        <div className="bg-dark-800 p-1 rounded-xl flex gap-1 border border-white/5">
          <button 
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeframe === 'weekly' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeframe === 'all-time' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setTimeframe('all-time')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-2 md:gap-6 pt-12 pb-8">
        {/* 2nd Place */}
        <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative mb-4">
            <Avatar size="xl" alt={topUsers[1].name} className="ring-4 ring-slate-300" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">2</div>
          </div>
          <div className="text-center w-24 md:w-32 glass-strong border-t-4 border-slate-300 p-4 rounded-t-xl h-32 flex flex-col justify-end">
            <p className="font-bold text-white text-sm truncate w-full">{topUsers[1].name}</p>
            <p className="text-brand-300 font-mono font-bold mt-1">{topUsers[1].score}</p>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center animate-slide-up relative z-10">
          <Trophy size={32} className="text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          <div className="relative mb-4">
            <Avatar size="xl" className="w-20 h-20 ring-4 ring-amber-400" alt={topUsers[0].name} />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">1</div>
          </div>
          <div className="text-center w-28 md:w-40 bg-gradient-to-t from-brand-900/50 to-amber-900/20 border-t-4 border-amber-400 p-4 rounded-t-xl h-40 flex flex-col justify-end shadow-glow">
            <p className="font-bold text-white truncate w-full">{topUsers[0].name}</p>
            <p className="text-amber-400 font-mono font-bold text-lg mt-1">{topUsers[0].score}</p>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative mb-4">
            <Avatar size="xl" alt={topUsers[2].name} className="ring-4 ring-amber-700" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">3</div>
          </div>
          <div className="text-center w-24 md:w-32 glass-strong border-t-4 border-amber-700 p-4 rounded-t-xl h-24 flex flex-col justify-end">
            <p className="font-bold text-white text-sm truncate w-full">{topUsers[2].name}</p>
            <p className="text-brand-300 font-mono font-bold mt-1">{topUsers[2].score}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white/5 hidden md:grid">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">Speaker</div>
          <div className="col-span-2 text-center">Streak</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-2 text-right pr-4">Score</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {topUsers.slice(3).map((user, idx) => (
            <div 
              key={user.name} 
              className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                user.isCurrentUser ? 'bg-brand-500/10 border-l-4 border-brand-500' : 'hover:bg-white/5'
              }`}
            >
              <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-2">
                <span className="font-bold text-slate-400">{user.rank}</span>
                {user.change > 0 && <ChevronUp size={16} className="text-emerald-400" />}
                {user.change < 0 && <ChevronDown size={16} className="text-red-400" />}
                {user.change === 0 && <span className="w-4 flex justify-center text-slate-600">-</span>}
              </div>
              
              <div className="col-span-7 md:col-span-5 flex items-center gap-3">
                <Avatar alt={user.name} size="sm" />
                <div>
                  <p className={`font-semibold text-sm ${user.isCurrentUser ? 'text-brand-400' : 'text-slate-200'}`}>
                    {user.name}
                  </p>
                </div>
              </div>
              
              <div className="col-span-3 md:col-span-2 hidden md:flex items-center justify-center gap-1 text-slate-300 text-sm">
                <Flame size={16} className="text-orange-500" />
                {user.streak}
              </div>
              
              <div className="col-span-3 md:col-span-2 hidden md:flex items-center justify-center">
                <Badge variant={user.role === 'Pro' ? 'brand' : 'neutral'}>{user.role}</Badge>
              </div>
              
              <div className="col-span-3 md:col-span-2 text-right pr-4 font-mono font-bold text-brand-300">
                {user.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
