import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, TrendingUp, Users, ChevronRight, Crown } from 'lucide-react';
import axios from 'axios';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const resp = await axios.get('/api/analytics/leaderboard');
        setData(resp.data.leaderboard);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const topThree = data.slice(0, 3);
  const remaining = data.slice(3);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-500/10 rounded-full border border-brand-500/20 text-brand-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
          <Star size={14} fill="currentColor" />
          Global Rankings
          <Star size={14} fill="currentColor" />
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Elite Communicators</h1>
        <p className="text-slate-400 text-lg">Top performers mastering the art of Group Discussion.</p>
      </header>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="order-2 md:order-1 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-slate-400/20 border-2 border-slate-400 flex items-center justify-center text-4xl font-black text-slate-400">
                {topThree[1].name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-900 px-3 py-1 rounded-full text-xs font-black">2ND</div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{topThree[1].name}</h3>
            <p className="text-brand-400 font-black tracking-widest text-xs">{Math.round(topThree[1].score * 100)} PTS</p>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="relative mb-8 scale-125">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce">
                <Crown size={40} fill="currentColor" />
              </div>
              <div className="w-28 h-28 rounded-full bg-yellow-500/20 border-4 border-yellow-500 flex items-center justify-center text-5xl font-black text-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                {topThree[0].name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-900 px-4 py-1 rounded-full text-xs font-black shadow-lg">1ST</div>
            </div>
            <h3 className="text-2xl font-black text-white mb-1">{topThree[0].name}</h3>
            <p className="text-brand-400 font-black tracking-widest text-sm">{Math.round(topThree[0].score * 100)} PTS</p>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="order-3 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-amber-700/20 border-2 border-amber-700 flex items-center justify-center text-3xl font-black text-amber-700">
                {topThree[2].name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-white px-3 py-1 rounded-full text-xs font-black">3RD</div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{topThree[2].name}</h3>
            <p className="text-brand-400 font-black tracking-widest text-xs">{Math.round(topThree[2].score * 100)} PTS</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-strong rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <div className="flex gap-12 ml-4">
            <span>Rank</span>
            <span>Communicator</span>
          </div>
          <div className="flex gap-16 mr-12 text-right">
            <span>Sessions</span>
            <span>Score</span>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {remaining.length > 0 ? remaining.map((u, i) => (
            <div key={i} className="flex items-center justify-between p-6 hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-12 ml-4">
                <span className="text-slate-500 font-black w-4">{i + 4}</span>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-dark-900 rounded-full flex items-center justify-center text-brand-500 font-bold group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    {u.name.charAt(0)}
                  </div>
                  <span className="text-white font-bold">{u.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-16 mr-8">
                <div className="text-right w-16">
                  <span className="text-slate-400 text-sm font-medium">{u.sessions}</span>
                </div>
                <div className="text-right w-20">
                  <span className="text-brand-400 font-black">{Math.round(u.score * 100)}</span>
                </div>
                <ChevronRight size={18} className="text-slate-700 group-hover:text-brand-500 transition-colors" />
              </div>
            </div>
          )) : (
            <div className="p-20 text-center">
              <Trophy size={48} className="mx-auto text-slate-800 mb-4" />
              <p className="text-slate-500 font-medium italic">Join more sessions to climb the ranks!</p>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Banner */}
      <div className="bg-brand-500/10 border border-brand-500/30 p-8 rounded-[2rem] flex items-center justify-between overflow-hidden relative group">
        <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <Award size={200} />
        </div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="p-4 bg-brand-500 rounded-2xl shadow-xl shadow-brand-500/20">
            <TrendingUp size={32} className="text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-1">Climb the Leaderboard</h4>
            <p className="text-slate-400 text-sm">Consistent participation and high relevance scores boost your ranking.</p>
          </div>
        </div>
        <button className="relative z-10 px-8 py-3 bg-brand-500 text-white rounded-xl font-black text-sm hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30">
          View Achievements
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
