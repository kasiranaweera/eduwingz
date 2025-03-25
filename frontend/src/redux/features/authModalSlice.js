// In authModalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authModalSlice = createSlice({
  name: 'authModal',
  initialState: {
    authModalOpen: false
  },
  reducers: {
    setAuthModalOpen: (state, action) => {
      state.authModalOpen = action.payload;
      console.log('Setting auth modal open:', action.payload);
    }
  }
});

export const { setAuthModalOpen } = authModalSlice.actions;
export default authModalSlice.reducer;