import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Schedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${API_URL}/schedules/upcoming`);
        setSchedules(response.data.schedules);
      } catch (err) {
        console.error('Failed to fetch schedules', err);
        // Mock data
        setSchedules([
          { _id: '1', title: 'Tech Trends 2026', startTime: new Date(Date.now() + 86400000).toISOString(), creator: { name: 'Admin' } },
          { _id: '2', title: 'Soft Skills Workshop', startTime: new Date(Date.now() + 172800000).toISOString(), creator: { name: 'Sarah' } },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  return (
    <div className="max-w-4xl mx-auto w-full mt-10 p-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Schedules</h2>
          <p className="text-gray-400">Plan and join upcoming discussion sessions</p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" />
          Schedule Session
        </button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading schedules...</div>
        ) : (
          schedules.map(session => (
            <div key={session._id} className="bg-dark-800 p-6 rounded-3xl border border-dark-700 flex items-center justify-between hover:border-brand-500/50 transition-all">
              <div className="flex items-center">
                <div className="p-4 bg-brand-500/10 rounded-2xl mr-6 text-brand-500">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{session.title}</h3>
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <Clock size={14} className="mr-1" />
                    {new Date(session.startTime).toLocaleString()}
                    <span className="mx-2">•</span>
                    <Users size={14} className="mr-1" />
                    Host: {session.creator?.name || 'User'}
                  </div>
                </div>
              </div>
              <button className="btn-secondary">Set Reminder</button>
            </div>
          ))
        )}
        {!loading && schedules.length === 0 && (
          <div className="p-20 bg-dark-800 rounded-3xl border border-dashed border-dark-700 text-center text-gray-500">
            No upcoming sessions found.
          </div>
        )}
      </div>
    </div>
  );
}
