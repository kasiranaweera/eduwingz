import { Box } from '@mui/material'
import wightLogo from '../../assets/img/eduwingz_name_w.png'
import blackLogo from '../../assets/img/eduwingz_name_b.png'
import mainlogo from '../../assets/img/eduwingz_logo.png'
import { useSelector } from "react-redux";
import { themeModes } from "../../configs/theme.config";

const Logo = () => {
  const { themeMode } = useSelector((state) => state.themeMode);

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <img src={mainlogo} alt="logo" style={{ height: "48px" }} />
      <Box sx={{ width: "8px" }}></Box>
      {themeMode === themeModes.dark ? (
        <img src={wightLogo} alt="logo" style={{ height: "28px" }} />
      ) : (
        <img src={blackLogo} alt="logo" style={{ height: "28px" }} />
      )}
    </Box>
  );
}

export default Logo
