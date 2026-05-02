import { create } from 'zustand';
import { roomAPI } from '../services/api';

const useRoomStore = create((set) => ({
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null,

  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const response = await roomAPI.getRooms();
      set({ rooms: response.data.rooms || response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch rooms', loading: false });
    }
  },

  createRoom: async (roomData) => {
    set({ loading: true, error: null });
    try {
      const response = await roomAPI.createRoom(roomData);
      const newRoom = response.data.room || response.data;
      set((state) => ({ 
        rooms: [newRoom, ...state.rooms], 
        loading: false 
      }));
      return newRoom;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create room', loading: false });
      throw error;
    }
  },

  getRoomDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await roomAPI.getRoomById(id);
      set({ currentRoom: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch room details', loading: false });
      throw error;
    }
  },
}));

export default useRoomStore;
