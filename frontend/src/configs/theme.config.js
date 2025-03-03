import { createTheme } from "@mui/material/styles";

export const themeModes = {
  dark: "dark",
  light: "light"
};

const themeConfigs = {
  custom: ({ mode }) => {
    const customPalette = mode === themeModes.dark ? {
      primary: {
        main: "#4CF59A", // 4CF59A, 13FD00
        contrastText: "#023C01",
      },
      secondary: {
        main: "#f44336",
        contrastText: "#ffffff"
      },
      background: {
        default: "#161616",
        paper: "#202020"
      },
      footericon: {
        main: '#858585'
      },
    } : {
      primary: {
        main: "#000000DE", //078660
      },
      secondary: {
        main: "#f44336"
      },
      background: {
        default: "#e0e0e0",
        paper: "#4CF59A" // #4CF59A
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