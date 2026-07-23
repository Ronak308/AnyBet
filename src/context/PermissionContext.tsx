import React, { createContext, useContext, useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from './AuthContext'

// ─── 1. Types ─────────────────────────────────────────────────────────────────

export type AccessLevel = 'no_access' | 'view_only' | 'create_update' | 'approve_review' | 'full_access'
export type ActionPermission = 'view' | 'create' | 'edit' | 'delete' | 'approve'

export type ModuleKey =
  | 'dashboard'
  | 'users'
  | 'roles-permissions'
  | 'leaderboards'
  | 'reputation'
  | 'settings'
  | 'challenges-all'
  | 'challenges-categories'
  | 'challenges-live'
  | 'challenges-disputes'
  | 'challenges-analytics'
  | 'financials-wallet'
  | 'financials-transactions'
  | 'financials-rewards'
  | 'financials-treasury'
  | 'ai-oracle-control'
  | 'ai-oracle-settlement'
  | 'ai-oracle-config'
  | 'ai-oracle-monitoring'
  | 'support-tickets'
  | 'support-categories'
  | 'support-faq'
  | string

// Mapping of access levels to allowed action permissions
export const ACCESS_LEVEL_ACTIONS: Record<AccessLevel, ActionPermission[]> = {
  full_access: ['view', 'create', 'edit', 'delete', 'approve'],
  create_update: ['view', 'create', 'edit'],
  approve_review: ['view', 'approve'],
  view_only: ['view'],
  no_access: []
}

// ─── 2. Default Permission Matrix by Role ─────────────────────────────────────

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

// ─── 3. Pure Helper Functions ──────────────────────────────────────────────────

export function actionsToAccessLevel(actions: ActionPermission[]): AccessLevel {
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

/** Reads current permission matrix (syncing saved admin customizations from local storage if available) */
export function getActivePermissionMatrix(): Record<string, Record<string, AccessLevel>> {
  try {
    const local = localStorage.getItem('anybet_role_permissions')
    if (local) {
      const parsed = JSON.parse(local)
      return { ...DEFAULT_PERMISSIONS, ...parsed }
    }
  } catch (e) {
    console.warn('Failed to parse active role permissions:', e)
  }
  return DEFAULT_PERMISSIONS
}

/** Get the AccessLevel for a specific role and module */
export function getUserAccessLevel(role: string, moduleKey: ModuleKey): AccessLevel {
  const cleanRole = (role || 'user').trim().toLowerCase()
  if (cleanRole === 'admin') return 'full_access'
  const matrix = getActivePermissionMatrix()
  const roleMatrix = matrix[cleanRole]
  if (!roleMatrix) return 'no_access'
  return roleMatrix[moduleKey] || 'no_access'
}

/** Check if a specific role has permission for an action in a module */
export function checkPermission(
  role: string,
  moduleKey: ModuleKey,
  action: ActionPermission = 'view'
): boolean {
  const cleanRole = (role || 'user').trim().toLowerCase()
  if (cleanRole === 'admin') return true
  const accessLevel = getUserAccessLevel(cleanRole, moduleKey)
  const allowedActions = ACCESS_LEVEL_ACTIONS[accessLevel] || []
  return allowedActions.includes(action)
}

// ─── 4. React Context Setup ───────────────────────────────────────────────────

interface PermissionContextValue {
  userRole: string
  getAccess: (moduleKey: ModuleKey) => AccessLevel
  can: (moduleKey: ModuleKey, action?: ActionPermission) => boolean
  canView: (moduleKey: ModuleKey) => boolean
  canCreate: (moduleKey: ModuleKey) => boolean
  canEdit: (moduleKey: ModuleKey) => boolean
  canDelete: (moduleKey: ModuleKey) => boolean
  canApprove: (moduleKey: ModuleKey) => boolean
}

const PermissionContext = createContext<PermissionContextValue | null>(null)

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const userRole = (user?.role || 'user').trim().toLowerCase()
  const [matrix, setMatrix] = useState(() => getActivePermissionMatrix())

  useEffect(() => {
    const syncMatrix = () => {
      setMatrix(getActivePermissionMatrix())
    }

    window.addEventListener('storage', syncMatrix)
    window.addEventListener('permissions-updated', syncMatrix)

    let unsubscribeFirestore: (() => void) | null = null
    try {
      const colRef = collection(db, 'rolesAndPermissions')
      unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
        const firestoreMatrix: Record<string, Record<string, AccessLevel>> = {}
        snapshot.forEach((docSnap) => {
          const roleId = docSnap.id
          const data = docSnap.data()
          firestoreMatrix[roleId] = {}
          for (const [modKey, actions] of Object.entries(data)) {
            if (Array.isArray(actions)) {
              firestoreMatrix[roleId][modKey] = actionsToAccessLevel(actions as ActionPermission[])
            } else if (typeof actions === 'string') {
              firestoreMatrix[roleId][modKey] = actions as AccessLevel
            }
          }
        })
        if (Object.keys(firestoreMatrix).length > 0) {
          const merged = { ...DEFAULT_PERMISSIONS, ...firestoreMatrix }
          setMatrix(merged)
          localStorage.setItem('anybet_role_permissions', JSON.stringify(merged))
        }
      }, (error) => {
        console.warn('Firestore rolesAndPermissions listener error:', error)
      })
    } catch (err) {
      console.warn('Failed to subscribe to rolesAndPermissions snapshot:', err)
    }

    return () => {
      window.removeEventListener('storage', syncMatrix)
      window.removeEventListener('permissions-updated', syncMatrix)
      if (unsubscribeFirestore) unsubscribeFirestore()
    }
  }, [])

  const getAccess = (moduleKey: ModuleKey): AccessLevel => {
    if (userRole === 'admin') return 'full_access'
    const roleMatrix = matrix[userRole]
    if (!roleMatrix) return 'no_access'
    return roleMatrix[moduleKey] || 'no_access'
  }

  const can = (moduleKey: ModuleKey, action: ActionPermission = 'view'): boolean => {
    if (userRole === 'admin') return true
    const level = getAccess(moduleKey)
    const allowed = ACCESS_LEVEL_ACTIONS[level] || []
    return allowed.includes(action)
  }

  const value: PermissionContextValue = {
    userRole,
    getAccess,
    can,
    canView: (moduleKey: ModuleKey) => can(moduleKey, 'view'),
    canCreate: (moduleKey: ModuleKey) => can(moduleKey, 'create'),
    canEdit: (moduleKey: ModuleKey) => can(moduleKey, 'edit'),
    canDelete: (moduleKey: ModuleKey) => can(moduleKey, 'delete'),
    canApprove: (moduleKey: ModuleKey) => can(moduleKey, 'approve'),
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

// ─── 5. Custom Hook: usePermissions() ──────────────────────────────────────────

export function usePermissions(): PermissionContextValue {
  const ctx = useContext(PermissionContext)
  if (!ctx) {
    // Safe fallback if used outside Provider
    const matrix = getActivePermissionMatrix()
    const can = (moduleKey: ModuleKey, action: ActionPermission = 'view'): boolean => {
      const level = matrix.user?.[moduleKey] || 'no_access'
      return (ACCESS_LEVEL_ACTIONS[level] || []).includes(action)
    }
    return {
      userRole: 'user',
      getAccess: (moduleKey) => matrix.user?.[moduleKey] || 'no_access',
      can,
      canView: (moduleKey: ModuleKey) => can(moduleKey, 'view'),
      canCreate: (moduleKey: ModuleKey) => can(moduleKey, 'create'),
      canEdit: (moduleKey: ModuleKey) => can(moduleKey, 'edit'),
      canDelete: (moduleKey: ModuleKey) => can(moduleKey, 'delete'),
      canApprove: (moduleKey: ModuleKey) => can(moduleKey, 'approve'),
    }
  }
  return ctx
}

// Alias for convenience
export const usePermission = usePermissions

// ─── 6. Guard Component: <PermissionGuard> ────────────────────────────────────

interface PermissionGuardProps {
  module: ModuleKey
  action?: ActionPermission
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action = 'view',
  fallback = null,
  children
}) => {
  const { can } = usePermissions()
  if (!can(module, action)) {
    return <>{fallback}</>
  }
  return <>{children}</>
}
