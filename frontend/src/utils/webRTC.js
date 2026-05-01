const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

export const createPeerConnection = (socket, targetId, stream, onRemoteStream) => {
  const pc = new RTCPeerConnection(servers);

  // Add local stream tracks to peer connection
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
  });

  // Handle remote stream
  pc.ontrack = (event) => {
    onRemoteStream(event.streams[0]);
  };

  // ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('webrtc_signal', {
        target: targetId,
        signal: { ice: event.candidate },
      });
    }
  };

  return pc;
};
