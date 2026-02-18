import { Avatar, Box, Rating, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";

const FeedbackCard = ({ name, comment, stars }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  
  function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        width: 66,
        height: 66,
        bgcolor: stringToColor(name),
      },
      children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
    };
  }

  return (
    <Box
      sx={{
        gridColumn: { md: "span 3", xs: "span 12", sm: "span 6" },
        backgroundColor: "graycolor.one",
        p: 3,
        height: "350px",
        display: "flex",
        alignItems: "center",
        borderRadius: 5,
        borderBottom: 1,
        borderLeft: 1,
        borderColor: "primary.main",
        transition: "all 0.3s",
        transform: "translateY(0px)",
        "&:hover": {
          boxShadow: 3,
          borderTop: 1,
          borderRight: 1,
          transform: "translateY(-5px)",
          borderColor: "primary.main",
        },
      }}
    >
      <Stack
        direction="column"
        sx={{ justifyContent: "center", alignItems: "center" }}
        spacing={2}
      >
        <Avatar {...stringAvatar(name)} />
        <Typography
          variant={isMdUp ? "h6" : "body1"}
          sx={{ textAlign: "center", fontWeight: "500" }}
        >
          {" "}
          {name}
        </Typography>
        <Typography variant={isMdUp ? "body1" : "body2"} sx={{ textAlign: "center", color: 'primary.ContrastText', fontWeight:300}}>
          {comment.length > 100 ? `${comment.substring(0, 100)}...` : comment}
        </Typography>
        <Rating readOnly name="size-large" value={stars} size="large" />
      </Stack>
    </Box>
  );
};

export default FeedbackCard;
