import React from 'react';
import { User, Mail, Shield, Award, Edit3 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ProfilePage = () => {
  const { user } = useAuthStore();
  
  // Mock data if user is not available
  const currentUser = user || { name: 'Test User', email: 'test@example.com', role: 'Speaker' };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Profile Settings</h1>
        <p className="text-slate-400">Manage your account and personal details.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="xl" className="w-24 h-24" />
              <button className="absolute bottom-0 right-0 p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg transition-colors">
                <Edit3 size={14} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{currentUser.name}</h2>
            <p className="text-sm text-slate-400 mb-4">{currentUser.role}</p>
            
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-full mx-auto w-fit">
              <Award size={16} />
              Pro Speaker
            </div>
          </div>
          
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Account Security</h3>
            </div>
            <div className="p-4 space-y-4">
              <button className="w-full flex items-center justify-between text-sm text-slate-300 hover:text-white transition-colors">
                <span className="flex items-center gap-2"><Shield size={16} className="text-slate-400" /> Change Password</span>
                <span className="text-slate-500">&gt;</span>
              </button>
              <button className="w-full flex items-center justify-between text-sm text-slate-300 hover:text-white transition-colors">
                <span className="flex items-center gap-2"><Shield size={16} className="text-slate-400" /> Two-Factor Auth</span>
                <span className="text-emerald-400">Enabled</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input 
                  label="Full Name"
                  defaultValue={currentUser.name}
                  icon={User}
                />
                <Input 
                  label="Email Address"
                  type="email"
                  defaultValue={currentUser.email}
                  icon={Mail}
                />
              </div>
              
              <Input 
                label="Bio"
                as="textarea"
                rows={4}
                defaultValue="I'm a software engineer practicing for technical interviews and system design discussions."
                className="resize-none"
              />
              
              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <Button variant="ghost">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </form>
          </div>
          
          <div className="card p-6 md:p-8 border-red-500/20">
            <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="danger">Delete Account</Button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProfilePage;
