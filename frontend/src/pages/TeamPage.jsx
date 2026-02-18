import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Description,
  Image as ImageIcon,
  BarChart,
  AccountTree,
  MenuBook,
  Slideshow,
  Download,
  AutoAwesome,
  CheckCircle,
  Info,
  Circle
} from '@mui/icons-material';

const EducationalDesignGenerator = () => {
  const [designType, setDesignType] = useState('graphical-abstract');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const designTypes = [
    { 
      id: 'graphical-abstract', 
      name: 'Graphical Abstract', 
      icon: Description, 
      model: 'stabilityai/stable-diffusion-2-1',
      color: '#1976d2'
    },
    { 
      id: 'infographic', 
      name: 'Infographic', 
      icon: ImageIcon, 
      model: 'stabilityai/stable-diffusion-2-1',
      color: '#2e7d32'
    },
    { 
      id: 'diagram', 
      name: 'Diagram', 
      icon: AccountTree, 
      model: 'stabilityai/stable-diffusion-2-1',
      color: '#ed6c02'
    },
    { 
      id: 'mindmap', 
      name: 'Mind Map', 
      icon: AccountTree, 
      model: 'text',
      color: '#9c27b0'
    },
    { 
      id: 'chart', 
      name: 'Chart/Graph', 
      icon: BarChart, 
      model: 'chart',
      color: '#d32f2f'
    },
    { 
      id: 'flashcard', 
      name: 'Flashcard', 
      icon: MenuBook, 
      model: 'text',
      color: '#0288d1'
    },
    { 
      id: 'slide', 
      name: 'Slide Design', 
      icon: Slideshow, 
      model: 'stabilityai/stable-diffusion-2-1',
      color: '#7b1fa2'
    }
  ];

  const generateDesign = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const selectedType = designTypes.find(t => t.id === designType);
      
      if (selectedType.model === 'text') {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: `Generate a ${designType} for: ${prompt}. ${
                designType === 'mindmap' 
                  ? 'Create a hierarchical structure with main topic, subtopics, and details. Format as JSON with structure: {center: "topic", branches: [{name: "subtopic", items: ["detail1", "detail2"]}]}'
                  : 'Create a flashcard with front (question) and back (answer). Format as JSON: {front: "question", back: "answer"}'
              }`
            }]
          })
        });

        const data = await response.json();
        const content = data.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          setResult({ type: 'text', data: JSON.parse(jsonMatch[0]) });
        } else {
          setResult({ type: 'text', data: { raw: content } });
        }
        
      } else if (selectedType.model === 'chart') {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: `Generate chart data for: ${prompt}. Return ONLY valid JSON with this structure: {"type": "bar|line|pie", "title": "Chart Title", "data": [{"label": "A", "value": 10}]}`
            }]
          })
        });

        const data = await response.json();
        const content = data.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          setResult({ type: 'chart', data: JSON.parse(jsonMatch[0]) });
        }
        
      } else {
        const enhancedPrompt = `${designType} style: ${prompt}, educational, clean design, professional, high quality, detailed`;
        
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${selectedType.model}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              inputs: enhancedPrompt,
              parameters: {
                negative_prompt: "blurry, low quality, distorted",
                num_inference_steps: 30
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error('Image generation failed. The model may be loading. Please try again in a moment.');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setResult({ type: 'image', url: imageUrl });
      }
      
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.type === 'image') {
      return (
        <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src={result.url} 
              alt="Generated design" 
              style={{ 
                width: '100%', 
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }} 
            />
            <Button
              variant="contained"
              startIcon={<Download />}
              href={result.url}
              download={`${designType}.png`}
              sx={{ mt: 3 }}
            >
              Download Image
            </Button>
          </Box>
        </Paper>
      );
    }

    if (result.type === 'chart' && result.data) {
      const { type, title, data } = result.data;
      const maxValue = Math.max(...data.map(d => d.value));
      
      return (
        <Paper elevation={3} sx={{ mt: 4, p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {title}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {type === 'bar' && (
            <Box sx={{ mt: 2 }}>
              {data.map((item, idx) => (
                <Box key={idx} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {item.label}
                    </Typography>
                    <Chip label={item.value} size="small" color="primary" />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.value / maxValue) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              ))}
            </Box>
          )}
          
          {type === 'pie' && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {data.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Circle 
                        sx={{ 
                          color: `hsl(${(idx * 360) / data.length}, 70%, 50%)`,
                          fontSize: 20
                        }} 
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {item.value}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      );
    }

    if (result.type === 'text' && result.data) {
      if (result.data.center) {
        return (
          <Paper elevation={3} sx={{ mt: 4, p: 4, bgcolor: '#f5f5f5' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Chip 
                label={result.data.center}
                color="primary"
                sx={{ 
                  fontSize: '1.2rem', 
                  height: 'auto', 
                  py: 2, 
                  px: 4,
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
            <Grid container spacing={3}>
              {result.data.branches?.map((branch, idx) => (
                <Grid item xs={12} md={6} lg={4} key={idx}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">
                        {branch.name}
                      </Typography>
                      <List dense>
                        {branch.items?.map((item, i) => (
                          <ListItem key={i}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={item}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        );
      } else if (result.data.front) {
        return (
          <Paper elevation={3} sx={{ mt: 4, p: 4, minHeight: 300 }}>
            <Box sx={{ mb: 4 }}>
              <Chip label="FRONT" size="small" color="primary" sx={{ mb: 2 }} />
              <Typography variant="h5" fontWeight="medium">
                {result.data.front}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Chip label="BACK" size="small" color="secondary" sx={{ mb: 2 }} />
              <Typography variant="h6">
                {result.data.back}
              </Typography>
            </Box>
          </Paper>
        );
      } else {
        return (
          <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {result.data.raw}
            </Typography>
          </Paper>
        );
      }
    }

    return null;
  };

  const selectedDesign = designTypes.find(t => t.id === designType);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={5} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <AutoAwesome sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Educational Design Generator
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            AI-powered tool to create diagrams, infographics, charts, mindmaps & more
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Select Design Type
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {designTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = designType === type.id;
              
              return (
                <Grid item xs={6} sm={4} md={3} lg={12/7} key={type.id}>
                  <Card
                    onClick={() => setDesignType(type.id)}
                    sx={{
                      cursor: 'pointer',
                      border: isSelected ? `3px solid ${type.color}` : '2px solid transparent',
                      bgcolor: isSelected ? `${type.color}15` : 'white',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Icon 
                        sx={{ 
                          fontSize: 40, 
                          color: isSelected ? type.color : 'text.secondary',
                          mb: 1
                        }} 
                      />
                      <Typography variant="caption" display="block" fontWeight="medium">
                        {type.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Describe Your Design"
            placeholder='Example: "Photosynthesis process with chloroplast, light energy, and glucose production"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={generateDesign}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
            sx={{ 
              py: 1.5,
              background: `linear-gradient(45deg, ${selectedDesign.color}, ${selectedDesign.color}dd)`,
              '&:hover': {
                background: `linear-gradient(45deg, ${selectedDesign.color}dd, ${selectedDesign.color})`
              }
            }}
          >
            {loading ? 'Generating...' : 'Generate Design'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {renderResult()}

        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Info color="primary" />
            <Typography variant="h6" fontWeight="medium">
              Tips for Best Results
            </Typography>
          </Box>
          
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Graphical Abstracts" 
                secondary="Describe key concepts, processes, or workflows clearly"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Diagrams" 
                secondary="Specify components and their relationships"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Charts" 
                secondary="Mention data categories and approximate values"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Mind Maps" 
                secondary="State the central topic and key subtopics"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Note" 
                secondary="Image generation may take 20-30 seconds. If it fails, try again."
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default EducationalDesignGenerator;