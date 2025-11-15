import { createSlice } from "@reduxjs/toolkit";

// Load theme from localStorage or default to "dark"
const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem("themeMode");
    return savedTheme || "dark";
  } catch (error) {
    return "dark";
  }
};

export const themeModeSlice = createSlice({
  name: "ThemeMode",
  initialState: {
    themeMode: getInitialTheme()
  },
  reducers: {
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
      // Save to localStorage whenever theme changes
      try {
        localStorage.setItem("themeMode", action.payload);
      } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
      }
    }
  }
});

export const {
  setThemeMode
} = themeModeSlice.actions;

export default themeModeSlice.reducer;