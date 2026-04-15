import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedType }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedType && user.tipo !== allowedType) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;

