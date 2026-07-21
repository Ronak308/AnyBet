import React, { useState } from 'react'
import {
  Bell,
  PanelLeft,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Activity
} from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from './ui/dropdown-menu'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { ConfirmationModal } from './ui/confirmation-modal'
import { ThemeToggleButton2 } from './ui/skiper4'
import { Logo } from './ui/Logo'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed
}) => {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const notifications = [
    { id: 1, title: 'New Dispute Triggered', text: '#AB-1052 irregular activity reported', time: '2m ago', type: 'dispute' },
    { id: 2, title: 'AI Model Refreshed', text: 'Prediction settling updated for Crypto markets', time: '1h ago', type: 'system' },
    { id: 3, title: 'Security Escalation', text: 'Admin_Beta requested override for ID #AB-8720', time: '3h ago', type: 'security' }
  ]

  return (
    <header className="sticky top-0 z-45 w-full bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-6 select-none">
      {/* Left side: Hamburger for mobile + Page Title */}
      <div className="flex items-center gap-4">
        {/* Brand logo in header on mobile */}
        <div className="md:hidden">
          <Logo size="sm" collapsed={false} />
        </div>

        {/* Sidebar Toggle for Desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted hover:text-foreground hidden md:flex"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>

        {/* Dynamic Title (Desktop Only) */}
        <div className="hidden md:flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
          <h2 className="text-md font-bold font-sans text-foreground uppercase tracking-wider">
            {activeTab.replace('-', ' ')}
          </h2>
        </div>
      </div>

      {/* Right side: Search, Notifications, Settings, Profile */}
      <div className="flex items-center gap-4">


        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 mt-2 p-2 border border-muted/30" sideOffset={8}>
            <div className="px-3 py-2 flex items-center justify-between border-b border-border/40 mb-1">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Live System Alerts</span>
              <span className="text-[9px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-bold uppercase">
                {notifications.length} ACTIVE
              </span>
            </div>

            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-2.5 rounded hover:bg-surface/50 border border-transparent hover:border-border/30 mb-1">
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-xs text-foreground font-sans">{n.title}</span>
                  <span className="text-[9px] font-mono text-muted">{n.time}</span>
                </div>
                <p className="text-[10px] text-muted font-mono leading-tight">{n.text}</p>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem className="w-full text-center text-primary justify-center text-[10px] font-mono py-2 hover:bg-primary/5 cursor-pointer">
              VIEW OVERSIGHT LOGS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle — Skiper4 */}
        <ThemeToggleButton2
          isDark={isDark}
          onToggle={toggleTheme}
          className="h-8 w-8 p-1.5 shrink-0"
        />

        {/* Separator */}
        <span className="h-6 w-px bg-border/80"></span>

        {/* User profile section */}
        {user && (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer group/profile transition-all duration-200 hover:bg-surface/30 rounded-lg select-none p-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar square with rounded corners */}
                    <div className="h-9 w-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 text-foreground font-semibold text-xs group-hover/profile:border-primary/50 transition-colors">
                      {user.name
                        ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                        : 'U'}
                    </div>
                    
                    <div className="hidden sm:block min-w-0 text-left">
                      <span className="text-xs font-semibold text-foreground truncate group-hover/profile:text-primary transition-colors font-sans">
                        {user.name}
                      </span>
                    </div>
                  </div>

                  <div className="h-8 w-8 text-muted group-hover/profile:text-foreground shrink-0 rounded-lg flex items-center justify-center transition-colors ml-1">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border border-muted/30 p-1.5 shadow-2xl rounded-xl">
                {/* Profile */}
                <DropdownMenuItem
                  onClick={() => setActiveTab('reputation')}
                  className="flex items-center gap-2 text-[11px] font-sans text-foreground hover:bg-surface/80 cursor-pointer rounded-lg p-2"
                >
                  <User className="h-3.5 w-3.5 text-muted" />
                  <span>Profile</span>
                </DropdownMenuItem>

                {/* Access Control */}
                <DropdownMenuItem
                  onClick={() => setActiveTab('users')}
                  className="flex items-center gap-2 text-[11px] font-sans text-foreground hover:bg-surface/80 cursor-pointer rounded-lg p-2"
                >
                  <Shield className="h-3.5 w-3.5 text-muted" />
                  <span>Access Control</span>
                </DropdownMenuItem>

                {/* Telemetry Logs */}
                <DropdownMenuItem
                  onClick={() => setActiveTab('operations')}
                  className="flex items-center gap-2 text-[11px] font-sans text-foreground hover:bg-surface/80 cursor-pointer rounded-lg p-2"
                >
                  <Activity className="h-3.5 w-3.5 text-muted" />
                  <span>Telemetry Logs</span>
                </DropdownMenuItem>

                <div className="my-1 border-t border-border/40" />

                {/* Log out */}
                <DropdownMenuItem
                  id="navbar-logout"
                  className="flex items-center gap-2 text-[11px] font-sans text-red-400 focus:bg-red-950/20 cursor-pointer rounded-lg p-2"
                  onClick={() => setLogoutConfirmOpen(true)}
                >
                  <LogOut className="h-3.5 w-3.5 text-red-400" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={async () => {
          setLogoutConfirmOpen(false)
          await logout()
        }}
        title="Sign Out"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        description="Are you sure you want to sign out of your account?"
        icon={LogOut}
      />
    </header>
  )
}
