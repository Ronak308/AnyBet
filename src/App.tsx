import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Navbar } from './components/Navbar'
import { OperationsView } from './pages/OperationsView'
import { ChallengesView } from './pages/ChallengesView'
import { ReputationView } from './pages/ReputationView'
import { FinancialsView } from './pages/FinancialsView'
import { OracleConfigView } from './pages/OracleConfigView'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { WalletProvider } from './context/WalletContext'
import { ChallengesProvider } from './context/ChallengesContext'
import { LayoutDashboard, Sword, Users, Coins, Cpu } from 'lucide-react'

// Interface for floating particle
interface Particle {
  id: number
  x: string
  y: string
  size: number
  duration: number
  color: string
}

// ─── Auth Gate ─────────────────────────────────────────────────────────────

type AuthScreen = 'login' | 'signup'

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth()
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login')

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

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        {authScreen === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LoginPage onSwitchToSignup={() => setAuthScreen('signup')} />
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SignupPage onSwitchToLogin={() => setAuthScreen('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return <Dashboard />
}

// ─── Main Dashboard ────────────────────────────────────────────────────────

function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>('operations')
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null)

  useEffect(() => {
    // Intercept standard window.alert calls and route to our custom Toast system
    window.alert = (message: any) => {
      const msgStr = String(message)
      let type: 'info' | 'success' | 'warning' = 'info'
      const msgLower = msgStr.toLowerCase()
      if (msgLower.includes('success') || msgLower.includes('passed') || msgLower.includes('complete') || msgLower.includes('online')) {
        type = 'success'
      } else if (msgLower.includes('warn') || msgLower.includes('shutdown') || msgLower.includes('cancel') || msgLower.includes('locked') || msgLower.includes('terminate')) {
        type = 'warning'
      }

      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msgStr, type } }))
    }

    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent
      setToast({
        message: customEvent.detail.message,
        type: customEvent.detail.type || 'info'
      })
    }

    window.addEventListener('show-toast', handleToast)
    return () => window.removeEventListener('show-toast', handleToast)
  }, [])

  // Auto clear active toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(null)
    }, 3200)
    return () => clearTimeout(timer)
  }, [toast])

  // Floating background particles
  const particles: Particle[] = [
    { id: 1, x: '10vw', y: '20vh', size: 8, duration: 25, color: '#8026FF' },
    { id: 2, x: '75vw', y: '15vh', size: 12, duration: 35, color: '#00E0FF' },
    { id: 3, x: '25vw', y: '65vh', size: 6, duration: 20, color: '#00E0FF' },
    { id: 4, x: '80vw', y: '75vh', size: 10, duration: 40, color: '#8026FF' },
    { id: 5, x: '50vw', y: '45vh', size: 4, duration: 30, color: '#8026FF' },
    { id: 6, x: '85vw', y: '40vh', size: 7, duration: 22, color: '#00E0FF' },
    { id: 7, x: '5vw', y: '80vh', size: 9, duration: 28, color: '#8026FF' },
    { id: 8, x: '40vw', y: '85vh', size: 5, duration: 33, color: '#00E0FF' },
  ]

  // Unified navigation handler — passed to all views
  const navigate = (tab: string) => setActiveTab(tab)

  // Mobile Bottom Navigation tabs list
  const mobileTabs = [
    { id: 'operations', label: 'Ops', icon: LayoutDashboard },
    { id: 'challenges-all', label: 'Bets', icon: Sword },
    { id: 'reputation', label: 'Rep', icon: Users },
    { id: 'financials', label: 'Finance', icon: Coins },
    { id: 'ai-oracle', label: 'Oracle', icon: Cpu },
  ]

  // Render the current view
  const renderActiveView = () => {
    if (activeTab.startsWith('financials')) {
      return <FinancialsView activeTab={activeTab} navigate={navigate} />
    }
    if (activeTab.startsWith('challenges')) {
      return <ChallengesView activeTab={activeTab} navigate={navigate} />
    }

    switch (activeTab) {
      case 'operations':
        return <OperationsView onNavigateToChallenges={() => navigate('challenges-all')} navigate={navigate} />
      case 'reputation':
        return <ReputationView navigate={navigate} />
      case 'ai-oracle':
        return <OracleConfigView navigate={navigate} />
      default:
        return <OperationsView onNavigateToChallenges={() => navigate('challenges-all')} navigate={navigate} />
    }
  }

  return (
    <div className="h-screen bg-background text-foreground flex relative overflow-hidden font-sans select-none pb-16 md:pb-0">
      
      {/* Floating particles background layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full filter blur-[4px]"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
            animate={{
              x: [0, Math.random() * 60 - 30, 0],
              y: [0, Math.random() * 60 - 30, 0],
              opacity: [0.15, 0.45, 0.15]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Sidebar - Collapsible */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
        className="hidden md:flex"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen relative z-10 overflow-hidden">
        {/* Top Navbar */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          sidebarCollapsed={sidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed} 
        />

        {/* Dynamic View Swapper */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Floating Pill / Island style) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-surface/90 backdrop-blur-lg border border-border/60 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center justify-around px-2.5 z-40 select-none">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full cursor-pointer relative h-11 min-w-[56px] transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <Icon className={`h-4.5 w-4.5 transition-colors duration-200 z-10 ${
                isActive ? 'text-primary' : 'text-muted hover:text-foreground'
              }`} />
              <span className={`text-[9px] font-mono tracking-wider font-bold z-10 transition-colors duration-200 ${
                isActive ? 'text-foreground' : 'text-muted'
              }`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Custom Animated In-App Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-55 p-4 rounded-xl border border-border shadow-glow bg-[#151221] flex items-center gap-3 select-none pointer-events-none"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : toast.type === 'warning' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(179,102,255,0.5)]'}`} />
            <span className="text-xs font-mono text-foreground font-semibold uppercase tracking-wider">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Root App ──────────────────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WalletProvider>
          <ChallengesProvider>
            <AuthGate />
          </ChallengesProvider>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
