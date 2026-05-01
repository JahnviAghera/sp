import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, MessageSquare, Hand, Sparkles } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  // Mock user for now - in real app, get from Auth context
  const [user] = useState({ id: Math.random().toString(36).substr(2, 9), name: 'User_' + Math.floor(Math.random()*100) });
  
  const socket = useSocket(code, user);
  const { peers, localStream } = useWebRTC(socket, code);
  
  const [isMuted, setIsMuted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('ai_feedback', ({ userId, feedback }) => {
      if (userId === user.id) {
        setFeedback(feedback);
      }
    });

    socket.on('queue_updated', (updatedQueue) => {
      setQueue(updatedQueue);
    });

    socket.on('speaking_turn_start', (speaker) => {
      setCurrentSpeaker(speaker);
    });

    // Setup Speech Recognition for AI feedback
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        // Emit transcript periodically or on end
        if (event.results[event.results.length - 1].isFinal) {
          socket.emit('speaking_turn', { roomCode: code, transcript, userId: user.id });
        }
      };

      if (!isMuted) recognitionRef.current.start();
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [socket, isMuted, code, user.id]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = isMuted);
    }
  };

  const leaveRoom = () => navigate('/dashboard');

  const raiseHand = () => {
    socket.emit('raise_hand', { roomCode: code, userId: user.id, userName: user.name });
  };

  const nextSpeaker = () => {
    socket.emit('next_speaker', { roomCode: code });
  };

  return (
    <div className="flex-grow flex flex-col -m-6 bg-dark-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-800 bg-dark-800">
        <div>
          <h2 className="text-xl font-bold">Room: <span className="uppercase text-brand-500">{code}</span></h2>
          <p className="text-xs text-gray-400">Live Audio & AI Feedback</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={raiseHand}
            className="p-2 bg-dark-700 hover:bg-dark-600 rounded-full transition-colors text-yellow-400"
          >
            <Hand size={20} />
          </button>
          {/* Moderator Only Button Example */}
          <button 
            onClick={nextSpeaker}
            className="p-2 bg-brand-500/20 hover:bg-brand-500/30 text-brand-500 rounded-full transition-colors text-xs font-bold px-3"
          >
            Next Speaker
          </button>
          <button className="p-2 bg-dark-700 hover:bg-dark-600 rounded-full transition-colors" onClick={() => setChatOpen(!chatOpen)}>
            <MessageSquare size={20} />
          </button>
          <button className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-brand-500 text-white'}`} onClick={toggleMute}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors" onClick={leaveRoom}>
            <PhoneOff size={20} />
          </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Main Area */}
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Local Participant */}
            <ParticipantCard name={`${user.name} (You)`} isSpeaking={!isMuted} stream={null} />
            
            {/* Remote Participants */}
            {Object.entries(peers).map(([id, peer]) => (
              <ParticipantCard key={id} name={`Peer_${id.substr(0,4)}`} isSpeaking={true} stream={peer.stream} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {chatOpen && (
          <div className="w-80 bg-dark-800 border-l border-dark-700 flex flex-col">
            <div className="p-4 border-b border-dark-700 flex items-center">
              <Sparkles className="text-brand-500 mr-2" size={18} />
              <h3 className="font-semibold text-sm">AI Feedback & Queue</h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {/* Queue Section */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Speaking Queue</p>
                <div className="space-y-2">
                  {currentSpeaker && (
                    <div className="bg-brand-500/10 border border-brand-500/30 p-2 rounded-lg flex items-center">
                      <Mic size={12} className="text-brand-500 mr-2" />
                      <span className="text-xs font-bold text-brand-500">{currentSpeaker.userName} (Speaking)</span>
                    </div>
                  )}
                  {queue.filter(q => q.userId !== currentSpeaker?.userId).map((q, idx) => (
                    <div key={idx} className="bg-dark-700 p-2 rounded-lg text-xs flex items-center text-gray-400">
                      <span className="mr-2 opacity-50">{idx + 1}.</span>
                      {q.userName}
                    </div>
                  ))}
                  {queue.length === 0 && !currentSpeaker && (
                    <p className="text-[10px] text-gray-600 italic">Queue is empty</p>
                  )}
                </div>
              </div>
              
              <hr className="border-dark-700" />
              
              {/* AI Feedback Section */}
              {feedback ? (
                <div className="bg-brand-500/10 border border-brand-500/20 p-3 rounded-lg">
                  <p className="text-xs font-bold text-brand-500 mb-2 uppercase">Real-time Analysis</p>
                  <p className="text-sm text-gray-200">{feedback.summary || "Processing speech..."}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-dark-900 p-1 rounded">Fluency: {Math.round(feedback.fluency * 100)}%</div>
                    <div className="bg-dark-900 p-1 rounded">Confidence: {Math.round(feedback.confidence * 100)}%</div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center">Start speaking to get AI feedback</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantCard({ name, isSpeaking, stream }) {
  const audioRef = useRef();

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`bg-dark-800 rounded-2xl aspect-video flex flex-col items-center justify-center relative border-2 transition-all ${isSpeaking ? 'border-brand-500 shadow-lg shadow-brand-500/20' : 'border-transparent'}`}>
      <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center text-2xl font-bold text-brand-500 mb-3 uppercase">
        {name.charAt(0)}
      </div>
      <p className="text-sm font-medium text-gray-200">{name}</p>
      {stream && <audio ref={audioRef} autoPlay playsInline />}
      {isSpeaking && (
        <div className="absolute top-4 right-4 text-brand-500 animate-pulse">
          <Mic size={20} />
        </div>
      )}
    </div>
  );
}
