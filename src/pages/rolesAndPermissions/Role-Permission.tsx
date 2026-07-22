import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
  Shield,
  Users,
  Coins,
  Sword,
  HelpCircle,
  ChevronDown,
  Check,
  LayoutDashboard,
  Trophy,
  Star,
  Settings,
  Cpu,
  Layers,
  SlidersHorizontal,
  Save,
  RotateCcw
} from 'lucide-react'

type AccessLevel = 'no_access' | 'view_only' | 'create_update' | 'approve_review' | 'full_access'

interface AccessLevelConfig {
  key: AccessLevel
  label: string
  code: string
  badgeClass: string
  buttonBg: string
}

const ACCESS_LEVELS: Record<AccessLevel, AccessLevelConfig> = {
  no_access: {
    key: 'no_access',
    label: 'No Access',
    code: '-',
    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    buttonBg: 'bg-card dark:bg-surface/80 border-border/80 text-foreground hover:bg-surface/60'
  },
  view_only: {
    key: 'view_only',
    label: 'View Only',
    code: 'V',
    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    buttonBg: 'bg-card dark:bg-surface/80 border-border/80 text-foreground hover:bg-surface/60'
  },
  create_update: {
    key: 'create_update',
    label: 'Create/Update',
    code: 'C',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    buttonBg: 'bg-card dark:bg-surface/80 border-border/80 text-foreground hover:bg-surface/60'
  },
  approve_review: {
    key: 'approve_review',
    label: 'Approve',
    code: 'A',
    badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    buttonBg: 'bg-card dark:bg-surface/80 border-border/80 text-foreground hover:bg-surface/60'
  },
  full_access: {
    key: 'full_access',
    label: 'Full Access',
    code: 'F',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    buttonBg: 'bg-card dark:bg-surface/80 border-border/80 text-foreground hover:bg-surface/60'
  }
}

interface SubItemPermission {
  id: string
  name: string
}

interface ModuleItem {
  id: string
  name: string
  icon: React.ElementType
  subItems?: SubItemPermission[]
}

const SINGLE_MODULES: ModuleItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', name: 'Users', icon: Users },
  { id: 'roles-permissions', name: 'Roles & Permissions', icon: Shield },
  { id: 'leaderboards', name: 'Leaderboards', icon: Trophy },
  { id: 'reputation', name: 'Reputation', icon: Star },
  { id: 'settings', name: 'Settings', icon: Settings }
]

const MULTI_TAB_MODULES: ModuleItem[] = [
  {
    id: 'challenges',
    name: 'Challenges',
    icon: Sword,
    subItems: [
      { id: 'challenges-all', name: 'All Challenges' },
      { id: 'challenges-categories', name: 'Categories' },
      { id: 'challenges-live', name: 'Live & Settlement' },
      { id: 'challenges-disputes', name: 'Disputes' },
      { id: 'challenges-analytics', name: 'Analytics' }
    ]
  },
  {
    id: 'financials',
    name: 'Financials',
    icon: Coins,
    subItems: [
      { id: 'financials-wallet', name: 'Wallet' },
      { id: 'financials-transactions', name: 'Transactions' },
      { id: 'financials-rewards', name: 'Rewards' },
      { id: 'financials-treasury', name: 'Treasury' }
    ]
  },
  {
    id: 'ai-oracle',
    name: 'AI Oracle',
    icon: Cpu,
    subItems: [
      { id: 'ai-oracle-control', name: 'Control Center' },
      { id: 'ai-oracle-settlement', name: 'Settlement Center' },
      { id: 'ai-oracle-config', name: 'Configuration' },
      { id: 'ai-oracle-monitoring', name: 'Monitoring' }
    ]
  },
  {
    id: 'support-center',
    name: 'Support Center',
    icon: HelpCircle,
    subItems: [
      { id: 'support-tickets', name: 'Support Tickets' },
      { id: 'support-categories', name: 'Categories' },
      { id: 'support-faq', name: 'FAQ Manager' }
    ]
  }
]

interface RoleDefinition {
  id: string
  name: string
  description: string
  userCount: number
  color: string
}

// Reusable Access Level Dropdown component
const AccessDropdown: React.FC<{
  currentLevel: AccessLevel
  onSelect: (level: AccessLevel) => void
}> = ({ currentLevel, onSelect }) => {
  const currentConfig = ACCESS_LEVELS[currentLevel] || ACCESS_LEVELS.no_access

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-[154px] px-2.5 py-1 rounded-lg border text-sm font-medium flex items-center justify-between gap-1 cursor-pointer transition-all shrink-0 hover:border-primary/50 shadow-sm bg-card dark:bg-surface/80 border-border/80 text-foreground hover:bg-surface/60"
        >
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <span className={`w-4 h-4 flex items-center justify-center rounded text-[10px] font-mono font-bold border shrink-0 ${currentConfig.badgeClass}`}>
              {currentConfig.code}
            </span>
            <span className="truncate font-bold text-[12.5px] text-foreground">{currentConfig.label}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-0.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[154px] bg-card dark:bg-[#120F1D] text-foreground border border-border/80 p-1.5 shadow-xl z-50 rounded-xl">
        {Object.values(ACCESS_LEVELS).map(lvl => {
          const isSelected = currentLevel === lvl.key

          return (
            <DropdownMenuItem
              key={lvl.key}
              onClick={() => onSelect(lvl.key)}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${isSelected
                ? 'bg-primary/15 text-primary font-bold'
                : 'text-foreground hover:bg-surface/60 hover:text-foreground'
                }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-4 h-4 flex items-center justify-center rounded text-[10px] font-mono font-bold border shrink-0 ${lvl.badgeClass}`}>
                  {lvl.code}
                </span>
                <span className="font-bold text-[12.5px] text-foreground truncate">{lvl.label}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-0.5" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Default permission matrix structure by role (exact user spec matrix)
export const DEFAULT_PERMISSIONS: Record<string, Record<string, AccessLevel>> = {
  admin: {
    dashboard: 'full_access',
    users: 'full_access',
    'roles-permissions': 'full_access',
    leaderboards: 'full_access',
    reputation: 'full_access',
    settings: 'full_access',
    'challenges-all': 'full_access',
    'challenges-categories': 'full_access',
    'challenges-live': 'full_access',
    'challenges-disputes': 'full_access',
    'challenges-analytics': 'full_access',
    'financials-wallet': 'full_access',
    'financials-transactions': 'full_access',
    'financials-rewards': 'full_access',
    'financials-treasury': 'full_access',
    'ai-oracle-control': 'full_access',
    'ai-oracle-settlement': 'full_access',
    'ai-oracle-config': 'full_access',
    'ai-oracle-monitoring': 'full_access',
    'support-tickets': 'full_access',
    'support-categories': 'full_access',
    'support-faq': 'full_access'
  },
  moderator: {
    dashboard: 'view_only',
    users: 'view_only',
    'roles-permissions': 'no_access',
    leaderboards: 'view_only',
    reputation: 'approve_review',
    settings: 'no_access',
    'challenges-all': 'view_only',
    'challenges-categories': 'create_update',
    'challenges-live': 'approve_review',
    'challenges-disputes': 'approve_review',
    'challenges-analytics': 'view_only',
    'financials-wallet': 'no_access',
    'financials-transactions': 'no_access',
    'financials-rewards': 'no_access',
    'financials-treasury': 'no_access',
    'ai-oracle-control': 'view_only',
    'ai-oracle-settlement': 'approve_review',
    'ai-oracle-config': 'no_access',
    'ai-oracle-monitoring': 'view_only',
    'support-tickets': 'create_update',
    'support-categories': 'view_only',
    'support-faq': 'create_update'
  },
  finance: {
    dashboard: 'view_only',
    users: 'view_only',
    'roles-permissions': 'no_access',
    leaderboards: 'view_only',
    reputation: 'view_only',
    settings: 'no_access',
    'challenges-all': 'view_only',
    'challenges-categories': 'no_access',
    'challenges-live': 'no_access',
    'challenges-disputes': 'no_access',
    'challenges-analytics': 'view_only',
    'financials-wallet': 'full_access',
    'financials-transactions': 'full_access',
    'financials-rewards': 'full_access',
    'financials-treasury': 'full_access',
    'ai-oracle-control': 'no_access',
    'ai-oracle-settlement': 'no_access',
    'ai-oracle-config': 'no_access',
    'ai-oracle-monitoring': 'no_access',
    'support-tickets': 'no_access',
    'support-categories': 'no_access',
    'support-faq': 'no_access'
  },
  support: {
    dashboard: 'view_only',
    users: 'view_only',
    'roles-permissions': 'no_access',
    leaderboards: 'view_only',
    reputation: 'view_only',
    settings: 'no_access',
    'challenges-all': 'view_only',
    'challenges-categories': 'view_only',
    'challenges-live': 'view_only',
    'challenges-disputes': 'view_only',
    'challenges-analytics': 'no_access',
    'financials-wallet': 'no_access',
    'financials-transactions': 'no_access',
    'financials-rewards': 'no_access',
    'financials-treasury': 'no_access',
    'ai-oracle-control': 'no_access',
    'ai-oracle-settlement': 'no_access',
    'ai-oracle-config': 'no_access',
    'ai-oracle-monitoring': 'no_access',
    'support-tickets': 'full_access',
    'support-categories': 'create_update',
    'support-faq': 'full_access'
  }
}

export const RolesPermissionsPage: React.FC<{ navigate?: (tab: string) => void }> = () => {
  const [roles] = useState<RoleDefinition[]>([
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full administrative access to all operations, configurations, and financial tools.',
      userCount: 4,
      color: 'from-purple-500/25 to-indigo-500/10 text-purple-400 border-purple-500/30'
    },
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Responsible for audit resolution, challenge settlement, and dispute moderation.',
      userCount: 8,
      color: 'from-amber-500/25 to-orange-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Supervises treasury ledger, fee config, reward distributions, and coin withdrawals.',
      userCount: 3,
      color: 'from-emerald-500/25 to-teal-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'support',
      name: 'Support',
      description: 'Manages player inquiries, tickets, global FAQ listings, and category structures.',
      userCount: 12,
      color: 'from-cyan-500/25 to-blue-500/10 text-cyan-400 border-cyan-500/30'
    }
  ])

  const [selectedRoleId, setSelectedRoleId] = useState<string>('admin')

  // Module & Sub-tab access level matrix state initialized from DEFAULT_PERMISSIONS
  const [roleModuleAccess, setRoleModuleAccess] = useState<Record<string, Record<string, AccessLevel>>>(DEFAULT_PERMISSIONS)
  const [savedPermissions, setSavedPermissions] = useState<Record<string, Record<string, AccessLevel>>>(DEFAULT_PERMISSIONS)

  // Track if any role permission has been modified compared to saved state
  const hasChanges = React.useMemo(() => {
    return JSON.stringify(roleModuleAccess) !== JSON.stringify(savedPermissions)
  }, [roleModuleAccess, savedPermissions])

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'admin':
        return Shield
      case 'moderator':
        return Sword
      case 'finance':
        return Coins
      case 'support':
        return HelpCircle
      default:
        return Users
    }
  }

  const [saving, setSaving] = useState(false)

  const handleUpdateAccess = (itemKey: string, level: AccessLevel) => {
    setRoleModuleAccess(prev => ({
      ...prev,
      [selectedRoleId]: {
        ...(prev[selectedRoleId] || {}),
        [itemKey]: level
      }
    }))
  }

  const handleResetPermissions = () => {
    const currentRoleName = roles.find(r => r.id === selectedRoleId)?.name || 'Selected Role'
    setRoleModuleAccess(prev => ({
      ...prev,
      [selectedRoleId]: { ...DEFAULT_PERMISSIONS[selectedRoleId] }
    }))
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: {
          message: `Permissions reset to default matrix for ${currentRoleName}!`,
          type: 'info'
        }
      })
    )
  }

  const handleSaveChanges = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSavedPermissions(roleModuleAccess)
      const currentRoleName = roles.find(r => r.id === selectedRoleId)?.name || 'Selected Role'
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `Permissions updated successfully for ${currentRoleName}!`,
            type: 'success'
          }
        })
      )
    }, 500)
  }

  return (
    <div className="p-6 space-y-6 min-h-screen text-foreground relative z-10 font-sans">

      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Roles & Permissions</h3>
            <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-1">
              Managing organizational roles and system module access clearance levels
            </p>
          </div>
        </div>
      </div>

      {/* ─── ROLES TABS BAR & SAVE ACTION ─── */}
      <Tabs value={selectedRoleId} onValueChange={setSelectedRoleId} className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="inline-flex h-9 items-center justify-start rounded-lg border border-border/80 bg-surface/30 p-1 gap-1 shadow-none">
            {roles.map(role => {
              const RoleIcon = getRoleIcon(role.id)
              const isActive = selectedRoleId === role.id
              return (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className={`h-7 px-3.5 text-xs font-semibold rounded-md flex items-center gap-2 cursor-pointer transition-all border shadow-none data-[state=active]:shadow-none ${isActive
                    ? 'data-[state=active]:bg-primary/15 data-[state=active]:text-primary font-semibold border-primary/30 shadow-none data-[state=active]:shadow-none'
                    : 'data-[state=inactive]:bg-transparent border-transparent text-muted-foreground hover:bg-surface/50 hover:text-foreground'
                    }`}
                >
                  <RoleIcon className={`h-4 w-4 shrink-0 ${isActive ? '!text-primary' : 'text-muted-foreground'}`} />
                  <span>{role.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={handleResetPermissions}
              className="h-9 px-3.5 gap-1.5 text-xs font-mono uppercase tracking-wider border border-border text-muted hover:text-foreground hover:bg-surface/60 cursor-pointer transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>

            <Button
              onClick={handleSaveChanges}
              disabled={saving || !hasChanges}
              className={`h-9 px-4 gap-2 text-xs font-mono uppercase tracking-wider text-white transition-all ${!hasChanges || saving
                ? 'bg-primary/40 text-white/50 border border-primary/20 cursor-not-allowed shadow-none'
                : 'bg-primary hover:bg-primary-hover cursor-pointer shadow-[0_0_15px_rgba(128,38,255,0.3)] active:scale-95'
                }`}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* ─── SINGLE-TAB MODULES SECTION ─── */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2 px-0.5">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted font-bold">Single-Tab Modules</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {SINGLE_MODULES.map(module => {
              const ModuleIcon = module.icon
              const currentLevel = roleModuleAccess[selectedRoleId]?.[module.id] || 'no_access'
              const defaultLevel = DEFAULT_PERMISSIONS[selectedRoleId]?.[module.id] || 'no_access'
              const isModified = currentLevel !== defaultLevel

              return (
                <div
                  key={module.id}
                  className="group bg-card dark:bg-surface/60 border border-border/40 dark:border-border/80 hover:border-primary/50 py-3.5 px-4 rounded-xl flex items-center justify-between gap-3 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <ModuleIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-bold text-foreground tracking-tight truncate">
                        {module.name}
                      </span>
                      {isModified && (
                        <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20 shrink-0">
                          Modified
                        </span>
                      )}
                    </div>
                  </div>

                  <AccessDropdown
                    currentLevel={currentLevel}
                    onSelect={(lvl) => handleUpdateAccess(module.id, lvl)}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── MULTI-TAB MODULES SECTION ─── */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2 px-0.5">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted font-bold">Multi-Tab Modules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MULTI_TAB_MODULES.map(module => {
              const ModuleIcon = module.icon
              return (
                <div
                  key={module.id}
                  className="group bg-card dark:bg-surface/60 border border-border/40 dark:border-border/80 hover:border-primary/50 p-4 rounded-xl flex flex-col justify-start gap-3 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {/* Module Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/40 dark:border-border/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ModuleIcon className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground tracking-tight truncate">
                        {module.name}
                      </h3>
                    </div>
                    <span className="text-[9px] font-mono text-primary font-semibold bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                      {module.subItems!.length} Sub-tabs
                    </span>
                  </div>

                  {/* Sub-tabs Vertical List */}
                  <div className="space-y-2">
                    {module.subItems!.map(sub => {
                      const subLevel = roleModuleAccess[selectedRoleId]?.[sub.id] || 'no_access'
                      const subDefaultLevel = DEFAULT_PERMISSIONS[selectedRoleId]?.[sub.id] || 'no_access'
                      const isSubModified = subLevel !== subDefaultLevel

                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between gap-1.5 p-1.5 px-2 rounded-lg bg-surface/40 dark:bg-surface/60 border border-border/30 dark:border-border/50 hover:border-border transition-colors"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 pr-1">
                            <span className="text-xs font-semibold text-foreground/90 truncate">
                              {sub.name}
                            </span>
                            {isSubModified && (
                              <span className="text-[8px] font-mono text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 px-1 py-0.1 rounded border border-amber-500/20 shrink-0">
                                Modified
                              </span>
                            )}
                          </div>
                          <AccessDropdown
                            currentLevel={subLevel}
                            onSelect={(lvl) => handleUpdateAccess(sub.id, lvl)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </Tabs>

    </div>
  )
}
