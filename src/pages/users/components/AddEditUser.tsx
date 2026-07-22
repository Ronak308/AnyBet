import React, { useState, useEffect } from 'react'
import type { User } from '@/context/AuthContext'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SheetContent } from '../../../components/ui/sheet'
import { AtSign, Mail, Shield, User as UserIcon, UserCheck, Lock, Eye, EyeOff, X, Phone, Calendar, CheckCircle, Camera, Trash2 } from 'lucide-react'
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
    const [mobileNumber, setMobileNumber] = useState('')
    const [dob, setDob] = useState('')
    const [role, setRole] = useState('user')
    const [status, setStatus] = useState('active')
    const [kycStatus, setKycStatus] = useState('Not Submitted')
    const [avatar, setAvatar] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name)
            setEmail(userToEdit.email)
            setUsername(userToEdit.username)
            setMobileNumber(userToEdit.mobileNumber || '')
            setDob(userToEdit.dob || '')
            const cleanRole = userToEdit.role ? userToEdit.role.trim().toLowerCase() : 'user'
            if (['admin', 'user', 'moderator', 'finance', 'support'].includes(cleanRole)) {
                setRole(cleanRole)
            } else {
                setRole(cleanRole)
            }
            setStatus((userToEdit as any).status || 'active')
            setKycStatus(userToEdit.kycStatus || 'Not Submitted')
            setAvatar(userToEdit.avatar || '')
        } else {
            setName('')
            setEmail('')
            setUsername('')
            setMobileNumber('')
            setDob('')
            setRole('user')
            setStatus('active')
            setKycStatus('Not Submitted')
            setAvatar('')
        }
        setFieldErrors({})
    }, [userToEdit])

    const getMaxDobDate = () => {
        const today = new Date()
        const maxYear = today.getFullYear() - 18
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        return `${maxYear}-${month}-${day}`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFieldErrors({})

        const finalName = name.trim()
        const finalEmail = email.trim()
        const finalUsername = username.trim().toLowerCase()
        const finalMobileNumber = mobileNumber.trim()
        const finalDob = dob.trim()
        const errors: Record<string, string> = {}

        if (!finalName) {
            errors.name = 'Full Name is required.'
        } else if (!/^[a-zA-Z\s\-'\u00C0-\u017F]+$/.test(finalName)) {
            errors.name = 'Full Name can only contain letters, spaces, hyphens, and apostrophes.'
        } else if (finalName.length < 2) {
            errors.name = 'Full Name must be at least 2 characters.'
        }
        if (!finalUsername) {
            errors.username = 'Username is required.'
        } else if (!/^[a-zA-Z0-9_\-]+$/.test(finalUsername)) {
            errors.username = 'Username can only contain letters, numbers, underscores, and hyphens.'
        } else if (finalUsername.length < 3) {
            errors.username = 'Username must be at least 3 characters.'
        }
        if (!finalEmail) {
            errors.email = 'Email address is required.'
        } else if (!/\S+@\S+\.\S+/.test(finalEmail)) {
            errors.email = 'Please enter a valid email address.'
        }
        if (!finalDob) {
            errors.dob = 'Date of Birth is required.'
        } else {
            const birthDate = new Date(finalDob)
            const today = new Date()
            let age = today.getFullYear() - birthDate.getFullYear()
            const m = today.getMonth() - birthDate.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            if (age < 18) {
                errors.dob = 'User must be at least 18 years old.'
            }
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
                mobileNumber: finalMobileNumber,
                dob: finalDob,
                role,
                status,
                kycStatus,
                avatar: avatar || '',
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

                <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-5 pr-1">
                    {/* Avatar Upload */}
                    <div className="flex flex-row items-center gap-6 border border-dashed border-muted/30 p-4 rounded-xl bg-surface/20">
                        {/* Left side: image display */}
                        <div className="relative group cursor-pointer shrink-0">
                            <div className="h-28 w-28 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center overflow-hidden text-primary font-bold text-lg shadow-lg">
                                {avatar ? (
                                    <img src={avatar} alt="Profile preview" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-12 w-12 text-primary/45" />
                                )}
                            </div>
                            
                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="avatar-upload-input"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        // For Firebase Spark Plan, we use a static premium avatar URL
                                        // to avoid saving large base64 strings in Firestore.
                                        const staticAvatars = [
                                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
                                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
                                            'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face',
                                            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
                                            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
                                        ]
                                        const randomIndex = Math.floor(Math.random() * staticAvatars.length)
                                        setAvatar(staticAvatars[randomIndex])
                                        toast.success('Assigned static premium avatar (Spark Plan compatible)')
                                    }
                                }}
                                disabled={isLoading}
                            />
                            
                            {/* Clickable Overlay */}
                            <label
                                htmlFor="avatar-upload-input"
                                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                            >
                                <Camera className="h-7 w-7 text-white" />
                            </label>
                        </div>
                        
                        {/* Right side: instructions and action buttons */}
                        <div className="flex flex-col gap-2.5 items-start">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-foreground font-sans">Upload New Avatar</span>
                                <span className="text-[10px] font-mono text-muted">Assigns a premium static URL to support Spark plan limits.</span>
                            </div>
                            <div className="flex gap-2">
                                <label
                                    htmlFor="avatar-upload-input"
                                    className="text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border border-muted/30 hover:bg-surface/50 transition-colors cursor-pointer text-foreground"
                                >
                                    Choose File
                                </label>
                                {avatar && (
                                    <button
                                        type="button"
                                        onClick={() => setAvatar('')}
                                        className="text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-1.5"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Full Name (Single field in a row) */}
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
                                className="pl-9 text-xs font-sans h-9 bg-surface/80 border border-muted/30 focus:border-primary transition-all rounded-lg focus-visible:ring-primary/30"
                            />
                        </div>
                        {fieldErrors.name && (
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.name}</span>
                        )}
                    </div>

                    {/* Row 1: Username & Mobile Number */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Username */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                                Username <span className="text-red-400 ml-0.5">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                <Input
                                    type="text"
                                    placeholder="e.g. yash_bet"
                                    value={username}
                                    onChange={e => setUsername(e.target.value.toLowerCase())}
                                    disabled={isLoading || !!userToEdit}
                                    className={`pl-9 text-xs font-mono h-9 bg-surface/80 border border-muted/30 focus:border-primary transition-all rounded-lg focus-visible:ring-primary/30 ${userToEdit ? 'opacity-60 cursor-not-allowed bg-surface/40' : ''
                                        }`}
                                />
                            </div>
                            {fieldErrors.username && (
                                <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.username}</span>
                            )}
                        </div>

                        {/* Mobile Number */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                                Mobile Number
                            </label>
                            <div className="relative flex items-center">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                <Input
                                    type="tel"
                                    placeholder="e.g. +1 (555) 019-2834"
                                    value={mobileNumber}
                                    onChange={e => setMobileNumber(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-9 text-xs font-mono h-9 bg-surface/80 border border-muted/30 focus:border-primary transition-all rounded-lg focus-visible:ring-primary/30"
                                />
                            </div>
                            {fieldErrors.mobileNumber && (
                                <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.mobileNumber}</span>
                            )}
                        </div>
                    </div>

                    {/* Email Address (Single field in a row) */}
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
                                disabled={isLoading || !!userToEdit}
                                required
                                className={`pl-9 text-xs font-sans h-9 bg-surface/80 border border-muted/30 focus:border-primary transition-all rounded-lg focus-visible:ring-primary/30 ${userToEdit ? 'opacity-60 cursor-not-allowed bg-surface/40' : ''
                                    }`}
                            />
                        </div>
                        {fieldErrors.email && (
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.email}</span>
                        )}
                    </div>

                    {/* Date of Birth (Single field in a row) */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                            Date of Birth <span className="text-red-400 ml-0.5">*</span>
                        </label>
                        <div className="relative flex items-center">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                            <Input
                                type="date"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                max={getMaxDobDate()}
                                disabled={isLoading}
                                className="pl-9 text-xs font-mono h-9 bg-surface/80 border border-muted/30 focus:border-primary transition-all rounded-lg focus-visible:ring-primary/30"
                            />
                        </div>
                        {fieldErrors.dob && (
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.dob}</span>
                        )}
                    </div>

                    {/* Row 4: Role, Status & KYC Status */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Role selection */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                                Role
                            </label>
                            <div className="relative flex items-center">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-9 pr-3 py-1.5 w-full h-9 rounded-lg border border-muted/30 bg-surface/80 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer appearance-none"
                                >
                                    <option value="user" className="bg-[#120F1D] text-foreground">User</option>
                                    <option value="admin" className="bg-[#120F1D] text-foreground">Admin</option>
                                    <option value="moderator" className="bg-[#120F1D] text-foreground">Moderator</option>
                                    <option value="finance" className="bg-[#120F1D] text-foreground">Finance</option>
                                    <option value="support" className="bg-[#120F1D] text-foreground">Support</option>
                                </select>
                            </div>
                        </div>

                        {/* Status Selection */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                                Status
                            </label>
                            <div className="relative flex items-center">
                                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-9 pr-3 py-1.5 w-full h-9 rounded-lg border border-muted/30 bg-surface/80 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer appearance-none"
                                >
                                    <option value="active" className="bg-[#120F1D] text-foreground">Active</option>
                                    <option value="inactive" className="bg-[#120F1D] text-foreground">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* KYC Status Selection */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">KYC Status</label>
                            <div className="relative flex items-center">
                                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                <select
                                    value={kycStatus}
                                    onChange={e => setKycStatus(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-9 pr-3 py-1.5 w-full h-9 rounded-lg border border-muted/30 bg-surface/80 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer appearance-none"
                                >
                                    <option value="Not Submitted" className="bg-[#120F1D] text-foreground">Not Submitted</option>
                                    <option value="Pending" className="bg-[#120F1D] text-foreground">Pending</option>
                                    <option value="Verified" className="bg-[#120F1D] text-foreground">Verified</option>
                                    <option value="Rejected" className="bg-[#120F1D] text-foreground">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Row 6: Password & Confirm Password (Only for creation) */}
                    {!userToEdit && (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                                    Password <span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password (min 6 chars)"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="pl-9 pr-10 text-xs font-sans h-9 bg-surface/80 border border-muted/30 focus:border-primary transition-all rounded-lg focus-visible:ring-primary/30"
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

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">
                                    Confirm Password <span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="pl-9 pr-10 text-xs font-sans h-9 bg-surface/80 border border-muted/30 focus:border-primary transition-all rounded-lg focus-visible:ring-primary/30"
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
                        </div>
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
