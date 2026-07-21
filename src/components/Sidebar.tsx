import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Sword,
  Users,
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
  Settings,
  HelpCircle
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

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
  const [financialsOpen, setFinancialsOpen] = useState(() => activeTab.startsWith('financials'))
  const [challengesOpen, setChallengesOpen] = useState(() => activeTab.startsWith('challenges'))
  const [oracleOpen, setOracleOpen] = useState(() => activeTab.startsWith('ai-oracle') || activeTab.startsWith('oracle'))

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
  }, [activeTab])

  const menuItems = [
    { id: 'operations', label: 'Operations', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'challenges', label: 'Challenges', icon: Sword, isDropdown: true },
    { id: 'reputation', label: 'Reputation', icon: Trophy },
    { id: 'financials', label: 'Financials', icon: Coins, isDropdown: true },
    { id: 'ai-oracle', label: 'AI Oracle', icon: Cpu, isDropdown: true },
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

  const oracleSubItems = [
    { id: 'ai-oracle-control', label: 'Control Center', icon: Cpu },
    { id: 'ai-oracle-settlement', label: 'Settlement Center', icon: Sword },
    { id: 'ai-oracle-config', label: 'Configuration', icon: Layers },
    { id: 'ai-oracle-monitoring', label: 'Monitoring', icon: BarChart3 },
  ]
  return (
    <motion.div
      animate={{ width: isCollapsed ? 76 : 260 }}
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
                className="flex flex-col gap-1"
              >
                <Logo collapsed={false} size="md" />
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
        <nav className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isChallengesGroup = item.id === 'challenges'
            const isFinancialsGroup = item.id === 'financials'
            const isOracleGroup = item.id === 'ai-oracle'
            const isChallengesActive = activeTab.startsWith('challenges')
            const isFinancialsActive = activeTab.startsWith('financials')
            const isOracleActive = activeTab.startsWith('ai-oracle') || activeTab.startsWith('oracle')

            const isActive = isChallengesGroup 
              ? isChallengesActive 
              : isFinancialsGroup 
                ? isFinancialsActive 
                : isOracleGroup
                  ? isOracleActive
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
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer w-full text-left ${isSubActive
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
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer w-full text-left ${isSubActive
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
                        className="flex flex-col gap-1 pl-4 pr-1 overflow-hidden border-l-2 border-primary/20 ml-5 my-0.5"
                      >
                        {oracleSubItems.map((sub) => {
                          const SubIcon = sub.icon
                          const isSubActive = activeTab === sub.id || (activeTab === 'ai-oracle' && sub.id === 'ai-oracle-control')

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
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} h-10 w-full transition-all duration-200`}
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

      <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-border/70 shrink-0">
        {/* Settings button */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted hover:text-foreground font-sans text-sm font-medium transition-all duration-200",
            isCollapsed ? 'justify-center p-0 h-10' : 'px-4 gap-3 h-10'
          )}
          onClick={() => setActiveTab('ai-oracle')}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Button>

        {/* Support Button */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted hover:text-foreground font-sans text-sm font-medium transition-all duration-200",
            isCollapsed ? 'justify-center p-0 h-10' : 'px-4 gap-3 h-10'
          )}
          onClick={() => alert("Ops Support desk online. Channel #ops-support.")}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Support</span>}
        </Button>
      </div>
    </motion.div>
  )
}
