import { motion } from 'framer-motion'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom'
import { OperationsView } from '@/pages/OperationsView'
import { ChallengesView } from '@/pages/ChallengesView'
import { ReputationView } from '@/pages/ReputationView'
import { FinancialsView } from '@/pages/FinancialsView'
import { OracleConfigView } from '@/pages/OracleConfigView'
import { UsersPage } from '@/pages/users/UsersPage'
import { LoginPage } from '@/pages/auth/LoginPage'
// import { SignupPage } from '@/pages/auth/SignupPage'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { DashboardLayout } from '@/App/DashbaordLayout'

// ─── Route Wrappers to Keep Prop Contracts Untouched ─────────────────────────

function OperationsRoute() {
  const navigate = useNavigate()
  return (
    <OperationsView
      onNavigateToChallenges={() => navigate('/challenges')}
      navigate={(tab) => navigate('/' + tab)}
    />
  )
}

function ChallengesRoute() {
  const navigate = useNavigate()
  return <ChallengesView navigate={(tab) => navigate('/' + tab)} />
}

function ReputationRoute() {
  const navigate = useNavigate()
  return <ReputationView navigate={(tab) => navigate('/' + tab)} />
}

function FinancialsRoute() {
  const navigate = useNavigate()
  return <FinancialsView navigate={(tab) => navigate('/' + tab)} />
}

function OracleRoute() {
  const navigate = useNavigate()
  return <OracleConfigView navigate={(tab) => navigate('/' + tab)} />
}

function UsersRoute() {
  const navigate = useNavigate()
  return <UsersPage navigate={(tab) => navigate('/' + tab)} />
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

/*
function SignupPageView() {
  const navigate = useNavigate()
  return (
    <motion.div
      key="signup"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <SignupPage onSwitchToLogin={() => navigate('/login')} />
    </motion.div>
  )
}
*/

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
          {/* <Route path="/signup" element={<SignupPageView />} /> */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/operations" replace />} />
            <Route path="operations" element={<OperationsRoute />} />
            <Route path="challenges" element={<ChallengesRoute />} />
            <Route path="reputation" element={<ReputationRoute />} />
            <Route path="financials" element={<FinancialsRoute />} />
            <Route path="ai-oracle" element={<OracleRoute />} />
            <Route path="users" element={<UsersRoute />} />
            <Route path="*" element={<Navigate to="/operations" replace />} />
          </Route>
        </>
      )}
    </Routes>
  )
}

// ─── Root App ──────────────────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AuthGate />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
