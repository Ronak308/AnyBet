import React, { useState, useEffect } from 'react'
import type { User } from '@/context/AuthContext'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SheetContent } from '../../../components/ui/sheet'
import { AtSign, Mail, Shield, User as UserIcon, UserCheck, Lock, Eye, EyeOff, X } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

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
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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
        setFieldErrors({})
    }, [userToEdit])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFieldErrors({})

        const finalName = name.trim()
        const finalEmail = email.trim()
        const finalUsername = username.trim().toLowerCase()
        const errors: Record<string, string> = {}

        if (!finalName) {
            errors.name = 'Full Name is required.'
        } else if (!/^[a-zA-Z\s\-'\u00C0-\u017F]+$/.test(finalName)) {
            errors.name = 'Full Name can only contain letters, spaces, hyphens, and apostrophes.'
        } else if (finalName.length < 2) {
            errors.name = 'Full Name must be at least 2 characters.'
        }
        if (!finalEmail) {
            errors.email = 'Email address is required.'
        } else if (!/\S+@\S+\.\S+/.test(finalEmail)) {
            errors.email = 'Please enter a valid email address.'
        }
        if (!finalUsername) {
            errors.username = 'Username is required.'
        } else if (!/^[a-zA-Z0-9_\-]+$/.test(finalUsername)) {
            errors.username = 'Username can only contain letters, numbers, underscores, and hyphens.'
        } else if (finalUsername.length < 3) {
            errors.username = 'Username must be at least 3 characters.'
        }

        if (!userToEdit) {
            if (!password) {
                errors.password = 'Password is required.'
            } else if (password.length < 6) {
                errors.password = 'Password must be at least 6 characters.'
            } else if (!/[A-Z]/.test(password)) {
                errors.password = 'Password must contain at least one uppercase letter.'
            } else if (!/[a-z]/.test(password)) {
                errors.password = 'Password must contain at least one lowercase letter.'
            } else if (!/[0-9]/.test(password)) {
                errors.password = 'Password must contain at least one number.'
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                errors.password = 'Password must contain at least one special character.'
            }
            if (password !== confirmPassword) {
                errors.confirmPassword = 'Passwords do not match.'
            }
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
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
            toast.success(userToEdit ? `Successfully updated @${finalUsername}` : `Successfully added @${finalUsername}`)
            onClose()
        } catch (err: any) {
            const errMsg = err.message || 'Failed to save user details.'
            toast.error(errMsg)
            if (errMsg.toLowerCase().includes('email')) {
                setFieldErrors(prev => ({ ...prev, email: errMsg }))
            } else if (errMsg.toLowerCase().includes('username')) {
                setFieldErrors(prev => ({ ...prev, username: errMsg }))
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <SheetContent side="right" hideClose className="p-6 bg-card/95 backdrop-blur-md text-foreground border-l border-border max-w-2xl w-full h-full flex flex-col justify-between select-none">
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="border-b border-border/40 pb-4 mb-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">
                            {userToEdit ? 'Edit User Details' : 'Add New User'}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-muted hover:text-foreground p-1.5 transition-colors rounded-md hover:bg-border/30 shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
                        {userToEdit ? `Updating profile for @${userToEdit.username}` : 'Register a new administrator or operator'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-5">


                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                            Full Name <span className="text-red-400 ml-0.5">*</span>
                        </label>
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
                        {fieldErrors.name && (
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.name}</span>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                            Email Address <span className="text-red-400 ml-0.5">*</span>
                        </label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                            <Input
                                type="email"
                                placeholder="e.g. yash@anybet.io"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                className="pl-9 text-xs font-sans h-9 bg-card/65 border-border focus:border-primary transition-all rounded-lg"
                            />
                        </div>
                        {fieldErrors.email && (
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.email}</span>
                        )}
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                            Username {!userToEdit && <span className="text-red-400 ml-0.5">*</span>}
                        </label>
                        <div className="relative flex items-center">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                            <Input
                                type="text"
                                placeholder="e.g. yash_bet"
                                value={username}
                                onChange={e => setUsername(e.target.value.toLowerCase())}
                                disabled={isLoading || !!userToEdit}
                                className={`pl-9 text-xs font-mono h-9 bg-card/65 border-border focus:border-primary transition-all rounded-lg ${userToEdit ? 'opacity-60 cursor-not-allowed bg-surface/40' : ''
                                    }`}
                            />
                        </div>
                        {fieldErrors.username && (
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.username}</span>
                        )}
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
                                <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                                    Password <span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter initial password (min 6 chars)"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="pl-9 pr-10 text-xs font-sans h-9 bg-card/65 border-border focus:border-primary transition-all rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors z-10"
                                        onClick={() => setShowPassword(v => !v)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.password}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                                    Confirm Password <span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm initial password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="pl-9 pr-10 text-xs font-sans h-9 bg-card/65 border-border focus:border-primary transition-all rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors z-10"
                                        onClick={() => setShowConfirmPassword(v => !v)}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                                {fieldErrors.confirmPassword && (
                                    <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.confirmPassword}</span>
                                )}
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
