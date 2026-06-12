import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Auth Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// App Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Reports from './pages/Reports';

// Employee Pages
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';

// Leave Pages
import LeaveList from './pages/leaves/LeaveList';
import LeaveForm from './pages/leaves/LeaveForm';

// Asset Pages
import AssetList from './pages/assets/AssetList';
import AssetForm from './pages/assets/AssetForm';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Leaves (all authenticated users) */}
      <Route path="/leaves" element={<ProtectedRoute><LeaveList /></ProtectedRoute>} />
      <Route path="/leaves/apply" element={<ProtectedRoute><LeaveForm /></ProtectedRoute>} />

      {/* Employees (admin + manager only) */}
      <Route path="/employees" element={
        <RoleRoute allowedRoles={['admin','manager']}><EmployeeList /></RoleRoute>
      } />
      <Route path="/employees/new" element={
        <RoleRoute allowedRoles={['admin']}><EmployeeForm /></RoleRoute>
      } />
      <Route path="/employees/:id" element={
        <ProtectedRoute><EmployeeForm /></ProtectedRoute>
      } />
      <Route path="/employees/:id/edit" element={
        <RoleRoute allowedRoles={['admin','manager']}><EmployeeForm /></RoleRoute>
      } />

      {/* Assets (admin + manager only) */}
      <Route path="/assets" element={
        <RoleRoute allowedRoles={['admin','manager']}><AssetList /></RoleRoute>
      } />
      <Route path="/assets/new" element={
        <RoleRoute allowedRoles={['admin']}><AssetForm /></RoleRoute>
      } />
      <Route path="/assets/:id/edit" element={
        <RoleRoute allowedRoles={['admin']}><AssetForm /></RoleRoute>
      } />

      {/* Reports (admin only) */}
      <Route path="/reports" element={
        <RoleRoute allowedRoles={['admin']}><Reports /></RoleRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: '5rem' }}>🔍</div>
          <h1 style={{ color: '#f1f1f5', fontSize: '2rem' }}>404 — Page Not Found</h1>
          <a href="/dashboard" style={{ color: '#818cf8', fontWeight: 600 }}>← Go to Dashboard</a>
        </div>
      } />
    </Routes>
  );
}

export default App;
