import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { SmoothInput } from './ui/skiper106'
import { Button } from './ui/button'
import { Logo } from './ui/Logo'

interface LoginPageProps {
  onSwitchToSignup: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup }) => {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Direct login bypass for empty fields
    const finalEmail = email.trim() || 'admin@anybet.io'
    const finalPassword = password || 'password123'

    setIsLoading(true)
    const result = await login(finalEmail, finalPassword)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">

      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(179,102,255,0.12) 0%, transparent 70%)',
            top: '-200px',
            left: '-200px',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,224,255,0.08) 0%, transparent 70%)',
            bottom: '-150px',
            right: '-150px',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
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
        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 border border-border/60">

          {/* Logo header */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="mb-4 flex items-center justify-center"
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Logo size="lg" collapsed={false} />
            </motion.div>
            <p className="text-muted text-xs font-mono uppercase tracking-widest mt-1">
              AnyBet Ops Console
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-muted uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none z-10" />
                <SmoothInput
                  id="login-email"
                  type="email"
                  placeholder="operator@anybet.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                  wrapperClassName="flex-1 border border-border focus-within:border-primary transition-colors rounded-lg"
                  className="pl-9 pr-4 py-2.5 h-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-muted uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none z-10" />
                <SmoothInput
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  wrapperClassName="flex-1 border border-border focus-within:border-primary transition-colors rounded-lg"
                  className="pl-9 pr-10 py-2.5 h-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors z-10"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
              id="login-submit"
              type="submit"
              variant="primary"
              size="lg"
              className="mt-1 w-full gap-2 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="h-4 w-4 rounded-full border-2 border-[#151221]/40 border-t-[#151221]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Switch to signup */}
          <p className="text-center text-sm text-muted font-mono">
            No account yet?{' '}
            <button
              id="goto-signup"
              type="button"
              onClick={onSwitchToSignup}
              className="text-primary hover:text-primary-hover font-semibold transition-colors underline underline-offset-2"
            >
              Create one
            </button>
          </p>

          {/* Demo hint */}
          <div className="mt-5 p-3 bg-primary/5 border border-primary/15 rounded-lg flex items-start gap-2.5">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] font-mono text-muted leading-relaxed">
              <span className="text-primary font-semibold">New here?</span>{' '}
              Create an account to access the AnyBet Ops dashboard. All data is stored locally.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
