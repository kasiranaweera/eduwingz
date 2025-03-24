import { createTheme } from "@mui/material/styles";

export const themeModes = {
  dark: "dark",
  light: "light"
};

const themeConfigs = {
  custom: ({ mode }) => {
    const customPalette = mode === themeModes.dark ? {
      primary: {
        main: "#ffc107", // 4CF59A, 13FD00
        contrastText: "#fff8e1",
      },
      secondary: {
        main: "#ff9800",
        contrastText: "#fff3e0"
      },
      background: {
        default: "#121212",
        paper: "#212121"
      },
      footericon: {
        main: '#858585'
      },
    } : {
      primary: {
        main: "#ffc107", //078660
        contrastText: "#131313",
      },
      secondary: {
        main: "#ff9800"
      },
      background: {
        default: "#fafafa",
        paper: "#fafafa" // #4CF59A
      },
      footericon: {
        main: '#858585'
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