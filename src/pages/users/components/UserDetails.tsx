import React, { useState } from 'react'
import type { User } from '@/context/AuthContext'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Ban, Calendar, Activity, Mail, X } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'challenge-history'>('profile')
  const status = (user as any).status || 'active'

  // User Financial & Betting Mock Stats
  const walletBalance = (user as any).walletBalance || (user as any).balance || 145000
  const totalWagered = (user as any).totalWagered || 320000
  const totalWins = (user as any).totalWins || 28
  const totalLosses = (user as any).totalLosses || 6
  const winRate = Math.round((totalWins / Math.max(1, totalWins + totalLosses)) * 100)

  // Past Challenge Participation History
  const challengeHistory = [
    { id: 'AB-9921', title: 'Will Bitcoin cross $100k by midnight?', choice: 'YES', stake: 15000, outcome: 'WON', payout: 29250, date: '2026-07-21' },
    { id: 'AB-8820', title: 'Champions League Score Predictor', choice: 'YES', stake: 10000, outcome: 'WON', payout: 24000, date: '2026-07-19' },
    { id: 'AB-7712', title: 'Marathon Completion Under 3 Hours', choice: 'NO', stake: 5000, outcome: 'LOST', payout: 0, date: '2026-07-15' },
    { id: 'AB-6610', title: 'Will it Rain in Tokyo Tomorrow?', choice: 'YES', stake: 8000, outcome: 'ACTIVE', payout: 16800, date: '2026-07-22' }
  ]

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
    <Card className="w-full bg-[#120F1D] border-border/60 text-foreground p-6 shadow-2xl relative overflow-hidden font-sans">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="pro" className="font-mono text-[10px]">USER DEEP SPEC AUDIT</Badge>
          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">VERIFIED PLAYER</Badge>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg text-muted hover:text-foreground cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* User Avatar & Core Stats */}
      <div className="flex items-center gap-4 bg-surface/30 p-4 rounded-2xl border border-border/40 mb-5">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
          alt={user.name}
          className="w-14 h-14 rounded-full border-2 border-primary/50 bg-black/40"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground truncate">{user.name}</h3>
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary uppercase">{user.role}</Badge>
          </div>
          <span className="text-xs font-mono text-muted">@{user.username} • Joined {joinedDate}</span>
          
          <div className="flex items-center gap-4 mt-2 font-mono text-xs">
            <div>
              <span className="text-[9px] text-muted block uppercase">Wallet Balance</span>
              <strong className="text-emerald-400 font-bold">{walletBalance.toLocaleString()} Coins</strong>
            </div>
            <div className="border-l border-border/40 pl-4">
              <span className="text-[9px] text-muted block uppercase">Win Rate</span>
              <strong className="text-cyan-400 font-bold">{winRate}% ({totalWins}W / {totalLosses}L)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sub-Tabs */}
      <div className="flex items-center bg-surface/40 border border-border/60 rounded-xl p-1 gap-1 font-mono text-xs mb-5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-primary text-white font-bold shadow' : 'text-muted hover:text-foreground'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'wallet' ? 'bg-primary text-white font-bold shadow' : 'text-muted hover:text-foreground'
          }`}
        >
          Wallet Balance
        </button>
        <button
          onClick={() => setActiveTab('challenge-history')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'challenge-history' ? 'bg-primary text-white font-bold shadow' : 'text-muted hover:text-foreground'
          }`}
        >
          Betting History ({challengeHistory.length})
        </button>
      </div>

      {/* ─── TAB 1: PROFILE DETAILS ─── */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 bg-surface/30 border border-border/40 p-4 rounded-xl text-xs font-mono">
            <div className="flex justify-between items-center pb-2.5 border-b border-border/40">
              <span className="text-muted flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted/70" /> Email Address
              </span>
              <span className="text-foreground font-bold truncate">{user.email}</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-border/40">
              <span className="text-muted flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted/70" /> Member Since
              </span>
              <span className="text-foreground font-bold">{joinedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-muted/70" /> Last Authenticated
              </span>
              <span className="text-foreground font-bold">{formatLastLogin(user)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: WALLET BALANCE & STATS ─── */}
      {activeTab === 'wallet' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-surface/30 border border-border/40 rounded-xl space-y-1">
              <span className="text-[10px] text-muted block uppercase">Current Wallet Balance</span>
              <span className="text-emerald-400 font-bold text-lg">{walletBalance.toLocaleString()} Coins</span>
            </div>
            <div className="p-3 bg-surface/30 border border-border/40 rounded-xl space-y-1">
              <span className="text-[10px] text-muted block uppercase">Total Volume Wagered</span>
              <span className="text-primary font-bold text-lg">{totalWagered.toLocaleString()} Coins</span>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary text-xs">Escrow Wallet Protection</span>
              <Badge variant="success" className="text-[9px]">100% SECURE</Badge>
            </div>
            <p className="text-xs text-foreground/90 font-sans leading-relaxed">
              All betting stakes are locked in real-time Escrow DB. Payouts automatically credit upon AI resolution.
            </p>
          </div>
        </div>
      )}

      {/* ─── TAB 3: PAST CHALLENGE PARTICIPATION & WINNING HISTORY ─── */}
      {activeTab === 'challenge-history' && (
        <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">ID</TableHead>
                <TableHead className="text-xs font-mono">Challenge Title</TableHead>
                <TableHead className="text-xs font-mono">Choice</TableHead>
                <TableHead className="text-xs font-mono">Stake</TableHead>
                <TableHead className="text-xs font-mono">Outcome</TableHead>
                <TableHead className="text-xs font-mono text-right">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challengeHistory.map((item) => (
                <TableRow key={item.id} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold text-primary">{item.id}</TableCell>
                  <TableCell className="font-sans font-bold text-foreground text-xs">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{item.choice}</Badge>
                  </TableCell>
                  <TableCell className="text-muted">{item.stake.toLocaleString()} Coins</TableCell>
                  <TableCell>
                    {item.outcome === 'WON' ? (
                      <Badge variant="success" className="text-[9px] gap-1">🥇 WON</Badge>
                    ) : item.outcome === 'LOST' ? (
                      <Badge variant="outline" className="text-[9px] text-red-400 border-red-500/40 bg-red-500/10">❌ LOST</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/40">⏳ IN-GAME</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-400">
                    {item.payout > 0 ? `+${item.payout.toLocaleString()} Coins` : '0 Coins'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Actions Panel */}
      <div className="mt-6 border-t border-border/40 pt-4">
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
            className={`flex-1 text-xs font-mono uppercase tracking-wider py-2 h-9 gap-1.5 ${status === 'inactive' ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10' : ''}`}
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
