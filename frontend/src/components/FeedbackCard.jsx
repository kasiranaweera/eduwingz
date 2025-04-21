import { Avatar, Box, Rating, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";

const FeedbackCard = ({ name, comment, stars }) => {
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

  const labels = {
    0.5: "Useless",
    1: "Useless+",
    1.5: "Poor",
    2: "Poor+",
    2.5: "Ok",
    3: "Ok+",
    3.5: "Good",
    4: "Good+",
    4.5: "Excellent",
    5: "Excellent+",
  };

  function getLabelText(value) {
    return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
  }

  return (
    <Box
      sx={{
        backgroundColor: "graycolor.one",
        width: "25%",
        p: 3,
        height: "350px",
        display: "flex",
        alignItems: "center",
        borderRadius: 5,
        borderBottom: 1,
        borderLeft: 1,
        borderColor: "primary.main",
        mx: 1.5,
      }}
    >
      <Stack
        direction="column"
        sx={{ justifyContent: "center", alignItems: "center" }}
        spacing={2}
      >
        <Avatar {...stringAvatar(name)} />
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontWeight: "500" }}
        >
          {" "}
          {name}
        </Typography>
        <Typography sx={{ textAlign: "center", color: "#BEBCBC" }}>
          {comment.length > 100 ? `${comment.substring(0, 100)}...` : comment}
        </Typography>
        <Rating readOnly name="size-large" value={stars} size="large" />
      </Stack>
    </Box>
  );
};

export default FeedbackCard;
