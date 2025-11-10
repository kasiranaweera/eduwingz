import React from "react";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { CheckCircle, Schedule, MenuBook } from "@mui/icons-material";

const activities = [
  {
    icon: <CheckCircle color="success" />,
    text: "Completed Lesson: Algebra Basics",
    time: "2 hours ago",
  },
  {
    icon: <Schedule color="primary" />,
    text: "Started Quiz: Chapter 3",
    time: "5 hours ago",
  },
  {
    icon: <MenuBook color="secondary" />,
    text: "Viewed Notes: Chemical Reactions",
    time: "1 day ago",
  },
];

const RecentActivities = () => {
  return (
    <List dense>
      {activities.map((action, index) => (
        <ListItem key={index}>
          <ListItemIcon>{action.icon}</ListItemIcon>
          <ListItemText primary={action.text} secondary={action.time} />
        </ListItem>
      ))}
    </List>
  );
};

export default RecentActivities;
