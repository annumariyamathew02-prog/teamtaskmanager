import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#9c27b0'
    }
  },
  typography: {
    h4: {
      fontWeight: 700
    },
    h5: {
      fontWeight: 700
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
    }
  }
});

export default theme;
