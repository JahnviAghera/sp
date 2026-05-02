import { useEffect, useRef, useState } from 'react';

export const useWebRTC = (socket, roomCode) => {
  const [peers, setPeers] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const pcs = useRef({});
  const peersRef = useRef({}); // Synchronous tracker to avoid race conditions
  const localStreamRef = useRef(null);

  const requestPermission = async () => {
    try {
      if (localStreamRef.current) return true;
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setPermissionStatus('granted');

      // Add tracks to all existing connections
      Object.values(pcs.current).forEach(pc => {
        const senders = pc.getSenders();
        stream.getTracks().forEach(track => {
          if (!senders.find(s => s.track === track)) {
            pc.addTrack(track, stream);
          }
        });
      });
      return true;
    } catch (err) {
      console.error('WebRTC Permission Error:', err);
      setPermissionStatus('denied');
      return false;
    }
  };

  const createPeerConnection = async (targetSocketId, isInitiator) => {
    if (pcs.current[targetSocketId]) return pcs.current[targetSocketId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pcs.current[targetSocketId] = pc;

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc_ice', { roomCode, candidate: event.candidate, toSocketId: targetSocketId });
      }
    };

    pc.onconnectionstatechange = () => {
      setPeers(prev => ({
        ...prev,
        [targetSocketId]: { ...prev[targetSocketId], connectionState: pc.connectionState }
      }));
    };

    pc.ontrack = (event) => {
      console.log('Received remote track from:', targetSocketId);
      const remoteStream = new MediaStream();
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
      } else {
        remoteStream.addTrack(event.track);
      }

      setPeers(prev => ({
        ...prev,
        [targetSocketId]: { ...prev[targetSocketId], stream: remoteStream }
      }));
    };

    pc.onnegotiationneeded = async () => {
      if (isInitiator) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc_offer', { roomCode, offer, toSocketId: targetSocketId });
        } catch (err) {
          console.error('Negotiation error:', err);
        }
      }
    };

    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_offer', { roomCode, offer, toSocketId: targetSocketId });
      } catch (err) {
        console.error('Initial offer error:', err);
      }
    }

    return pc;
  };

  useEffect(() => {
    if (!socket) return;

    const init = async () => {
      const granted = await requestPermission();
      if (!granted) return;

      socket.on('user_joined', async ({ user, socketId, directory }) => {
        // CLEANUP GHOSTS using peersRef (synchronous)
        if (socketId !== socket.id && user?.id) {
          Object.keys(peersRef.current).forEach(sid => {
            if (peersRef.current[sid].userId === user.id && sid !== socketId) {
              console.log('Cleaning up ghost connection:', sid);
              pcs.current[sid]?.close();
              delete pcs.current[sid];
              delete peersRef.current[sid];
              setPeers(prev => {
                const next = { ...prev };
                delete next[sid];
                return next;
              });
            }
          });
        }

        if (socketId === socket.id && directory) {
          for (const [sid, u] of Object.entries(directory)) {
            if (sid !== socket.id) {
              peersRef.current[sid] = { name: u.name, userId: u.id };
              setPeers(prev => ({ ...prev, [sid]: { name: u.name, userId: u.id } }));
              await createPeerConnection(sid, true);
            }
          }
          return;
        }

        peersRef.current[socketId] = { name: user?.name || 'Peer', userId: user?.id };
        setPeers(prev => ({
          ...prev,
          [socketId]: { ...prev[socketId], name: user?.name || 'Peer', userId: user?.id }
        }));
      });

      socket.on('webrtc_offer', async ({ from, offer }) => {
        const pc = await createPeerConnection(from, false);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc_answer', { roomCode, answer, toSocketId: from });
      });

      socket.on('webrtc_answer', async ({ from, answer }) => {
        const pc = pcs.current[from];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('webrtc_ice', async ({ from, candidate }) => {
        const pc = pcs.current[from];
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on('user_left', ({ socketId }) => {
        if (pcs.current[socketId]) {
          pcs.current[socketId].close();
          delete pcs.current[socketId];
        }
        delete peersRef.current[socketId];
        setPeers(prev => {
          const next = { ...prev };
          delete next[socketId];
          return next;
        });
      });
    };

    init();

    return () => {
      Object.values(pcs.current).forEach(pc => pc.close());
      pcs.current = {};
      peersRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [socket, roomCode]);

  // Force reconnect all peers (The "Silver Bullet" for audio issues)
  const reconnectAll = async () => {
    console.log('Force reconnecting all peers...');
    Object.keys(pcs.current).forEach(sid => {
      pcs.current[sid]?.close();
      delete pcs.current[sid];
    });
    
    // Re-initiate connections to everyone in our current peers list
    for (const sid of Object.keys(peersRef.current)) {
      await createPeerConnection(sid, true);
    }
  };

  return { peers, localStream, permissionStatus, requestPermission, reconnectAll };
};
