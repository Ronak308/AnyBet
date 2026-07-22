import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
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

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)

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
  }, [])

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

  // Determine active tab string from url pathname
  const activeTab = location.pathname.split('/')[1] || 'dashboard'
  const setActiveTab = (tab: string) => navigate('/' + tab)

  // Mobile Bottom Navigation tabs list
  const mobileTabs = [
    { id: 'dashboard', label: 'Ops', icon: LayoutDashboard },
    { id: 'challenges-all', label: 'Bets', icon: Sword },
    { id: 'reputation', label: 'Rep', icon: Users },
    { id: 'financials', label: 'Finance', icon: Coins },
    { id: 'ai-oracle', label: 'Oracle', icon: Cpu },
  ]
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
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full"
            >
              <Outlet />
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
              <Icon className={`h-4.5 w-4.5 transition-colors duration-200 z-10 ${isActive ? 'text-primary' : 'text-muted hover:text-foreground'
                }`} />
              <span className={`text-[9px] font-mono tracking-wider font-bold z-10 transition-colors duration-200 ${isActive ? 'text-foreground' : 'text-muted'
                }`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>


    </div>
  )
}
