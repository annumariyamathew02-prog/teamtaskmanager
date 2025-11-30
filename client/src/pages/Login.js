// client/src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'john@example.com', // Pre-fill for testing
    password: 'password123'   // Pre-fill for testing
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password');
      }
      
      // Call login function from AuthContext
      await login(formData);
      
      // Show success message and redirect
      console.log('Login successful');
      // Navigation will be handled by the useEffect
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to log in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e8f0fe 0%, #f3f7ff 50%, #ffffff 100%)',
        p: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 1100,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Grid container>
          {/* Left: marketing / hero */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              background: 'linear-gradient(180deg, rgba(25,118,210,0.08), rgba(25,118,210,0.02))',
              p: { xs: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Team Task Manager
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
              Organize work. Ship faster.
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Manage tasks, track progress, and collaborate with your team in one place. Assign tasks to
              people or entire teams, set deadlines, and get notified when work is due.
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Assign tasks to people or teams" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Track status: pending, in-progress, completed" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Set deadlines & reminders" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="caption" color="text.secondary">
              Quick demo account: <strong>john@example.com</strong> / <strong>password123</strong>
            </Typography>
          </Grid>

          {/* Right: login form */}
          <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 6 }, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome back
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sign in to your account to continue managing tasks and collaborating with your team.
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  placeholder="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  placeholder="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold', mb: 2 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Button
                  component={Link}
                  to="/register"
                  fullWidth
                  variant="outlined"
                  onClick={(e) => { e.preventDefault(); navigate('/register'); }}
                  sx={{ py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Create Account
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    By signing in you agree to the Terms of Service and Privacy Policy.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Login;