import { motion } from 'framer-motion'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom'
import { OperationsView } from '@/pages/OperationsView'
import { ChallengesView } from '@/pages/ChallengesView'
import { ReputationView } from '@/pages/ReputationView'
import { FinancialsView } from '@/pages/FinancialsView'
import { OracleConfigView } from '@/pages/OracleConfigView'
import { UsersPage } from '@/pages/users/UsersPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { ProfileSettings } from '@/pages/profile/ProfileSettings'
import { SupportCenterPage } from '@/pages/supportcenter/SupportTickets'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { DashboardLayout } from '@/App/DashbaordLayout'
import { ToastContainer } from '@/components/ui/Toast'

// ─── Route Wrappers to Keep Prop Contracts Untouched ─────────────────────────

function OperationsRoute() {
  const navigate = useNavigate()
  return (
    <OperationsView
      onNavigateToChallenges={() => navigate('/challenges-all')}
      navigate={(tab) => navigate('/' + tab)}
    />
  )
}

function ChallengesRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname
  return <ChallengesView activeTab={currentTab} navigate={(tab) => navigate('/' + tab)} />
}

function ReputationRoute() {
  const navigate = useNavigate()
  return <ReputationView navigate={(tab) => navigate('/' + tab)} />
}

function FinancialsRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname
  return <FinancialsView activeTab={currentTab} navigate={(tab) => navigate('/' + tab)} />
}

function OracleRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname
  return <OracleConfigView activeTab={currentTab} navigate={(tab) => navigate('/' + tab)} />
}

function UsersRoute() {
  const navigate = useNavigate()
  return <UsersPage navigate={(tab) => navigate('/' + tab)} />
}

function ProfileRoute() {
  const navigate = useNavigate()
  return <ProfilePage navigate={(tab) => navigate('/' + tab)} />
}

function ProfileSettingsRoute() {
  const navigate = useNavigate()
  return <ProfileSettings navigate={(tab) => navigate('/' + tab)} />
}

function SupportCenterRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname
  return <SupportCenterPage activeTab={currentTab} navigate={(tab) => navigate('/' + tab)} />
}

function LoginPageView() {
  const navigate = useNavigate()
  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <LoginPage onSwitchToSignup={() => navigate('/signup')} />
    </motion.div>
  )
}

// ─── Auth Gate ─────────────────────────────────────────────────────────────

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-border border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<LoginPageView />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/operations" replace />} />
            <Route path="operations" element={<OperationsRoute />} />
            <Route path="challenges" element={<ChallengesRoute />} />
            <Route path="challenges-all" element={<ChallengesRoute />} />
            <Route path="challenges-categories" element={<ChallengesRoute />} />
            <Route path="challenges-live" element={<ChallengesRoute />} />
            <Route path="challenges-disputes" element={<ChallengesRoute />} />
            <Route path="challenges-analytics" element={<ChallengesRoute />} />
            <Route path="reputation" element={<ReputationRoute />} />
            <Route path="financials" element={<FinancialsRoute />} />
            <Route path="financials-wallet" element={<FinancialsRoute />} />
            <Route path="financials-transactions" element={<FinancialsRoute />} />
            <Route path="financials-rewards" element={<FinancialsRoute />} />
            <Route path="financials-treasury" element={<FinancialsRoute />} />
            <Route path="financials-revenue" element={<FinancialsRoute />} />
            <Route path="financials-escrow" element={<FinancialsRoute />} />
            <Route path="financials-fees" element={<FinancialsRoute />} />
            <Route path="financials-disputes" element={<FinancialsRoute />} />
            <Route path="ai-oracle" element={<OracleRoute />} />
            <Route path="ai-oracle-control" element={<OracleRoute />} />
            <Route path="ai-oracle-settlement" element={<OracleRoute />} />
            <Route path="ai-oracle-config" element={<OracleRoute />} />
            <Route path="ai-oracle-monitoring" element={<OracleRoute />} />
            <Route path="users" element={<UsersRoute />} />
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="profile-settings" element={<ProfileSettingsRoute />} />
            <Route path="support-center" element={<SupportCenterRoute />} />
            <Route path="support-tickets" element={<SupportCenterRoute />} />
            <Route path="support-disputes" element={<SupportCenterRoute />} />
            <Route path="support-refunds" element={<SupportCenterRoute />} />
            <Route path="support-faq" element={<SupportCenterRoute />} />
            <Route path="support-categories" element={<SupportCenterRoute />} />
            <Route path="*" element={<Navigate to="/operations" replace />} />
          </Route>
        </>
      )}
    </Routes>
  )
}

import { WalletProvider } from '@/context/WalletContext'
import { ChallengesProvider } from '@/context/ChallengesContext'
import { OracleProvider } from '@/context/OracleContext'

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AuthProvider>
          <ChallengesProvider>
            <OracleProvider>
              <BrowserRouter>
                <AuthGate />
                <ToastContainer />
              </BrowserRouter>
            </OracleProvider>
          </ChallengesProvider>
        </AuthProvider>
      </WalletProvider>
    </ThemeProvider>
  )
}

export default App
