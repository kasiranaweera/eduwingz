import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import uiConfigs from "../configs/ui.config";
import menuConfigs from "../configs/menu.configs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import SubjectIcon from '@mui/icons-material/Subject';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';

const PlatformLessonId = () => {
  const { appState } = useSelector((state) => state.appState);
  const [open, setOpen] = React.useState(false);
  const [drawerWidth, setDrawerWidth] = React.useState(500); // Width in pixels
  const [isResizing, setIsResizing] = React.useState(false);
  const drawerRef = useRef(null);

  const minWidth = 300;
  const maxWidth = 800;

  const handleChat = () => {};

  const handlePlatformMenu = (index) => {
    index === 4 ? setOpen((prev) => !prev) : setOpen(false);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const containerWidth = window.innerWidth;
      const newWidth = containerWidth - e.clientX;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  return (
    <>
      <Drawer
        sx={{
          backgroundColor:'background.default',
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor:'background.default',
            boxSizing: "border-box",
            transition: isResizing ? "none" : "width 0.3s ease",
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        {/* Resize Handle */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "20px",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            "&:hover": {
              "&::before": {
                bgcolor: "primary.main",
                opacity: 0.5,
              },
            },
            "&::before": {
              content: '""',
              position: "absolute",
              left: "0px",
              top: 0,
              bottom: 0,
              width: "1px",
              bgcolor: isResizing ? "primary.main" : "divider",
              borderRadius: 1,
              transition: "background-color 0.2s",
            },
          }}
        >
          {/* <DragIndicatorIcon
            sx={{
              fontSize: 20,
              color: isResizing ? "primary.main" : "text.disabled",
              position: "relative",
              zIndex: 1,
            }}
          /> */}
        </Box>

        {/* Drawer Content */}
        <Box sx={{ p: 3, mt: 8, }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Chat Assistant</Typography>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{mt:1, mb:3}} orientation="horizontal" flexItem />              
          <Typography>Kasi - Your learning assistant</Typography>
          
          {/* Add your chat interface here */}
          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              💡 Drag the left edge to resize this panel
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box
        sx={{
          width: open ? `calc(100% - ${drawerWidth}px)` : "100%",
          transition: isResizing ? "none" : "width 0.3s ease",
        }}
      >
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Typography variant="h5">
            Science: Chemical Basis of Life (Biology)
          </Typography>
          <Box sx={{gap:1, display:'flex'}}>
          {open && (<><Button variant="outlined" sx={{color: 'primary.contrastText', borderColor: 'primary.contrastText', textTransform:'initial'}}>Chapters</Button></>)}

            <IconButton><MoreHorizIcon /></IconButton>
          </Box>
          
        </Box>
        <Grid sx={{ mt: 2 }} container spacing={3}>
          <Grid size={open ? 0 : 3} spacing={3} sx={{display: open ? "none" : 'block'}} container direction="column">
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: "graycolor.two",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6">Chapters</Typography>
              <Divider sx={{mt:1, mb:3}} orientation="horizontal" flexItem />              
              <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography component="span">Accordion 1</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <List><ListItem>
                <ListItemIcon><SubjectIcon /></ListItemIcon>
                  <ListItemText
                    primary="Single-line item"
                    // secondary={ 'Secondary text'}
                  />
                </ListItem>
                <ListItem>
                <ListItemIcon><SubjectIcon /></ListItemIcon>
                  <ListItemText
                    primary="Single-line item"
                    // secondary={ 'Secondary text'}
                  />
                </ListItem></List>
        </AccordionDetails>
      </Accordion>
              
            </Paper>
          </Grid>
          <Grid size={open ? 12 : 9} spacing={3} container direction="column">
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: "graycolor.two",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6">Content</Typography>
              <Divider sx={{mt:1, mb:3}} orientation="horizontal" flexItem /> 
              <Typography variant="paragraph">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</Typography> 
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1200,
        }}
      >
        <Box
          sx={{
            backgroundColor: "background.paper",
            p: 1,
            borderRadius: 3,
            gap: 1,
            display: "inline-flex",
            alignItems: "end",
            boxShadow: 3,
          }}
        >
          {menuConfigs.platformMenu.map((item, index) => (
            <Box
              key={index}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px) scale(1.1)" },
              }}
            >
              <Tooltip title={item.display} placement="top" arrow>
                <IconButton
                  size="large"
                  onClick={() => handlePlatformMenu(index)}
                  sx={{
                    border: 1,
                    borderColor: "graycolor.two",
                    "&:hover": {
                      color: appState.includes(item.state)
                        ? "secondary.contrastText"
                        : "primary.main",
                    },
                    color: appState.includes(item.state)
                      ? "secondary.contrastText"
                      : "primary.contrastText",
                    background: appState.includes(item.state)
                      ? uiConfigs.style.mainGradient.color
                      : "none",
                  }}
                >
                  {item.icon}
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default PlatformLessonId;