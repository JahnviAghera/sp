import React, { useState, useEffect } from 'react';
import { User, Lock, Key, Image, Save, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user: storeUser, fetchProfile: updateStoreProfile } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'security', 'api'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // General Settings
  const [formData, setFormData] = useState({ name: '', bio: '', skills: '', avatarUrl: '' });
  
  // Security
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  // API Key
  const [apiKey, setApiKey] = useState('');
  const [testStatus, setTestStatus] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await authAPI.getProfile();
        const userData = response.data.user;
        setFormData({
          name: userData.name || '',
          bio: userData.bio || '',
          skills: (userData.skills || []).join(', '),
          avatarUrl: userData.avatarUrl || ''
        });
        setApiKey(userData.geminiApiKey || '');
      } catch (err) {
        console.error('Failed to fetch profile', err);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [storeUser]);

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...formData,
        skills: (formData.skills || '').toString().split(',').map(s => s.trim()).filter(s => s)
      };
      await authAPI.updateProfile(updated);
      await updateStoreProfile();
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setSaving(true);
    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Failed to update password', err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile({ geminiApiKey: apiKey });
      await updateStoreProfile();
      toast.success('API Key saved successfully');
    } catch (err) {
      console.error('Failed to save API key', err);
      toast.error('Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleTestKey = async () => {
    if (!apiKey) {
      setTestStatus({ status: 'error', message: 'Please enter a key first' });
      return;
    }
    setTestStatus({ status: 'testing', message: 'Testing connection...' });
    try {
      const res = await authAPI.testApiKey({ apiKey });
      setTestStatus({ status: 'success', message: res.data.message });
    } catch (err) {
      setTestStatus({ status: 'error', message: err.response?.data?.message || 'Connection failed' });
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin text-brand-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto w-full mt-10 p-6 text-white">
      <button 
        onClick={() => navigate('/profile')}
        className="flex items-center text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account preferences and integrations.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center font-bold text-sm transition-colors ${activeTab === 'general' ? 'bg-brand-500/20 text-brand-500 border border-brand-500/30' : 'text-gray-400 hover:bg-dark-800'}`}
          >
            <User size={18} className="mr-3" /> General
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center font-bold text-sm transition-colors ${activeTab === 'security' ? 'bg-brand-500/20 text-brand-500 border border-brand-500/30' : 'text-gray-400 hover:bg-dark-800'}`}
          >
            <Lock size={18} className="mr-3" /> Security
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center font-bold text-sm transition-colors ${activeTab === 'api' ? 'bg-brand-500/20 text-brand-500 border border-brand-500/30' : 'text-gray-400 hover:bg-dark-800'}`}
          >
            <Key size={18} className="mr-3" /> AI API Keys
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          {activeTab === 'general' && (
            <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700 animate-fade-in">
              <h2 className="text-xl font-bold mb-6">General Information</h2>
              <form onSubmit={handleSaveGeneral} className="space-y-6">
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center text-3xl font-black text-brand-500 border-2 border-brand-500/30 overflow-hidden shrink-0">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      formData.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="flex-grow">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Avatar URL</label>
                    <div className="flex items-center mt-1">
                      <Image size={16} className="text-gray-500 absolute ml-3" />
                      <input 
                        className="input-field pl-10 w-full" 
                        placeholder="https://example.com/avatar.jpg"
                        value={formData.avatarUrl} 
                        onChange={e => setFormData({...formData, avatarUrl: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Full Name</label>
                    <input 
                      required
                      className="input-field mt-1 w-full" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Skills (comma separated)</label>
                    <input 
                      className="input-field mt-1 w-full" 
                      placeholder="React, Public Speaking, English"
                      value={formData.skills} 
                      onChange={e => setFormData({...formData, skills: e.target.value})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Bio</label>
                  <textarea 
                    className="input-field mt-1 h-24 pt-2 w-full resize-none" 
                    placeholder="Tell us a little about yourself..."
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                  />
                </div>

                <div className="pt-4 border-t border-dark-700 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors flex items-center"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700 animate-fade-in">
              <h2 className="text-xl font-bold mb-6">Security Settings</h2>
              <form onSubmit={handleSavePassword} className="space-y-6 max-w-md">
                
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Current Password</label>
                  <input 
                    type="password"
                    required
                    className="input-field mt-1 w-full" 
                    value={passwordData.currentPassword} 
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">New Password</label>
                    <input 
                      type="password"
                      required
                      className="input-field mt-1 w-full" 
                      value={passwordData.newPassword} 
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Confirm New Password</label>
                    <input 
                      type="password"
                      required
                      className="input-field mt-1 w-full" 
                      value={passwordData.confirmPassword} 
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-700 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 font-bold rounded-xl transition-colors flex items-center"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Lock size={16} className="mr-2" />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700 animate-fade-in">
              <h2 className="text-xl font-bold mb-6">AI Integrations</h2>
              <form onSubmit={handleSaveApiKey} className="space-y-6">
                
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Google Gemini API Key</label>
                  <p className="text-xs text-gray-400 mb-3 mt-1">
                    Provide your own Gemini API key to remove platform limits during your sessions. Your key is stored securely.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="password"
                      className="input-field flex-grow" 
                      placeholder="AIzaSy..."
                      value={apiKey} 
                      onChange={e => setApiKey(e.target.value)} 
                    />
                    <button 
                      type="button"
                      onClick={handleTestKey}
                      disabled={testStatus.status === 'testing'}
                      className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-sm font-bold rounded-xl transition-colors flex items-center justify-center min-w-[140px]"
                    >
                      {testStatus.status === 'testing' ? <Loader2 size={16} className="animate-spin" /> : 'Test Connection'}
                    </button>
                  </div>
                  
                  {testStatus.status === 'success' && <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><CheckCircle size={12}/> {testStatus.message}</p>}
                  {testStatus.status === 'error' && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><XCircle size={12}/> {testStatus.message}</p>}
                </div>

                <div className="pt-4 border-t border-dark-700 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors flex items-center"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                    Save API Key
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
