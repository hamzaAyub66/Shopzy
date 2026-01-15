import { create } from 'zustand';

interface NotificationState {
  isOrderModalVisible: boolean;
  setOrderModalVisible: (visible: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isOrderModalVisible: false,
  setOrderModalVisible: (visible) => set({ isOrderModalVisible: visible }),
}));