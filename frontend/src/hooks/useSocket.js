import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const useSocket = (roomCode, user) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!roomCode || !user?.id) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      query: { userId: user.id }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, user?.id]);


  return socket;
};
