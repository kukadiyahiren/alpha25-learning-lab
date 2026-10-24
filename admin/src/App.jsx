import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken } from './api';
import Layout from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CatalogPage from './pages/CatalogPage';
import ClassesPage from './pages/ClassesPage';

function Private({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Private><Dashboard /></Private>} />
      <Route path="/classes" element={<Private><ClassesPage /></Private>} />
      <Route path="/audio" element={<Private><CatalogPage resource="audio" /></Private>} />
      <Route path="/ebooks" element={<Private><CatalogPage resource="ebooks" /></Private>} />
      <Route path="/worksheets" element={<Private><CatalogPage resource="worksheets" /></Private>} />
      <Route path="/gk" element={<Private><CatalogPage resource="gk" /></Private>} />
      <Route path="/spoken-english" element={<Private><CatalogPage resource="spoken-english" /></Private>} />
      <Route path="/phonics" element={<Private><CatalogPage resource="phonics" /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
