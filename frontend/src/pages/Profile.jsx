import React, { useState, useEffect } from 'react';
import { User, Mail, Award, BookOpen, Clock, Activity, Edit2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';

export default function Profile() {
  const navigate = useNavigate();
  const { user: storeUser, fetchProfile: updateStoreProfile } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', skills: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await authAPI.getProfile();
        const userData = response.data.user;
        setProfile(userData);
        setFormData({
          name: userData.name,
          bio: userData.bio || '',
          skills: (userData.skills || []).join(', ')
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [storeUser]);

  const handleSave = async () => {
    try {
      const updated = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      await authAPI.updateProfile(updated);
      await updateStoreProfile(); // Update global state
      setProfile({ ...profile, ...updated });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      setEditing(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading profile...</div>;
  if (!profile) return <div className="p-20 text-center text-gray-500">Could not load profile. Please try again.</div>;

  return (
    <div className="max-w-4xl mx-auto w-full mt-10 p-6 text-white">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Main Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-24 h-24 bg-brand-500/20 rounded-full flex items-center justify-center text-3xl font-black text-brand-500 mx-auto mb-4 border-2 border-brand-500/30 relative">
              {profile.name?.charAt(0) || 'U'}
              <button className="absolute bottom-0 right-0 p-1.5 bg-dark-700 rounded-full border border-dark-600 hover:bg-dark-600 transition-colors">
                <Edit2 size={12} className="text-gray-300" />
              </button>
            </div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{profile.email}</p>
            <button 
              onClick={() => editing ? handleSave() : setEditing(true)}
              className={`w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${editing ? 'bg-green-500 text-white' : 'bg-dark-700 hover:bg-dark-600 text-gray-300'}`}
            >
              {editing ? <><Save size={16} className="mr-2" /> Save Changes</> : <><Edit2 size={16} className="mr-2" /> Edit Profile</>}
            </button>
          </div>

          <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Performance Stats</h3>
            <div className="space-y-4">
              <StatRow icon={<Clock size={16}/>} label="Speaking Time" value={`${Math.floor(profile.stats?.totalSpeakingTime / 60 || 0)}m`} />
              <StatRow icon={<Activity size={16}/>} label="Sessions" value={profile.stats?.sessionsParticipated || 0} />
              <StatRow icon={<Award size={16}/>} label="Skill Level" value="Advanced" />
            </div>
          </div>
        </div>

        {/* Right Column: Bio, Skills & History */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <BookOpen className="text-brand-500 mr-3" size={20} />
              About Me
            </h3>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Name</label>
                  <input 
                    className="input-field mt-1 w-full" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Bio</label>
                  <textarea 
                    className="input-field mt-1 h-24 pt-2 w-full" 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Skills (comma separated)</label>
                  <input 
                    className="input-field mt-1 w-full" 
                    value={formData.skills} 
                    onChange={e => setFormData({...formData, skills: e.target.value})} 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  {profile.bio || "No bio added yet. Tell us about your communication goals!"}
                </p>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-dark-900 border border-dark-700 rounded-full text-xs text-brand-500 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700">
            <h3 className="text-xl font-bold mb-6">Recent Session History</h3>
            {(profile.recentSessions || []).length > 0 ? (
              <div className="space-y-4">
                {profile.recentSessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-dark-900 rounded-2xl border border-dark-700 hover:border-brand-500/30 transition-colors">
                    <div>
                      <h4 className="font-bold text-sm">{s.title}</h4>
                      <p className="text-[10px] text-gray-500">{new Date(s.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-500">Score: {s.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                <p className="text-slate-500 text-sm">No sessions completed yet.</p>
                <a href="/rooms/new" className="text-brand-500 text-xs font-bold hover:underline mt-2 inline-block">Join your first session →</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center text-gray-400">
        <span className="mr-2 text-brand-500">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

function HistoryItem({ title, date, score }) {
  return (
    <div className="flex items-center justify-between p-4 bg-dark-900 rounded-2xl border border-dark-700 hover:border-brand-500/30 transition-colors">
      <div>
        <h4 className="font-bold text-sm">{title}</h4>
        <p className="text-[10px] text-gray-500">{date}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-brand-500">Score: {score}</p>
        <button className="text-[10px] text-gray-500 underline hover:text-brand-500">View Transcript</button>
      </div>
    </div>
  );
}

