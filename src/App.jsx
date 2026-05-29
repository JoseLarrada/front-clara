import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SuperAdminDashboard from './features/superadmin/pages/SuperAdminDashboard'
import RRHHDashboardPage from './features/rrhh/dashboard/pages/RRHHDashboardPage'
import EmployeeManagementPage from './features/rrhh/employees/pages/EmployeeManagementPage'
import ScheduleSettingsPage from './features/rrhh/schedules/pages/ScheduleSettingsPage'
import GeocercaManagementPage from './features/rrhh/geocercas/pages/GeocercaManagementPage'
import JustificacionPage from './features/rrhh/justificaciones/pages/JustificacionPage'
import VacacionesPage from './features/rrhh/vacaciones/pages/VacacionesPage'
import PrenominaPage from './features/rrhh/prenomina/pages/PrenominaPage'
import CalendarioPage from './features/rrhh/calendario/pages/CalendarioPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/superadmin" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'SUPERADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rrhh" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN_RRHH', 'ADMIN_RRHH']}>
                <RRHHDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rrhh/empleados" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN_RRHH', 'ADMIN_RRHH']}>
                <EmployeeManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rrhh/horarios" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN_RRHH', 'ADMIN_RRHH']}>
                <ScheduleSettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rrhh/geocercas" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN_RRHH', 'ADMIN_RRHH']}>
                <GeocercaManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rrhh/justificaciones" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN_RRHH', 'ADMIN_RRHH']}>
                <JustificacionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rrhh/vacaciones" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN_RRHH', 'ADMIN_RRHH']}>
                <VacacionesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rrhh/prenomina" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN_RRHH', 'ADMIN_RRHH']}>
                <PrenominaPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rrhh/calendario" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN_RRHH', 'ADMIN_RRHH']}>
                <CalendarioPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
