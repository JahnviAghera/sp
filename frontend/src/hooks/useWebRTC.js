import { useEffect, useRef, useState } from 'react';

const pcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export const useWebRTC = (socket, roomCode) => {
  const [peers, setPeers] = useState({}); // { socketId: { stream, name } }
  const pcs = useRef({}); // { socketId: RTCPeerConnection }
  const localStream = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const initLocalStream = async () => {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // When a new user joins, send them an offer
        socket.on('user_joined', async ({ user, socketId }) => {
          if (socketId === socket.id) return;
          await createPeerConnection(socketId, true);
        });

        // Handle signaling
        socket.on('webrtc_offer', async ({ from, offer }) => {
          const pc = await createPeerConnection(from, false);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc_answer', { roomCode, answer, toSocketId: from });
        });

        socket.on('webrtc_answer', async ({ from, answer }) => {
          const pc = pcs.current[from];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on('webrtc_ice', async ({ from, candidate }) => {
          const pc = pcs.current[from];
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socket.on('user_left', ({ socketId }) => {
          if (pcs.current[socketId]) {
            pcs.current[socketId].close();
            delete pcs.current[socketId];
            setPeers(prev => {
              const next = { ...prev };
              delete next[socketId];
              return next;
            });
          }
        });
      } catch (err) {
        console.error('Failed to get local stream', err);
      }
    };

    const createPeerConnection = async (targetSocketId, isOffer) => {
      const pc = new RTCPeerConnection(pcConfig);
      pcs.current[targetSocketId] = pc;

      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc_ice', { roomCode, candidate: event.candidate, toSocketId: targetSocketId });
        }
      };

      pc.ontrack = (event) => {
        setPeers(prev => ({
          ...prev,
          [targetSocketId]: { stream: event.streams[0] }
        }));
      };

      if (isOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_offer', { roomCode, offer, toSocketId: targetSocketId });
      }

      return pc;
    };

    initLocalStream();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      Object.values(pcs.current).forEach(pc => pc.close());
    };
  }, [socket, roomCode]);

  return { peers, localStream: localStream.current };
};
