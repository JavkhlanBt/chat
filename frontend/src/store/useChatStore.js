import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async ({ text, file }, receiverId) => {
    const { selectedUser, messages } = get();
    if (!selectedUser && !receiverId) {
      toast.error("No user selected");
      return;
    }
    try {
      const res = await axiosInstance.post(
        `/messages/send/${receiverId || selectedUser._id}`,
        { text, file }
      );
      set({ messages: [...messages, res.data] });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket not initialized");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages } = get();
      // Check if message is part of the current conversation
      const isRelevantMessage =
        (newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === useAuthStore.getState().authUser._id) ||
        (newMessage.senderId === useAuthStore.getState().authUser._id &&
          newMessage.receiverId === selectedUser._id);

      if (isRelevantMessage) {
        set({ messages: [...messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
