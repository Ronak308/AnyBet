import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Sword, 
  Users, 
  Coins, 
  Cpu, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  History,
  Gift,
  PieChart,
  ListFilter,
  Layers,
  Zap,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { useAuth } from '../context/AuthContext'

import { Logo } from './ui/Logo'

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  className
}) => {
  const { logout, user } = useAuth()
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [financialsOpen, setFinancialsOpen] = useState(() => activeTab.startsWith('financials'))
  const [challengesOpen, setChallengesOpen] = useState(() => activeTab.startsWith('challenges'))

  useEffect(() => {
    if (activeTab.startsWith('financials')) {
      setFinancialsOpen(true)
    }
    if (activeTab.startsWith('challenges')) {
      setChallengesOpen(true)
    }
  }, [activeTab])

  const menuItems = [
    { id: 'operations', label: 'Operations', icon: LayoutDashboard },
    { id: 'challenges', label: 'Challenges', icon: Sword, isDropdown: true },
    { id: 'reputation', label: 'Reputation', icon: Users },
    { id: 'financials', label: 'Financials', icon: Coins, isDropdown: true },
    { id: 'ai-oracle', label: 'AI Oracle', icon: Cpu },
  ]

  const challengeSubItems = [
    { id: 'challenges-all', label: 'All Challenges', icon: ListFilter },
    { id: 'challenges-categories', label: 'Categories', icon: Layers },
    { id: 'challenges-live', label: 'Live & Settlement', icon: Zap },
    { id: 'challenges-disputes', label: 'Disputes', icon: AlertTriangle },
    { id: 'challenges-analytics', label: 'Analytics', icon: BarChart3 },
  ]

  const financialSubItems = [
    { id: 'financials-wallet', label: 'Wallet', icon: Wallet },
    { id: 'financials-transactions', label: 'Transactions', icon: History },
    { id: 'financials-rewards', label: 'Rewards', icon: Gift },
    { id: 'financials-treasury', label: 'Treasury', icon: PieChart },
  ]

  const handleLogout = () => {
    if (!logoutConfirm) {
      setLogoutConfirm(true)
      setTimeout(() => setLogoutConfirm(false), 3000)
      return
    }
    logout()
  }

  return (
    <motion.div
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn("h-screen sticky top-0 bg-background border-r border-border flex flex-col justify-between py-6 px-4 shrink-0 overflow-hidden select-none", className)}
    >
      <div className="flex flex-col gap-8 flex-grow">
        {/* Header/Logo */}
        <div className="flex items-center justify-between min-h-[48px]">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1"
              >
                <Logo collapsed={false} size="md" />
                <span className="text-[9px] text-muted font-mono uppercase tracking-widest pl-0.5">Admin v2.4.0</span>
              </motion.div>
            ) : (
              <motion.div 
                key="collapsed-logo"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="mx-auto cursor-pointer"
                onClick={() => setIsCollapsed(false)}
              >
                <Logo collapsed={true} size="md" />
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted hover:text-foreground hidden md:flex"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isChallengesGroup = item.id === 'challenges'
            const isFinancialsGroup = item.id === 'financials'
            const isChallengesActive = activeTab.startsWith('challenges')
            const isFinancialsActive = activeTab.startsWith('financials')

            const isActive = isChallengesGroup 
              ? isChallengesActive 
              : isFinancialsGroup 
                ? isFinancialsActive 
                : activeTab === item.id

            if (isChallengesGroup) {
              return (
                <div key={item.id} className="flex flex-col gap-1">
                  <Button
                    variant={isActive ? "nav-active" : "nav"}
                    onClick={() => {
                      if (isCollapsed) {
                        setIsCollapsed(false)
                        setChallengesOpen(true)
                        setActiveTab('challenges-all')
                      } else {
                        const newOpen = !challengesOpen
                        setChallengesOpen(newOpen)
                        if (newOpen && !activeTab.startsWith('challenges')) {
                          setActiveTab('challenges-all')
                        }
                      }
                    }}
                    className={`flex items-center justify-between ${isCollapsed ? 'justify-center px-0' : 'px-4'} h-11 w-full transition-all duration-200`}
                    glow={isActive}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted'}`} />
                      {!isCollapsed && (
                        <span className="font-medium text-sm font-sans">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="text-muted hover:text-foreground">
                        {challengesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    )}
                  </Button>

                  {/* Challenges Sub-menu Dropdown */}
                  <AnimatePresence>
                    {challengesOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-1 pl-4 pr-1 overflow-hidden border-l-2 border-primary/20 ml-5 my-0.5"
                      >
                        {challengeSubItems.map((sub) => {
                          const SubIcon = sub.icon
                          const isSubActive = activeTab === sub.id || (activeTab === 'challenges' && sub.id === 'challenges-all')

                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveTab(sub.id)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer w-full text-left ${
                                isSubActive
                                  ? 'bg-primary/15 text-primary font-bold border border-primary/30'
                                  : 'text-muted hover:text-foreground hover:bg-surface/60'
                              }`}
                            >
                              <SubIcon className={`h-3.5 w-3.5 ${isSubActive ? 'text-primary' : 'text-muted'}`} />
                              <span>{sub.label}</span>
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            if (isFinancialsGroup) {
              return (
                <div key={item.id} className="flex flex-col gap-1">
                  <Button
                    variant={isActive ? "nav-active" : "nav"}
                    onClick={() => {
                      if (isCollapsed) {
                        setIsCollapsed(false)
                        setFinancialsOpen(true)
                        setActiveTab('financials-wallet')
                      } else {
                        const newOpen = !financialsOpen
                        setFinancialsOpen(newOpen)
                        if (newOpen && !activeTab.startsWith('financials')) {
                          setActiveTab('financials-wallet')
                        }
                      }
                    }}
                    className={`flex items-center justify-between ${isCollapsed ? 'justify-center px-0' : 'px-4'} h-11 w-full transition-all duration-200`}
                    glow={isActive}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted'}`} />
                      {!isCollapsed && (
                        <span className="font-medium text-sm font-sans">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="text-muted hover:text-foreground">
                        {financialsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    )}
                  </Button>

                  {/* Financials Sub-menu Accordion Dropdown */}
                  <AnimatePresence>
                    {financialsOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-1 pl-4 pr-1 overflow-hidden border-l-2 border-primary/20 ml-5 my-0.5"
                      >
                        {financialSubItems.map((sub) => {
                          const SubIcon = sub.icon
                          const isSubActive = activeTab === sub.id || (activeTab === 'financials' && sub.id === 'financials-wallet')

                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveTab(sub.id)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer w-full text-left ${
                                isSubActive
                                  ? 'bg-primary/15 text-primary font-bold border border-primary/30'
                                  : 'text-muted hover:text-foreground hover:bg-surface/60'
                              }`}
                            >
                              <SubIcon className={`h-3.5 w-3.5 ${isSubActive ? 'text-primary' : 'text-muted'}`} />
                              <span>{sub.label}</span>
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            return (
              <Button
                key={item.id}
                variant={isActive ? "nav-active" : "nav"}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} h-12 w-full transition-all duration-200`}
                glow={isActive}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted'}`} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-sm font-sans"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Button>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-6 mt-auto">

        {/* Collapsed Toggle Button */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted hover:text-foreground mx-auto"
            onClick={() => setIsCollapsed(false)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        {/* User info strip (collapsed: hidden, expanded: show) */}
        {!isCollapsed && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-2 bg-surface/40 border border-border/50 rounded-lg"
          >
            <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-[9px] font-mono text-muted uppercase tracking-widest mt-0.5 truncate">{user.role}</p>
          </motion.div>
        )}

        {/* Support & Logout */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? 'justify-center p-0' : 'px-4 gap-3'} text-muted hover:text-foreground`}
            onClick={() => alert("Ops Support desk online. Channel #ops-support.")}
          >
            <HelpCircle className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="text-xs font-mono uppercase tracking-wider">Support</span>}
          </Button>

          <Button
            id="sidebar-logout"
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? 'justify-center p-0' : 'px-4 gap-3'} transition-colors ${
              logoutConfirm
                ? 'text-red-300 bg-red-950/30 hover:bg-red-950/40'
                : 'text-red-400/80 hover:text-red-400 hover:bg-red-950/20'
            }`}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span className="text-xs font-mono uppercase tracking-wider">
                {logoutConfirm ? 'Confirm?' : 'Sign Out'}
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
