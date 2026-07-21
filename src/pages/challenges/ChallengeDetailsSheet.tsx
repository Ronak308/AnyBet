import React, { useState } from 'react'
import { 
  X, 
  CheckCircle, 
  Clock, 
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
    updateChallenge,
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
                {challenge.status === 'Approved' && (
                  <Button 
                    size="sm" 
                    variant="primary"
                    glow
                    onClick={() => updateChallenge(challenge.id, { status: 'Live' })}
                    className="gap-1.5 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <TrendingUp className="h-3.5 w-3.5" /> Go Live
                  </Button>
                )}
                {challenge.status === 'Live' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsSettling(true)}
                    className="gap-1.5 text-xs font-mono border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Award className="h-3.5 w-3.5" /> Settle
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="h-8 w-8 text-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sub Navigation Tabs */}
            <div className="border-b border-border/50 bg-surface/20 px-6 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {[
                  { id: 'info', label: 'Overview & Rules', icon: FileText },
                  { id: 'participants', label: `Participants (${challenge.participantsCount})`, icon: Users },
                  { id: 'financials', label: 'Financials', icon: Coins },
                  { id: 'settlement', label: 'Settlement & Oracle', icon: Cpu },
                  { id: 'timeline', label: 'Audit Timeline', icon: Clock }
                ].map(tab => {
                  const Icon = tab.icon
                  const isActive = activeSubTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider transition-all border-b-2 font-medium cursor-pointer whitespace-nowrap shrink-0 ${
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
                      {challenge.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase">Stake Amount</span>
                      <p className="text-base font-bold font-mono text-primary mt-1">{challenge.stakeAmount} BET</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase">Total Prize Pool</span>
                      <p className="text-base font-bold font-mono text-emerald-400 mt-1">{challenge.prizePool.toLocaleString()} BET</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase">Start Date</span>
                      <p className="text-xs font-mono text-foreground mt-1">{challenge.startDate}</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase">End Date</span>
                      <p className="text-xs font-mono text-foreground mt-1">{challenge.endDate}</p>
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
                              <TableCell className="font-mono text-xs text-primary">{p.stakeAmount} BET</TableCell>
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

              {/* TAB 3: FINANCIALS */}
              {activeSubTab === 'financials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Total BET Collected</span>
                        <Coins className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xl font-bold font-mono text-foreground mt-2">{(challenge.financials?.totalCollected || 0).toLocaleString()} BET</p>
                    </div>

                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Platform Fee (5%)</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-2">{(challenge.financials?.platformFee || 0).toLocaleString()} BET</p>
                    </div>

                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Net Winner Payout</span>
                        <Award className="h-4 w-4 text-purple-400" />
                      </div>
                      <p className="text-xl font-bold font-mono text-purple-400 mt-2">{(challenge.financials?.winnerPayout || 0).toLocaleString()} BET</p>
                    </div>
                  </div>

                  <div className="p-4 bg-surface/20 border border-border/40 rounded-xl space-y-3">
                    <h4 className="text-xs font-mono uppercase text-muted tracking-wider">Escrow Lock & Release Protocol</h4>
                    <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-border/30">
                      <span className="text-muted">Currently Locked Escrow Balance</span>
                      <span className="text-foreground font-bold">{(challenge.financials?.lockedCoins || 0).toLocaleString()} BET</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-border/30">
                      <span className="text-muted">Refund Reserve Allocated</span>
                      <span className="text-foreground font-bold">{(challenge.financials?.refundAmount || 0).toLocaleString()} BET</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTLEMENT & ORACLE */}
              {activeSubTab === 'settlement' && (
                <div className="space-y-6">
                  <div className="p-4 bg-surface/40 border border-border/50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted">Settlement Engine Method</span>
                      <Badge variant="outline" className="border-primary/40 text-primary">{challenge.settlement.settlementMethod}</Badge>
                    </div>
                    {challenge.settlement.oracleResult && (
                      <div className="p-3 bg-black/40 rounded-lg border border-border/50 space-y-1">
                        <span className="text-[10px] font-mono text-muted uppercase">Oracle Feed Payload</span>
                        <p className="text-xs font-mono text-foreground/90">{challenge.settlement.oracleResult}</p>
                        {challenge.settlement.oracleConfidence && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-mono text-muted">Confidence Score:</span>
                            <span className="text-xs font-mono text-emerald-400 font-bold">{challenge.settlement.oracleConfidence}%</span>
                          </div>
                        )}
                      </div>
                    )}
                    {challenge.settlement.winnerName && (
                      <div className="flex items-center justify-between pt-2 border-t border-border/30">
                        <span className="text-xs font-mono text-muted">Declared Winner</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{challenge.settlement.winnerName}</span>
                      </div>
                    )}
                  </div>

                  {isSettling && (
                    <form onSubmit={handleSettle} className="p-4 bg-primary/10 border border-primary/30 rounded-xl space-y-4">
                      <h4 className="text-xs font-mono uppercase text-primary font-bold">Manual Settlement Override</h4>
                      <div>
                        <label className="text-[10px] font-mono text-muted uppercase block mb-1">Declared Winner Username / ID</label>
                        <input 
                          type="text" 
                          value={winnerInput}
                          onChange={e => setWinnerInput(e.target.value)}
                          placeholder="e.g. Alex_R or USR_01"
                          className="w-full bg-background border border-border rounded-lg p-2.5 text-xs font-mono text-foreground focus:border-primary outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="primary" glow type="submit" className="text-xs font-mono">Confirm Settlement</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsSettling(false)} className="text-xs font-mono">Cancel</Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 5: AUDIT TIMELINE */}
              {activeSubTab === 'timeline' && (
                <div className="space-y-4 pl-2">
                  <div className="relative border-l-2 border-primary/30 pl-6 space-y-6 my-2">
                    {challenge.timeline.map((event, idx) => (
                      <div key={event.id || idx} className="relative">
                        {/* Stepper Node Icon */}
                        <div className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          event.completed 
                            ? 'bg-primary border-primary text-background' 
                            : 'bg-background border-border text-muted'
                        }`}>
                          {event.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold font-sans ${event.completed ? 'text-foreground' : 'text-muted'}`}>{event.stage}</span>
                            <span className="text-[10px] font-mono text-muted">{event.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted font-sans">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sheet Footer */}
            <div className="p-4 border-t border-border/60 bg-surface/30 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-mono text-muted">AnyBet Audit Protocol Engine v2.4</span>
              <Button size="sm" variant="ghost" onClick={onClose} className="text-xs font-mono">Close</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
