import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import contentData from "../assets/contentData";

const ObjectCard = () => {
  const datalist = contentData.featuerData;
  return (
    <Box>
      {datalist.map((item, index) =>
        index % 2 === 1 ? (
          <Box
            key={index}
            sx={{
              backgroundColor: "graycolor.one",
              p: 3,
              display: "flex",
              alignItems: "center",
              borderRadius: 5,
              borderBottom: 1,
              borderLeft: 1,
              borderColor: "primary.main",
              mb: 3,
            }}
          >
            <Stack
              direction="row"
              spacing={2.5}
              sx={{ justifyContent: "center", alignItems: "stretch" }}
            >
              <Box
                sx={{
                  width: "30vw",
                  borderRadius: 5,
                  backgroundImage: `url(${item.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <Box sx={{ width: "60%" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 550,
                    color: "primary.main",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography sx={{
                    fontWeight: 500,
                  }}>{item.subtitle}</Typography>

                <List>
                  {item.list.map((item, i) => (
                    <ListItem alignItems="flex-start" key={i}>
                      <ListItemIcon
                        sx={{ minWidth: 20, color: "primary.main" }}
                      >
                        <FiberManualRecordIcon fontSize="inherit" />
                      </ListItemIcon>
                      <ListItemText sx={{textAlign:'justify'}}
                        primary={item.primary}
                        secondary={item.secondary}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Stack>
          </Box>
        ) : (
          <Box
            key={index}
            sx={{
              backgroundColor: "graycolor.one",
              p: 3,
              display: "flex",
              alignItems: "center",
              borderRadius: 5,
              borderBottom: 1,
              borderLeft: 1,
              borderColor: "primary.main",
              mb: 3,
            }}
          >
            <Stack
              direction="row"
              spacing={2.5}
              sx={{ justifyContent: "center", alignItems: "stretch" }}
            >
              <Box sx={{ width: "60%" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 550,
                    color: "primary.main",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {item.subtitle}
                </Typography>

                <List>
                  {item.list.map((item, i) => (
                    <ListItem alignItems="flex-start" key={i}>
                      <ListItemIcon
                        sx={{ minWidth: 20, color: "primary.main" }}
                      >
                        <FiberManualRecordIcon fontSize="inherit" />
                      </ListItemIcon>
                      <ListItemText sx={{textAlign:'justify'}}
                        primary={item.primary}
                        secondary={item.secondary}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box
                sx={{
                  width: "30vw",
                  borderRadius: 5,
                  backgroundImage: `url(${item.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </Stack>
          </Box>
        )
      )}
    </Box>
  );
};

export default ObjectCard;
