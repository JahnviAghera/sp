import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export const useSocket = (roomCode, user) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!roomCode || !user) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setSocket(newSocket);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, user]);

  return socket;
};
