
import { Navigate } from 'react-router-dom';
import { useAuth } from '../App';

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
};

export default Index;
