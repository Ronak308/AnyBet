import React, { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
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
  ShieldAlert,
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
  RotateCcw,
  Minus
} from 'lucide-react'
import { usePermissions } from '@/context/PermissionContext'

type AccessLevel = 'no_access' | 'view_only' | 'create_update' | 'approve_review' | 'full_access'
type ActionPermission = 'view' | 'create' | 'edit' | 'delete' | 'approve'

const ACCESS_LEVEL_TO_ACTIONS: Record<AccessLevel, ActionPermission[]> = {
  full_access: ['view', 'create', 'edit', 'delete', 'approve'],
  create_update: ['view', 'create', 'edit'],
  approve_review: ['view', 'approve'],
  view_only: ['view'],
  no_access: []
}

function actionsToAccessLevel(actions: ActionPermission[]): AccessLevel {
  if (!actions || !Array.isArray(actions) || actions.length === 0) return 'no_access'
  const hasApprove = actions.includes('approve')
  const hasDelete = actions.includes('delete')
  const hasCreateOrEdit = actions.includes('create') || actions.includes('edit')
  const hasView = actions.includes('view')

  if (hasApprove && hasDelete && hasCreateOrEdit && hasView) return 'full_access'
  if (hasApprove) return 'approve_review'
  if (hasCreateOrEdit) return 'create_update'
  if (hasView) return 'view_only'
  return 'no_access'
}

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
    badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
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
  disabled?: boolean
}> = ({ currentLevel, onSelect, disabled }) => {
  const currentConfig = ACCESS_LEVELS[currentLevel] || ACCESS_LEVELS.no_access

  if (disabled) {
    return (
      <div
        className="w-[154px] px-2.5 py-1 rounded-lg border text-sm font-medium flex items-center justify-between gap-1 shrink-0 bg-card/50 dark:bg-surface/40 border-border/50 text-muted-foreground opacity-70 cursor-not-allowed"
      >
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <span className={`w-4 h-4 flex items-center justify-center rounded text-[10px] font-mono font-bold border shrink-0 ${currentConfig.badgeClass}`}>
            {currentConfig.code === '-' ? (
              <Minus className="h-3 w-3 stroke-[3]" />
            ) : (
              currentConfig.code
            )}
          </span>
          <span className="truncate font-bold text-[12.5px] text-foreground/80">{currentConfig.label}</span>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-[154px] px-2.5 py-1 rounded-lg border text-sm font-medium flex items-center justify-between gap-1 cursor-pointer transition-all shrink-0 hover:border-primary/50 shadow-sm bg-card dark:bg-surface/80 border-border/80 text-foreground hover:bg-surface/60"
        >
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <span className={`w-4 h-4 flex items-center justify-center rounded text-[10px] font-mono font-bold border shrink-0 ${currentConfig.badgeClass}`}>
              {currentConfig.code === '-' ? (
                <Minus className="h-3 w-3 stroke-[3]" />
              ) : (
                currentConfig.code
              )}
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
                  {lvl.code === '-' ? (
                    <Minus className="h-3 w-3 stroke-[3]" />
                  ) : (
                    lvl.code
                  )}
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
  const { canView, canEdit } = usePermissions()
  const isEditable = canEdit('roles-permissions')

  const [roles] = useState<RoleDefinition[]>([
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

  const [selectedRoleId, setSelectedRoleId] = useState<string>('moderator')

  // Helper to load cached permissions from localStorage if available to prevent UI flashing
  const getInitialPermissions = (): Record<string, Record<string, AccessLevel>> => {
    try {
      const cached = localStorage.getItem('anybet_role_permissions')
      if (cached) return JSON.parse(cached)
    } catch (e) {
      console.warn('Failed to parse cached permissions:', e)
    }
    return DEFAULT_PERMISSIONS
  }

  // Module & Sub-tab access level matrix state initialized from cache or DEFAULT_PERMISSIONS
  const [roleModuleAccess, setRoleModuleAccess] = useState<Record<string, Record<string, AccessLevel>>>(getInitialPermissions)
  const [savedPermissions, setSavedPermissions] = useState<Record<string, Record<string, AccessLevel>>>(getInitialPermissions)

  // Sync permissions from collection rolesAndPermissions on mount in parallel
  useEffect(() => {
    const initPermissions = async () => {
      try {
        const roleSnaps = await Promise.all(
          roles.map(role => getDoc(doc(db, 'rolesAndPermissions', role.id)))
        )

        const loadedAccess: Record<string, Record<string, AccessLevel>> = {}

        roleSnaps.forEach((snap, idx) => {
          const roleId = roles[idx].id
          if (snap.exists()) {
            const data = snap.data()
            loadedAccess[roleId] = {}
            for (const [modKey, actions] of Object.entries(data)) {
              if (Array.isArray(actions)) {
                loadedAccess[roleId][modKey] = actionsToAccessLevel(actions as ActionPermission[])
              }
            }
          }
        })

        if (Object.keys(loadedAccess).length > 0) {
          const finalPerms = { ...DEFAULT_PERMISSIONS, ...loadedAccess }
          setRoleModuleAccess(finalPerms)
          setSavedPermissions(finalPerms)
          localStorage.setItem('anybet_role_permissions', JSON.stringify(finalPerms))
        }
      } catch (e) {
        console.warn('Firestore read failed for rolesAndPermissions:', e)
      }
    }

    initPermissions()
  }, [])

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
    if (!isEditable) return
    setRoleModuleAccess(prev => ({
      ...prev,
      [selectedRoleId]: {
        ...(prev[selectedRoleId] || {}),
        [itemKey]: level
      }
    }))
  }

  const handleResetPermissions = () => {
    if (!isEditable) return
    const currentRoleName = roles.find(r => r.id === selectedRoleId)?.name || 'Selected Role'
    setRoleModuleAccess(savedPermissions)
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: {
          message: `Changes reset for ${currentRoleName}!`,
          type: 'info'
        }
      })
    )
  }

  const handleSaveChanges = async () => {
    if (!isEditable) return
    setSaving(true)
    let saveSuccess = true

    try {
      for (const [roleId, modulesMap] of Object.entries(roleModuleAccess)) {
        const docData: Record<string, any> = {}
        for (const [moduleId, level] of Object.entries(modulesMap)) {
          docData[moduleId] = ACCESS_LEVEL_TO_ACTIONS[level] || []
        }
        docData.updatedAt = new Date().toISOString()
        const docRef = doc(db, 'rolesAndPermissions', roleId)
        await setDoc(docRef, docData, { merge: true })
      }
      localStorage.setItem('anybet_role_permissions', JSON.stringify(roleModuleAccess))
      window.dispatchEvent(new Event('permissions-updated'))
    } catch (e) {
      console.error('Error saving role permissions to Firestore:', e)
      saveSuccess = false
    }

    setSaving(false)

    if (saveSuccess) {
      setSavedPermissions(roleModuleAccess)
      const currentRoleName = roles.find(r => r.id === selectedRoleId)?.name || 'Selected Role'
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `Permissions for ${currentRoleName} saved successfully to collection rolesAndPermissions!`,
            type: 'success'
          }
        })
      )
    } else {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `Failed to save changes to database. Please try again.`,
            type: 'error'
          }
        })
      )
    }
  }

  if (!canView('roles-permissions')) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center font-sans">
        <div className="p-8 rounded-2xl max-w-md w-full text-center space-y-4 border border-rose-500/30 bg-rose-500/5 backdrop-blur-md">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Access Restricted</h3>
          <p className="text-xs text-muted font-mono leading-relaxed">
            Your assigned role does not have permission to view the Roles & Permissions module.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 min-h-screen text-foreground relative z-10 font-sans">

      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Roles & Permissions</h3>
            </div>
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

          {canEdit('roles-permissions') && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={handleResetPermissions}
                disabled={!hasChanges || saving}
                className={`h-9 px-3.5 gap-1.5 text-xs font-mono uppercase tracking-wider border border-border text-muted transition-all ${!hasChanges || saving
                  ? 'opacity-50 cursor-not-allowed border-border/40 text-muted/50'
                  : 'hover:text-foreground hover:bg-surface/60 cursor-pointer'
                  }`}
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
          )}
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
              const savedLevel = savedPermissions[selectedRoleId]?.[module.id] || 'no_access'
              const isModified = currentLevel !== savedLevel

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
                    disabled={!isEditable}
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
                      const subSavedLevel = savedPermissions[selectedRoleId]?.[sub.id] || 'no_access'
                      const isSubModified = subLevel !== subSavedLevel

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
                            disabled={!isEditable}
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
