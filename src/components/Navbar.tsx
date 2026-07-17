import React, { useState } from 'react'
import { 
  Search, 
  Bell, 
  Settings, 
  Menu,
  ChevronDown,
  User,
  Shield,
  Activity,
  LogOut,
  SlidersHorizontal
} from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from './ui/dropdown-menu'
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet'
import { Sidebar } from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ThemeToggleButton2 } from './ui/skiper4'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  const notifications = [
    { id: 1, title: 'New Dispute Triggered', text: '#AB-1052 irregular activity reported', time: '2m ago', type: 'dispute' },
    { id: 2, title: 'AI Model Refreshed', text: 'Prediction settling updated for Crypto markets', time: '1h ago', type: 'system' },
    { id: 3, title: 'Security Escalation', text: 'Admin_Beta requested override for ID #AB-8720', time: '3h ago', type: 'security' }
  ]

  const handleLogout = () => {
    if (!logoutConfirm) {
      setLogoutConfirm(true)
      setTimeout(() => setLogoutConfirm(false), 3000)
      return
    }
    logout()
  }

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
        {/* Mobile menu trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-muted hover:text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[260px] bg-background">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                setActiveTab(tab)
                setMobileMenuOpen(false)
              }} 
              isCollapsed={false} 
              setIsCollapsed={() => {}} 
            />
          </SheetContent>
        </Sheet>
        
        {/* Sidebar Toggle for Desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted hover:text-foreground hidden md:flex"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>

        {/* Dynamic Title */}
        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
          <h2 className="text-md font-bold font-sans text-foreground uppercase tracking-wider">
            {activeTab.replace('-', ' ')}
          </h2>
        </div>
      </div>

      {/* Right side: Search, Notifications, Settings, Profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-48 lg:w-64 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <Input 
            placeholder="Global query..." 
            className="pl-9 pr-8 h-9 text-xs" 
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted bg-[#22222C] px-1.5 py-0.5 rounded border border-border">
            /
          </kbd>
        </div>

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
          <DropdownMenuContent className="w-80 right-0 mt-2 p-2" sideOffset={8}>
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
              className={`gap-2.5 transition-colors ${logoutConfirm ? 'text-red-300 bg-red-950/30 focus:bg-red-950/40' : 'text-red-400 focus:bg-red-950/20'}`}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>{logoutConfirm ? 'Click again to confirm' : 'Sign Out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
