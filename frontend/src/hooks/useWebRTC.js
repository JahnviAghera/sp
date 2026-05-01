import { useEffect, useRef, useState } from 'react';
import { createPeerConnection } from '../utils/webRTC';

const useWebRTC = (socket, userId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const pcs = useRef({}); // Store RTCPeerConnection objects

  useEffect(() => {
    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    startLocalStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !localStream) return;

    socket.on('user_joined', async ({ user }) => {
      const pc = createPeerConnection(
        socket,
        user._id,
        localStream,
        (remoteStream) => {
          setRemoteStreams((prev) => ({ ...prev, [user._id]: remoteStream }));
        }
      );

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      pcs.current[user._id] = pc;

      socket.emit('webrtc_signal', {
        target: user._id,
        signal: { offer },
      });
    });

    socket.on('webrtc_signal', async ({ signal, from }) => {
      let pc = pcs.current[from];

      if (!pc) {
        pc = createPeerConnection(
          socket,
          from,
          localStream,
          (remoteStream) => {
            setRemoteStreams((prev) => ({ ...prev, [from]: remoteStream }));
          }
        );
        pcs.current[from] = pc;
      }

      if (signal.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc_signal', { target: from, signal: { answer } });
      } else if (signal.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
      } else if (signal.ice) {
        await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
      }
    });

    return () => {
      socket.off('webrtc_signal');
      socket.off('user_joined');
    };
  }, [socket, localStream]);

  return { localStream, remoteStreams };
};

export default useWebRTC;
