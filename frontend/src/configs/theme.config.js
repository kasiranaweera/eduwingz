import { createTheme } from "@mui/material/styles";

export const themeModes = {
  dark: "dark",
  light: "light"
};

const themeConfigs = {
  custom: ({ mode }) => {
    const customPalette = mode === themeModes.dark ? {
      primary: {
        main: "#ff9800",
        contrastText: "#fafafa",
      },
      secondary: {
        main: "#ffc107",
        contrastText: "#131313"
      },
      background: {
        default: "#121212",
        paper: "#212121"
      },
      footericon: {
        main: '#858585'
      },
      graycolor: {
        one: "#313131",
        two: "#414141"
      }
    } : {
      primary: {
        main: "#ff9800",
        contrastText: "#131313",
      },
      secondary: {
        main: "#ffc107",
        contrastText: "#fff8e1"
      },
      background: {
        default: "#fafafa",
        paper: "#fafafa"
      },
      footericon: {
        main: '#858585'
      },
      graycolor: {
        one: "#eeeeee",
        two: "#e0e0e0"
      }
    };

    return createTheme({
      palette: {
        mode,
        ...customPalette
      },
      components: {
        MuiButton: {
          defaultProps: { disableElevation: true }
        }
      }
    });
  }
};

export default themeConfigs;
