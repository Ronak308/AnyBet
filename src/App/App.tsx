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
import { RolesPermissionsPage } from '@/pages/rolesAndPermissions/Role-Permission'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { ProfileSettings } from '@/pages/profile/ProfileSettings'
import { SupportCenterPage } from '@/pages/supportcenter/SupportTickets'
import { PlatformSettingsView } from '@/pages/PlatformSettingsView'
import { HelpPage } from '@/pages/HelpPage'
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

function RolesPermissionsRoute() {
  const navigate = useNavigate()
  return <RolesPermissionsPage navigate={(tab) => navigate('/' + tab)} />
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

function HelpRoute() {
  const navigate = useNavigate()
  return <HelpPage navigate={(tab) => navigate('/' + tab)} />
}

function SupportCenterRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname
  return <SupportCenterPage activeTab={currentTab} navigate={(tab) => navigate('/' + tab)} />
}

// ─── Protected Layout & Route Gate ───────────────────────────────────────────

import { usePermissions } from '@/context/PermissionContext'
import { ShieldAlert } from 'lucide-react'

function AccessRestrictedView({ moduleName }: { moduleName: string }) {
  return (
    <div className="p-6 min-h-[calc(100vh-4rem)] flex items-center justify-center font-sans">
      <div className="p-8 rounded-2xl max-w-md w-full text-center space-y-4 border border-rose-500/30 bg-rose-500/5 backdrop-blur-md">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Access Restricted</h3>
        <p className="text-xs text-muted font-mono leading-relaxed">
          Your assigned role does not have permission to view the <span className="text-primary font-bold">{moduleName}</span> module.
        </p>
      </div>
    </div>
  )
}

function ProtectedModuleRoute({ moduleKey, label, children }: { moduleKey: string; label: string; children: React.ReactNode }) {
  const { canView } = usePermissions()
  if (!canView(moduleKey)) {
    return <AccessRestrictedView moduleName={label} />
  }
  return <>{children}</>
}

function DefaultRedirect() {
  const { canView } = usePermissions()

  const defaultRoutes = [
    { key: 'dashboard', path: '/dashboard' },
    { key: 'users', path: '/users' },
    { key: 'roles-permissions', path: '/roles-permissions' },
    { key: 'challenges-all', path: '/challenges-all' },
    { key: 'leaderboards', path: '/leaderboards' },
    { key: 'reputation', path: '/reputation' },
    { key: 'financials-wallet', path: '/financials-wallet' },
    { key: 'ai-oracle-control', path: '/ai-oracle-control' },
    { key: 'support-tickets', path: '/support-tickets' },
    { key: 'settings', path: '/settings' },
  ]

  const firstAllowed = defaultRoutes.find(route => canView(route.key))
  const targetPath = firstAllowed ? firstAllowed.path : '/profile'

  return <Navigate to={targetPath} replace />
}

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
      <Route path="/login" element={isAuthenticated ? <DefaultRedirect /> : <LoginPage onSwitchToSignup={() => { }} />} />

      {!isAuthenticated ? (
        <Route path="*" element={<Navigate to="/login" state={{ from: location }} replace />} />
      ) : (
        <>
          <Route path="/" element={<DefaultRedirect />} />
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<ProtectedModuleRoute moduleKey="dashboard" label="Dashboard"><OperationsRoute /></ProtectedModuleRoute>} />
            <Route path="challenges" element={<ProtectedModuleRoute moduleKey="challenges-all" label="Challenges"><ChallengesRoute /></ProtectedModuleRoute>} />
            <Route path="challenges-all" element={<ProtectedModuleRoute moduleKey="challenges-all" label="All Challenges"><ChallengesRoute /></ProtectedModuleRoute>} />
            <Route path="challenges-categories" element={<ProtectedModuleRoute moduleKey="challenges-categories" label="Challenge Categories"><ChallengesRoute /></ProtectedModuleRoute>} />
            <Route path="challenges-live" element={<ProtectedModuleRoute moduleKey="challenges-live" label="Live & Settlement"><ChallengesRoute /></ProtectedModuleRoute>} />
            <Route path="challenges-disputes" element={<ProtectedModuleRoute moduleKey="challenges-disputes" label="Disputes"><ChallengesRoute /></ProtectedModuleRoute>} />
            <Route path="challenges-analytics" element={<ProtectedModuleRoute moduleKey="challenges-analytics" label="Analytics"><ChallengesRoute /></ProtectedModuleRoute>} />
            <Route path="leaderboards" element={<ProtectedModuleRoute moduleKey="leaderboards" label="Leaderboards"><LeaderboardsRoute /></ProtectedModuleRoute>} />
            <Route path="reputation" element={<ProtectedModuleRoute moduleKey="reputation" label="Reputation"><ReputationRoute /></ProtectedModuleRoute>} />
            <Route path="financials" element={<ProtectedModuleRoute moduleKey="financials-wallet" label="Financials"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="financials-wallet" element={<ProtectedModuleRoute moduleKey="financials-wallet" label="Wallet"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="financials-payments" element={<ProtectedModuleRoute moduleKey="financials-wallet" label="Payments"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="financials-transactions" element={<ProtectedModuleRoute moduleKey="financials-transactions" label="Transactions"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="financials-rewards" element={<ProtectedModuleRoute moduleKey="financials-rewards" label="Rewards"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="financials-treasury" element={<ProtectedModuleRoute moduleKey="financials-treasury" label="Treasury"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="financials-revenue" element={<ProtectedModuleRoute moduleKey="financials-treasury" label="Revenue"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="financials-escrow" element={<ProtectedModuleRoute moduleKey="financials-treasury" label="Escrow"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="financials-fees" element={<ProtectedModuleRoute moduleKey="financials-treasury" label="Fees"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="financials-disputes" element={<ProtectedModuleRoute moduleKey="financials-treasury" label="Financial Disputes"><FinancialsRoute /></ProtectedModuleRoute>} />
            <Route path="ai-oracle" element={<ProtectedModuleRoute moduleKey="ai-oracle-control" label="AI Oracle"><OracleRoute /></ProtectedModuleRoute>} />
            <Route path="ai-oracle-control" element={<ProtectedModuleRoute moduleKey="ai-oracle-control" label="Oracle Control Center"><OracleRoute /></ProtectedModuleRoute>} />
            <Route path="ai-oracle-settlement" element={<ProtectedModuleRoute moduleKey="ai-oracle-settlement" label="Oracle Settlement Center"><OracleRoute /></ProtectedModuleRoute>} />
            <Route path="ai-oracle-config" element={<ProtectedModuleRoute moduleKey="ai-oracle-config" label="Oracle Configuration"><OracleRoute /></ProtectedModuleRoute>} />
            <Route path="ai-oracle-monitoring" element={<ProtectedModuleRoute moduleKey="ai-oracle-monitoring" label="Oracle Monitoring"><OracleRoute /></ProtectedModuleRoute>} />
            <Route path="users" element={<ProtectedModuleRoute moduleKey="users" label="Users"><UsersRoute /></ProtectedModuleRoute>} />
            <Route path="roles-permissions" element={<ProtectedModuleRoute moduleKey="roles-permissions" label="Roles & Permissions"><RolesPermissionsRoute /></ProtectedModuleRoute>} />
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="profile-settings" element={<ProfileSettingsRoute />} />
            <Route path="settings" element={<ProtectedModuleRoute moduleKey="settings" label="Settings"><SettingsRoute /></ProtectedModuleRoute>} />
            <Route path="help" element={<HelpRoute />} />
            <Route path="support-center" element={<ProtectedModuleRoute moduleKey="support-tickets" label="Support Center"><SupportCenterRoute /></ProtectedModuleRoute>} />
            <Route path="support-tickets" element={<ProtectedModuleRoute moduleKey="support-tickets" label="Support Tickets"><SupportCenterRoute /></ProtectedModuleRoute>} />
            <Route path="support-disputes" element={<ProtectedModuleRoute moduleKey="support-tickets" label="Support Disputes"><SupportCenterRoute /></ProtectedModuleRoute>} />
            <Route path="support-refunds" element={<ProtectedModuleRoute moduleKey="support-tickets" label="Support Refunds"><SupportCenterRoute /></ProtectedModuleRoute>} />
            <Route path="support-faq" element={<ProtectedModuleRoute moduleKey="support-faq" label="FAQ Manager"><SupportCenterRoute /></ProtectedModuleRoute>} />
            <Route path="support-categories" element={<ProtectedModuleRoute moduleKey="support-categories" label="Support Categories"><SupportCenterRoute /></ProtectedModuleRoute>} />
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
import { PermissionProvider } from '@/context/PermissionContext'

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AuthProvider>
          <PermissionProvider>
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
          </PermissionProvider>
        </AuthProvider>
      </WalletProvider>
    </ThemeProvider>
  )
}

export default App
