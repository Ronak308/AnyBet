import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, AtSign, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { SmoothInput } from './ui/skiper106'
import { Button } from './ui/button'
import { Logo } from './ui/Logo'

interface SignupPageProps {
  onSwitchToLogin: () => void
}

// Password strength helper
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
  if (score === 2) return { score, label: 'Fair', color: '#f59e0b' }
  if (score === 3) return { score, label: 'Good', color: '#8026FF' }
  return { score, label: 'Strong', color: '#10b981' }
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin }) => {
  const { signup } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      setError('Username must be 3–20 characters: letters, numbers, or underscores only.')
      return
    }

    setIsLoading(true)
    const result = await signup(name, email, username, password)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Signup failed. Please try again.')
    }
  }

  const sharedWrapperClass = "flex-1 border border-border focus-within:border-primary transition-colors rounded-lg"

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">

      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,224,255,0.08) 0%, transparent 70%)',
            top: '-200px',
            right: '-200px',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(179,102,255,0.12) 0%, transparent 70%)',
            bottom: '-150px',
            left: '-150px',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(179,102,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(179,102,255,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-panel rounded-2xl p-6 border border-border/60">

          {/* Logo header */}
          <div className="flex flex-col items-center mb-5">
            <motion.div
              className="mb-3 flex items-center justify-center"
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Logo size="lg" collapsed={false} />
            </motion.div>
            <p className="text-muted text-xs font-mono mt-0.5 uppercase tracking-widest">
              AnyBet Ops Console
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                <SmoothInput
                  id="signup-name"
                  type="text"
                  placeholder="Alex Vance"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  disabled={isLoading}
                  wrapperClassName={sharedWrapperClass}
                  className="pl-8 pr-4 py-2 h-9"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                <SmoothInput
                  id="signup-email"
                  type="email"
                  placeholder="operator@anybet.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                  wrapperClassName={sharedWrapperClass}
                  className="pl-8 pr-4 py-2 h-9"
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Username</label>
              <div className="relative flex items-center">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                <SmoothInput
                  id="signup-username"
                  type="text"
                  placeholder="admin_alpha"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={isLoading}
                  wrapperClassName={sharedWrapperClass}
                  className="pl-8 pr-4 py-2 h-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                <SmoothInput
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                  wrapperClassName={sharedWrapperClass}
                  className="pl-8 pr-10 py-2 h-9"
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

              {/* Password strength indicator */}
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 mt-0.5 overflow-hidden"
                  >
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="h-0.5 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: i <= strength.score ? strength.color : '#251F33' }}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                    {strength.score === 4 && (
                      <CheckCircle2 className="h-3 w-3" style={{ color: strength.color }} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2.5 p-3 bg-red-950/30 border border-red-500/30 rounded-lg text-red-300 text-xs font-mono overflow-hidden"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <Button
              id="signup-submit"
              type="submit"
              variant="primary"
              size="default"
              className="mt-0.5 w-full gap-2 font-semibold h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="h-4 w-4 rounded-full border-2 border-[#151221]/40 border-t-[#151221]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Switch to login */}
          <p className="text-center text-sm text-muted font-mono">
            Already have an account?{' '}
            <button
              id="goto-login"
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary-hover font-semibold transition-colors underline underline-offset-2"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
