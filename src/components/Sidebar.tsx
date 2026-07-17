import React, { useState } from 'react'
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
  ChevronRight
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

  const menuItems = [
    { id: 'operations', label: 'Operations', icon: LayoutDashboard },
    { id: 'challenges', label: 'Challenges', icon: Sword },
    { id: 'reputation', label: 'Reputation', icon: Users },
    { id: 'financials', label: 'Financials', icon: Coins },
    { id: 'ai-oracle', label: 'AI Oracle', icon: Cpu },
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
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

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
