import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem("user");
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const userSlice = createSlice({
  name: 'User',
  initialState: {
    user: initialUser,
    listFavorites: []
  },
  reducers: {
    setUser: (state, action) => {
      if (action.payload === null) {
        localStorage.removeItem('user');
      } else {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
      state.user = action.payload;
    },
    setListFavorites: (state, action) => {
      state.listFavorites = action.payload;
    },
    removeFavorite: (state, action) => {
      const { mediaId } = action.payload;
      state.listFavorites = state.listFavorites.filter((e) => e.mediaId.toString() !== mediaId.toString());
    },
    addFavorite: (state, action) => {
      state.listFavorites = [action.payload, ...state.listFavorites];
    }
  }
});

export const { setUser, setListFavorites, addFavorite, removeFavorite } = userSlice.actions;

export default userSlice.reducer;
