import React, { useState } from 'react'
import {
  Bell,
  Settings,
  ChevronDown,
  PanelLeft,
  User,
  Shield,
  Activity,
  LogOut
} from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from './ui/dropdown-menu'
import { ConfirmationModal } from './ui/confirmation-modal'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ThemeToggleButton2 } from './ui/skiper4'
import { Logo } from './ui/Logo'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

// Color-hash avatar background based on username
function getAvatarColor(username: string): string {
  const colors = [
    '#8026FF', '#00E0FF', '#10b981', '#f59e0b',
    '#ef4444', '#6366f1', '#ec4899', '#14b8a6',
  ]
  let h = 0
  for (let i = 0; i < username.length; i++) h = (h + username.charCodeAt(i)) % colors.length
  return colors[h]
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed
}) => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const notifications = [
    { id: 1, title: 'New Dispute Triggered', text: '#AB-1052 irregular activity reported', time: '2m ago', type: 'dispute' },
    { id: 2, title: 'AI Model Refreshed', text: 'Prediction settling updated for Crypto markets', time: '1h ago', type: 'system' },
    { id: 3, title: 'Security Escalation', text: 'Admin_Beta requested override for ID #AB-8720', time: '3h ago', type: 'security' }
  ]

  const displayName = user?.name ?? 'Guest'
  const displayUsername = user?.username ?? 'guest'
  const displayRole = user?.role ?? 'Unknown'
  const displayEmail = user?.email ?? ''
  const initials = getInitials(displayName)
  const avatarColor = getAvatarColor(displayUsername)

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
          <PanelLeft className="h-5 w-5" />
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
          <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 mt-2 p-2" sideOffset={8}>
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

        {/* Quick Settings Shortcut */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted hover:text-foreground"
          onClick={() => setActiveTab('ai-oracle')}
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Theme Toggle — Skiper4 */}
        <ThemeToggleButton2
          isDark={isDark}
          onToggle={toggleTheme}
          className="h-8 w-8 p-1.5 shrink-0"
        />

        {/* Separator */}
        <span className="h-6 w-px bg-border/60 hidden sm:block"></span>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer group">
              <Avatar className="h-8 w-8 ring-1 ring-border group-hover:ring-primary/50 transition-all duration-200">
                <AvatarFallback
                  style={{ backgroundColor: avatarColor + '22', color: avatarColor, border: `1px solid ${avatarColor}44` }}
                  className="text-xs font-bold font-sans"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-none font-sans group-hover:text-primary transition-all duration-200">
                  {displayUsername}
                </span>
                <span className="text-[9px] font-mono text-muted uppercase tracking-widest mt-0.5">
                  {displayRole}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted group-hover:text-foreground hidden lg:block" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 right-0 mt-2 p-2" sideOffset={8}>
            <div className="px-3 py-2 flex flex-col mb-1 border-b border-border/40">
              <span className="text-xs font-bold text-foreground">{displayName}</span>
              <span className="text-[9px] font-mono text-muted uppercase tracking-widest mt-0.5">{displayEmail}</span>
              <span className="text-[9px] font-mono text-primary/70 uppercase tracking-widest mt-0.5">{user?.id}</span>
            </div>
            <DropdownMenuItem onClick={() => setActiveTab('reputation')} className="gap-2.5">
              <User className="h-4 w-4 text-muted" />
              <span>Profile Hub</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5">
              <Shield className="h-4 w-4 text-muted" />
              <span>Access Control</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5">
              <Activity className="h-4 w-4 text-muted" />
              <span>Telemetry Logs</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              id="navbar-logout"
              className="gap-2.5 text-red-400 focus:bg-red-950/20"
              onClick={() => setLogoutConfirmOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
