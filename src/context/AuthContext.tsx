import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { auth, db } from '../firebase'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: string
  uid?: string
  name: string
  email: string
  username: string
  role: string
  avatar?: string
  joinedAt: string
  createdAt?: any
  status?: string
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
const USE_FIREBASE = true

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
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(false)

  // Rehydrate session / subscribe to auth state changes
  useEffect(() => {
    if (USE_FIREBASE) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            if (userDoc.exists()) {
              const data = userDoc.data()
              const cleanStatus = (data.status || 'active').trim().toLowerCase()
              if (cleanStatus === 'inactive') {
                localStorage.removeItem(STORAGE_USER_KEY)
                setUser(null)
                await signOut(auth)
                setIsLoading(false)
                return
              }
              const freshUser = {
                ...data,
                role: data.role ? (data.role.trim().toLowerCase() === 'admin' ? 'admin' : 'user') : 'user'
              } as User
              setUser(freshUser)
              localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(freshUser))
            } else {
              // No Firestore doc — build minimal profile from Auth
              const email = firebaseUser.email || ''
              const isAdmin = email.trim().toLowerCase() === 'admin@anybet.com'
              const fallback: User = {
                id: firebaseUser.uid,
                name: isAdmin ? 'Admin User' : (firebaseUser.displayName || email.split('@')[0] || 'User'),
                email,
                username: email.split('@')[0] || 'user',
                role: isAdmin ? 'admin' : 'user',
                joinedAt: new Date().toISOString()
              }
              setUser(fallback)
              localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(fallback))
            }
          } catch (error) {
            console.error('Error fetching user document from Firestore:', error)
          } finally {
            setIsLoading(false)
          }
        } else {
          // If no firebase user but cached user exists, keep cached user
          const cached = getStoredUser()
          if (!cached) {
            setUser(null)
          }
          setIsLoading(false)
        }
      })
      return () => unsubscribe()
    } else {
      const stored = getStoredUser()
      setUser(stored)
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (USE_FIREBASE) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password)
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          const cleanStatus = (data.status || 'active').trim().toLowerCase()
          if (cleanStatus === 'inactive') {
            localStorage.removeItem(STORAGE_USER_KEY)
            setUser(null)
            await signOut(auth)
            return { success: false, error: 'Your account is inactive. Please contact an administrator.' }
          }
        }
        return { success: true }
      } catch (error: any) {
        console.error('Firebase Login Error:', error)
        return { success: false, error: error.message || 'Login failed.' }
      }
    } else {
      await new Promise(r => setTimeout(r, 650)) // simulate network

      const db = getUsersDb()
      const emailKey = email.trim() ? email.trim().toLowerCase() : 'admin@anybet.io'
      let entry = db[emailKey]

      if (!entry) {
        // Direct login: Auto-create the user if they don't exist
        const isDefault = emailKey === 'admin@anybet.io'
        const newUser: User = {
          id: generateId(),
          name: isDefault ? 'Ronak' : emailKey.split('@')[0],
          email: emailKey,
          username: isDefault ? 'Ronak' : emailKey.split('@')[0],
          role: 'User',
          joinedAt: new Date().toISOString(),
          status: 'active'
        }
        db[emailKey] = { user: newUser, passwordHash: simpleHash(password || 'password123') }
        saveUsersDb(db)
        entry = db[emailKey]
      }

      if (entry.user.status === 'inactive') {
        return { success: false, error: 'Your account is inactive. Please contact an administrator.' }
      }

      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(entry.user))
      setUser(entry.user)
      return { success: true }
    }
  }, [])

  const signup = useCallback(async (
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (USE_FIREBASE) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user

        const userData: User = {
          id: firebaseUser.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          username: username.trim(),
          role: 'User',
          joinedAt: new Date().toISOString()
        }

        // Save detailed profile info to Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), userData)
        setUser(userData)
        return { success: true }
      } catch (error: any) {
        console.error('Firebase Signup Error:', error)
        return { success: false, error: error.message || 'Signup failed.' }
      }
    } else {
      await new Promise(r => setTimeout(r, 750)) // simulate network

      const db = getUsersDb()
      const emailKey = email.trim().toLowerCase()

      if (db[emailKey]) {
        // Direct Login if email already exists
        const entry = db[emailKey]
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(entry.user))
        setUser(entry.user)
        return { success: true }
      }

      // Auto-resolve username conflict
      let finalUsername = username.trim()
      let usernameExists = Object.values(db).some(
        e => e.user.username.toLowerCase() === finalUsername.toLowerCase()
      )
      if (usernameExists) {
        finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`
      }

      const newUser: User = {
        id: generateId(),
        name: name.trim(),
        email: emailKey,
        username: finalUsername,
        role: 'Operator',
        joinedAt: new Date().toISOString(),
      }

      db[emailKey] = { user: newUser, passwordHash: simpleHash(password) }
      saveUsersDb(db)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser))
      setUser(newUser)
      return { success: true }
    }
  }, [])

  const logout = useCallback(() => {
    if (USE_FIREBASE) {
      signOut(auth).catch(err => console.error('Firebase Signout Error:', err))
      setUser(null)
    } else {
      localStorage.removeItem(STORAGE_USER_KEY)
      setUser(null)
    }
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

