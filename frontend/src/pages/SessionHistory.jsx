import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, FileText, Users, Lock, Globe } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export default function SessionHistory() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'with-report' | 'no-report'

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/rooms/my-sessions');
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error('Failed to load session history', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = sessions.filter(s => {
    if (filter === 'with-report') return !!s.review?.sessionSummary;
    if (filter === 'no-report') return !s.review?.sessionSummary;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto w-full p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-400 font-black uppercase tracking-[0.3em] text-xs mb-1">Your History</p>
          <h1 className="text-4xl font-black text-white tracking-tight">Past Sessions</h1>
          <p className="text-slate-400 text-sm mt-1">
            Every room you joined — public and private.
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-white">{sessions.length}</p>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Total</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-dark-800 rounded-2xl border border-white/5 w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'with-report', label: 'With Report' },
          { key: 'no-report', label: 'No Report' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === tab.key
                ? 'bg-brand-500 text-white'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Session List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 bg-dark-800/50 rounded-3xl border border-dashed border-white/10 text-center">
          <Clock size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">No sessions found</p>
          <p className="text-slate-600 text-sm mt-1">
            {filter === 'all'
              ? 'Join a room to start building your history.'
              : 'No sessions match this filter.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-sm transition-all"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session, i) => {
            const myResult = session.review?.participants?.find(p => p.name === user?.name);
            const hasReport = !!session.review?.sessionSummary;
            const isPrivate = session.room?.isPrivate;
            const score = myResult?.overallScore;

            return (
              <div
                key={session._id || i}
                onClick={() => hasReport && navigate(`/report/${session.room?.code}`)}
                className={`p-5 bg-dark-800 rounded-2xl border border-white/5 transition-all flex items-center justify-between gap-4 ${
                  hasReport
                    ? 'hover:border-brand-500/30 cursor-pointer group'
                    : 'cursor-default'
                }`}
              >
                {/* Score Badge */}
                <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${
                  score >= 80
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : score >= 60
                    ? 'bg-brand-500/15 text-brand-400'
                    : score
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-white/5 text-slate-600'
                }`}>
                  {score || '—'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                      {session.room?.title || 'Unknown Room'}
                    </p>
                    {isPrivate ? (
                      <Lock size={10} className="text-slate-600 shrink-0" />
                    ) : (
                      <Globe size={10} className="text-slate-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium uppercase">
                    <span className="flex items-center gap-1">
                      <Clock size={9} />
                      {new Date(session.startedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={9} />
                      {session.participants?.length || 1} participant{session.participants?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Action */}
                {hasReport ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-1 bg-brand-500/10 text-brand-400 text-[9px] font-black uppercase rounded-lg tracking-widest">
                      Report
                    </span>
                    <ChevronRight size={16} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest shrink-0 flex items-center gap-1">
                    <FileText size={10} />
                    No Report
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
