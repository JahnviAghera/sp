import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Hash, Calendar, Clock, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import { roomAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useRoomStore from '../store/useRoomStore';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const { user } = useAuthStore();

  const { rooms, fetchRooms } = useRoomStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [schedResp, sessResp] = await Promise.all([
          axios.get('/api/schedules/upcoming'),
          axios.get('/api/rooms/my-sessions')
        ]);
        setSchedules(schedResp.data.schedules);
        setPastSessions(sessResp.data.sessions);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchDashboardData();
    fetchRooms();
  }, [fetchRooms]);

  const handleCreateRoom = () => {
    navigate('/rooms/new');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) navigate(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-8 space-y-12 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <header className="flex justify-between items-center bg-gradient-to-r from-brand-600/20 to-purple-600/20 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
          <Activity size={200} />
        </div>
        <div className="relative z-10">
          <p className="text-brand-400 font-black uppercase tracking-[0.3em] text-xs mb-3">Welcome Back</p>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-2">Hello, {user?.name.split(' ')[0]}!</h2>
          <p className="text-slate-400 max-w-md">Ready to master your communication skills today? Join a session or analyze your progress.</p>
        </div>
        <div className="relative z-10 flex gap-4">
          <button onClick={() => navigate('/analytics')} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
            <TrendingUp className="text-brand-400" />
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <ActionCard 
              icon={<Plus size={28} />}
              title="New Session"
              desc="Start a real-time voice room with AI moderation and live feedback."
              btnText={loading ? 'Creating...' : 'Create Room'}
              onClick={handleCreateRoom}
              color="brand"
              disabled={loading}
            />
            <div className="bg-dark-800 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between group hover:border-brand-500/30 transition-all">
              <div>
                <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-all">
                  <Hash size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Join Session</h3>
                <p className="text-slate-400 text-sm mb-8">Enter a room code to jump into an existing discussion.</p>
              </div>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="ENTER CODE" 
                  className="w-full bg-dark-900 border-2 border-white/5 rounded-2xl py-4 text-center text-xl font-black tracking-[0.3em] text-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-800 placeholder:tracking-normal"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  required
                />
                <button type="submit" className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10">
                  Join Room
                </button>
              </form>
            </div>
          </div>

          {/* Active Public Sessions */}
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                <Users size={24} className="text-brand-500" />
                Active Public Sessions
              </h3>
              <span className="px-3 py-1 bg-brand-500/20 text-brand-400 text-xs font-bold rounded-full">{rooms?.length || 0} Live</span>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {rooms && rooms.length > 0 ? (
                rooms.map((room) => (
                  <div key={room._id} className="p-6 bg-dark-800 rounded-3xl border border-white/5 hover:border-brand-500/30 transition-all group flex flex-col justify-between h-48">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-400 transition-colors">
                          {room.topic || 'General'}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                          <Users size={12} /> {room.participants?.length || 0}/{room.maxParticipants}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1 line-clamp-1">{room.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{room.description || 'Join this public session to improve your communication skills.'}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/room/${room.code}`)}
                      className="w-full py-3 bg-white/5 hover:bg-brand-500 hover:text-white text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      Join Now <ChevronRight size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-10 bg-dark-800/50 rounded-3xl border border-white/5 border-dashed text-center">
                  <p className="text-slate-500 text-sm mb-4">No public sessions are active right now.</p>
                  <button onClick={handleCreateRoom} className="text-brand-500 text-xs font-bold uppercase tracking-widest hover:underline">Start the first one!</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-10">
          <div className="grid grid-cols-2 gap-6 mb-2">
            <QuickStat label="Avg. Score" val={pastSessions.length > 0 ? Math.round(pastSessions.reduce((acc, s) => acc + (s.review.participants.find(p => p.name === user.name)?.overallScore || 0), 0) / pastSessions.length) : 'N/A'} />
            <QuickStat label="Sessions" val={pastSessions.length} />
          </div>

          {/* Recent Reports */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Activity size={20} className="text-brand-500" />
              Recent Reports
            </h3>
            <div className="space-y-3">
              {pastSessions.length > 0 ? pastSessions.slice(0, 5).map((session, i) => {
                const myResult = session.review.participants.find(p => p.name === user.name);
                return (
                  <div key={i} onClick={() => navigate(`/report/${session.room.code}`)} className="p-4 bg-dark-800 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-all cursor-pointer group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${myResult?.overallScore >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-400'}`}>
                        {myResult?.overallScore || '??'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{session.room.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">{new Date(session.startedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                );
              }) : (
                <div className="p-6 bg-dark-800/50 rounded-2xl border border-dashed border-white/10 text-center">
                  <p className="text-xs text-slate-600 italic">No reports yet.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Calendar size={20} className="text-brand-500" />
              Upcoming GDs
            </h3>
            <div className="space-y-4">
              {schedules.length > 0 ? schedules.map((s, i) => (
                <ScheduleItem key={i} item={s} onJoin={() => navigate(`/room/${s.roomCode || 'DEMO'}`)} />
              )) : (
                <div className="p-8 glass-strong rounded-[2.5rem] border border-dashed border-white/10 text-center">
                  <p className="text-slate-600 text-sm italic mb-4">No sessions scheduled.</p>
                  <button className="text-brand-500 text-xs font-bold uppercase tracking-widest hover:underline">+ Schedule One</button>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, btnText, onClick, color, disabled }) {
  return (
    <div className="bg-dark-800 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between group hover:border-brand-500/30 transition-all">
      <div>
        <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-all">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">{desc}</p>
      </div>
      <button 
        onClick={onClick}
        disabled={disabled}
        className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-brand-500/20 active:scale-95 disabled:opacity-50"
      >
        {btnText}
      </button>
    </div>
  );
}

function ScheduleItem({ item, onJoin }) {
  const date = new Date(item.startTime);
  return (
    <div className="glass-strong p-6 rounded-3xl border border-white/5 hover:border-brand-500/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-brand-500/10 rounded-full text-brand-400 text-[10px] font-black uppercase tracking-widest">
          <Clock size={10} />
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <span className="text-slate-600 text-[10px] font-bold uppercase">{date.toLocaleDateString()}</span>
      </div>
      <h4 className="text-white font-bold mb-2 group-hover:text-brand-400 transition-colors">{item.title}</h4>
      <p className="text-slate-500 text-xs mb-6 line-clamp-1">{item.description}</p>
      <button 
        onClick={onJoin}
        className="w-full py-3 bg-white/5 group-hover:bg-brand-500 group-hover:text-white text-slate-400 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
      >
        Join Waitlist
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function QuickStat({ label, val }) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
      <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">{label}</p>
      <p className="text-xl font-black text-white">{val}</p>
    </div>
  );
}
