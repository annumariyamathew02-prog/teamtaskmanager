// client/src/pages/Profile.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  Alert,
  Grid,
}from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';


const Profile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    currentPassword: Yup.string().when('newPassword', {
      is: (val) => val && val.length > 0,
      then: Yup.string().required('Current password is required'),
    }),
    newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref('newPassword'), null],
      'Passwords must match'
    ),
  });

  const formik = useFormik({
    initialValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        // In a real app, you would call an API to update the user's profile
        // For now, we'll just show a success message
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to update profile');
      }
    },
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    formik.resetForm();
    setIsEditing(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>

        <Paper sx={{ p: 4, mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{ width: 100, height: 100, mb: 2, fontSize: '2.5rem' }}
            >
              {currentUser?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6">{currentUser?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {currentUser?.role || 'User'}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={!isEditing}
                />
              </Grid>

              {isEditing && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Change Password
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      id="currentPassword"
                      name="currentPassword"
                      label="Current Password"
                      type="password"
                      value={formik.values.currentPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.currentPassword &&
                        Boolean(formik.errors.currentPassword)
                      }
                      helperText={
                        formik.touched.currentPassword &&
                        formik.errors.currentPassword
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      label="New Password"
                      type="password"
                      value={formik.values.newPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.newPassword &&
                        Boolean(formik.errors.newPassword)
                      }
                      helperText={
                        formik.touched.newPassword && formik.errors.newPassword
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.confirmPassword &&
                        Boolean(formik.errors.confirmPassword)
                      }
                      helperText={
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                      }
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sx={{ mt: 2 }}>
                {isEditing ? (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;