import { Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './index.css'
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import './App.css'


const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
            </Routes>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;