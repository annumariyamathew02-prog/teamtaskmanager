// client/src/components/common/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppShell from '../layout/AppShell';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      {children}
    </AppShell>
  );
};

export default ProtectedRoute;