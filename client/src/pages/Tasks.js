// client/src/pages/Tasks.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../services/api';


const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const taskValidationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  dueDate: Yup.date().required('Due date is required').min(new Date(), 'Due date must be in the future'),
  priority: Yup.string().required('Priority is required'),
  status: Yup.string().required('Status is required'),
  assignedTo: Yup.string().required('Please assign to a team member'),
  team: Yup.string(),
});

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterTeam, setFilterTeam] = useState(''); // Filter by team

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
    fetchTeams();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.getTasks();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data } = await api.getTeamMembers();
      setTeamMembers(data);
    } catch (error) {
      toast.error('Failed to fetch team members');
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await api.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 'medium',
      status: 'pending',
      assignedTo: '',
      team: '',
    },
    validationSchema: taskValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          ...values,
          dueDate: values.dueDate.toISOString(),
        };
        // Remove empty team field
        if (!payload.team) {
          delete payload.team;
        }
        
        if (editingTask) {
          await api.updateTask(editingTask._id, payload);
          toast.success('Task updated successfully');
        } else {
          await api.createTask(payload);
          toast.success('Task created successfully');
        }
        handleClose();
        resetForm();
        fetchTasks();
      } catch (error) {
        toast.error(error.response?.data?.error || 'An error occurred');
      }
    },
  });

  const handleOpen = (task = null) => {
    if (task) {
      setEditingTask(task);
      formik.setValues({
        title: task.title,
        description: task.description || '',
        dueDate: new Date(task.dueDate),
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo._id,
        team: task.team ? task.team._id || task.team : '',
      });
    } else {
      setEditingTask(null);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(id);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography>Loading tasks...</Typography>
      </Container>
    );
  }

  // Filter tasks by team if selected
  const filteredTasks = filterTeam 
    ? tasks.filter(task => task.team && task.team._id === filterTeam)
    : tasks;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Task
        </Button>
      </Box>

      {/* Team Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filter-team-label">Filter by Team</InputLabel>
          <Select
            labelId="filter-team-label"
            id="filter-team"
            value={filterTeam}
            label="Filter by Team"
            onChange={(e) => setFilterTeam(e.target.value)}
          >
            <MenuItem value="">All Teams</MenuItem>
            {teams.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No tasks found. Create one to get started!
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.team ? task.team.name : '—'}</TableCell>
                  <TableCell>{task.assignedTo.name}</TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(task)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(task._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="title"
                name="title"
                label="Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
              <TextField
                margin="normal"
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
              <FormControl
                fullWidth
                margin="normal"
                error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
              >
                <InputLabel id="assignedTo-label">Assigned To</InputLabel>
                <Select
                  labelId="assignedTo-label"
                  id="assignedTo"
                  name="assignedTo"
                  value={formik.values.assignedTo}
                  label="Assigned To"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {teamMembers.map((member) => (
                    <MenuItem key={member._id} value={member._id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.assignedTo && formik.errors.assignedTo && (
                  <FormHelperText>{formik.errors.assignedTo}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="team-label">Team (Optional)</InputLabel>
                <Select
                  labelId="team-label"
                  id="team"
                  name="team"
                  value={formik.values.team}
                  label="Team (Optional)"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">None</MenuItem>
                  {teams.map((t) => (
                    <MenuItem key={t._id} value={t._id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Due Date"
                value={formik.values.dueDate}
                onChange={(date) => formik.setFieldValue('dueDate', date, true)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                    helperText={formik.touched.dueDate && formik.errors.dueDate}
                  />
                )}
              />
              <FormControl
                fullWidth
                margin="normal"
                error={formik.touched.priority && Boolean(formik.errors.priority)}
              >
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={formik.values.priority}
                  label="Priority"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.priority && formik.errors.priority && (
                  <FormHelperText>{formik.errors.priority}</FormHelperText>
                )}
              </FormControl>
              <FormControl
                fullWidth
                margin="normal"
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  label="Status"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTask ? 'Update' : 'Create'} Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Tasks;