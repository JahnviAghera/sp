import React from 'react';
import { BarChart3, TrendingUp, Mic, Clock, BrainCircuit, Activity } from 'lucide-react';
import Badge from '../components/ui/Badge';

const AnalyticsPage = () => {
  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Performance Analytics</h1>
        <p className="text-slate-400">Deep dive into your speaking metrics and AI feedback.</p>
      </div>

      {/* Highlights */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-strong p-6 rounded-2xl border-brand-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-500/10 rounded-full blur-xl" />
          <h3 className="text-sm font-semibold text-slate-400 mb-1">Overall Score</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">86</span>
            <span className="text-sm font-medium text-emerald-400 mb-1 flex items-center">
              <TrendingUp size={14} className="mr-1" /> +4%
            </span>
          </div>
        </div>
        
        <div className="glass-strong p-6 rounded-2xl border-purple-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl" />
          <h3 className="text-sm font-semibold text-slate-400 mb-1">Pacing (WPM)</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">142</span>
            <span className="text-sm font-medium text-slate-400 mb-1">Optimal</span>
          </div>
        </div>
        
        <div className="glass-strong p-6 rounded-2xl border-cyan-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl" />
          <h3 className="text-sm font-semibold text-slate-400 mb-1">Filler Words</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">12</span>
            <span className="text-sm font-medium text-amber-400 mb-1">per session</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-brand-400" /> Score History
            </h3>
            <select className="bg-dark-800 border border-white/10 rounded-lg px-3 py-1 text-sm text-slate-300 outline-none">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
            </select>
          </div>
          <div className="h-64 w-full flex items-end justify-between gap-3 px-2">
            {[65, 59, 80, 81, 56, 55, 40, 88, 92, 86].map((h, i) => (
              <div key={i} className="w-full flex flex-col justify-end group">
                <div className="opacity-0 group-hover:opacity-100 text-[10px] text-center text-brand-300 mb-1 transition-opacity">
                  {h}
                </div>
                <div 
                  className="w-full bg-brand-500/20 hover:bg-brand-500/50 rounded-t-sm transition-all"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BrainCircuit size={18} className="text-purple-400" /> AI Insights
          </h3>
          
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-emerald-400 font-semibold mb-1 text-sm">Strengths</h4>
              <p className="text-slate-300 text-sm">Your articulation is excellent and you maintain a consistent volume throughout discussions.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-amber-400 font-semibold mb-1 text-sm">Areas for Improvement</h4>
              <p className="text-slate-300 text-sm">You frequently use "um" and "like" during transitions. Try pausing silently instead of using filler words.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <h4 className="text-cyan-400 font-semibold mb-1 text-sm">Vocabulary Usage</h4>
              <p className="text-slate-300 text-sm">Good use of domain-specific terms. Could expand on active verbs when describing your experiences.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
