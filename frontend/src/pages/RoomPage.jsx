import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoomStore from '../store/useRoomStore';
import useAuthStore from '../store/useAuthStore';
import useWebRTC from '../hooks/useWebRTC';
import { Mic, MicOff, MessageSquare, Hand, LogOut, Users, Settings, Activity } from 'lucide-react';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const RoomPage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { socket, connectSocket, disconnectSocket } = useRoomStore();
  const { localStream, remoteStreams } = useWebRTC(socket, user?._id);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    connectSocket(id);
    
    if (socket) {
      socket.emit('join_room_request', { roomId: id, user });

      socket.on('receive_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('user_joined', (data) => {
        setParticipants((prev) => [...prev, data.user]);
      });

      socket.on('user_left', (data) => {
        setParticipants((prev) => prev.filter(p => p._id !== data.userId));
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [id, user, socket, connectSocket, disconnectSocket, navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && socket) {
      socket.emit('send_message', { text: chatInput, user: user.name });
      setChatInput('');
    } else if (chatInput.trim()) {
      // For local testing without socket connection
      setMessages((prev) => [...prev, { text: chatInput, user: user.name }]);
      setChatInput('');
    }
  };

  const toggleHand = () => {
    if (socket) socket.emit('raise_hand');
    setHandRaised(!handRaised);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-bg-primary rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
      
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar - Participants */}
      <div className="w-64 glass-strong border-r border-white/5 p-6 flex flex-col z-10 hidden lg:flex">
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-brand-400" size={20} />
          <h2 className="font-bold text-white tracking-wide">Participants</h2>
          <Badge variant="brand" className="ml-auto">1/6</Badge>
        </div>
        
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {/* Current User */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${!isMuted ? 'bg-emerald-400' : 'bg-transparent'}`} />
            <Avatar alt={user?.name || 'User'} src={user?.avatar} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name} (You)</p>
              <p className="text-xs text-brand-300">Moderator</p>
            </div>
            {handRaised && <Hand size={14} className="text-amber-400" />}
            {isMuted ? <MicOff size={14} className="text-slate-500" /> : <Mic size={14} className="text-emerald-400" />}
          </div>
          
          {/* Remote Participants */}
          {participants.map((p, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent">
              <Avatar alt={p.name} src={p.avatar} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{p.name}</p>
                <p className="text-xs text-slate-500">Participant</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-6 border-t border-white/5 mt-auto">
          <Button 
            variant="danger" 
            icon={LogOut} 
            className="w-full" 
            onClick={() => navigate('/dashboard')}
          >
            Leave Room
          </Button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col z-10 relative">
        {/* Top bar for mobile/tablet */}
        <div className="lg:hidden glass border-b border-white/5 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="text-brand-400" size={18} />
            <span className="font-bold text-white text-sm">Room {id}</span>
          </div>
          <Button variant="danger" size="sm" icon={LogOut} onClick={() => navigate('/dashboard')}>
            Leave
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          
          {/* Active Speaker Visualizer */}
          <div className="text-center relative z-10">
            <div className="mb-10 relative inline-block">
              {/* Pulsing ring when speaking */}
              {!isMuted && (
                <>
                  <div className="absolute inset-0 rounded-full border border-brand-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute inset-0 rounded-full border border-purple-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] animation-delay-500" />
                </>
              )}
              
              <div className={`w-48 h-48 rounded-full border-4 ${!isMuted ? 'border-brand-500 bg-brand-500/10 shadow-glow' : 'border-dark-700 bg-dark-800'} flex items-center justify-center transition-all duration-500 mx-auto relative z-10`}>
                <Avatar alt={user?.name || 'User'} size="xl" className="w-40 h-40" />
              </div>
            </div>
            
            <div className="glass px-8 py-4 rounded-2xl inline-block mb-4 border-brand-500/20">
              <h2 className="text-2xl font-bold text-white mb-1">Software Engineering Prep</h2>
              <p className="text-brand-300 text-sm font-medium">Topic: System Design</p>
            </div>
            
            <div className="h-8 flex justify-center">
              {!isMuted ? (
                <div className="sound-wave text-brand-400">
                  <span /><span /><span /><span /><span />
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Microphone is muted</p>
              )}
            </div>
          </div>
          
          {/* AI Feedback floating card */}
          <div className="absolute top-8 right-8 glass p-4 rounded-xl max-w-xs animate-fade-in hidden md:block">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Live AI Analysis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your pacing is excellent. Try to incorporate more specific technical vocabulary related to scalability.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 pb-8">
          <div className="glass-strong rounded-3xl p-4 flex items-center justify-between max-w-3xl mx-auto shadow-2xl border-white/10">
            <div className="flex gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isMuted 
                    ? 'bg-dark-700 text-slate-400 hover:bg-dark-600 hover:text-white' 
                    : 'bg-brand-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:bg-brand-500'
                }`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              <button 
                onClick={toggleHand}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  handRaised 
                    ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                    : 'bg-dark-700 text-slate-400 hover:bg-dark-600 hover:text-white'
                }`}
              >
                <Hand size={24} />
              </button>
            </div>
            
            <div className="px-6 py-2 rounded-xl bg-dark-900 border border-white/5 flex flex-col items-center">
              <span className="text-xs text-slate-500 uppercase font-semibold">Remaining Time</span>
              <span className="text-xl font-mono font-bold text-white tracking-wider">04:25</span>
            </div>
            
            <div className="flex gap-4">
              <button className="w-14 h-14 rounded-2xl flex items-center justify-center bg-dark-700 text-slate-400 hover:bg-dark-600 hover:text-white transition-all">
                <Settings size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remote Audio Streams */}
      {Object.entries(remoteStreams).map(([peerId, stream]) => (
        <audio
          key={peerId}
          autoPlay
          ref={(el) => { if (el) el.srcObject = stream; }}
        />
      ))}

      {/* Right Sidebar - Chat */}
      <div className="w-80 glass-strong border-l border-white/5 flex flex-col z-10 hidden md:flex">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <MessageSquare size={18} className="text-brand-400" />
          <h2 className="font-bold text-white">Room Chat</h2>
        </div>
        
        <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 text-sm mt-10">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.user === user?.name;
              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.user}</span>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                    isMe 
                      ? 'bg-brand-600 text-white rounded-tr-sm' 
                      : 'bg-dark-700 text-slate-200 border border-white/5 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-dark-950/50">
          <div className="relative">
            <input 
              className="w-full bg-dark-800 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="Message room..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!chatInput.trim()}
              className="absolute right-2 top-2 bottom-2 w-8 flex items-center justify-center text-brand-400 hover:text-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomPage;
