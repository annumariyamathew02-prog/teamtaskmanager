// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, Button, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import WarningIcon from '@mui/icons-material/Warning';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [overdueTask, setOverdueTask] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeadlineReminders();
  }, []);

  const fetchDeadlineReminders = async () => {
    try {
      const { data } = await api.getTasks();
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const upcoming = [];
      const overdue = [];

      data.forEach(task => {
        // Only check non-completed tasks
        if (task.status !== 'completed') {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

          // Overdue: due date is in the past
          if (daysUntilDue < 0) {
            overdue.push({
              ...task,
              daysOverdue: Math.abs(daysUntilDue)
            });
          }
          // Upcoming: due within 3 days
          else if (daysUntilDue <= 3 && daysUntilDue >= 0) {
            upcoming.push({
              ...task,
              daysUntilDue
            });
          }
        }
      });

      setUpcomingTasks(upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue));
      setOverdueTask(overdue.sort((a, b) => b.daysOverdue - a.daysOverdue));
    } catch (error) {
      console.error('Failed to fetch deadline reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysText = (days) => {
    if (days === 0) return 'Due Today!';
    if (days === 1) return 'Due Tomorrow';
    return `Due in ${days} days`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome, {currentUser?.name}!
        </Typography>
        <Button variant="outlined" color="error" onClick={logout}>
          Logout
        </Button>
      </Box>

      {/* Deadline Reminders Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: '#d32f2f' }} />
          Deadline Reminders
        </Typography>

        {/* Overdue Tasks */}
        {overdueTask.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              ⚠️ {overdueTask.length} Overdue Task{overdueTask.length > 1 ? 's' : ''}
            </Typography>
            <List sx={{ p: 0 }}>
              {overdueTask.map(task => (
                <ListItem key={task._id} sx={{ pl: 0, pb: 0 }}>
                  <ListItemText
                    primary={`"${task.title}" - ${task.daysOverdue} day${task.daysOverdue > 1 ? 's' : ''} overdue`}
                    secondary={`Assigned to: ${task.assignedTo.name} | Status: ${task.status}`}
                    sx={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {/* Upcoming Tasks Due Soon */}
        {upcomingTasks.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📅 {upcomingTasks.length} Task{upcomingTasks.length > 1 ? 's' : ''} Due Soon
            </Typography>
            <List sx={{ p: 0 }}>
              {upcomingTasks.map(task => (
                <ListItem key={task._id} sx={{ pl: 0, pb: 0 }}>
                  <ListItemText
                    primary={`"${task.title}" - ${getDaysText(task.daysUntilDue)}`}
                    secondary={`Assigned to: ${task.assignedTo.name} | Status: ${task.status}`}
                    sx={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {overdueTask.length === 0 && upcomingTasks.length === 0 && !loading && (
          <Alert severity="success">✅ All tasks are on track! No upcoming deadlines.</Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3,
              },
            }}
            onClick={() => navigate('/tasks')}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Tasks
            </Typography>
            <Typography variant="body1" sx={{ flexGrow: 1 }}>
              View and manage your tasks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3,
              },
            }}
            onClick={() => navigate('/team')}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Team
            </Typography>
            <Typography variant="body1" sx={{ flexGrow: 1 }}>
              View your team members
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3,
              },
            }}
            onClick={() => navigate('/profile')}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Profile
            </Typography>
            <Typography variant="body1" sx={{ flexGrow: 1 }}>
              Update your profile information
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;