import { useSelector } from 'react-redux';

export function useAuth() {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;
  const isEmployee = user?.role === 'employee';
  return { user, token, isAuthenticated, isAdmin, isManager, isEmployee };
}
