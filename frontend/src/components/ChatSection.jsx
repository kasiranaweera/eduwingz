import { Box, Button, IconButton, Paper, TextField } from "@mui/material";
import React from "react";
import SendIcon from '@mui/icons-material/Send';
import { themeModes } from "../configs/theme.config";
import { useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import FormatShapesOutlinedIcon from '@mui/icons-material/FormatShapesOutlined';

const ChatSection = ({ sx }) => {
    const {themeMode} = useSelector((state) => state.themeMode);

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{backgroundColor:'background.paper', p:3, borderRadius:5}}>
        <TextField
        sx={{width:'100%', mb:1}}
          label="What can I do for you..."
          multiline
          rows={3}
          variant="standard"
        />
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Box sx={{display:'flex', gap:1, alignItems:'center'}}>
          <IconButton
              sx={{
                display: { xs: "none", md: "flex" },
                "&:hover": { color: "primary.main" },
                color:
                  themeMode === themeModes.dark
                    ? "primary.contrastText"
                    : "primary.contrastText",
              }}
            //   onClick={}
            >
                <AddIcon/>
            </IconButton>
            <Button startIcon={<TravelExploreOutlinedIcon/>} sx={{backgroundColor:'graycolor.two', textTransform:'none', color:'primary.contrastText', '&:hover':{color:'primary.main'}, px:2, borderRadius:100}}>Search</Button>
            <Button startIcon={<FormatShapesOutlinedIcon/>} sx={{backgroundColor:'graycolor.two', textTransform:'none', color:'primary.contrastText', '&:hover':{color:'primary.main'}, px:2, borderRadius:100}}>Template</Button>
          </Box>
          <IconButton
              sx={{
                display: { xs: "none", md: "flex" },
                "&:hover": { color: "primary.main" },
                color:
                  themeMode === themeModes.dark
                    ? "primary.contrastText"
                    : "primary.contrastText",
              }}
            //   onClick={}
            >
                <SendIcon/>
            </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatSection;
