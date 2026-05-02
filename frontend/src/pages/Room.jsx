import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, MessageSquare, Hand, Sparkles, Clock, Info, Shield, ChevronRight, UserMinus, VolumeX, Share } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) return null; // Let ProtectedRoute handle redirection

  const effectiveUser = user;

  const socket = useSocket(code, effectiveUser);
  const { peers, localStream, permissionStatus, requestPermission } = useWebRTC(socket, code);

  const [isMuted, setIsMuted] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [directory, setDirectory] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [captions, setCaptions] = useState(null);
  const [roomInfo, setRoomInfo] = useState({ topic: 'Loading topic...', startTime: Date.now(), duration: 20 * 60 * 1000, moderatorId: null });
  const [timeLeft, setTimeLeft] = useState('');

  const recognitionRef = useRef(null);

  const isModerator = roomInfo.moderatorId === effectiveUser.id;

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - roomInfo.startTime;
      const remaining = Math.max(0, roomInfo.duration - elapsed);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [roomInfo]);

  useEffect(() => {
    if (!socket) return;

    socket.on('user_joined', (data) => {
      if (data.topic) {
        setRoomInfo({
          topic: data.topic,
          startTime: data.startTime,
          duration: data.duration,
          moderatorId: data.moderatorId
        });
      }
      if (data.queue) setQueue(data.queue);
      if (data.activeSpeaker) setCurrentSpeaker(data.activeSpeaker);
      if (data.directory) setDirectory(data.directory);
    });

    socket.on('user_left', ({ socketId }) => {
      setDirectory(prev => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    });

    // Send the join event now that we are ready
    if (localStream) {
      socket.emit('join_room', { roomCode: code, user: effectiveUser });
    }

    socket.on('chat_message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('ai_feedback', ({ userId, feedback }) => {
      if (userId === effectiveUser.id) setFeedback(feedback);
    });
    socket.on('queue_updated', (updatedQueue) => setQueue(updatedQueue));
    socket.on('speaking_turn_start', (speaker) => setCurrentSpeaker(speaker));

    socket.on('speaking_turn', ({ userId, userName, transcript }) => {
      setCaptions({ name: userName, text: transcript });
      if (window.captionTimeout) clearTimeout(window.captionTimeout);
      window.captionTimeout = setTimeout(() => setCaptions(null), 4000);
    });

    socket.on('force_mute', () => {
      setIsMuted(true);
      if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = false);
      toast.error('Moderator muted you');
    });

    socket.on('force_kick', () => {
      toast.error('You were removed from the room');
      navigate('/dashboard');
    });

    socket.on('moderator_action', ({ action, target }) => {
      const targetName = target === socket.id ? 'You' : (peers[target]?.name || 'Someone');
      toast(`${targetName} was ${action}d by moderator`, { icon: '🛡️' });
    });

    return () => {
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('chat_message');
      socket.off('ai_feedback');
      socket.off('queue_updated');
      socket.off('speaking_turn_start');
      socket.off('speaking_turn');
      socket.off('force_mute');
      socket.off('force_kick');
      socket.off('moderator_action');
    };
  }, [socket, code, effectiveUser.id, localStream, navigate]);

  // Separate stable effect for Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !socket) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('');

      // Display interim results locally immediately
      setCaptions({ name: effectiveUser.name + ' (You)', text: transcript });
      if (window.captionTimeout) clearTimeout(window.captionTimeout);
      window.captionTimeout = setTimeout(() => setCaptions(null), 4000);

      // Emit to others only when the phrase is complete
      if (event.results[event.results.length - 1].isFinal) {
        socket.emit('speaking_turn', { roomCode: code, transcript, userId: effectiveUser.id });
      }
    };

    // Automatically restart if it stops unexpectedly while not muted
    recognitionRef.current.onend = () => {
      if (!isMuted) {
        try { recognitionRef.current.start(); } catch (e) { }
      }
    };

    if (!isMuted) {
      try { recognitionRef.current.start(); } catch (e) { }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // prevent auto-restart on unmount
        recognitionRef.current.stop();
      }
    };
  }, [isMuted, socket, code, effectiveUser.id, effectiveUser.name]);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (localStream) localStream.getAudioTracks().forEach(track => track.enabled = isMuted);
  };

  const muteParticipant = (sid) => socket.emit('mute_user', { roomCode: code, targetSocketId: sid });
  const kickParticipant = (sid) => socket.emit('kick_user', { roomCode: code, targetSocketId: sid });
  const raiseHand = () => socket.emit('raise_hand', { roomCode: code, userId: effectiveUser.id, userName: effectiveUser.name });
  const nextSpeaker = () => socket.emit('next_speaker', { roomCode: code });

  const handleInvite = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Invite link copied to clipboard!', { icon: '🔗' });
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <div className="flex-grow flex flex-col h-screen bg-bg-primary overflow-hidden -m-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-900/10 via-bg-primary to-bg-primary pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-8 py-4 glass-strong border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-brand-500/20 rounded-xl">
            <Shield className={isModerator ? "text-yellow-400" : "text-brand-400"} size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">{code}</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {isModerator ? 'Moderating Session' : 'Live Session'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleInvite} className="flex items-center gap-2 px-5 py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-xl transition-all border border-brand-500/20 font-bold text-sm">
            <Share size={16} /> Invite
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/50 rounded-xl border border-white/5">
            <Clock size={16} className="text-brand-400" />
            <span className="font-mono text-sm font-bold text-white">{timeLeft}</span>
          </div>
          <button onClick={() => navigate(`/report/${code}`)} className="flex items-center gap-2 px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/20 font-bold text-sm">
            <PhoneOff size={16} /> Leave
          </button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden relative z-10">
        <main className="flex-grow flex flex-col p-6 overflow-hidden">
          <div className="mb-6 p-6 glass-strong rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Info size={80} /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em] mb-2">Discussion Topic</p>
              <h2 className="text-2xl font-bold text-white leading-tight">{roomInfo.topic}</h2>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              <ParticipantCard
                name={`${effectiveUser.name} (You)`}
                isSpeaking={!isMuted && currentSpeaker?.userId === effectiveUser.id}
                isMuted={isMuted}
                isLocal={true}
                isModerator={isModerator}
              />

              {Object.entries(directory)
                .filter(([id, dirUser]) => id !== socket.id)
                .map(([id, dirUser]) => (
                  <ParticipantCard
                    key={id}
                    name={dirUser.name || `User_${id.substr(0, 4)}`}
                    isSpeaking={currentSpeaker?.socketId === id}
                    stream={peers[id]?.stream}
                    showControls={isModerator}
                    onMute={() => muteParticipant(id)}
                    onKick={() => kickParticipant(id)}
                  />
                ))}
            </div>
          </div>

          {/* Captions Overlay */}
          {captions && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 max-w-3xl w-full text-center px-8 py-5 bg-dark-900/80 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl z-20 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">{captions.name}</p>
              <p className="text-xl text-white font-medium leading-relaxed">{captions.text}</p>
            </div>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 glass-strong rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl z-30">
            <ControlBtn active={!isMuted} onClick={toggleMute} icon={isMuted ? <MicOff size={22} /> : <Mic size={22} />} label={isMuted ? "Unmute" : "Mute"} color={isMuted ? "red" : "brand"} />
            <div className="w-px h-8 bg-white/10 mx-2" />
            <ControlBtn active={true} onClick={raiseHand} icon={<Hand size={22} />} label="Raise Hand" color="yellow" />
            {isModerator && <ControlBtn active={true} onClick={nextSpeaker} icon={<ChevronRight size={22} />} label="Next Speaker" color="brand" primary />}
          </div>
        </main>

        <aside className={`w-96 glass-strong border-l border-white/5 transition-all duration-300 flex flex-col ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg"><Sparkles className="text-brand-400" size={18} /></div>
              <h3 className="font-bold text-white uppercase tracking-widest text-sm">AI Moderator</h3>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <section>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                Speaking Queue <span className="px-2 py-0.5 bg-dark-900 rounded-full text-slate-400">{queue.length}</span>
              </h4>
              <div className="space-y-3">
                {currentSpeaker && (
                  <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-500/40"><Mic size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-brand-400 uppercase tracking-tighter">Current Speaker</p>
                      <p className="text-sm font-bold text-white">{currentSpeaker.userName}</p>
                    </div>
                  </div>
                )}
                {queue.filter(q => q.userId !== currentSpeaker?.userId).map((q, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 opacity-60">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-xs font-bold">{idx + 1}</div>
                    <p className="text-sm font-medium text-slate-300">{q.userName}</p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Real-time Insights</h4>
              {feedback ? (
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-white/10 rounded-3xl">
                    <p className="text-sm text-slate-200 leading-relaxed italic mb-4">"{feedback.summary || "Generating feedback..."}"</p>
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard label="Fluency" val={feedback.fluency} color="brand" />
                      <MetricCard label="Confidence" val={feedback.confidence} color="purple" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center glass-strong rounded-3xl border border-white/5 border-dashed">
                  <Sparkles className="mx-auto text-slate-700 mb-4" size={32} />
                  <p className="text-xs text-slate-500">Speak to receive real-time sentiment and fluency analysis.</p>
                </div>
              )}
            </section>
          </div>
        </aside>
        {permissionStatus !== 'granted' && (
          <PermissionOverlay
            status={permissionStatus}
            onRetry={requestPermission}
          />
        )}
      </div>
    </div>

  );
}


function ParticipantCard({ name, isSpeaking, isMuted, stream, isLocal, showControls, onMute, onKick, isModerator }) {
  const audioRef = useRef();
  useEffect(() => { if (audioRef.current && stream) audioRef.current.srcObject = stream; }, [stream]);

  return (
    <div className={`relative group aspect-square rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${isSpeaking ? 'bg-brand-500/10 scale-[1.02]' : 'bg-white/5'} border-2 ${isSpeaking ? 'border-brand-500 shadow-lg' : 'border-white/5'}`}>
      {isSpeaking && <div className="absolute inset-0 bg-brand-500/10 animate-pulse" />}

      {/* Moderator Action Overlay */}
      {showControls && !isLocal && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button onClick={onMute} className="p-2 bg-dark-900/80 hover:bg-red-500 text-white rounded-lg backdrop-blur-md transition-colors"><VolumeX size={16} /></button>
          <button onClick={onKick} className="p-2 bg-dark-900/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-md transition-colors"><UserMinus size={16} /></button>
        </div>
      )}

      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black z-10 ${isSpeaking ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="mt-6 text-center z-10">
        <div className="flex items-center justify-center gap-2">
          <p className={`text-lg font-bold ${isSpeaking ? 'text-brand-400' : 'text-slate-200'}`}>{name}</p>
          {isModerator && isLocal && <Shield size={14} className="text-yellow-400" />}
        </div>
        <div className="flex items-center justify-center gap-2 mt-1">
          {isMuted && <MicOff size={14} className="text-red-500" />}
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{isSpeaking ? 'Speaking...' : 'Listening'}</span>
        </div>
      </div>
      {stream && <audio ref={audioRef} autoPlay playsInline />}
    </div>
  );
}

function ControlBtn({ icon, label, onClick, color, active, primary }) {
  const colors = { brand: 'bg-brand-500/10 text-brand-400', red: 'bg-red-500/10 text-red-500', yellow: 'bg-yellow-500/10 text-yellow-500' };
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-3 rounded-2xl border ${primary ? 'bg-brand-500 text-white min-w-[100px]' : colors[color]} ${!active && 'opacity-50'}`}>
      {icon} <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
  );
}

function MetricCard({ label, val, color }) {
  const percentage = Math.round((val || 0) * 100);
  return (
    <div className="bg-dark-900/50 p-3 rounded-2xl border border-white/5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
        <span className="text-[10px] font-black text-white">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color === 'brand' ? 'bg-brand-500' : 'bg-purple-500'}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function PermissionOverlay({ status, onRetry }) {
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-bg-primary/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-md w-full p-10 glass-strong rounded-[3rem] border border-white/10 text-center space-y-8 shadow-2xl">
        <div className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Mic size={40} className="text-brand-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-3">Microphone Access Required</h2>
          <p className="text-slate-400 leading-relaxed">Please allow microphone access to participate in the real-time discussion and receive AI feedback.</p>
        </div>
        {!isSecure && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-left">
            <p className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-2"><Shield size={14} /> Insecure Connection</p>
            <p className="text-[10px] text-red-400/80 leading-relaxed">Browsers block microphones on non-HTTPS sites. Use localhost or enable the Chrome flag: <code className="block mt-2 p-2 bg-black/30 rounded font-mono text-[9px] break-all whitespace-pre-wrap">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code></p>
          </div>
        )}
        <button onClick={onRetry} className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-brand-500/20 active:scale-95">{status === 'denied' ? 'Try Again' : 'Allow Microphone'}</button>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Check your browser address bar for the prompt</p>
      </div>
    </div>
  );
}
