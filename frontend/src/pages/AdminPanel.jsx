import React, { useState, useEffect } from 'react';
import { Users, Shield, Ban, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/users`);
        setUsers(response.data.users);
      } catch (err) {
        console.error('Failed to fetch users', err);
        setUsers([
          { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'moderator' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full mt-10 p-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex items-center mb-10">
        <div className="p-4 bg-red-500/10 rounded-3xl mr-6 text-red-500">
          <Shield size={40} />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight">Admin Console</h2>
          <p className="text-gray-400">System management and oversight</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<Users />} label="Total Users" value={users.length} color="text-brand-500" />
        <StatCard icon={<Activity />} label="Active Rooms" value="5" color="text-yellow-500" />
        <StatCard icon={<Ban />} label="Banned Users" value="0" color="text-red-500" />
      </div>

      <div className="bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-dark-700 bg-dark-900/30">
          <h3 className="font-bold text-xl">User Management</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-dark-900/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-dark-700">
              <th className="px-8 py-4">User</th>
              <th className="px-8 py-4">Email</th>
              <th className="px-8 py-4">Role</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-dark-700/50 hover:bg-dark-700/10 transition-colors">
                <td className="px-8 py-6 font-semibold">{u.name}</td>
                <td className="px-8 py-6 text-gray-400 text-sm">{u.email}</td>
                <td className="px-8 py-6 uppercase text-[10px] font-black tracking-tighter">
                  <span className={`px-2 py-1 rounded ${u.role === 'moderator' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-brand-500/10 text-brand-500'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                    <Ban size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 flex items-center">
      <div className={`p-4 bg-dark-900 rounded-2xl mr-4 ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}
