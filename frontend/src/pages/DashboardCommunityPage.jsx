import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ShareIcon from "@mui/icons-material/Share";
import CommentIcon from "@mui/icons-material/Comment";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddIcon from "@mui/icons-material/Add";

// Mock data for community posts
const MOCK_POSTS = [
  {
    id: 1,
    title: "How to solve quadratic equations efficiently?",
    content: "I'm struggling with the factorization method for quadratic equations. Can anyone explain step by step?",
    category: "question",
    author: "John Doe",
    avatar: "JD",
    timestamp: "2 hours ago",
    views: 156,
    likes: 24,
    comments: 8,
    liked: false,
    tags: ["mathematics", "algebra"],
  },
  {
    id: 2,
    title: "Great resource for learning Python",
    content: "Found this amazing tutorial that helped me understand OOP concepts better.",
    category: "resource",
    author: "Jane Smith",
    avatar: "JS",
    timestamp: "4 hours ago",
    views: 342,
    likes: 87,
    comments: 15,
    liked: true,
    tags: ["programming", "python"],
  },
  {
    id: 3,
    title: "Physics Midterm Exam Tips",
    content: "Let's discuss strategies for the upcoming physics midterm. What topics are you finding most challenging?",
    category: "discussion",
    author: "Mike Johnson",
    avatar: "MJ",
    timestamp: "6 hours ago",
    views: 89,
    likes: 12,
    comments: 5,
    liked: false,
    tags: ["physics", "exam"],
  },
  {
    id: 4,
    title: "New Chemistry Lab Session Announced",
    content: "The advanced chemistry lab session will start next week. All interested students should register by Friday.",
    category: "announcement",
    author: "Admin",
    avatar: "AD",
    timestamp: "1 day ago",
    views: 523,
    likes: 45,
    comments: 22,
    liked: false,
    tags: ["chemistry", "announcement"],
  },
];

const PlatformCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: "",
    content: "",
    category: "discussion",
  });

  const categories = [
    { id: "all", label: "All", color: "default" },
    { id: "discussion", label: "Discussion", color: "primary" },
    { id: "question", label: "Question", color: "info" },
    { id: "resource", label: "Resource", color: "success" },
    { id: "announcement", label: "Announcement", color: "warning" },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPosts(MOCK_POSTS);
      setFilteredPosts(MOCK_POSTS);
      setLoading(false);
    }, 500);
  }, []);

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = posts;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedCategory, posts]);

  const handleCreatePost = () => {
    if (newPostData.title.trim() && newPostData.content.trim()) {
      const post = {
        id: posts.length + 1,
        ...newPostData,
        author: "You",
        avatar: "YO",
        timestamp: "just now",
        views: 0,
        likes: 0,
        comments: 0,
        liked: false,
        tags: [],
      };
      setPosts([post, ...posts]);
      setNewPostData({ title: "", content: "", category: "discussion" });
      setOpenNewPost(false);
    }
  };

  const handleLikePost = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const getCategoryColor = (category) => {
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.color : "default";
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Community
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewPost(true)}
          >
            New Post
          </Button>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search posts, discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Category Filter */}
        <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1 }}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? "filled" : "outlined"}
              color={cat.color}
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Box>
      </Box>

      {/* Posts List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredPosts.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">
            No posts found. Try adjusting your filters or create a new post!
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredPosts.map((post) => (
            <Card key={post.id} elevation={0} sx={{ border: 1, borderColor: "divider" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {post.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {post.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.timestamp} • {post.views} views
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title="Options">
                    <IconButton size="small">
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {post.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {post.content}
                </Typography>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    {post.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                {/* Category Badge */}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={post.category}
                    size="small"
                    color={getCategoryColor(post.category)}
                    variant="filled"
                  />
                </Box>
              </CardContent>

              <Divider />

              <CardActions sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Like">
                    <IconButton
                      size="small"
                      onClick={() => handleLikePost(post.id)}
                      sx={{
                        color: post.liked ? "error.main" : "text.secondary",
                      }}
                    >
                      {post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {post.likes}
                      </Typography>
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Comment">
                    <IconButton size="small" sx={{ color: "text.secondary" }}>
                      <CommentIcon />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {post.comments}
                      </Typography>
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Share">
                    <IconButton size="small" sx={{ color: "text.secondary" }}>
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Button size="small" color="primary">
                  View Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* New Post Dialog */}
      <Dialog open={openNewPost} onClose={() => setOpenNewPost(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create a New Post</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            placeholder="What's on your mind?"
            value={newPostData.title}
            onChange={(e) =>
              setNewPostData({ ...newPostData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Content"
            placeholder="Share your thoughts, question, or resource..."
            multiline
            rows={4}
            value={newPostData.content}
            onChange={(e) =>
              setNewPostData({ ...newPostData, content: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Category
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {categories.slice(1).map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                onClick={() =>
                  setNewPostData({ ...newPostData, category: cat.id })
                }
                variant={
                  newPostData.category === cat.id ? "filled" : "outlined"
                }
                color={cat.color}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNewPost(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleCreatePost}
            variant="contained"
            disabled={!newPostData.title.trim() || !newPostData.content.trim()}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlatformCommunity;
