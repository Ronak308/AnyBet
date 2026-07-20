import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, AtSign, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { SmoothInput } from '../../components/ui/skiper106'
import { Button } from '../../components/ui/button'
import { Logo } from '../../components/ui/Logo'

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

    const finalName = name.trim()
    const finalEmail = email.trim()
    const finalUsername = username.trim()
    const finalPassword = password

    if (!finalName) {
      setError('Full name is required.')
      return
    }
    if (!finalEmail) {
      setError('Email address is required.')
      return
    }
    if (!finalUsername) {
      setError('Username is required.')
      return
    }
    if (!finalPassword) {
      setError('Password is required.')
      return
    }
    if (finalPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    // Auto-sanitize username to keep it valid (alphanumeric + underscores)
    let cleanUsername = finalUsername
    if (cleanUsername.includes('@')) {
      cleanUsername = cleanUsername.split('@')[0]
    }
    cleanUsername = cleanUsername.replace(/[^a-zA-Z0-9_]/g, '')

    // Ensure length constraints
    if (cleanUsername.length < 3) {
      cleanUsername = `usr_${cleanUsername}`.substring(0, 20)
    }
    if (cleanUsername.length < 3) {
      cleanUsername = `user_${Math.floor(1000 + Math.random() * 9000)}`
    }
    cleanUsername = cleanUsername.substring(0, 20)

    setIsLoading(true)
    const result = await signup(finalName, finalEmail, cleanUsername, finalPassword)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Signup failed. Please try again.')
    }
  }

  const sharedWrapperClass = "flex-1 border border-border focus-within:border-primary transition-colors rounded-lg"

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative overflow-hidden select-none">

      {/* LEFT COLUMN: Authorization Form Panel */}
      <div className="w-full lg:w-[42%] min-h-screen flex items-center justify-center p-6 sm:p-12 relative z-10 bg-background overflow-y-auto">

        {/* Ambient subtle background grid for form column */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(179,102,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(179,102,255,1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md relative z-10 py-6"
        >
          {/* Card Wrapper */}
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
              <p className="text-muted text-[10px] font-mono uppercase tracking-widest mt-0.5">
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
                    className="flex items-start gap-2.5 p-3 bg-error-bg border border-error-border rounded-lg text-error-text text-xs font-mono overflow-hidden"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-error-text" />
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
            <p className="text-center text-xs text-muted font-mono">
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

      {/* RIGHT COLUMN: Cover Hero Image Banner */}
      <div className="hidden lg:block lg:w-[58%] h-screen sticky top-0 relative overflow-hidden border-l border-border">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/auth-hero.png")' }}
        />

        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0D0B14] via-[#0D0B14]/85 to-transparent z-10" />

        {/* Ambient Cyber Light Effect */}
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-10" />
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#00E0FF]/5 blur-[100px] pointer-events-none z-10" />

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col justify-center p-16 z-20 select-none">

          <div className="flex flex-col gap-4 max-w-xl">
            <span className="text-xs font-mono text-primary uppercase tracking-widest font-semibold">// NEXT-GEN PREDICTION MARKET PROTOCOL</span>
            <h2 className="text-4xl font-extrabold text-foreground tracking-tight leading-tight uppercase font-sans">
              Predict on anything, <br />settled by AI.
            </h2>
            <p className="text-sm text-muted leading-relaxed font-sans mt-2">
              Join AnyBet's decentralized console to place stakes on physical events, sports matches, and crypto prediction markets. All outcomes are audited by autonomous oracle networks for transparent payouts.
            </p>
          </div>

          <div className="flex items-center justify-between font-mono text-[9px] text-muted border-t border-white/5 pt-4">
            <span>OPERATOR CONSOLE V2.4.0</span>
            <span>SYSTEM SECURITY PROTOCOL: SECURE SHA-256</span>
          </div>
        </div>
      </div>
    </div>
  )
}
