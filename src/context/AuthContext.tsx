import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  avatar?: string
  joinedAt: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

// ─── Storage Keys ───────────────────────────────────────────────────────────

const STORAGE_USER_KEY = 'anybet_user'
const STORAGE_USERS_DB_KEY = 'anybet_users_db'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function getUsersDb(): Record<string, { user: User; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_DB_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveUsersDb(db: Record<string, { user: User; passwordHash: string }>) {
  localStorage.setItem(STORAGE_USERS_DB_KEY, JSON.stringify(db))
}

// Very simple "hash" — just for demo purposes (NOT production-safe)
function simpleHash(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h.toString(16)
}

function generateId(): string {
  return `USR_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const stored = getStoredUser()
    setUser(stored)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 650)) // simulate network

    const db = getUsersDb()
    const emailKey = email.trim().toLowerCase()
    const entry = db[emailKey]

    if (!entry) {
      return { success: false, error: 'No account found with this email.' }
    }

    if (entry.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Incorrect password. Please try again.' }
    }

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(entry.user))
    setUser(entry.user)
    return { success: true }
  }, [])

  const signup = useCallback(async (
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 750)) // simulate network

    const db = getUsersDb()
    const emailKey = email.trim().toLowerCase()

    if (db[emailKey]) {
      return { success: false, error: 'An account with this email already exists.' }
    }

    // Check username uniqueness
    const usernameExists = Object.values(db).some(
      e => e.user.username.toLowerCase() === username.trim().toLowerCase()
    )
    if (usernameExists) {
      return { success: false, error: 'Username is already taken. Choose another.' }
    }

    const newUser: User = {
      id: generateId(),
      name: name.trim(),
      email: emailKey,
      username: username.trim(),
      role: 'Operator',
      joinedAt: new Date().toISOString(),
    }

    db[emailKey] = { user: newUser, passwordHash: simpleHash(password) }
    saveUsersDb(db)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser))
    setUser(newUser)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_USER_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
