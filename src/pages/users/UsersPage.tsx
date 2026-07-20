import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore'
import { db, firebaseConfig } from '@/firebase/firebase'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth as getSecondaryAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { type User, useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Sheet } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { UserDetails } from './components/UserDetails'
import { AddEditUser } from './components/AddEditUser'
import {
  UserPlus,
  Search,
  SlidersHorizontal,
  Trash2,
  Edit3,
  Database,
  ShieldAlert,
  Download,
  User as UserIcon,
  MoreHorizontal
} from 'lucide-react'

const normalizeRole = (role: string): string => {
  if (!role) return 'user'
  const r = role.trim().toLowerCase()
  if (r === 'admin') return 'admin'
  return 'user'
}

const formatUserDate = (u: User) => {
  const dateVal = u.joinedAt || u.createdAt
  if (!dateVal) return 'N/A'

  let date: Date
  if (typeof dateVal.toDate === 'function') {
    date = dateVal.toDate()
  } else if (dateVal.seconds !== undefined) {
    date = new Date(dateVal.seconds * 1000)
  } else if (typeof dateVal === 'string' || typeof dateVal === 'number' || dateVal instanceof Date) {
    date = new Date(dateVal)
  } else {
    return 'N/A'
  }

  if (isNaN(date.getTime())) return 'N/A'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const UsersPage: React.FC<{ navigate: (tab: string) => void }> = ({ navigate: _navigate }) => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sheet drawer states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<{ id: string; username: string } | null>(null)

  // Filters & Searching
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
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
        const userId = doc.id || data.uid || data.id
        const cleanStatus = (data.status || 'active').trim().toLowerCase()
        fetchedUsers.push({
          ...data,
          id: userId,
          uid: userId,
          role: normalizeRole(data.role || 'user'),
          status: cleanStatus === 'active' ? 'active' : 'inactive'
        } as User)
      })

      // If Firestore is empty, seed it with the currently logged-in user
      if (fetchedUsers.length === 0 && currentUser) {
        await setDoc(doc(db, 'users', currentUser.id), currentUser)
        fetchedUsers = [currentUser]
      }

      // Add a default status if missing
      const processedUsers = fetchedUsers.map(u => ({
        ...u,
        role: normalizeRole(u.role),
        status: (u as any).status === 'active' ? 'active' : 'inactive'
      }))

      setUsers(processedUsers)
      if (processedUsers.length > 0) {
        // Keep current selected user if it still exists, else pick first
        setSelectedUser(prev => {
          if (prev) {
            const found = processedUsers.find(u => u.id === prev.id)
            if (found) return found
          }
          return processedUsers[0]
        })
      }
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
      setSelectedUser(processedFallback[0] || null)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Save/Create user details in Firestore
  const handleSaveUser = async (userData: Omit<User, 'joinedAt'> & { status?: string; password?: string }) => {
    try {
      const existingUser = users.find(u => u.id === userData.id)
      let finalUserId = userData.id

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
      const joinedAtVal = existingUser
        ? (existingUser.joinedAt || (existingUser as any).createdAt || new Date().toISOString())
        : new Date().toISOString()
      const createdAtVal = existingUser
        ? ((existingUser as any).createdAt || existingUser.joinedAt || new Date())
        : new Date()

      // Omit password from firestore record
      const { password, ...userDataWithoutPassword } = userData

      const updatedData = {
        ...userDataWithoutPassword,
        id: finalUserId,
        uid: finalUserId, // Save uid field matching the Firestore document schema
        role: normalizeRole(userData.role), // Keep role normalized
        joinedAt: typeof joinedAtVal === 'string' ? joinedAtVal : (joinedAtVal.toDate ? joinedAtVal.toDate().toISOString() : new Date().toISOString()),
        createdAt: createdAtVal
      }

      await setDoc(userRef, updatedData, { merge: true })

      // Update local state
      setUsers(prev => {
        const index = prev.findIndex(u => u.id === finalUserId)
        if (index > -1) {
          const updatedList = [...prev]
          updatedList[index] = updatedData as User
          return updatedList
        } else {
          return [updatedData as User, ...prev]
        }
      })

      // Update selected user details
      setSelectedUser(updatedData as User)

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
          if (selectedUser?.id === userId) {
            setSelectedUser(updated)
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
      await deleteDoc(doc(db, 'users', userId))

      setUsers(prev => {
        const filtered = prev.filter(u => u.id !== userId)
        if (selectedUser?.id === userId) {
          setSelectedUser(filtered[0] || null)
        }
        return filtered
      })

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `User @${username} has been deleted.`, type: 'warning' }
      }))
    } catch (error) {
      console.error('Error deleting user from Firestore:', error)
      alert('Error: Failed to delete user from Firestore.')
    }
  }

  // Export users to CSV
  const handleExportUsers = () => {
    window.alert("Preparing user directory CSV export...")
    const headers = "ID,Name,Username,Email,Role,Status,JoinedAt\n"
    const rows = users.map(u =>
      `"${u.id}","${u.name}","${u.username}","${u.email}","${u.role}","${(u as any).status || 'active'}","${formatUserDate(u)}"`
    ).join("\n")

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows
    const encodedUri = encodeURI(csvContent)

    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `anybet_user_directory_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: "User directory CSV downloaded successfully!", type: 'success' }
    }))
  }

  // Open direct mail/telemetry dialog
  const handleSendMessage = (user: User) => {
    const msg = window.prompt(`Send telemetry notification message to @${user.username}:`)
    if (msg && msg.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Telemetry message dispatched to @${user.username}`, type: 'success' }
      }))
    }
  }

  // Filtering users array
  const filteredUsers = users.filter(u => {
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">User Directory</h3>
          <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-1">
            Managing administrator permissions and console access keys
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className={`h-8 gap-1.5 font-mono text-[9px] uppercase tracking-wider transition-all ${isFilterOpen ? 'bg-secondary/15 text-secondary border-secondary shadow-[0_0_10px_rgba(0,224,255,0.2)]' : ''
              }`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal className="h-3 w-3" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 font-mono text-[9px] uppercase tracking-wider"
            onClick={handleExportUsers}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="h-8 gap-1.5 font-mono text-[9px] uppercase tracking-wider"
            onClick={() => {
              setUserToEdit(null)
              setIsAddEditOpen(true)
            }}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add User
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-red-950/30 border border-red-500/30 rounded-lg text-red-300 text-xs font-mono">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          <div>
            <span className="font-bold">Firestore Sync Error:</span> {error}
          </div>
        </div>
      )}

      {/* Expandable Filter Grid */}
      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-border bg-background/40 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-muted font-mono uppercase tracking-widest font-bold">Search Directory</label>
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
              <Input
                placeholder="Name, email, username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-9 text-xs font-sans bg-card/40 border-border focus:border-primary transition-all rounded-lg"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-muted font-mono uppercase tracking-widest font-bold">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="h-8 w-full rounded-lg border border-border bg-background px-3 py-1 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer"
            >
              <option value="all">ALL ROLES</option>
              <option value="admin">ADMIN</option>
              <option value="user">USER</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-muted font-mono uppercase tracking-widest font-bold">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 w-full rounded-lg border border-border bg-background px-3 py-1 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer"
            >
              <option value="all">ALL STATUSES</option>
              <option value="active">ACTIVE</option>
              <option value="inactive">INACTIVE</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* Main Content Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Users List Table Card: 8 Columns */}
        <motion.div variants={cardVariants} className="lg:col-span-7 xl:col-span-8">
          <Card className="h-full flex flex-col justify-between">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/40">
                    <TableHead className="font-mono text-[9px] uppercase tracking-wider">Name</TableHead>
                    <TableHead className="font-mono text-[9px] uppercase tracking-wider">User Name</TableHead>
                    <TableHead className="font-mono text-[9px] uppercase tracking-wider">Email</TableHead>
                    <TableHead className="font-mono text-[9px] uppercase tracking-wider">Role</TableHead>
                    <TableHead className="font-mono text-[9px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-mono text-[9px] uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-xs font-mono text-muted">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <motion.div
                            className="h-5 w-5 rounded-full border-2 border-border border-t-primary"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          />
                          Accessing Firebase User Collection...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-xs font-mono text-muted">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <ShieldAlert className="h-6 w-6 text-muted-text/50" />
                          <span>No matches found. Check active filters.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => {
                      const isActive = selectedUser?.id === u.id
                      const status = (u as any).status || 'active'
                      return (
                        <TableRow
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
                          className={`hover:bg-surface/30 cursor-pointer transition-colors duration-150 border-b border-border/20 ${isActive ? 'bg-surface/50' : ''
                            }`}
                        >
                          {/* Name */}
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full border border-border/40 bg-surface/20 flex items-center justify-center shrink-0 overflow-hidden">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                                ) : (
                                  <UserIcon className="h-4 w-4 text-muted" />
                                )}
                              </div>
                              <span className="font-semibold text-foreground text-xs truncate max-w-[120px] block">{u.name}</span>
                            </div>
                          </TableCell>

                          {/* User Name */}
                          <TableCell className="py-2.5">
                            <span className="text-xs font-mono text-muted truncate max-w-[100px] block">@{u.username}</span>
                          </TableCell>

                          {/* Email */}
                          <TableCell className="py-2.5">
                            <span className="text-xs font-mono text-muted-text/90 max-w-[150px] truncate block">{u.email}</span>
                          </TableCell>

                          {/* Role */}
                          <TableCell className="py-2.5">
                            <Badge variant="outline" className="text-[8px] uppercase font-mono tracking-wider">
                              {u.role}
                            </Badge>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase font-semibold">
                              <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500 shadow-glow' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                              <span className={status === 'active' ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                                {status}
                              </span>
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right py-2.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted hover:text-foreground hover:bg-surface/25 rounded-lg transition-colors"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setUserToEdit(u)
                                      setIsAddEditOpen(true)
                                    }}
                                  >
                                    <Edit3 className="h-3.5 w-3.5 text-muted" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-400 focus:bg-red-950/20 focus:text-red-300"
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
            <div className="p-3 border-t border-border/40 bg-surface/10 flex items-center justify-between text-[8px] font-mono text-muted uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Database className="h-3 w-3 text-secondary" />
                Firebase Firestore Sync Active
              </span>
              <span>Total Registry: {users.length} Users</span>
            </div>
          </Card>
        </motion.div>

        {/* Selected User Details Sidebar: 4 Columns */}
        <motion.div variants={cardVariants} className="lg:col-span-5 xl:col-span-4">
          {selectedUser ? (
            <UserDetails
              user={selectedUser}
              onToggleStatus={handleToggleStatus}
              onSendMessage={handleSendMessage}
              onEdit={(user) => {
                setUserToEdit(user)
                setIsAddEditOpen(true)
              }}
            />
          ) : (
            <Card className="h-full flex items-center justify-center p-6 text-center text-xs font-mono text-muted border-dashed border-2">
              Select a user profile to inspect telemetry.
            </Card>
          )}
        </motion.div>
      </div>

      {/* Slideout Sheet for Add/Edit Form */}
      <Sheet open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        {isAddEditOpen && (
          <AddEditUser
            userToEdit={userToEdit}
            onSave={handleSaveUser}
            onClose={() => setIsAddEditOpen(false)}
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
