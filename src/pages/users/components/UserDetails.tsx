import React from 'react'
import type { User } from '@/context/AuthContext'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { ShieldCheck, Ban, Calendar, Activity, Mail, X } from 'lucide-react'

interface UserDetailsProps {
  user: User
  onToggleStatus: (userId: string) => Promise<void>
  onEdit: (user: User) => void
  onClose?: () => void
}

export const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  onToggleStatus,
  onEdit,
  onClose
}) => {
  const status = (user as any).status || 'active'

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

  const formatUserDate = (u: any) => {
    const dateVal = u.createdAt || u.joinedAt
    if (!dateVal) return 'N/A'

    const date = parseFirestoreDate(dateVal)
    if (!date) return 'N/A'

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatLastLogin = (u: any) => {
    const val = u.lastLoginAt
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

  const joinedDate = formatUserDate(user)

  return (
    <Card className="h-full flex flex-col justify-between p-6 bg-card border-none select-none font-sans shadow-none">
      <div>
        {/* Sheet Header */}
        <div className="border-b border-border/40 pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">
                User Details
              </h2>
              <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
                Viewing profile for @{user.username}
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-foreground p-1.5 transition-colors rounded-md hover:bg-border/30 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="relative mb-3">
            <div className="h-20 w-20 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden text-primary font-bold text-lg shadow-xl shadow-primary/5">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span>
                  {user.name
                    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'U'}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#120F1D] border border-muted/30 p-1 rounded-full">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-foreground font-sans leading-tight">{user.name}</h3>
          <span className="text-xs font-mono text-muted mt-1">@{user.username}</span>

          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {user.role}
            </span>
            {status === 'active' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Profile details */}
        <div className="flex flex-col gap-2.5 mb-6">
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Account Details</span>

          <div className="flex flex-col gap-3 bg-surface/50 border border-muted/20 p-4 rounded-xl text-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-border/40">
              <span className="text-muted flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted/70" />
                Email Address
              </span>
              <span className="text-foreground font-mono font-medium truncate max-w-[240px]">{user.email}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted/70" />
                Created Date
              </span>
              <span className="text-foreground font-mono font-medium">{joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Recent logs */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">System Access Log</span>
            <span className="text-[9px] font-mono text-primary flex items-center gap-1 font-bold">
              <Activity className="h-2.5 w-2.5 animate-pulse" />
              MONITORING
            </span>
          </div>

          <div className="relative border-l border-muted/20 pl-4 ml-1.5 flex flex-col gap-4 font-sans mt-1">
            {/* Last Login */}
            <div className="relative">
              <span className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-[#120F1D] shadow-[0_0_8px_rgba(128,38,255,0.4)]" />
              <div className="flex flex-col">
                <span className="text-xs text-foreground font-semibold">Last authenticated session</span>
                <span className="text-[10px] text-muted font-mono mt-0.5">
                  {formatLastLogin(user)}
                </span>
              </div>
            </div>

            {/* Blocked / Allowed Protocol */}
            <div className="relative">
              {status === 'inactive' ? (
                <>
                  <span className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-red-500 ring-4 ring-[#120F1D] shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                  <div className="flex flex-col">
                    <span className="text-xs text-red-400 font-semibold">Sign-in requests blocked</span>
                    <span className="text-[10px] text-muted font-mono mt-0.5">Lockout protocol active</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-[#120F1D] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <div className="flex flex-col">
                    <span className="text-xs text-emerald-400 font-semibold">Sign-in credentials authorized</span>
                    <span className="text-[10px] text-muted font-mono mt-0.5">Console credentials active</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Panel */}
      <div className="mt-8 border-t border-border/40 pt-4">
        <div className="flex gap-3 w-full">
          {onClose && (
            <Button
              variant="outline"
              className="flex-1 text-xs font-mono uppercase tracking-wider py-2 h-9 border-muted/30 hover:bg-surface/50"
              onClick={onClose}
            >
              Close
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1 text-xs font-mono uppercase tracking-wider py-2 h-9 border-muted/30 hover:bg-surface/50"
            onClick={() => onEdit(user)}
          >
            Edit Profile
          </Button>
          <Button
            variant={status === 'inactive' ? 'outline' : 'danger'}
            className={`flex-1 text-xs font-mono uppercase tracking-wider py-2 h-9 gap-1.5 ${status === 'inactive' ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10' : ''
              }`}
            onClick={() => onToggleStatus(user.id)}
          >
            <Ban className="h-3.5 w-3.5" />
            {status === 'inactive' ? 'Activate' : 'Deactivate'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
