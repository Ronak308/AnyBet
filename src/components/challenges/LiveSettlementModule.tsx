import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Users, 
  Coins, 
  Lock, 
  Award, 
  Cpu,
  X
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useChallenges } from '../../context/ChallengesContext'
import type { ChallengeItem } from '../../context/ChallengesContext'

export const LiveSettlementModule: React.FC = () => {
  const { challenges, settleChallenge, showToastNotice } = useChallenges()

  const [settleModalChallenge, setSettleModalChallenge] = useState<ChallengeItem | null>(null)
  const [winnerInput, setWinnerInput] = useState('')
  const [settlementNotes, setSettlementNotes] = useState('')

  // Live Metric Aggregations
  const liveChallenges = useMemo(() => challenges.filter(c => c.status === 'Live'), [challenges])
  const pendingSettlement = useMemo(() => challenges.filter(c => c.status === 'Disputed' || c.status === 'Live' || c.settlement.status === 'Under Review'), [challenges])

  const totalLiveParticipants = useMemo(() => liveChallenges.reduce((sum, c) => sum + c.participantsCount, 0), [liveChallenges])
  const totalLivePrizePool = useMemo(() => liveChallenges.reduce((sum, c) => sum + c.prizePool, 0), [liveChallenges])
  const totalLockedCoins = useMemo(() => challenges.reduce((sum, c) => sum + c.financials.lockedCoins, 0), [challenges])

  const handleExecuteSettlement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!settleModalChallenge) return
    if (!winnerInput.trim()) {
      showToastNotice('Winner ID or username is required', 'warning')
      return
    }

    settleChallenge(settleModalChallenge.id, winnerInput.trim(), winnerInput.trim(), settlementNotes.trim() || 'Verified by operator')
    setSettleModalChallenge(null)
    setWinnerInput('')
    setSettlementNotes('')
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Live Challenges</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{liveChallenges.length}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Active Participants</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">{totalLiveParticipants.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Live Prize Pools</span>
              <p className="text-2xl font-bold font-mono text-purple-400 mt-1">{totalLivePrizePool.toLocaleString()} BET</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Escrow Balance (Locked BET)</span>
              <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{totalLockedCoins.toLocaleString()} BET</p>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Lock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Live Monitoring Cards Row */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold font-sans text-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Active Live Events
        </h4>

        {liveChallenges.length === 0 ? (
          <div className="p-8 text-center bg-surface/20 border border-border/40 rounded-xl">
            <Zap className="h-8 w-8 text-muted mx-auto mb-2 opacity-40" />
            <p className="text-xs font-mono text-muted">No live challenges currently active.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {liveChallenges.map(c => (
              <Card key={c.id} className="bg-surface/40 border-border/60 hover:border-primary/40 transition-all">
                <CardContent className="p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-primary font-bold">{c.id}</span>
                      <h5 className="font-bold text-xs text-foreground line-clamp-1">{c.title}</h5>
                    </div>
                    <Badge variant="success" className="text-[9px]">LIVE</Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-muted">
                      <span>Completion Progress</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[10px] font-mono">
                    <span className="text-muted">{c.participantsCount} participants</span>
                    <span className="text-purple-400 font-bold">{c.prizePool.toLocaleString()} BET</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Settlement Queue Section */}
      <Card className="border border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-surface/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-bold font-sans text-foreground">Settlement & Verification Queue</h4>
          </div>
          <span className="text-xs font-mono text-muted">{pendingSettlement.length} Events Awaiting Resolution</span>
        </div>

        <Table>
          <TableHeader className="bg-surface/60">
            <TableRow>
              <TableHead className="text-xs font-mono">ID</TableHead>
              <TableHead className="text-xs font-mono">Challenge Title</TableHead>
              <TableHead className="text-xs font-mono">Method</TableHead>
              <TableHead className="text-xs font-mono">AI Oracle Status</TableHead>
              <TableHead className="text-xs font-mono">Prize Pool</TableHead>
              <TableHead className="text-xs font-mono text-right">Settlement Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingSettlement.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs font-mono text-muted">
                  No challenges in the settlement queue.
                </TableCell>
              </TableRow>
            ) : (
              pendingSettlement.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs font-bold text-primary">{c.id}</TableCell>
                  <TableCell className="font-medium text-xs text-foreground">{c.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      {c.settlement.settlementMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-xs font-mono text-muted">
                        {c.settlement.oracleConfidence ? `${c.settlement.oracleConfidence}% Confidence` : 'Feed Active'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-emerald-400">
                    {c.prizePool.toLocaleString()} BET
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="primary"
                      glow
                      onClick={() => {
                        setSettleModalChallenge(c)
                        setWinnerInput(c.participants[0]?.username || '')
                      }}
                      className="text-xs font-mono gap-1.5 h-8"
                    >
                      <Award className="h-3.5 w-3.5" /> Settle Wager
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* SETTLEMENT MODAL OVERLAY */}
      {settleModalChallenge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={() => setSettleModalChallenge(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background border border-border rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold font-sans text-foreground">Declare Winner & Distribute Rewards</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary">{settleModalChallenge.id}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSettleModalChallenge(null)}
                  className="h-8 w-8 text-muted hover:text-foreground rounded-lg"
                  title="Close / Back"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 bg-surface/40 rounded-xl border border-border/50 space-y-1 text-xs font-sans">
              <span className="font-bold text-foreground">{settleModalChallenge.title}</span>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted pt-1">
                <span>Net Winner Payout:</span>
                <span className="text-emerald-400 font-bold">{settleModalChallenge.financials.winnerPayout.toLocaleString()} BET</span>
              </div>
            </div>

            {settleModalChallenge.settlement.oracleResult && (
              <div className="p-3 bg-black/50 border border-cyan-500/30 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-bold">
                  <Cpu className="h-3.5 w-3.5" /> AI Oracle Intelligence
                </div>
                <p className="text-xs font-mono text-foreground/80">{settleModalChallenge.settlement.oracleResult}</p>
              </div>
            )}

            <form onSubmit={handleExecuteSettlement} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Declared Winner Username or ID</label>
                <input
                  type="text"
                  value={winnerInput}
                  onChange={e => setWinnerInput(e.target.value)}
                  placeholder="e.g. Alex_R"
                  required
                  className="w-full bg-surface/50 border border-border rounded-lg p-2.5 text-xs font-mono text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Operator Notes / Rationale</label>
                <textarea
                  value={settlementNotes}
                  onChange={e => setSettlementNotes(e.target.value)}
                  placeholder="Audit verification comments..."
                  rows={2}
                  className="w-full bg-surface/50 border border-border rounded-lg p-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button size="sm" variant="ghost" onClick={() => setSettleModalChallenge(null)} className="text-xs font-mono">Cancel</Button>
                <Button size="sm" variant="primary" glow type="submit" className="text-xs font-mono">Confirm Settlement & Payout</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  )
}
