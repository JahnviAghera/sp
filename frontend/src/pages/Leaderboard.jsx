import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${API_URL}/analytics/leaderboard`);
        setLeaders(response.data.leaderboard);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
        // Fallback mock data
        setLeaders([
          { _id: '1', name: 'Alex Johnson', stats: { totalSpeakingTime: 3600, sessionsParticipated: 12 } },
          { _id: '2', name: 'Sarah Chen', stats: { totalSpeakingTime: 3200, sessionsParticipated: 10 } },
          { _id: '3', name: 'Mike Ross', stats: { totalSpeakingTime: 2800, sessionsParticipated: 15 } },
          { _id: '4', name: 'Elena Rodriguez', stats: { totalSpeakingTime: 2100, sessionsParticipated: 8 } },
          { _id: '5', name: 'James Wilson', stats: { totalSpeakingTime: 1800, sessionsParticipated: 6 } },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown className="text-yellow-400" size={24} />;
      case 1: return <Medal className="text-gray-300" size={24} />;
      case 2: return <Medal className="text-amber-600" size={24} />;
      default: return <span className="text-gray-500 font-bold w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full mt-10 p-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex items-center mb-10">
        <div className="p-4 bg-yellow-400/10 rounded-3xl mr-6">
          <Trophy className="text-yellow-400" size={40} />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight">Hall of Fame</h2>
          <p className="text-gray-400">Top performers based on clarity and engagement</p>
        </div>
      </div>

      <div className="bg-dark-800 rounded-3xl border border-dark-700 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-500">Loading rankings...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900/50 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-dark-700">
                <th className="px-8 py-4 w-20">Rank</th>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4 text-center">Speaking Time</th>
                <th className="px-8 py-4 text-center">Sessions</th>
                <th className="px-8 py-4 text-right">Badge</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((user, index) => (
                <tr 
                  key={user._id} 
                  className={`border-b border-dark-700/50 hover:bg-dark-700/20 transition-colors ${index < 3 ? 'bg-brand-500/5' : ''}`}
                >
                  <td className="px-8 py-6">
                    <div className="flex justify-center">{getRankIcon(index)}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-brand-500 font-bold mr-4 border border-dark-600">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-lg">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center font-mono text-gray-300">
                    {Math.floor(user.stats.totalSpeakingTime / 60)}m
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-brand-500">
                    {user.stats.sessionsParticipated}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {index === 0 && (
                      <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-black rounded-full border border-yellow-400/20 uppercase tracking-tighter">
                        Elite Orator
                      </span>
                    )}
                    {index > 0 && index < 3 && (
                      <span className="px-3 py-1 bg-brand-500/10 text-brand-500 text-[10px] font-black rounded-full border border-brand-500/20 uppercase tracking-tighter">
                        Pro Speaker
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
