import { useEffect, useRef, useState } from 'react';

export const useWebRTC = (socket, roomCode) => {
  const [peers, setPeers] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const pcs = useRef({});
  const localStreamRef = useRef(null);

  const requestPermission = async () => {
    try {
      console.log('Requesting microphone permission...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionStatus('denied');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setPermissionStatus('granted');
      return true;
    } catch (err) {
      console.error('WebRTC Permission Error:', err);
      setPermissionStatus('denied');
      return false;
    }
  };

  useEffect(() => {
    if (!socket) return;

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

      pc.ontrack = (event) => {
        setPeers(prev => ({
          ...prev,
          [targetSocketId]: { ...prev[targetSocketId], stream: event.streams[0] }
        }));
      };

      if (isInitiator) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc_offer', { roomCode, offer, toSocketId: targetSocketId });
        } catch (err) {
          console.error('Failed to create offer:', err);
        }
      }

      return pc;
    };

    const init = async () => {
      const granted = await requestPermission();
      if (!granted) return;

      socket.on('user_joined', async ({ user, socketId, directory }) => {
        if (socketId === socket.id && directory) {
          for (const [sid, u] of Object.entries(directory)) {
            if (sid !== socket.id) {
              setPeers(prev => ({ ...prev, [sid]: { name: u.name } }));
              await createPeerConnection(sid, true);
            }
          }
          return;
        }
        setPeers(prev => ({
          ...prev,
          [socketId]: { ...prev[socketId], name: user?.name || 'Peer' }
        }));
      });

      socket.on('webrtc_offer', async ({ from, offer }) => {
        const pc = await createPeerConnection(from, false);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc_answer', { roomCode, answer, toSocketId: from });
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      });

      socket.on('webrtc_answer', async ({ from, answer }) => {
        const pc = pcs.current[from];
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (err) {
            console.error('Error setting remote description:', err);
          }
        }
      });

      socket.on('webrtc_ice', async ({ from, candidate }) => {
        const pc = pcs.current[from];
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
      });

      socket.on('user_left', ({ socketId }) => {
        if (pcs.current[socketId]) {
          pcs.current[socketId].close();
          delete pcs.current[socketId];
        }
        setPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[socketId];
          return newPeers;
        });
      });
    };

    init();

    return () => {
      Object.values(pcs.current).forEach(pc => pc.close());
      pcs.current = {};
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [socket, roomCode]);

  return { peers, localStream, permissionStatus, requestPermission };
};
