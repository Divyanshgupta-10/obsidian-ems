import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { unread: 0, list: [] },
  reducers: {
    setNotifications(state, action) {
      state.list = action.payload.notifications;
      state.unread = action.payload.unread;
    },
    decrementUnread(state) {
      state.unread = Math.max(0, state.unread - 1);
    },
    clearUnread(state) {
      state.unread = 0;
    },
  },
});

export const { setNotifications, decrementUnread, clearUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
