import React, { useState, useEffect } from 'react'
import type { User } from '../../../context/AuthContext'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SheetContent } from '../../../components/ui/sheet'
import { AtSign, Mail, Shield, User as UserIcon, UserCheck, AlertCircle, Lock } from 'lucide-react'
 
interface AddEditUserProps {
    userToEdit: User | null
    onSave: (userData: Omit<User, 'joinedAt'> & { status?: string; password?: string }) => Promise<void>
    onClose: () => void
}
 
export const AddEditUser: React.FC<AddEditUserProps> = ({
    userToEdit,
    onSave,
    onClose
}) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState('user')
    const [status, setStatus] = useState('active')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
 
    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name)
            setEmail(userToEdit.email)
            setUsername(userToEdit.username)
            const cleanRole = userToEdit.role ? userToEdit.role.trim().toLowerCase() : 'user'
            setRole(cleanRole === 'admin' ? 'admin' : 'user')
            setStatus((userToEdit as any).status || 'active')
        } else {
            setName('')
            setEmail('')
            setUsername('')
            setRole('user')
            setStatus('active')
        }
        setError(null)
    }, [userToEdit])
 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
 
        const finalName = name.trim()
        const finalEmail = email.trim()
        const finalUsername = username.trim()
 
        if (!finalName) {
            setError('Name is required.')
            return
        }
        if (!finalEmail) {
            setError('Email is required.')
            return
        }
        if (!finalUsername) {
            setError('Username is required.')
            return
        }
 
        // Basic email validation
        if (!/\S+@\S+\.\S+/.test(finalEmail)) {
            setError('Please enter a valid email address.')
            return
        }

        if (!userToEdit) {
            if (password.length < 6) {
                setError('Password must be at least 6 characters.')
                return
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.')
                return
            }
        }
 
        setIsLoading(true)
        try {
            await onSave({
                id: userToEdit ? userToEdit.id : `usr_${Date.now()}`,
                name: finalName,
                email: finalEmail,
                username: finalUsername,
                role,
                status,
                password: userToEdit ? undefined : password
            })
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to save user details.')
        } finally {
            setIsLoading(false)
        }
    }
 
    return (
        <SheetContent side="right" className="p-6 bg-card/95 backdrop-blur-md text-foreground border-l border-border max-w-md w-full h-full flex flex-col justify-between select-none">
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="border-b border-border/40 pb-4 mb-6">
                    <h2 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">
                        {userToEdit ? 'Edit User Details' : 'Add New User'}
                    </h2>
                    <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
                        {userToEdit ? `Updating profile for @${userToEdit.username}` : 'Register a new administrator or operator'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-5">
                    {/* Error display */}
                    {error && (
                        <div className="flex items-start gap-2.5 p-3 bg-red-500/10 dark:bg-red-950/30 border border-red-500/20 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-300 text-xs font-mono">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">Full Name</label>
                        <div className="relative flex items-center">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                            <Input
                                type="text"
                                placeholder="e.g. Yash Patel"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={isLoading}
                                className="pl-9 text-xs font-sans h-9 bg-card/65 border-border focus:border-primary transition-all rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">Email Address</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                            <Input
                                type="email"
                                placeholder="e.g. yash@anybet.io"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="pl-9 text-xs font-sans h-9 bg-card/65 border-border focus:border-primary transition-all rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Role selection */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">Role</label>
                        <div className="relative flex items-center">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                disabled={isLoading}
                                className="pl-9 pr-3 py-1.5 w-full h-9 rounded-lg border border-border bg-card/65 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer appearance-none"
                            >
                                <option value="admin" className="bg-card text-foreground">Admin</option>
                                <option value="user" className="bg-card text-foreground">User</option>
                            </select>
                        </div>
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">Username</label>
                        <div className="relative flex items-center">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                            <Input
                                type="text"
                                placeholder="e.g. yash_bet"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                disabled={isLoading}
                                className="pl-9 text-xs font-mono h-9 bg-card/65 border-border focus:border-primary transition-all rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">Status</label>
                        <div className="relative flex items-center">
                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                disabled={isLoading}
                                className="pl-9 pr-3 py-1.5 w-full h-9 rounded-lg border border-border bg-card/65 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer appearance-none"
                            >
                                <option value="active" className="bg-card text-foreground">ACTIVE</option>
                                <option value="inactive" className="bg-card text-foreground">INACTIVE</option>
                            </select>
                        </div>
                    </div>

                    {/* Password & Confirm Password (Only for creation) */}
                    {!userToEdit && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">Password</label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                    <Input
                                        type="password"
                                        placeholder="Enter initial password (min 6 chars)"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="pl-9 text-xs font-sans h-9 bg-card/65 border-border focus:border-primary transition-all rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">Confirm Password</label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                    <Input
                                        type="password"
                                        placeholder="Confirm initial password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="pl-9 text-xs font-sans h-9 bg-card/65 border-border focus:border-primary transition-all rounded-lg"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </div>

            <div className="flex gap-3 border-t border-border/40 pt-4 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-xs font-mono py-2"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    className="flex-1 text-xs font-mono py-2"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save User'}
                </Button>
            </div>
        </SheetContent>
    )
}
