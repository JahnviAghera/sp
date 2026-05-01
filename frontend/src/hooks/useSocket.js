import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useSocket = (roomCode, user) => {
  const socketRef = useRef();

  useEffect(() => {
    if (!roomCode || !user) return;

    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('join_room', { roomCode, user });

    return () => {
      socketRef.current.emit('leave_room', { roomCode, user });
      socketRef.current.disconnect();
    };
  }, [roomCode, user]);

  return socketRef.current;
};
