import React, { useState } from 'react'
import { 
  X, 
  CheckCircle, 
  Coins, 
  Users, 
  FileText, 
  TrendingUp, 
  Cpu, 
  Award, 
  Check
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useChallenges } from '../../context/ChallengesContext'
import type { ChallengeItem, ChallengeStatus } from '../../context/ChallengesContext'

interface ChallengeDetailsSheetProps {
  challenge: ChallengeItem | null
  onClose: () => void
}

export const ChallengeDetailsSheet: React.FC<ChallengeDetailsSheetProps> = ({ challenge, onClose }) => {
  const { 
    settleChallenge, 
    approveChallenge, 
    showToastNotice 
  } = useChallenges()

  const [activeSubTab, setActiveSubTab] = useState<'info' | 'participants' | 'financials' | 'settlement' | 'timeline'>('info')
  const [winnerInput, setWinnerInput] = useState('')
  const [isSettling, setIsSettling] = useState(false)

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'Live':
        return <Badge variant="success">● LIVE</Badge>
      case 'Pending Review':
        return <Badge variant="warning">PENDING REVIEW</Badge>
      case 'Approved':
        return <Badge variant="pro">APPROVED</Badge>
      case 'Completed':
        return <Badge variant="success">COMPLETED</Badge>
      case 'Disputed':
        return <Badge variant="danger">DISPUTED</Badge>
      case 'Cancelled':
        return <Badge variant="outline">CANCELLED</Badge>
      case 'Draft':
        return <Badge variant="outline">DRAFT</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!challenge) return
    if (!winnerInput.trim()) {
      showToastNotice('Please specify the winner username or ID', 'warning')
      return
    }
    settleChallenge(challenge.id, winnerInput, winnerInput, 'Operator manual settlement')
    setIsSettling(false)
  }

  return (
    <Sheet open={!!challenge} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent 
        side="right" 
        hideClose={true}
        className="w-full sm:max-w-2xl lg:max-w-3xl bg-background border-l border-border p-0 overflow-hidden flex flex-col h-full shadow-2xl"
      >
        {challenge && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Sheet Header */}
            <div className="p-6 border-b border-border/60 bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-primary font-bold tracking-wider">{challenge.id}</span>
                  {getStatusBadge(challenge.status)}
                  <Badge variant="outline" className="border-primary/30 text-primary">{challenge.category}</Badge>
                  <Badge variant="outline" className="border-border text-muted">{challenge.type}</Badge>
                </div>
                <h2 className="text-xl font-bold font-sans text-foreground">{challenge.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                {challenge.status === 'Pending Review' && (
                  <Button 
                    size="sm" 
                    variant="primary"
                    glow
                    onClick={() => approveChallenge(challenge.id)}
                    className="gap-1.5 text-xs font-mono"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </Button>
                )}
                {challenge.status === 'Live' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsSettling(!isSettling)}
                    className="gap-1.5 text-xs font-mono border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Award className="h-3.5 w-3.5" /> Settle
                  </Button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface/60 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Settle Banner */}
            {isSettling && (
              <div className="p-4 bg-purple-500/10 border-b border-purple-500/20 shrink-0">
                <form onSubmit={handleSettle} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-purple-300 font-bold shrink-0">Manual Settlement:</span>
                  <input
                    type="text"
                    value={winnerInput}
                    onChange={e => setWinnerInput(e.target.value)}
                    placeholder="Enter winner username or ID..."
                    className="flex-1 bg-surface/60 border border-purple-500/30 rounded-md px-3 py-1.5 text-xs font-mono text-foreground outline-none focus:border-purple-500"
                  />
                  <Button type="submit" size="sm" variant="primary" glow className="text-xs font-mono h-8">
                    Confirm Winner
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setIsSettling(false)} className="text-xs font-mono h-8 text-muted">
                    Cancel
                  </Button>
                </form>
              </div>
            )}

            {/* Navigation Sub-Tabs */}
            <div className="border-b border-border/40 bg-surface/20 shrink-0">
              <div className="flex items-center gap-1 px-6 overflow-x-auto">
                {[
                  { id: 'info', label: 'Overview & Rules', icon: FileText },
                  { id: 'participants', label: `Participants (${challenge.participantsCount})`, icon: Users },
                  { id: 'financials', label: 'Financials & Odds', icon: Coins },
                  { id: 'settlement', label: 'Settlement & Oracle', icon: Cpu }
                ].map(tab => {
                  const Icon = tab.icon
                  const isActive = activeSubTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wider transition-all border-b-2 font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive 
                          ? 'border-primary text-primary font-bold bg-primary/5' 
                          : 'border-transparent text-muted hover:text-foreground hover:bg-surface/40'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sheet Body Content */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6">

              {/* TAB 1: OVERVIEW & RULES */}
              {activeSubTab === 'info' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-mono uppercase text-muted tracking-wider mb-2">Description</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed bg-surface/30 p-4 rounded-xl border border-border/50">
                      {challenge.description || 'No detailed description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase block">Stake Amount</span>
                      <p className="text-base font-bold font-mono text-primary mt-1">{challenge.stakeAmount || 100} Coins</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase block">Total Prize Pool</span>
                      <p className="text-base font-bold font-mono text-emerald-400 mt-1">{(challenge.prizePool || 100).toLocaleString()} Coins</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase block">Start Date</span>
                      <p className="text-xs font-mono text-foreground mt-1">{challenge.startDate}</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase block">End Date</span>
                      <p className="text-xs font-mono text-foreground mt-1">{challenge.endDate}</p>
                    </div>
                  </div>

                  {/* ODDS PREVIEW CARD */}
                  <div className="p-4 bg-surface/30 border border-border/50 rounded-2xl space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground uppercase">Live Weight-Based Odds Preview</span>
                      <Badge variant="pro" className="text-[9px]">P2P ESCROW</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 bg-surface/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">YES Side Odds</span>
                        <span className="font-bold text-foreground">1.95x Multiplier</span>
                      </div>
                      <div className="p-2.5 bg-surface/40 border border-rose-500/30 rounded-xl flex items-center justify-between">
                        <span className="text-rose-400 font-bold">NO Side Odds</span>
                        <span className="font-bold text-foreground">2.05x Multiplier</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono uppercase text-muted tracking-wider mb-2">Challenge Rules</h3>
                    <ul className="space-y-2">
                      {challenge.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80 bg-surface/20 p-2.5 rounded-lg border border-border/30">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: PARTICIPANTS */}
              {activeSubTab === 'participants' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted">Total Joined: {challenge.participantsCount} Users</span>
                    <span className="text-xs font-mono text-muted">Max Capacity: {challenge.maxParticipants || 'Unlimited'}</span>
                  </div>

                  {challenge.participants.length === 0 ? (
                    <div className="p-8 text-center bg-surface/20 rounded-xl border border-border/40">
                      <Users className="h-8 w-8 text-muted mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-muted font-mono">No detailed participant rows available for this event.</p>
                    </div>
                  ) : (
                    <div className="border border-border/60 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-surface/50">
                          <TableRow>
                            <TableHead className="text-xs font-mono">User</TableHead>
                            <TableHead className="text-xs font-mono">Joined Date</TableHead>
                            <TableHead className="text-xs font-mono">Stake</TableHead>
                            <TableHead className="text-xs font-mono">Progress</TableHead>
                            <TableHead className="text-xs font-mono">Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {challenge.participants.map(p => (
                            <TableRow key={p.id}>
                              <TableCell className="font-mono text-xs font-bold text-foreground">{p.username}</TableCell>
                              <TableCell className="font-mono text-xs text-muted">{p.joinedAt}</TableCell>
                              <TableCell className="font-mono text-xs text-primary">{p.stakeAmount} Coins</TableCell>
                              <TableCell>
                                <div className="w-24 bg-surface rounded-full h-2 overflow-hidden border border-border/50">
                                  <div className="bg-primary h-full rounded-full" style={{ width: `${p.progressPercent}%` }} />
                                </div>
                              </TableCell>
                              <TableCell>
                                {p.result === 'Winner' ? (
                                  <Badge variant="success">WINNER</Badge>
                                ) : (
                                  <Badge variant="outline">{p.result || 'Active'}</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FINANCIALS & ODDS */}
              {activeSubTab === 'financials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Total Coins Collected</span>
                        <Coins className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xl font-bold font-mono text-foreground mt-2">{(challenge.financials?.totalCollected || challenge.prizePool || 100).toLocaleString()} Coins</p>
                    </div>

                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Platform Fee (5%)</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-2">{(challenge.financials?.platformFee || Math.floor((challenge.prizePool || 100) * 0.05) || 5).toLocaleString()} Coins</p>
                    </div>

                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Net Winner Payout</span>
                        <Award className="h-4 w-4 text-purple-400" />
                      </div>
                      <p className="text-xl font-bold font-mono text-purple-400 mt-2">{((challenge.financials as any)?.netPayout || Math.floor((challenge.prizePool || 100) * 0.95) || 95).toLocaleString()} Coins</p>
                    </div>
                  </div>

                  {/* WEIGHT-BASED ODDS MULTIPLIER & PROJECTED PAYOUTS CARD */}
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Live Weight-Based Odds Multipliers & Payouts
                      </span>
                      <Badge variant="pro" className="text-[9px]">P2P ESCROW RATIO</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 bg-surface/40 border border-emerald-500/30 rounded-xl space-y-1">
                        <span className="text-[10px] text-muted block uppercase">YES Side Odds</span>
                        <span className="text-lg font-bold text-emerald-400 block">1.95x Multiplier</span>
                        <span className="text-[10px] text-muted">Proj. Payout: +95 Coins / 100 Stake</span>
                      </div>

                      <div className="p-3 bg-surface/40 border border-rose-500/30 rounded-xl space-y-1">
                        <span className="text-[10px] text-muted block uppercase">NO Side Odds</span>
                        <span className="text-lg font-bold text-rose-400 block">2.05x Multiplier</span>
                        <span className="text-[10px] text-muted">Proj. Payout: +105 Coins / 100 Stake</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-surface/20 border border-border/40 rounded-xl space-y-3 font-mono">
                    <h4 className="text-xs uppercase text-muted tracking-wider font-bold">Escrow Lock & Release Protocol</h4>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-border/30">
                      <span className="text-muted">Currently Locked Escrow Balance</span>
                      <span className="text-foreground font-bold">{(challenge.financials?.lockedCoins || challenge.prizePool || 100).toLocaleString()} Coins</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-muted">Refund Reserve Allocated</span>
                      <span className="text-foreground font-bold">{(challenge.financials?.refundAmount || 0).toLocaleString()} Coins</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTLEMENT & ORACLE */}
              {activeSubTab === 'settlement' && (
                <div className="space-y-6">
                  <div className="p-4 bg-surface/30 border border-border/40 rounded-xl space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase text-muted font-bold">Oracle Engine Status</span>
                      <Badge variant="pro">GEMINI 2.0 AI ORACLE</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-border/30">
                      <span className="text-muted">Resolution Provider</span>
                      <span className="text-cyan-400 font-bold">{(challenge as any).oracleProvider || (challenge as any).oracleSource || 'Binance Spot API & Sports Feed'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-muted">AI Confidence Interval</span>
                      <span className="text-emerald-400 font-bold">98.6% Confidence</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
