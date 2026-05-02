import React from 'react';

const AnalyticsPage = () => {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Performance Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Sessions" value="24" trend="+3 this week" />
          <StatCard title="Avg. Speaking Time" value="4m 12s" trend="-15s vs avg" />
          <StatCard title="Confidence Score" value="82%" trend="+5% improvement" />
          <StatCard title="Global Rank" value="#124" trend="Top 10%" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-strong p-8 rounded-3xl border border-white/5 h-96 flex flex-col items-center justify-center text-slate-500">
            <p>Sentiment Analysis Chart Placeholder</p>
          </div>
          <div className="glass-strong p-8 rounded-3xl border border-white/5 h-96 flex flex-col items-center justify-center text-slate-500">
            <p>Improvement Suggestions Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend }) => (
  <div className="glass-strong p-6 rounded-3xl border border-white/5">
    <p className="text-slate-400 text-sm mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
    <p className="text-brand-400 text-xs font-medium">{trend}</p>
  </div>
);

export default AnalyticsPage;
