import { create } from 'zustand';
import api from '../services/api';
import { io } from 'socket.io-client';

const useRoomStore = create((set, get) => ({
  rooms: [],
  currentRoom: null,
  socket: null,
  loading: false,
  error: null,

  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/rooms');
      set({ rooms: data.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch rooms', loading: false });
    }
  },

  createRoom: async (roomData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/rooms', roomData);
      set((state) => ({ rooms: [...state.rooms, data.data], loading: false }));
      return data.data;
    } catch (error) {
      set({ error: 'Failed to create room', loading: false });
      throw error;
    }
  },

  connectSocket: (roomId) => {
    const socket = io('/', {
      query: { roomId },
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));

export default useRoomStore;
