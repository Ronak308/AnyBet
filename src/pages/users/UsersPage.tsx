import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { auth, db, firebaseConfig } from '@/firebase/firebase'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth as getSecondaryAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { type User, useAuth } from '@/context/AuthContext'
import { useWallet } from '@/context/WalletContext'
import { deleteUserAccount } from '@/services/userAdminService'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { UserDetails } from './components/UserDetails'
import { AddEditUser } from './components/AddEditUser'
import {
  UserPlus,
  Search,
  Trash2,
  Edit3,
  ShieldAlert,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Users
} from 'lucide-react'

const normalizeRole = (role: string): string => {
  if (!role) return ''
  const r = role.trim().toLowerCase()
  if (r === 'admin') return 'admin'
  if (r === 'user') return 'user'
  return role.trim()
}

const parseFirestoreDate = (val: any): Date | null => {
  if (!val) return null
  if (val instanceof Date) return val

  if (typeof val.toDate === 'function') {
    const d = val.toDate()
    if (d instanceof Date && !isNaN(d.getTime())) return d
  }

  const seconds = val.seconds !== undefined ? val.seconds : val._seconds
  if (seconds !== undefined && seconds !== null) {
    const d = new Date(Number(seconds) * 1000)
    if (!isNaN(d.getTime())) return d
  }

  if (typeof val === 'string' || typeof val === 'number') {
    let cleanVal = val
    if (typeof val === 'string') {
      cleanVal = val.replace(/\s+at\s+/i, ' ')
    }
    const d = new Date(cleanVal)
    if (!isNaN(d.getTime())) return d
  }

  return null
}

const formatLastLoginTable = (u: User) => {
  const val = (u as any).lastLoginAt || (u as any)["lastLoginAt "] || (u as any).lastLogin
  if (!val) return 'Never'

  const date = parseFirestoreDate(val)
  if (!date) return 'Never'

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export const UsersPage: React.FC<{ navigate: (tab: string) => void }> = ({ navigate: _navigate }) => {
  const { user: currentUser } = useAuth()
  const { createWallet } = useWallet()
  const [users, setUsers] = useState<User[]>([])
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Sheet drawer states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<{ id: string; username: string } | null>(null)

  // Filters & Searching
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [error, setError] = useState<string | null>(null)

  // Fetch users from Firestore on load
  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      setError(null)
      const usersCol = collection(db, 'users')
      const snapshot = await getDocs(usersCol)
      let fetchedUsers: User[] = []

      snapshot.forEach(doc => {
        const data = doc.data()
        console.log("LOADED USER DOC ID:", doc.id, "DATA:", data)
        const userId = doc.id || data.uid || data.id
        const cleanStatus = (data.status || 'active').trim().toLowerCase()
        fetchedUsers.push({
          ...data,
          id: userId,
          uid: userId,
          role: normalizeRole(data.role || ''),
          status: cleanStatus === 'active' ? 'active' : 'inactive'
        } as User)
      })

      // If Firestore is empty, seed it with the currently logged-in user
      if (fetchedUsers.length === 0 && currentUser) {
        const seedData = {
          uid: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          username: currentUser.username,
          role: normalizeRole(currentUser.role),
          status: currentUser.status || 'active',
          createdAt: new Date()
        }
        await setDoc(doc(db, 'users', currentUser.id), seedData)
        fetchedUsers = [{ ...seedData, id: currentUser.id } as User]
      }

      // Add a default status if missing
      const processedUsers = fetchedUsers.map(u => ({
        ...u,
        role: normalizeRole(u.role),
        status: (u as any).status === 'active' ? 'active' : 'inactive'
      }))

      setUsers(processedUsers)
    } catch (err: any) {
      console.error('Error loading users from Firestore:', err)
      setError(err.message || 'Failed to load users from Firestore')
      // Fallback: display the currently authenticated user if DB query fails
      const fallbackList = currentUser ? [currentUser] : []
      const processedFallback = fallbackList.map(u => ({
        ...u,
        role: normalizeRole(u.role),
        status: (u as any).status === 'active' ? 'active' : 'inactive'
      }))
      setUsers(processedFallback)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter, statusFilter])

  // Save/Create user details in Firestore
  const handleSaveUser = async (userData: Omit<User, 'joinedAt'> & { status?: string; password?: string }) => {
    try {
      const existingUser = users.find(u => u.id === userData.id)
      let finalUserId = userData.id

      // Check if email or username is already taken by a different user
      const emailConflict = users.find(u =>
        u.id !== userData.id &&
        u.email.trim().toLowerCase() === userData.email.trim().toLowerCase()
      )
      if (emailConflict) {
        throw new Error('A user with this email address already exists.')
      }

      const usernameConflict = users.find(u =>
        u.id !== userData.id &&
        u.username.trim().toLowerCase() === userData.username.trim().toLowerCase()
      )
      if (usernameConflict) {
        throw new Error('A user with this username already exists.')
      }

      // If creating a new user, register them in Firebase Auth first
      if (!existingUser && userData.password) {
        const tempAppName = `tempApp_${Date.now()}`
        const tempApp = initializeApp(firebaseConfig, tempAppName)
        const tempAuth = getSecondaryAuth(tempApp)
        try {
          const userCreds = await createUserWithEmailAndPassword(tempAuth, userData.email, userData.password)
          finalUserId = userCreds.user.uid
        } catch (authError: any) {
          console.error('Error creating user in Firebase Auth:', authError)
          throw new Error(authError.message || 'Failed to register user in Firebase Authentication.')
        } finally {
          await deleteApp(tempApp)
        }
      }

      const userRef = doc(db, 'users', finalUserId)
      const createdAtVal = existingUser
        ? ((existingUser as any).createdAt || new Date())
        : new Date()

      // Build clean document matching user's requested schema:
      const cleanDataToSave = {
        uid: finalUserId,
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        username: userData.username.trim(),
        role: normalizeRole(userData.role),
        status: userData.status || 'active',
        createdAt: createdAtVal
      }

      await setDoc(userRef, cleanDataToSave, { merge: true })

      // Automatically initialize user's wallet if this is a newly created user account
      if (!existingUser) {
        createWallet(finalUserId, cleanDataToSave.username)
      }

      const updatedLocalUser = {
        ...cleanDataToSave,
        id: finalUserId, // keep locally for React list rendering keys
        joinedAt: typeof createdAtVal === 'string' ? createdAtVal : (createdAtVal.toDate ? createdAtVal.toDate().toISOString() : new Date().toISOString())
      } as User

      // Update local state
      setUsers(prev => {
        const index = prev.findIndex(u => u.id === finalUserId)
        if (index > -1) {
          const updatedList = [...prev]
          updatedList[index] = updatedLocalUser
          return updatedList
        } else {
          return [updatedLocalUser, ...prev]
        }
      })

      // Update view user details if active
      if (viewUser?.id === finalUserId) {
        setViewUser(updatedLocalUser)
      }

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `Success: User profile @${userData.username} saved.`,
          type: 'success'
        }
      }))
    } catch (error: any) {
      console.error('Failed to save user:', error)
      throw new Error(error.message || 'Failed to save user.')
    }
  }

  // Helpers for drawer handling
  const openDetailsForUser = (user: User) => {
    setUserToEdit(null)
    setViewUser(user)
    setIsDetailsOpen(true)
    setIsAddEditOpen(false)
  }

  const openEditForUser = (user: User) => {
    setIsDetailsOpen(false)
    setViewUser(null)
    setUserToEdit(user)
    setIsAddEditOpen(true)
  }

  const openCreateUser = () => {
    setIsDetailsOpen(false)
    setViewUser(null)
    setUserToEdit(null)
    setIsAddEditOpen(true)
  }



  const bulkActivate = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => updateDoc(doc(db, 'users', id), { status: 'active' })))
      setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, status: 'active' } : u))
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Successfully activated ${ids.length} users.`, type: 'success' }
      }))
    } catch (error) {
      console.error('Error bulk activating users:', error)
    }
  }

  const bulkDeactivate = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => updateDoc(doc(db, 'users', id), { status: 'inactive' })))
      setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, status: 'inactive' } : u))
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Successfully deactivated ${ids.length} users.`, type: 'warning' }
      }))
    } catch (error) {
      console.error('Error bulk deactivating users:', error)
    }
  }

  const bulkDelete = async (ids: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} selected users?`)) return
    try {
      await Promise.all(ids.map(id => deleteUserAccount(id)))
      setUsers(prev => prev.filter(u => !ids.includes(u.id)))
      setSelectedIds([])
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Successfully deleted ${ids.length} users.`, type: 'warning' }
      }))
    } catch (error) {
      console.error('Error bulk deleting users:', error)
      alert('Error: Failed to delete one or more users from authentication.')
    }
  }

  // Toggle user status (active <-> inactive)
  const handleToggleStatus = async (userId: string) => {
    try {
      const targetUser = users.find(u => u.id === userId)
      if (!targetUser) return

      const currentStatus = (targetUser as any).status || 'active'
      const nextStatus = currentStatus === 'inactive' ? 'active' : 'inactive'

      await updateDoc(doc(db, 'users', userId), { status: nextStatus })

      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated = { ...u, status: nextStatus }
          if (viewUser?.id === userId) {
            setViewUser(updated)
          }
          return updated
        }
        return u
      }))

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `User status @${targetUser.username} set to ${nextStatus}.`,
          type: nextStatus === 'active' ? 'success' : 'warning'
        }
      }))
    } catch (error) {
      console.error('Error updating user status in Firestore:', error)
      alert('Error: Failed to update user status in Firebase database.')
    }
  }

  // Trigger delete confirmation modal
  const handleDeleteUser = (userId: string, username: string) => {
    setDeleteConfirmUser({ id: userId, username })
  }

  // Handle actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return
    const { id: userId, username } = deleteConfirmUser
    setDeleteConfirmUser(null)

    try {
      await deleteUserAccount(userId)

      setUsers(prev => {
        const filtered = prev.filter(u => u.id !== userId)
        if (viewUser?.id === userId) {
          setViewUser(null)
          setIsDetailsOpen(false)
        }
        return filtered
      })

      if (currentUser?.id === userId) {
        await signOut(auth)
      }

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `User @${username} has been deleted.`, type: 'warning' }
      }))
    } catch (error) {
      console.error('Error deleting user account:', error)
      alert('Error: Failed to delete user from authentication.')
    }
  }


  // Filtering users array
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const status = (u as any).status || 'active'
      if (roleFilter !== 'all' && u.role?.toLowerCase() !== roleFilter.toLowerCase()) return false
      if (statusFilter !== 'all' && status !== statusFilter) return false

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          (u.username || '').toLowerCase().includes(query) ||
          (u.name || '').toLowerCase().includes(query) ||
          (u.email || '').toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      return true
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))

  const hasActiveFilters = searchQuery.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all'

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages))
  }, [totalPages])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 flex flex-col gap-6 w-full font-sans select-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">User Management</h3>
            <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-1">
              Managing administrator permissions and console access keys
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-error-bg border border-error-border rounded-lg text-error-text text-xs font-mono">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-error-text" />
          <div>
            <span className="font-bold">Firestore Sync Error:</span> {error}
          </div>
        </div>
      )}

      {/* Control Bar: Search, Filters & Create Action */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-1">
        {/* Left Side: Search & Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted/80 pointer-events-none" />
            <Input
              placeholder="Search by Name, Email, or Username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs font-sans bg-card border border-border focus-visible:ring-primary/30"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="h-9 px-3 rounded-lg text-xs font-mono bg-card border border-border text-foreground focus:outline-none focus:border-primary/50 w-full md:w-auto"
          >
            <option value="all" className="bg-[#151221] text-foreground">All Roles</option>
            <option value="admin" className="bg-[#151221] text-foreground">Admin</option>
            <option value="user" className="bg-[#151221] text-foreground">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 px-3 rounded-lg text-xs font-mono bg-card border border-border text-foreground focus:outline-none focus:border-primary/50 w-full md:w-auto"
          >
            <option value="all" className="bg-[#151221] text-foreground">All Statuses</option>
            <option value="active" className="bg-[#151221] text-foreground">Active</option>
            <option value="inactive" className="bg-[#151221] text-foreground">Inactive</option>
          </select>

          {/* Clear Filters Action */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery('')
                setRoleFilter('all')
                setStatusFilter('all')
              }}
              className="h-9 px-3 text-xs font-mono gap-1 text-muted hover:text-foreground shrink-0 border border-dashed border-border"
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </Button>
          )}
        </div>

        {/* Right Side: Create Action */}
        <div className="w-full md:w-auto flex justify-end">
          <Button
            variant="primary"
            glow
            onClick={openCreateUser}
            className="gap-2 text-xs font-mono shrink-0 h-9 w-full md:w-auto"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Bulk Action Strip if Selection > 0 */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-primary/15 border border-primary/40 rounded-xl flex items-center justify-between gap-4"
        >
          <span className="text-xs font-mono text-primary font-bold">
            {selectedIds.length} user{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" glow onClick={() => { bulkActivate(selectedIds); setSelectedIds([]); }} className="text-xs font-mono h-8">Activate</Button>
            <Button size="sm" variant="outline" onClick={() => { bulkDeactivate(selectedIds); setSelectedIds([]); }} className="text-xs font-mono h-8">Deactivate</Button>
            <Button size="sm" variant="ghost" onClick={() => { bulkDelete(selectedIds); }} className="text-xs font-mono h-8 text-muted hover:text-red-400">Delete</Button>
          </div>
        </motion.div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div variants={cardVariants} className="col-span-full">
          <div className="border border-muted/30 rounded-xl overflow-hidden bg-surface/30">
            <Table>
              <TableHeader className="bg-surface/75 border-b border-muted/30">
                <TableRow className="border-b border-muted/30 hover:bg-transparent h-14">
                  <TableHead className="text-xs font-mono h-14">Name</TableHead>
                  <TableHead className="text-xs font-mono h-14">Username</TableHead>
                  <TableHead className="text-xs font-mono h-14">Email</TableHead>
                  <TableHead className="text-xs font-mono h-14">Role</TableHead>
                  <TableHead className="text-xs font-mono h-14">Status</TableHead>
                  <TableHead className="text-xs font-mono h-14">Last Login</TableHead>
                  <TableHead className="text-xs font-mono h-14 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted font-mono text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <motion.div
                          className="h-5 w-5 rounded-full border-2 border-border border-t-primary"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Loading data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted font-mono text-xs">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <ShieldAlert className="h-6 w-6 text-muted-text/50" />
                        <span>No matches found. Check active filters.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u) => {
                    const isSelected = selectedIds.includes(u.id)
                    const status = (u as any).status || 'active'
                    return (
                      <TableRow
                        key={u.id}
                        onClick={() => openDetailsForUser(u)}
                        className={`cursor-pointer transition-colors border-b border-muted/20 hover:bg-surface/40 ${isSelected ? 'bg-primary/5' : ''}`}
                      >

                        {/* Name */}
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden text-primary font-bold text-[10px]">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                              ) : (
                                <span>
                                  {u.name
                                    ? u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                                    : 'U'}
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-xs text-foreground line-clamp-1">{u.name}</span>
                          </div>
                        </TableCell>

                        {/* User Name */}
                        <TableCell className="py-2.5">
                          <span className="font-mono text-xs text-muted">
                            {u.username ? `@${u.username}` : '—'}
                          </span>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="py-2.5">
                          <span className="font-mono text-xs text-muted">{u.email}</span>
                        </TableCell>

                        {/* Role */}
                        <TableCell className="py-2.5">
                          {u.role ? (
                            <span className="text-xs font-sans text-foreground capitalize">
                              {u.role}
                            </span>
                          ) : (
                            <span className="text-xs text-muted font-mono">—</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-2.5">
                          {status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Inactive
                            </span>
                          )}
                        </TableCell>

                        {/* Last Login */}
                        <TableCell className="py-2.5">
                          <span className="font-mono text-xs text-muted whitespace-nowrap">
                            {formatLastLoginTable(u)}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right py-2.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                                <DropdownMenuItem
                                  onClick={() => openDetailsForUser(u)}
                                  className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2"
                                >
                                  <Eye className="h-3.5 w-3.5 text-primary" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openEditForUser(u)}
                                  className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2"
                                >
                                  <Edit3 className="h-3.5 w-3.5 text-muted" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400 focus:bg-red-950/20 focus:text-red-300 flex items-center gap-2 text-xs font-mono cursor-pointer rounded-md p-2"
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Database indicator in footer */}
          <div className="p-4 bg-card flex items-center justify-between text-xs font-mono">
            <span className="text-muted">
              Showing {filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              {' '}to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} Users
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-xs font-mono"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-foreground font-bold">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-xs font-mono"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Details Sheet */}
      <Sheet
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open)
          if (!open) setViewUser(null)
        }}
      >
        <SheetContent side="right" hideClose className="w-full sm:max-w-2xl bg-background border-l border-border p-0 overflow-y-auto">
          {viewUser && (
            <UserDetails
              user={viewUser}
              onToggleStatus={handleToggleStatus}
              onEdit={(user) => {
                openEditForUser(user)
              }}
              onClose={() => {
                setIsDetailsOpen(false)
                setViewUser(null)
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Slideout Sheet for Add/Edit Form */}
      <Sheet
        open={isAddEditOpen}
        onOpenChange={(open) => {
          setIsAddEditOpen(open)
          if (!open) {
            setUserToEdit(null)
          }
        }}
      >
        {isAddEditOpen && (
          <AddEditUser
            userToEdit={userToEdit}
            onSave={handleSaveUser}
            onClose={() => {
              setIsAddEditOpen(false)
              setUserToEdit(null);
            }}
          />
        )}
      </Sheet>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
        description={
          deleteConfirmUser && (
            <p>
              Are you absolutely sure you want to permanently delete user{' '}
              <span className="font-semibold text-foreground font-mono">@{deleteConfirmUser.username}</span>? This action cannot be undone and will permanently wipe their data from the database.
            </p>
          )
        }
      />
    </motion.div>
  )
}
