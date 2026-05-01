import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Hash } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      // In a real app, you'd pass the auth token in headers
      const response = await axios.post(`${API_URL}/rooms/create`, {
        title: 'New GD Session',
        isPrivate: false,
        aiModerator: true
      });
      navigate(`/room/${response.data.room.code}`);
    } catch (err) {
      console.error('Failed to create room', err);
      // Fallback for demo if backend isn't ready/auth isn't configured
      const mockCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      navigate(`/room/${mockCode}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full mt-10 p-6">
      <h2 className="text-4xl font-black mb-10 tracking-tight">Dashboard</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700 shadow-2xl hover:border-brand-500/50 transition-all group">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-brand-500/10 rounded-2xl group-hover:bg-brand-500/20 transition-colors">
              <Plus className="text-brand-500" size={28} />
            </div>
            <h3 className="text-2xl font-bold ml-4">New Session</h3>
          </div>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Create a private or public room to practice group discussions with real-time AI performance analysis.
          </p>
          <button 
            onClick={handleCreateRoom} 
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center text-lg font-bold disabled:opacity-50"
          >
            {loading ? 'Creating...' : (
              <>
                <Users className="mr-3" size={22} />
                Create Room
              </>
            )}
          </button>
        </div>

        <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700 shadow-2xl hover:border-brand-500/50 transition-all group">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-brand-500/10 rounded-2xl group-hover:bg-brand-500/20 transition-colors">
              <Hash className="text-brand-500" size={28} />
            </div>
            <h3 className="text-2xl font-bold ml-4">Join Room</h3>
          </div>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Have a room code? Enter it below to instantly join your peers in a practice session.
          </p>
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <input 
              type="text" 
              placeholder="ENTER CODE" 
              className="input-field uppercase py-4 text-center text-xl font-mono tracking-widest bg-dark-900 border-2 border-dark-700 focus:border-brand-500 transition-all"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              required
            />
            <button type="submit" className="btn-secondary w-full py-4 text-lg font-bold">
              Join Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
