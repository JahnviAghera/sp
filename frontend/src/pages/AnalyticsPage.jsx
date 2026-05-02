import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { Activity, Clock, TrendingUp, Calendar, ChevronRight, BarChart2 } from 'lucide-react';
import axios from 'axios';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const resp = await axios.get('/api/analytics/user');
        setData(resp.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const hasData = data?.history?.length > 0;

  if (!hasData) {
    return (
      <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Performance Dashboard</h1>
          <p className="text-slate-400">Track your growth and master communication skills.</p>
        </header>
        <div className="flex flex-col items-center justify-center py-24 glass-strong rounded-[3rem] border border-dashed border-white/10 text-center space-y-6">
          <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center">
            <BarChart2 size={40} className="text-brand-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">No analytics data yet</h2>
            <p className="text-slate-400 max-w-sm">Complete your first discussion session to start seeing your performance analytics and skill progression charts here.</p>
          </div>
          <a href="/rooms/new" className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-brand-500/20">
            Start Your First Session
          </a>
        </div>
      </div>
    );
  }

  const chartData = data.history.map(h => ({
    date: new Date(h.createdAt).toLocaleDateString(),
    fluency: Math.round(h.metrics.fluency * 100),
    confidence: Math.round(h.metrics.confidence * 100),
    relevance: Math.round(h.metrics.relevance * 100),
  })).reverse();

  const latest = chartData[chartData.length - 1];
  const radarData = [
    { subject: 'Fluency', A: latest.fluency, fullMark: 100 },
    { subject: 'Confidence', A: latest.confidence, fullMark: 100 },
    { subject: 'Relevance', A: latest.relevance, fullMark: 100 },
  ];
  const strengths = Object.entries({ Fluency: latest.fluency, Confidence: latest.confidence, Relevance: latest.relevance }).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Performance Dashboard</h1>
          <p className="text-slate-400">Track your growth and master communication skills.</p>
        </div>
        <div className="glass-strong px-6 py-3 rounded-2xl border border-white/5 text-center">
          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Total Sessions</p>
          <p className="text-2xl font-black text-white">{data.totalSessions}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Clock className="text-brand-400" />} label="Speaking Time" value={`${Math.round((data?.summary?.totalSpeakingTime || 0) / 60)}m`} sub="Total cumulative" />
        <StatCard icon={<TrendingUp className="text-emerald-400" />} label="Avg. Fluency" value={`${Math.round((data?.summary?.avgFluency || 0) * 100)}%`} sub="Across all sessions" />
        <StatCard icon={<Activity className="text-blue-400" />} label="Avg. Confidence" value={`${Math.round((data?.summary?.avgConfidence || 0) * 100)}%`} sub="Across all sessions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-strong p-8 rounded-[2.5rem] border border-white/5">
          <h3 className="text-xl font-bold text-white mb-8">Skill Progression</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFluency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="fluency" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorFluency)" />
                <Area type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={4} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-strong p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center">
          <h3 className="text-xl font-bold text-white mb-8 self-start">Skill DNA</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 w-full space-y-3">
            <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
              <span className="text-xs text-slate-400">Primary Strength</span>
              <span className="text-sm font-bold text-brand-400 uppercase">{strengths[0][0]}</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
              <span className="text-xs text-slate-400">Needs Focus</span>
              <span className="text-sm font-bold text-purple-400 uppercase">{strengths[strengths.length - 1][0]}</span>
            </div>
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Calendar className="text-brand-500" />
          Recent Session History
        </h3>
        <div className="space-y-4">
          {data.history.map((h, i) => (
            <HistoryItem key={i} item={h} />
          ))}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }) => (
  <div className="glass-strong p-6 rounded-[2rem] border border-white/5 group hover:border-brand-500/50 transition-all duration-500">
    <div className="p-3 bg-dark-900/50 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-white mb-1">{value}</p>
    <p className="text-[10px] text-emerald-500 font-bold">{sub}</p>
  </div>
);

const HistoryItem = ({ item }) => (
  <div className="glass-strong p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 font-black">
        {Math.round((item.metrics?.overallScore || 0) * 100)}
      </div>
      <div>
        <h4 className="text-white font-bold mb-1">Session on {new Date(item.createdAt).toLocaleDateString()}</h4>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <span>{Math.round((item.speakingTimeSecs || 0) / 60)}m Speaking</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>{item.interruptions || 0} Interruptions</span>
        </div>
      </div>
    </div>
    <button className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
      <ChevronRight size={20} />
    </button>
  </div>
);

export default AnalyticsPage;
