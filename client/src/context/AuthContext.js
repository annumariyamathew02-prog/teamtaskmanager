// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (token) {
          // set header for verification call
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Verify token with backend if endpoint exists. If verification fails
          // assume token is invalid and clear stored auth.
          try {
            const resp = await axios.get('http://localhost:5000/api/auth/me');
            // prefer authoritative server user, fallback to stored user
            const serverUser = resp.data?.user || storedUser;
            setCurrentUser(serverUser || null);
          } catch (verifyErr) {
            // verification failed: clear stored auth
            console.warn('Token verification failed:', verifyErr?.response?.status || verifyErr.message);
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
          }
        } else if (storedUser) {
          // no token but local user exists — clear inconsistent state
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store user and token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the auth token for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update the current user
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    // Remove user and token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear current user
    setCurrentUser(null);
    navigate('/login');
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};