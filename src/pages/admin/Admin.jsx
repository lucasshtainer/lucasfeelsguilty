import { Navigate, Route, Routes } from 'react-router-dom';
import { isAdminLoggedIn } from '../../context/LettersContext.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import AdminEditor from './AdminEditor.jsx';
import './Admin.css';

function AdminGuard({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function Admin() {
  return (
    <div className="admin">
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          path="/"
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          }
        />
        <Route
          path="edit/:slug"
          element={
            <AdminGuard>
              <AdminEditor />
            </AdminGuard>
          }
        />
        <Route
          path="new"
          element={
            <AdminGuard>
              <AdminEditor isNew />
            </AdminGuard>
          }
        />
      </Routes>
    </div>
  );
}
