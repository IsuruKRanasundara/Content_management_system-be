import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AsyncJobProvider } from './context/AsyncJobContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ContentList from './pages/ContentList';
import ContentEditor from './pages/ContentEditor';
import UserList from './pages/UserList';
import AboutUs from './pages/AboutUs';
import ContentDetails from './pages/ContentDetails';
import AdminJobPanel from './pages/AdminJobPanel';
import { JobStatusIndicator } from './components/async/JobStatusComponents';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AsyncJobProvider autoRefreshInterval={30000} persistState={true}>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="about" element={<AboutUs />} />
                  <Route path="contents/:id/view" element={<ContentDetails />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="contents" element={<ContentList />} />
                    <Route path="contents/new" element={<ContentEditor />} />
                    <Route path="contents/:id" element={<ContentEditor />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute roles={['Admin']} />}>
                    <Route path="users" element={<UserList />} />
                    <Route path="admin/jobs" element={<AdminJobPanel />} />
                  </Route>
                </Route>
              </Routes>
              
              {/* Floating job status indicator */}
              <JobStatusIndicator />
            </Router>
          </AsyncJobProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
