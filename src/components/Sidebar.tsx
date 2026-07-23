import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Sword,
  Users,
  Shield,
  Coins,
  Cpu,
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
  BarChart3,
  Trophy,
  Award,
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
  CreditCard
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import { ConfirmationModal } from './ui/confirmation-modal'

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
  const { logout } = useAuth()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [financialsOpen, setFinancialsOpen] = useState(() => activeTab.startsWith('financials'))
  const [challengesOpen, setChallengesOpen] = useState(() => activeTab.startsWith('challenges'))
  const [oracleOpen, setOracleOpen] = useState(() => activeTab.startsWith('ai-oracle') || activeTab.startsWith('oracle'))
  const [supportOpen, setSupportOpen] = useState(() => activeTab.startsWith('support'))

  useEffect(() => {
    if (activeTab.startsWith('financials')) {
      setFinancialsOpen(true)
    }
    if (activeTab.startsWith('challenges')) {
      setChallengesOpen(true)
    }
    if (activeTab.startsWith('ai-oracle') || activeTab.startsWith('oracle')) {
      setOracleOpen(true)
    }
    if (activeTab.startsWith('support')) {
      setSupportOpen(true)
    }
  }, [activeTab])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles-permissions', label: 'Roles & Permissions', icon: Shield },
    { id: 'challenges', label: 'Challenges', icon: Sword, isDropdown: true },
    { id: 'leaderboards', label: 'Leaderboards', icon: Award },
    { id: 'reputation', label: 'Reputation', icon: Trophy },
    { id: 'financials', label: 'Financials', icon: Coins, isDropdown: true },
    { id: 'ai-oracle', label: 'AI Oracle', icon: Cpu, isDropdown: true },
    { id: 'support-center', label: 'Support Center', icon: MessageSquare, isDropdown: true },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
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
    { id: 'financials-payments', label: 'Payment Management', icon: CreditCard },
    { id: 'financials-transactions', label: 'Transactions', icon: History },
    { id: 'financials-rewards', label: 'Rewards', icon: Gift },
    { id: 'financials-treasury', label: 'Treasury', icon: PieChart },
  ]

  const oracleSubItems = [
    { id: 'ai-oracle-control', label: 'Control Center', icon: Cpu },
    { id: 'ai-oracle-settlement', label: 'Settlement Center', icon: Sword },
    { id: 'ai-oracle-config', label: 'Configuration', icon: Layers },
    { id: 'ai-oracle-monitoring', label: 'Monitoring', icon: BarChart3 },
  ]

  const supportSubItems = [
    { id: 'support-tickets', label: 'Support Tickets', icon: MessageSquare },
    { id: 'support-categories', label: 'Categories', icon: Layers },
    { id: 'support-faq', label: 'FAQ Manager', icon: HelpCircle },
  ]

  return (
    <motion.div
      animate={{ width: isCollapsed ? 76 : 275 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn("h-screen sticky top-0 bg-background border-r border-border flex flex-col py-6 px-4 shrink-0 overflow-hidden select-none", className)}
    >
      <div className="flex flex-col gap-6 flex-1 min-h-0 mb-4">
        {/* Header/Logo */}
        <div className="flex items-center justify-between min-h-[48px] shrink-0">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-center overflow-hidden py-1"
              >
                <Logo collapsed={false} className="w-full" />
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
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1 scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isChallengesGroup = item.id === 'challenges'
            const isFinancialsGroup = item.id === 'financials'
            const isOracleGroup = item.id === 'ai-oracle'
            const isSupportGroup = item.id === 'support-center'

            const isChallengesActive = activeTab.startsWith('challenges')
            const isFinancialsActive = activeTab.startsWith('financials')
            const isOracleActive = activeTab.startsWith('ai-oracle') || activeTab.startsWith('oracle')
            const isSupportActive = activeTab.startsWith('support')

            const isActive = isChallengesGroup
              ? isChallengesActive
              : isFinancialsGroup
                ? isFinancialsActive
                : isOracleGroup
                  ? isOracleActive
                  : isSupportGroup
                    ? isSupportActive
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
                    className={cn(
                      "flex items-center justify-between h-[38px] w-full transition-all duration-200 group",
                      isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                    glow={isActive}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <span className="font-semibold text-[13px] font-sans">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
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
                        className="flex flex-col gap-0.5 pl-4 pr-1 overflow-hidden border-l-2 border-primary/20 ml-5 my-0.5"
                      >
                        {challengeSubItems.map((sub) => {
                          const SubIcon = sub.icon
                          const isSubActive = activeTab === sub.id || (activeTab === 'challenges' && sub.id === 'challenges-all')

                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveTab(sub.id)}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans transition-all duration-200 cursor-pointer w-full text-left border border-transparent group",
                                isSubActive
                                  ? "bg-primary/15 text-primary font-semibold border-primary/30"
                                  : "text-nav-text hover:bg-surface/50"
                              )}
                            >
                              <SubIcon className="h-4 w-4 shrink-0" />
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
                    className={cn(
                      "flex items-center justify-between h-[38px] w-full transition-all duration-200 group",
                      isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                    glow={isActive}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <span className="font-semibold text-[13px] font-sans">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
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
                        className="flex flex-col gap-0.5 pl-4 pr-1 overflow-hidden border-l-2 border-primary/20 ml-5 my-0.5"
                      >
                        {financialSubItems.map((sub) => {
                          const SubIcon = sub.icon
                          const isSubActive = activeTab === sub.id || (activeTab === 'financials' && sub.id === 'financials-wallet')

                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveTab(sub.id)}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans transition-all duration-200 cursor-pointer w-full text-left border border-transparent group",
                                isSubActive
                                  ? "bg-primary/15 text-primary font-semibold border-primary/30"
                                  : "text-nav-text hover:bg-surface/50"
                              )}
                            >
                              <SubIcon className="h-4 w-4 shrink-0" />
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

            if (isOracleGroup) {
              return (
                <div key={item.id} className="flex flex-col gap-1">
                  <Button
                    variant={isActive ? "nav-active" : "nav"}
                    onClick={() => {
                      if (isCollapsed) {
                        setIsCollapsed(false)
                        setOracleOpen(true)
                        setActiveTab('ai-oracle-control')
                      } else {
                        const newOpen = !oracleOpen
                        setOracleOpen(newOpen)
                        if (newOpen && !activeTab.startsWith('ai-oracle') && !activeTab.startsWith('oracle')) {
                          setActiveTab('ai-oracle-control')
                        }
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between h-[38px] w-full transition-all duration-200 group",
                      isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                    glow={isActive}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <span className="font-semibold text-[13px] font-sans">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        {oracleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    )}
                  </Button>

                  {/* Oracle Sub-menu Accordion Dropdown */}
                  <AnimatePresence>
                    {oracleOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-0.5 pl-4 pr-1 overflow-hidden border-l-2 border-primary/20 ml-5 my-0.5"
                      >
                        {oracleSubItems.map((sub) => {
                          const SubIcon = sub.icon
                          const isSubActive = activeTab === sub.id || (activeTab === 'ai-oracle' && sub.id === 'ai-oracle-control')

                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveTab(sub.id)}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans transition-all duration-200 cursor-pointer w-full text-left border border-transparent group",
                                isSubActive
                                  ? "bg-primary/15 text-primary font-semibold border-primary/30"
                                  : "text-nav-text hover:bg-surface/50"
                              )}
                            >
                              <SubIcon className="h-4 w-4 shrink-0" />
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

            if (isSupportGroup) {
              return (
                <div key={item.id} className="flex flex-col gap-1">
                  <Button
                    variant={isActive ? "nav-active" : "nav"}
                    onClick={() => {
                      if (isCollapsed) {
                        setIsCollapsed(false)
                        setSupportOpen(true)
                        setActiveTab('support-tickets')
                      } else {
                        const newOpen = !supportOpen
                        setSupportOpen(newOpen)
                        if (newOpen && !activeTab.startsWith('support')) {
                          setActiveTab('support-tickets')
                        }
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between h-[38px] w-full transition-all duration-200 group",
                      isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                    glow={isActive}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <span className="font-semibold text-[13px] font-sans">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        {supportOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    )}
                  </Button>

                  {/* Support Sub-menu Dropdown */}
                  <AnimatePresence>
                    {supportOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-0.5 pl-4 pr-1 overflow-hidden border-l-2 border-primary/20 ml-5 my-0.5"
                      >
                        {supportSubItems.map((sub) => {
                          const SubIcon = sub.icon
                          const isSubActive = activeTab === sub.id || (activeTab === 'support-center' && sub.id === 'support-tickets')

                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveTab(sub.id)}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans transition-all duration-200 cursor-pointer w-full text-left border border-transparent group",
                                isSubActive
                                  ? "bg-primary/15 text-primary font-semibold border-primary/30"
                                  : "text-nav-text hover:bg-surface/50"
                              )}
                            >
                              <SubIcon className="h-4 w-4 shrink-0" />
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
                className={cn(
                  "flex items-center h-9 w-full transition-all duration-200 group",
                  isCollapsed ? "justify-center px-0" : "px-4"
                )}
                glow={isActive}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-semibold text-[13px] font-sans"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Sign Out Button */}
      <div className="mt-auto pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => setLogoutConfirmOpen(true)}
          className={cn(
            "flex items-center text-muted hover:text-red-500 hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:bg-red-950/20 transition-all duration-200 h-8 w-full",
            isCollapsed ? "justify-center px-0" : "px-4 gap-3"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-[13px] font-sans"
            >
              Sign Out
            </motion.span>
          )}
        </Button>
      </div>

      <ConfirmationModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={async () => {
          setLogoutConfirmOpen(false)
          logout()
        }}
        title="Sign Out"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        description="Are you sure you want to sign out of your account?"
        icon={LogOut}
      />

    </motion.div>
  )
}
