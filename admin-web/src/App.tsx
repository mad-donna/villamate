import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Villas from './pages/Villas';
import VillaDetail from './pages/VillaDetail';
import ProtectedRoute from './components/ProtectedRoute';
import SystemNotices from './pages/SystemNotices';
import Faqs from './pages/Faqs';
import Guides from './pages/Guides';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="villas" element={<Villas />} />
          <Route path="villas/:villaId" element={<VillaDetail />} />
          <Route path="notices" element={<SystemNotices />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="guides" element={<Guides />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
