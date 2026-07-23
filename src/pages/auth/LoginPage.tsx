import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/components/ui/Toast'
import { SmoothInput } from '../../components/ui/skiper106'
import { Button } from '../../components/ui/button'
import { Logo } from '../../components/ui/Logo'

function formatLoginErrorMessage(rawError?: string): string {
  if (!rawError) return 'Invalid email or password. Please check your credentials and try again.'

  const lower = rawError.toLowerCase()

  if (lower.includes('user-not-found') || lower.includes('wrong-password') || lower.includes('invalid-credential') || lower.includes('invalid credential')) {
    return 'Incorrect email or password. Please check your details and try again.'
  }
  if (lower.includes('invalid-email') || lower.includes('invalid email')) {
    return 'Please enter a valid email address format.'
  }
  if (lower.includes('user-disabled') || lower.includes('user disabled')) {
    return 'This account has been disabled. Please contact system support.'
  }
  if (lower.includes('too-many-requests') || lower.includes('too many requests')) {
    return 'Too many failed attempts. Please wait a moment before trying again.'
  }
  if (lower.includes('network-request-failed') || lower.includes('network error')) {
    return 'Network connection error. Please check your internet connection and try again.'
  }
  if (lower.includes('role') || lower.includes('authorized') || lower.includes('access denied')) {
    return 'Access Denied: Standard user accounts cannot log into the dashboard. Only Admin, Moderator, Support, and Finance roles are authorized.'
  }
  if (lower.includes('suspended')) {
    return 'Account Suspended: Your account has been suspended. Please contact system support.'
  }
  if (lower.includes('banned')) {
    return 'Account Banned: Your account has been banned. Please contact system support.'
  }
  if (lower.includes('inactive')) {
    return 'Account Inactive: Your account has been deactivated. Please contact an administrator.'
  }

  return rawError
}

interface LoginPageProps {
  onSwitchToSignup: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup: _onSwitchToSignup }) => {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalEmail = email.trim()
    const finalPassword = password

    if (!finalEmail) {
      toast.error('Please enter your email or username to log in.')
      return
    }
    if (!finalPassword) {
      toast.error('Please enter your password.')
      return
    }

    setIsLoading(true)
    const result = await login(finalEmail, finalPassword)
    setIsLoading(false)

    if (!result.success) {
      const userFriendlyMsg = formatLoginErrorMessage(result.error)
      toast.error(userFriendlyMsg)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative overflow-hidden select-none">

      {/* LEFT COLUMN: Authorization Form Panel */}
      <div className="w-full lg:w-[42%] min-h-screen flex items-center justify-center p-6 sm:p-12 relative z-10 bg-background">

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
          className="w-full max-w-md relative z-10"
        >
          {/* Card Wrapper */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-border/60">

            {/* Logo header */}
            <div className="flex flex-col items-center mb-6">
              <motion.div
                className="mb-3 flex items-center justify-center"
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Logo size="lg" collapsed={false} />
              </motion.div>
              <p className="text-muted text-[10px] font-mono uppercase tracking-widest mt-1">
                AnyBet Ops Console
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email or Username */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider">
                  Email or Username
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                  <SmoothInput
                    id="login-email"
                    type="text"
                    placeholder="operator@anybet.io or username"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="username"
                    disabled={isLoading}
                    wrapperClassName="flex-1 border border-border focus-within:border-primary transition-colors rounded-lg"
                    className="pl-8 pr-4 py-2 h-9"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none z-10" />
                  <SmoothInput
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={isLoading}
                    wrapperClassName="flex-1 border border-border focus-within:border-primary transition-colors rounded-lg"
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
              </div>

              {/* Submit */}
              <Button
                id="login-submit"
                type="submit"
                variant="primary"
                size="default"
                className="mt-1 w-full gap-2 font-semibold h-10"
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



            {/* Demo Credentials Card */}
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">Demo Access Credentials</span>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setEmail('admin@anybet.com')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted" />
                    <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Email</span>
                  </div>
                  <span className="text-xs font-mono text-foreground font-semibold group-hover:text-primary transition-colors">
                    admin@anybet.com
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPassword('Test@123')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-muted" />
                    <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Password</span>
                  </div>
                  <span className="text-xs font-mono text-foreground font-semibold group-hover:text-primary transition-colors">
                    Test@123
                  </span>
                </button>
              </div>
              <p className="text-[9px] font-mono text-muted text-center">Click any field above to auto-fill credentials</p>
            </div>
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
