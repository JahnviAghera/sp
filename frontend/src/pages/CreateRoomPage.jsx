import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useRoomStore from '../store/useRoomStore';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Hash, Shield, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';

const createRoomSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  topic: z.string().min(10, 'Topic must be at least 10 characters'),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  maxParticipants: z.number().min(2).max(20).optional(),
});

const CreateRoomPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      maxParticipants: 10,
      isPrivate: false,
    }
  });
  
  const createRoom = useRoomStore((state) => state.createRoom);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const newRoom = await createRoom({
        ...data,
        aiModerator: true // default to true for the premium experience
      });
      toast.success('Room created successfully!');
      navigate(`/room/${newRoom.code}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Create Session</h1>
          <p className="text-slate-400">Configure a new environment for discussion and skill building.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-slate-400 transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="bg-dark-800 rounded-[2.5rem] border border-white/5 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Session Title</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500"><Hash size={20} /></div>
                  <input 
                    {...register('title')} 
                    className="w-full bg-dark-900 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                    placeholder="e.g. Weekly Tech Sync"
                  />
                </div>
                {errors.title && <p className="text-red-500 text-xs mt-2 font-bold">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Main Topic</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"><Sparkles size={20} /></div>
                  <input 
                    {...register('topic')} 
                    className="w-full bg-dark-900 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                    placeholder="e.g. AI in modern web development"
                  />
                </div>
                {errors.topic && <p className="text-red-500 text-xs mt-2 font-bold">{errors.topic.message}</p>}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Max Participants</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"><Users size={20} /></div>
                  <input 
                    type="number"
                    {...register('maxParticipants', { valueAsNumber: true })} 
                    className="w-full bg-dark-900 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
                {errors.maxParticipants && <p className="text-red-500 text-xs mt-2 font-bold">{errors.maxParticipants.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Privacy</label>
                <label className="flex items-center gap-4 p-4 bg-dark-900 border-2 border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-all">
                  <div className="p-2 bg-slate-800 rounded-xl text-slate-400"><Shield size={20} /></div>
                  <div className="flex-grow">
                    <p className="text-white font-bold text-sm">Private Room</p>
                    <p className="text-slate-500 text-xs">Only people with the code can join</p>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" {...register('isPrivate')} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-700 checked:right-0 checked:border-brand-500 checked:bg-brand-500 transition-all" style={{right: '1.5rem'}}/>
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-800 cursor-pointer"></label>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-brand-500/20 active:scale-95"
            >
              {isSubmitting ? (
                'Initializing Environment...'
              ) : (
                <>
                  <Plus size={24} />
                  Launch Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .toggle-checkbox:checked { right: 0; border-color: #3b82f6; }
        .toggle-checkbox { right: 1.5rem; transition: all 0.3s; }
        .toggle-checkbox:checked + .toggle-label { background-color: #1e3a8a; }
      `}} />
    </div>
  );
};

export default CreateRoomPage;