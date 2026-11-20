import { Navigate, useLocation } from 'react-router-dom';

// Wrap any page with this. No token => go to /login. Token => show the page.
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
