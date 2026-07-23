import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useWallet } from './WalletContext'
import { toast } from '@/components/ui/Toast'

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
  mobileNumber?: string
  dob?: string
  kycStatus?: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>
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

// ─── Authorized Roles ────────────────────────────────────────────────────────

const AUTHORIZED_ROLES = ['admin', 'moderator', 'support', 'finance']

function isAuthorizedRole(role?: string): boolean {
  if (!role) return false
  return AUTHORIZED_ROLES.includes(role.trim().toLowerCase())
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate session & subscribe to realtime status changes for logged-in user
  useEffect(() => {
    if (USE_FIREBASE) {
      let docUnsubscribe: (() => void) | null = null

      const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (docUnsubscribe) {
          docUnsubscribe()
          docUnsubscribe = null
        }

        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          docUnsubscribe = onSnapshot(userDocRef, async (userSnap) => {
            if (userSnap.exists()) {
              const data = userSnap.data()
              const cleanStatus = (data.status || 'active').trim().toLowerCase()
              const cleanRole = (data.role || 'user').trim().toLowerCase()

              if (cleanStatus !== 'active' || !isAuthorizedRole(cleanRole)) {
                let statusMessage = 'Your account status has been changed. You have been logged out.'
                if (cleanStatus === 'suspended') {
                  statusMessage = 'Your account has been suspended by an administrator.'
                } else if (cleanStatus === 'banned') {
                  statusMessage = 'Your account has been banned by an administrator.'
                } else if (cleanStatus === 'inactive') {
                  statusMessage = 'Your account has been deactivated by an administrator.'
                } else if (!isAuthorizedRole(cleanRole)) {
                  statusMessage = 'Your role permissions have been revoked.'
                }

                toast.error(statusMessage)
                localStorage.removeItem(STORAGE_USER_KEY)
                setUser(null)
                await signOut(auth)
                setIsLoading(false)
                return
              }

              const freshUser = {
                ...data,
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                role: cleanRole,
                status: cleanStatus
              } as User

              setUser(freshUser)
              localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(freshUser))
              setIsLoading(false)
            } else {
              // No Firestore doc — build minimal profile from Auth for default admin
              const email = firebaseUser.email || ''
              const isAdmin = email.trim().toLowerCase() === 'admin@anybet.com'
              if (!isAdmin) {
                toast.error('User record not found in system. Access revoked.')
                localStorage.removeItem(STORAGE_USER_KEY)
                setUser(null)
                await signOut(auth)
                setIsLoading(false)
                return
              }
              const fallback: User = {
                id: firebaseUser.uid,
                name: 'Admin User',
                email,
                username: email.split('@')[0] || 'admin',
                role: 'admin',
                status: 'active',
                joinedAt: new Date().toISOString()
              }
              setUser(fallback)
              localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(fallback))
              setIsLoading(false)
            }
          }, (error) => {
            console.error('Error listening to user status changes:', error)
            setIsLoading(false)
          })
        } else {
          localStorage.removeItem(STORAGE_USER_KEY)
          setUser(null)
          setIsLoading(false)
        }
      })

      return () => {
        if (docUnsubscribe) docUnsubscribe()
        authUnsubscribe()
      }
    } else {
      const checkStoredUserStatus = () => {
        const stored = getStoredUser()
        if (stored) {
          const currentDb = getUsersDb()
          const dbEntry = Object.values(currentDb).find(e => e.user.id === stored.id || e.user.email === stored.email)
          const liveStatus = dbEntry ? (dbEntry.user.status || 'active').trim().toLowerCase() : (stored.status || 'active').trim().toLowerCase()
          if (liveStatus !== 'active') {
            toast.error(`Account ${liveStatus}. You have been logged out.`)
            setUser(null)
            localStorage.removeItem(STORAGE_USER_KEY)
          } else {
            setUser(stored)
          }
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }

      checkStoredUserStatus()
      const interval = setInterval(checkStoredUserStatus, 2000)
      window.addEventListener('storage', checkStoredUserStatus)

      return () => {
        clearInterval(interval)
        window.removeEventListener('storage', checkStoredUserStatus)
      }
    }
  }, [])

  const login = useCallback(async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const rawInput = emailOrUsername.trim().replace(/^@/, '')
    if (!rawInput) {
      return { success: false, error: 'Please enter your email address or username to log in.' }
    }

    if (USE_FIREBASE) {
      try {
        let finalEmail = rawInput.toLowerCase()

        // If user typed a username (no '@' symbol), lookup corresponding email in Firestore
        if (!finalEmail.includes('@')) {
          try {
            const usersRef = collection(db, 'users')
            const q = query(usersRef, where('username', '==', rawInput.toLowerCase()))
            const snap = await getDocs(q)
            if (!snap.empty) {
              const matchedData = snap.docs[0].data()
              if (matchedData.email) {
                finalEmail = matchedData.email.trim().toLowerCase()
              }
            }
          } catch (err) {
            console.warn('Username to email resolution error:', err)
          }
        }

        const userCred = await signInWithEmailAndPassword(auth, finalEmail, password)
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          const cleanStatus = (data.status || 'active').trim().toLowerCase()
          if (cleanStatus !== 'active') {
            localStorage.removeItem(STORAGE_USER_KEY)
            setUser(null)
            await signOut(auth)
            if (cleanStatus === 'suspended') {
              return { success: false, error: 'Your account has been suspended. Please contact system support.' }
            }
            if (cleanStatus === 'banned') {
              return { success: false, error: 'Your account has been banned. Please contact system support.' }
            }
            return { success: false, error: 'Your account is inactive. Please contact an administrator.' }
          }
          const cleanRole = (data.role || 'user').trim().toLowerCase()
          if (!isAuthorizedRole(cleanRole)) {
            localStorage.removeItem(STORAGE_USER_KEY)
            setUser(null)
            await signOut(auth)
            return { success: false, error: 'Access denied: Users with role "user" are not authorized to log into the dashboard. Only Admin, Moderator, Support, and Finance roles can log in.' }
          }
          await updateDoc(doc(db, 'users', userCred.user.uid), {
            lastLoginAt: serverTimestamp()
          })
        } else {
          // If Firestore document doesn't exist yet, seed/create it
          const cleanEmail = (userCred.user.email || finalEmail).trim().toLowerCase()
          const isAdmin = cleanEmail === 'admin@anybet.com'
          if (!isAdmin) {
            localStorage.removeItem(STORAGE_USER_KEY)
            setUser(null)
            await signOut(auth)
            return { success: false, error: 'Access denied: Only authorized roles (Admin, Moderator, Support, Finance) can log in.' }
          }
          await setDoc(doc(db, 'users', userCred.user.uid), {
            uid: userCred.user.uid,
            email: cleanEmail,
            username: cleanEmail.split('@')[0],
            name: 'Admin User',
            role: 'admin',
            status: 'active',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
          }, { merge: true })
        }
        return { success: true }
      } catch (error: any) {
        console.error('Firebase Login Error:', error)
        return { success: false, error: error.message || 'Login failed.' }
      }
    } else {
      await new Promise(r => setTimeout(r, 650)) // simulate network

      const usersDb = getUsersDb()
      const cleanInput = rawInput.toLowerCase()

      let entryKey = Object.keys(usersDb).find(
        k => k.toLowerCase() === cleanInput || usersDb[k].user.username.toLowerCase() === cleanInput
      )

      let entry = entryKey ? usersDb[entryKey] : null

      if (!entry) {
        // Direct login: Auto-create the user if they don't exist
        const isDefault = cleanInput === 'admin@anybet.io' || cleanInput === 'admin'
        const newUser: User = {
          id: generateId(),
          name: isDefault ? 'Admin User' : cleanInput,
          email: isDefault ? 'admin@anybet.com' : `${cleanInput}@anybet.com`,
          username: isDefault ? 'admin' : cleanInput,
          role: isDefault ? 'admin' : 'user',
          joinedAt: new Date().toISOString(),
          status: 'active'
        }
        usersDb[newUser.email] = { user: newUser, passwordHash: simpleHash(password || 'password123') }
        saveUsersDb(usersDb)
        entry = usersDb[newUser.email]
      }

      const userStatus = (entry.user.status || 'active').trim().toLowerCase()
      if (userStatus !== 'active') {
        if (userStatus === 'suspended') {
          return { success: false, error: 'Your account has been suspended. Please contact system support.' }
        }
        if (userStatus === 'banned') {
          return { success: false, error: 'Your account has been banned. Please contact system support.' }
        }
        return { success: false, error: 'Your account is inactive. Please contact an administrator.' }
      }

      const cleanRole = (entry.user.role || 'user').trim().toLowerCase()
      if (!isAuthorizedRole(cleanRole)) {
        return { success: false, error: 'Access denied: Users with role "user" are not authorized to log into the dashboard. Only Admin, Moderator, Support, and Finance roles can log in.' }
      }

      const updatedUser = {
        ...entry.user,
        lastLoginAt: new Date().toISOString()
      }
      usersDb[entry.user.email] = { ...entry, user: updatedUser }
      saveUsersDb(usersDb)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser))
      setUser(updatedUser)
      return { success: true }
    }
  }, [])

  const { createWallet } = useWallet()

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

        const cleanUserData = {
          uid: firebaseUser.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          username: username.trim(),
          role: 'user',
          status: 'active',
          createdAt: serverTimestamp()
        }

        // Save detailed profile info to Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), cleanUserData)

        // Initialize wallet dynamically for normal user on signup
        createWallet(firebaseUser.uid, username.trim())

        // Sign out immediately since newly registered users have 'user' role and cannot access the admin console
        await signOut(auth)
        localStorage.removeItem(STORAGE_USER_KEY)
        setUser(null)

        return {
          success: false,
          error: 'Account created successfully! However, access is denied as only administrators can log into this console.'
        }
      } catch (error: any) {
        console.error('Firebase Signup Error:', error)
        return { success: false, error: error.message || 'Signup failed.' }
      }
    } else {
      await new Promise(r => setTimeout(r, 750)) // simulate network

      const db = getUsersDb()
      const emailKey = email.trim().toLowerCase()

      if (db[emailKey]) {
        const entry = db[emailKey]
        const cleanRole = (entry.user.role || 'user').trim().toLowerCase()
        if (!isAuthorizedRole(cleanRole)) {
          return { success: false, error: 'Access denied: Users with role "user" are not authorized to log into the dashboard. Only Admin, Moderator, Support, and Finance roles can log in.' }
        }
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
        role: 'user', // Default non-admin role
        joinedAt: new Date().toISOString(),
        status: 'active'
      }

      db[emailKey] = { user: newUser, passwordHash: simpleHash(password) }
      saveUsersDb(db)

      // Initialize wallet dynamically for local mock user on signup
      createWallet(newUser.id, newUser.username)

      // Do not log them in since their role is 'user'
      localStorage.removeItem(STORAGE_USER_KEY)
      setUser(null)

      return {
        success: false,
        error: 'Account created successfully! However, access is denied as only administrators can log into this console.'
      }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_USER_KEY)
    setUser(null)
    if (USE_FIREBASE) {
      signOut(auth).catch(err => console.error('Firebase Signout Error:', err))
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

