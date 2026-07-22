import { motion } from 'framer-motion'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom'
import { OperationsView } from '@/pages/dashbaord/DashbordPage'
import { ChallengesView } from '@/pages/ChallengesView'
import { LeaderboardsView } from '@/pages/LeaderboardsView'
import { ReputationView } from '@/pages/ReputationView'
import { FinancialsView } from '@/pages/FinancialsView'
import { OracleConfigView } from '@/pages/OracleConfigView'
import { UsersPage } from '@/pages/users/UsersPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { ProfileSettings } from '@/pages/profile/ProfileSettings'
import { SupportCenterPage } from '@/pages/supportcenter/SupportTickets'
import { PlatformSettingsView } from '@/pages/PlatformSettingsView'
import NotFoundPage from '@/pages/NotFoundPage'
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

function LeaderboardsRoute() {
  return <LeaderboardsView />
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

function SettingsRoute() {
  return <PlatformSettingsView />
}

function SupportCenterRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname
  return <SupportCenterPage activeTab={currentTab} navigate={(tab) => navigate('/' + tab)} />
}

// ─── Protected Layout & Route Gate ───────────────────────────────────────────

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
          />
          <span className="text-xs font-mono text-muted">Authenticating Session...</span>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/operations" replace /> : <LoginPage onSwitchToSignup={() => {}} />} />

      {!isAuthenticated ? (
        <Route path="*" element={<Navigate to="/login" state={{ from: location }} replace />} />
      ) : (
        <>
          <Route path="/" element={<Navigate to="/operations" replace />} />
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<OperationsRoute />} />
            <Route path="operations" element={<OperationsRoute />} />
            <Route path="challenges" element={<ChallengesRoute />} />
            <Route path="challenges-all" element={<ChallengesRoute />} />
            <Route path="challenges-categories" element={<ChallengesRoute />} />
            <Route path="challenges-live" element={<ChallengesRoute />} />
            <Route path="challenges-disputes" element={<ChallengesRoute />} />
            <Route path="challenges-analytics" element={<ChallengesRoute />} />
            <Route path="leaderboards" element={<LeaderboardsRoute />} />
            <Route path="reputation" element={<ReputationRoute />} />
            <Route path="financials" element={<FinancialsRoute />} />
            <Route path="financials-wallet" element={<FinancialsRoute />} />
            <Route path="financials-payments" element={<FinancialsRoute />} />
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
            <Route path="settings" element={<SettingsRoute />} />
            <Route path="support-center" element={<SupportCenterRoute />} />
            <Route path="support-tickets" element={<SupportCenterRoute />} />
            <Route path="support-disputes" element={<SupportCenterRoute />} />
            <Route path="support-refunds" element={<SupportCenterRoute />} />
            <Route path="support-faq" element={<SupportCenterRoute />} />
            <Route path="support-categories" element={<SupportCenterRoute />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </>
      )}
    </Routes>
  )
}

import { WalletProvider } from '@/context/WalletContext'
import { ChallengesProvider } from '@/context/ChallengesContext'
import { OracleProvider } from '@/context/OracleContext'
import { PlatformSettingsProvider } from '@/context/PlatformSettingsContext'

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AuthProvider>
          <ChallengesProvider>
            <OracleProvider>
              <PlatformSettingsProvider>
                <BrowserRouter>
                  <AuthGate />
                  <ToastContainer />
                </BrowserRouter>
              </PlatformSettingsProvider>
            </OracleProvider>
          </ChallengesProvider>
        </AuthProvider>
      </WalletProvider>
    </ThemeProvider>
  )
}

export default App
