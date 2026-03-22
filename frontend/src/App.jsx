import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage       from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage  from './pages/DashboardPage'
import OverviewPage   from './pages/OverviewPage'
import AnalyticsPage  from './pages/AnalyticsPage'
import RewardsPage    from './pages/RewardsPage'
import Layout         from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen text-4xl animate-pulse">🌸</div>
  if (!user) return <Navigate to="/auth" replace />
  if (!user.onboarding_completed) return <Navigate to="/onboarding" replace />
  return children
}

function OnboardingRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  if (user.onboarding_completed) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index          element={<DashboardPage />} />
        <Route path="overview"  element={<OverviewPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="rewards"   element={<RewardsPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
