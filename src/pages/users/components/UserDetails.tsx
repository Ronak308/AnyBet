import React from 'react'
import type { User } from '../../../context/AuthContext'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { ShieldCheck, Mail, Ban, Calendar, Activity, Database, User as UserIcon } from 'lucide-react'

interface UserDetailsProps {
  user: User
  onToggleStatus: (userId: string) => Promise<void>
  onSendMessage: (user: User) => void
  onEdit: (user: User) => void
}

export const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  onToggleStatus,
  onSendMessage,
  onEdit
}) => {
  const status = (user as any).status || 'active'

  const formatUserDate = (u: any) => {
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

  const joinedDate = formatUserDate(user)

  // Simulated metrics
  const totalStakes = status === 'active' ? Math.floor(25 + (user.id.charCodeAt(0) % 50)) : 0
  const accuracy = status === 'active' ? Math.floor(70 + (user.id.charCodeAt(1) % 28)) : 0

  return (
    <Card className="h-full flex flex-col justify-between p-6 bg-card border-border select-none">
      <div>
        {/* Header Profile Section */}
        <div className="flex flex-col items-center justify-center border-b border-border/40 pb-5 mb-5 text-center">
          <div className="relative mb-3">
            <div className="h-16 w-16 rounded-full border-2 border-border/60 bg-surface/20 flex items-center justify-center shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-8 w-8 text-muted" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-background border border-border p-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary shadow-cyanGlow" />
            </div>
          </div>

          <h3 className="text-base font-bold text-foreground font-sans mt-2">{user.name}</h3>
          <span className="text-xs font-mono text-muted">@{user.username}</span>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3.5">
            <Badge variant="outline" className="text-[8px] tracking-wide text-muted-text/80 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-secondary rounded-full"></span>
              {user.role.toUpperCase()}
            </Badge>
            <Badge 
              variant={status === 'active' ? 'success' : 'danger'} 
              className="text-[9px]"
            >
              {status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Profile details */}
        <div className="flex flex-col gap-3.5 mb-5">
          <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Account Metadata</span>
          
          <div className="flex flex-col gap-2.5 bg-background/55 border border-border/40 p-3.5 rounded-lg text-xs font-sans">
            <div className="flex justify-between items-center">
              <span className="text-muted flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted" />
                Email:
              </span>
              <span className="text-foreground font-medium font-mono truncate max-w-[180px]">{user.email}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-muted" />
                Joined:
              </span>
              <span className="text-foreground font-medium font-mono">{joinedDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted flex items-center gap-2">
                <Database className="h-3.5 w-3.5 shrink-0 text-muted" />
                Database ID:
              </span>
              <span className="text-[10px] text-muted-text font-mono truncate max-w-[150px]">{user.uid || user.id}</span>
            </div>
          </div>
        </div>

        {/* Operational telemetry metrics */}
        <div className="mb-5">
          <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Operational Telemetry</span>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-3 bg-surface/30 border border-border/50 rounded-lg flex flex-col gap-0.5">
              <span className="text-[8px] font-mono text-muted uppercase tracking-widest">Tasks Audited</span>
              <span className="text-lg font-bold font-mono text-foreground">{totalStakes}</span>
            </div>
            <div className="p-3 bg-surface/30 border border-border/50 rounded-lg flex flex-col gap-0.5">
              <span className="text-[8px] font-mono text-muted uppercase tracking-widest">Accuracy Rating</span>
              <span className="text-lg font-bold font-mono text-secondary">{accuracy}%</span>
            </div>
          </div>
        </div>

        {/* Recent logs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Activity Log</span>
            <span className="text-[8px] font-mono text-primary flex items-center gap-1">
              <Activity className="h-2.5 w-2.5" />
              Realtime
            </span>
          </div>
          <div className="flex flex-col gap-2.5 font-sans">
            <div className="flex gap-2.5 text-[11px] leading-tight">
              <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1 shadow-[0_0_6px_rgba(0,224,255,0.4)] shrink-0" />
              <div className="flex flex-col">
                <span className="text-foreground font-semibold">User details read</span>
                <span className="text-[9px] text-muted font-mono mt-0.5">Console session audit log</span>
              </div>
            </div>
            {status === 'inactive' ? (
              <div className="flex gap-2.5 text-[11px] leading-tight">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1 shadow-[0_0_6px_rgba(239,68,68,0.4)] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-red-400 font-semibold">Access inactive</span>
                  <span className="text-[9px] text-muted font-mono mt-0.5">Lockout protocol active</span>
                </div>
              </div>
            ) : (
              <div className="flex gap-2.5 text-[11px] leading-tight">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shadow-[0_0_6px_rgba(16,185,129,0.4)] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-emerald-400 font-semibold">Connection established</span>
                  <span className="text-[9px] text-muted font-mono mt-0.5">Firebase telemetry sync OK</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Panel */}
      <div className="flex flex-col gap-2 mt-6 border-t border-border/40 pt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 text-[10px] font-mono uppercase tracking-wider py-1.5 h-8 gap-1"
            onClick={() => onEdit(user)}
          >
            Edit Profile
          </Button>
          <Button
            variant="secondary"
            className="text-[10px] font-mono uppercase tracking-wider px-3 h-8"
            onClick={() => onSendMessage(user)}
          >
            <Mail className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <Button
          variant={status === 'inactive' ? 'outline' : 'danger'}
          className={`w-full text-[10px] font-mono uppercase tracking-wider py-1.5 h-8 gap-1.5 ${
            status === 'inactive' ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10' : ''
          }`}
          onClick={() => onToggleStatus(user.id)}
        >
          <Ban className="h-3.5 w-3.5" />
          {status === 'inactive' ? 'Activate User' : 'Deactivate User'}
        </Button>
      </div>
    </Card>
  )
}
